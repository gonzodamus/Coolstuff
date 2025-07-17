// Game State
class GameState {
    constructor() {
        this.level = 1;
        this.gold = 100;
        this.xp = 0;
        this.totalSpinCount = 0;
        this.unlockedSpells = new Set(['Spark']);
        this.achievements = new Set();
        this.bonuses = {
            goldMultiplier: 1,
            xpMultiplier: 1,
            luckBonus: 0
        };
        
        // New mechanics
        this.reagents = {
            fire: 0,
            water: 0,
            earth: 0,
            air: 0,
            lightning: 0,
            ice: 0,
            star: 0,
            crystal: 0,
            death: 0,
            rainbow: 0
        };
        this.playerHealth = 100;
        this.maxPlayerHealth = 100;
        this.enemy = this.generateEnemy();
        this.combatActive = true;
        
        // Load saved game if exists
        this.load();
    }

    generateEnemy() {
        const enemies = [
            { name: "Goblin Shaman", health: 30, maxHealth: 30, goldReward: 25 },
            { name: "Dark Wizard", health: 50, maxHealth: 50, goldReward: 40 },
            { name: "Fire Elemental", health: 40, maxHealth: 40, goldReward: 35 },
            { name: "Shadow Beast", health: 60, maxHealth: 60, goldReward: 50 },
            { name: "Ancient Dragon", health: 100, maxHealth: 100, goldReward: 100 }
        ];
        
        const difficulty = Math.min(Math.floor(this.level / 3), enemies.length - 1);
        const enemy = { ...enemies[difficulty] };
        // Scale enemy health with level
        const healthMultiplier = 1 + (this.level - 1) * 0.1;
        enemy.health = Math.floor(enemy.health * healthMultiplier);
        enemy.maxHealth = enemy.health;
        enemy.goldReward = Math.floor(enemy.goldReward * healthMultiplier);
        
        return enemy;
    }

    save() {
        const saveData = {
            level: this.level,
            gold: this.gold,
            xp: this.xp,
            totalSpinCount: this.totalSpinCount,
            unlockedSpells: Array.from(this.unlockedSpells),
            achievements: Array.from(this.achievements),
            bonuses: this.bonuses,
            reagents: this.reagents,
            playerHealth: this.playerHealth,
            maxPlayerHealth: this.maxPlayerHealth,
            enemy: this.enemy,
            combatActive: this.combatActive
        };
        localStorage.setItem('spellSlotsGame', JSON.stringify(saveData));
    }

    load() {
        const saveData = localStorage.getItem('spellSlotsGame');
        if (saveData) {
            const data = JSON.parse(saveData);
            this.level = data.level || 1;
            this.gold = data.gold || 100;
            this.xp = data.xp || 0;
            this.totalSpinCount = data.totalSpinCount || 0;
            this.unlockedSpells = new Set(data.unlockedSpells || ['Spark']);
            this.achievements = new Set(data.achievements || []);
            this.bonuses = data.bonuses || {
                goldMultiplier: 1,
                xpMultiplier: 1,
                luckBonus: 0
            };
            this.reagents = data.reagents || {
                fire: 0, water: 0, earth: 0, air: 0, lightning: 0,
                ice: 0, star: 0, crystal: 0, death: 0, rainbow: 0
            };
            this.playerHealth = data.playerHealth || 100;
            this.maxPlayerHealth = data.maxPlayerHealth || 100;
            this.enemy = data.enemy || this.generateEnemy();
            this.combatActive = data.combatActive !== undefined ? data.combatActive : true;
        }
    }

    reset() {
        this.level = 1;
        this.gold = 100;
        this.xp = 0;
        this.totalSpinCount = 0;
        this.unlockedSpells = new Set(['Spark']);
        this.achievements = new Set();
        this.bonuses = {
            goldMultiplier: 1,
            xpMultiplier: 1,
            luckBonus: 0
        };
        this.reagents = {
            fire: 0, water: 0, earth: 0, air: 0, lightning: 0,
            ice: 0, star: 0, crystal: 0, death: 0, rainbow: 0
        };
        this.playerHealth = 100;
        this.maxPlayerHealth = 100;
        this.enemy = this.generateEnemy();
        this.combatActive = true;
        localStorage.removeItem('spellSlotsGame');
    }

    addReagent(symbolKey, amount = 1) {
        const reagentMap = {
            '🔥': 'fire',
            '💧': 'water', 
            '🌍': 'earth',
            '💨': 'air',
            '⚡': 'lightning',
            '❄️': 'ice',
            '🌟': 'star',
            '🔮': 'crystal',
            '💀': 'death',
            '🌈': 'rainbow'
        };
        
        const reagentType = reagentMap[symbolKey];
        if (reagentType && this.reagents[reagentType] !== undefined) {
            this.reagents[reagentType] += amount;
        }
    }

    takeDamage(amount) {
        this.playerHealth = Math.max(0, this.playerHealth - amount);
        if (this.playerHealth === 0) {
            this.playerHealth = this.maxPlayerHealth;
            this.gold = Math.max(10, Math.floor(this.gold * 0.8)); // Lose some gold but don't go below 10
            this.showUnlockNotification("You were defeated! Lost some gold but lived to fight another day.");
            this.enemy = this.generateEnemy();
        }
    }

    healPlayer(amount) {
        this.playerHealth = Math.min(this.maxPlayerHealth, this.playerHealth + amount);
    }

    damageEnemy(amount) {
        this.enemy.health = Math.max(0, this.enemy.health - amount);
        if (this.enemy.health === 0) {
            this.gold += this.enemy.goldReward;
            this.addXp(this.enemy.goldReward / 2);
            this.showUnlockNotification(`Defeated ${this.enemy.name}! Gained ${this.enemy.goldReward} gold!`);
            this.enemy = this.generateEnemy();
        }
    }

    getXpNeeded() {
        return 100 + (this.level - 1) * 50;
    }

    addXp(amount) {
        this.xp += Math.floor(amount * this.bonuses.xpMultiplier);
        while (this.xp >= this.getXpNeeded()) {
            this.xp -= this.getXpNeeded();
            this.levelUp();
        }
    }

    levelUp() {
        this.level++;
        this.gold += 50; // Level up bonus
        
        // Unlock new spells at certain levels
        const levelUnlocks = {
            2: 'Heal',
            3: 'Lightning Bolt',
            5: 'Frost Armor',
            7: 'Fireball',
            10: 'Time Warp',
            12: 'Death Strike',
            15: 'Meteor',
            20: 'Rainbow Blessing'
        };
        
        if (levelUnlocks[this.level]) {
            this.unlockedSpells.add(levelUnlocks[this.level]);
            this.showUnlockNotification(`New spell unlocked: ${levelUnlocks[this.level]}!`);
        }

        // Level bonuses
        if (this.level % 5 === 0) {
            this.bonuses.goldMultiplier += 0.1;
        }
        if (this.level % 10 === 0) {
            this.bonuses.xpMultiplier += 0.1;
        }

        this.showUnlockNotification(`Level Up! You are now level ${this.level}!`);
        this.checkAchievements();
    }

    checkAchievements() {
        const achievements = [
            {
                id: 'first_gather',
                name: 'First Gather',
                icon: '🌟',
                desc: 'Gather your first reagents',
                condition: () => this.totalSpinCount >= 1
            },
            {
                id: 'gold_hoarder',
                name: 'Gold Hoarder',
                icon: '💰',
                desc: 'Reach 1000 gold',
                condition: () => this.gold >= 1000
            },
            {
                id: 'spell_master',
                name: 'Spell Master',
                icon: '⚡',
                desc: 'Reach level 10',
                condition: () => this.level >= 10
            },
            {
                id: 'reagent_collector',
                name: 'Reagent Collector',
                icon: '🧪',
                desc: 'Collect 50 total reagents',
                condition: () => Object.values(this.reagents).reduce((sum, amount) => sum + amount, 0) >= 50
            },
            {
                id: 'archmage',
                name: 'Archmage',
                icon: '🧙‍♂️',
                desc: 'Reach level 20',
                condition: () => this.level >= 20
            },
            {
                id: 'spell_collector',
                name: 'Spell Collector',
                icon: '📚',
                desc: 'Unlock 5 different spells',
                condition: () => this.unlockedSpells.size >= 5
            }
        ];

        achievements.forEach(achievement => {
            if (!this.achievements.has(achievement.id) && achievement.condition()) {
                this.achievements.add(achievement.id);
                this.showUnlockNotification(`Achievement Unlocked: ${achievement.name}!`);
            }
        });
    }

    showUnlockNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'unlock-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(145deg, #ffd700, #ffed4e);
            color: #1a1a2e;
            padding: 20px 40px;
            border-radius: 15px;
            font-size: 1.2rem;
            font-weight: 600;
            z-index: 1000;
            box-shadow: 0 10px 30px rgba(255, 215, 0, 0.5);
            animation: unlock 0.8s ease;
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Spell System
const SYMBOLS = {
    '🔥': { name: 'Fire', weight: 20 },
    '💧': { name: 'Water', weight: 20 },
    '🌍': { name: 'Earth', weight: 20 },
    '💨': { name: 'Air', weight: 20 },
    '⚡': { name: 'Lightning', weight: 15 },
    '❄️': { name: 'Ice', weight: 15 },
    '🌟': { name: 'Star', weight: 10 },
    '🔮': { name: 'Crystal', weight: 8 },
    '💀': { name: 'Death', weight: 5 },
    '🌈': { name: 'Rainbow', weight: 3 }
};

const SPELLS = {
    'Spark': {
        cost: { fire: 1 },
        effect: 'Basic fire spell',
        damage: 8,
        type: 'damage',
        xpReward: 2
    },
    'Heal': {
        cost: { water: 2, star: 1 },
        effect: 'Restores 25 health',
        healing: 25,
        type: 'healing',
        xpReward: 5
    },
    'Lightning Bolt': {
        cost: { lightning: 2 },
        effect: 'Powerful electric attack',
        damage: 15,
        type: 'damage',
        xpReward: 8
    },
    'Frost Armor': {
        cost: { ice: 1, earth: 1 },
        effect: 'Protective ice spell that heals 15 HP',
        healing: 15,
        type: 'healing',
        xpReward: 6
    },
    'Fireball': {
        cost: { fire: 3 },
        effect: 'Devastating fire magic',
        damage: 25,
        type: 'damage',
        xpReward: 15
    },
    'Time Warp': {
        cost: { star: 1, crystal: 1 },
        effect: 'Gives double reagents next spin',
        type: 'utility',
        xpReward: 12
    },
    'Meteor': {
        cost: { fire: 2, earth: 1, star: 1 },
        effect: 'Calls down a meteor',
        damage: 40,
        type: 'damage',
        xpReward: 25
    },
    'Death Strike': {
        cost: { death: 1 },
        effect: 'Dark magic that deals heavy damage',
        damage: 20,
        type: 'damage',
        xpReward: 15
    },
    'Rainbow Blessing': {
        cost: { rainbow: 1 },
        effect: 'Powerful healing and reagent bonus',
        healing: 40,
        type: 'healing',
        xpReward: 20
    }
};

// Game Logic
class SpellSlotsGame {
    constructor() {
        this.gameState = new GameState();
        this.isSpinning = false;
        this.winStreak = 0;
        this.lossStreak = 0;
        this.lastResult = null;
        this.timeWarpActive = false;
        
        this.initializeUI();
        this.updateDisplay();
        this.populateSpellList();
        this.updateAchievements();
    }

    initializeUI() {
        // Gather reagents button
        const gatherBtn = document.getElementById('gatherBtn');
        gatherBtn.addEventListener('click', () => this.gatherReagents());

        // Save/Reset buttons
        document.getElementById('saveBtn').addEventListener('click', () => {
            this.gameState.save();
            this.showTemporaryMessage('Game saved!');
        });

        document.getElementById('resetBtn').addEventListener('click', () => {
            if (confirm('Are you sure you want to start a new game? This will delete your current progress.')) {
                this.gameState.reset();
                this.winStreak = 0;
                this.lossStreak = 0;
                this.timeWarpActive = false;
                this.updateDisplay();
                this.populateSpellList();
                this.updateAchievements();
                this.showTemporaryMessage('New game started!');
            }
        });

        // Enemy attack timer
        this.enemyAttackTimer = setInterval(() => {
            if (this.gameState.combatActive && !this.isSpinning) {
                this.enemyAttack();
            }
        }, 8000); // Enemy attacks every 8 seconds
    }

    showTemporaryMessage(message) {
        const messageEl = document.getElementById('lastSpell');
        const originalText = messageEl.textContent;
        messageEl.textContent = message;
        messageEl.style.color = '#4ecdc4';
        
        setTimeout(() => {
            messageEl.textContent = originalText;
            messageEl.style.color = '';
        }, 2000);
    }

    getRandomSymbol() {
        const symbols = Object.keys(SYMBOLS);
        const weights = Object.values(SYMBOLS).map(s => s.weight);
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        
        let random = Math.random() * totalWeight;
        for (let i = 0; i < symbols.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return symbols[i];
            }
        }
        return symbols[0];
    }

    async gatherReagents() {
        if (this.isSpinning) return;

        this.isSpinning = true;
        this.gameState.totalSpinCount++;

        // Disable gather button
        const gatherBtn = document.getElementById('gatherBtn');
        gatherBtn.disabled = true;

        // Add spinning animation
        const reels = [
            document.getElementById('reel1'),
            document.getElementById('reel2'),
            document.getElementById('reel3')
        ];

        reels.forEach(reel => reel.classList.add('spinning'));

        // Generate random symbols for each reel
        const symbols = [
            this.getRandomSymbol(),
            this.getRandomSymbol(),
            this.getRandomSymbol()
        ];

        // Simulate spinning time
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Update symbols
        reels.forEach((reel, index) => {
            reel.querySelector('.symbol').textContent = symbols[index];
            reel.classList.remove('spinning');
        });

        // Calculate reagents gained
        const result = this.calculateReagentGain(symbols);
        this.displayGatherResult(result);
        
        // Update game state
        result.reagentsGained.forEach(reagent => {
            this.gameState.addReagent(reagent.symbol, reagent.amount);
        });
        
        if (result.reagentsGained.length > 0) {
            this.gameState.addXp(result.xpEarned);
        }

        this.gameState.checkAchievements();
        this.updateDisplay();
        this.updateAchievements();
        this.gameState.save();

        // Re-enable gather button
        gatherBtn.disabled = false;
        this.isSpinning = false;
    }

    enemyAttack() {
        const damage = Math.floor(Math.random() * 10) + 5; // 5-14 damage
        this.gameState.takeDamage(damage);
        this.showTemporaryMessage(`${this.gameState.enemy.name} attacks for ${damage} damage!`);
        this.updateDisplay();
        this.gameState.save();
    }

    calculateReagentGain(symbols) {
        let xpEarned = 1; // Base XP for spinning
        const reagentsGained = [];

        // Check for matching symbols (multiples give reagents)
        const symbolCounts = {};
        symbols.forEach(symbol => {
            symbolCounts[symbol] = (symbolCounts[symbol] || 0) + 1;
        });

        // Multiples give reagents
        Object.entries(symbolCounts).forEach(([symbol, count]) => {
            if (count >= 2) {
                let amount = count === 2 ? 2 : 4; // 2 reagents for pair, 4 for triple
                if (this.timeWarpActive) {
                    amount *= 2; // Double reagents from Time Warp
                }
                reagentsGained.push({
                    symbol: symbol,
                    amount: amount
                });
                xpEarned += count * 2;
            }
        });

        // Reset Time Warp after use
        if (this.timeWarpActive && reagentsGained.length > 0) {
            this.timeWarpActive = false;
        }

        // Special symbol bonuses
        if (symbols.includes('🌈')) {
            reagentsGained.forEach(reagent => {
                reagent.amount = Math.floor(reagent.amount * 1.5);
            });
        }

        return {
            reagentsGained,
            xpEarned: Math.floor(xpEarned),
            symbols
        };
    }

    canCastSpell(spellName) {
        const spell = SPELLS[spellName];
        if (!spell || !this.gameState.unlockedSpells.has(spellName)) return false;
        
        for (const [reagentType, required] of Object.entries(spell.cost)) {
            if (this.gameState.reagents[reagentType] < required) {
                return false;
            }
        }
        return true;
    }

    castSpell(spellName) {
        if (!this.canCastSpell(spellName)) return false;

        const spell = SPELLS[spellName];
        
        // Consume reagents
        for (const [reagentType, required] of Object.entries(spell.cost)) {
            this.gameState.reagents[reagentType] -= required;
        }

        // Apply spell effects
        if (spell.type === 'damage') {
            this.gameState.damageEnemy(spell.damage);
            this.showTemporaryMessage(`${spellName}: ${spell.damage} damage to ${this.gameState.enemy.name}!`);
        } else if (spell.type === 'healing') {
            this.gameState.healPlayer(spell.healing);
            if (spellName === 'Rainbow Blessing') {
                // Rainbow Blessing also gives random reagents
                const reagentTypes = ['fire', 'water', 'earth', 'air', 'lightning', 'ice', 'star', 'crystal'];
                reagentTypes.forEach(type => {
                    this.gameState.reagents[type] += Math.floor(Math.random() * 3) + 1;
                });
                this.showTemporaryMessage(`${spellName}: Healed ${spell.healing} HP and gained random reagents!`);
            } else {
                this.showTemporaryMessage(`${spellName}: Healed ${spell.healing} HP!`);
            }
        } else if (spell.type === 'utility') {
            if (spellName === 'Time Warp') {
                this.timeWarpActive = true;
                this.showTemporaryMessage(`${spellName}: Next reagent gathering will give double reagents!`);
            }
        }

        this.gameState.addXp(spell.xpReward);
        this.updateDisplay();
        this.populateSpellList(); // Update spell list to reflect new castable status
        this.gameState.save();
        return true;
    }

    displayGatherResult(result) {
        const lastSpellEl = document.getElementById('lastSpell');
        const payoutEl = document.getElementById('payout');

        if (result.reagentsGained.length > 0) {
            const reagentText = result.reagentsGained.map(r => `${r.amount}x ${SYMBOLS[r.symbol].name}`).join(', ');
            lastSpellEl.textContent = `Reagents gathered: ${reagentText}`;
            payoutEl.textContent = `+${result.reagentsGained.reduce((sum, r) => sum + r.amount, 0)} Reagents`;
            payoutEl.className = 'payout positive';
        } else {
            const failMessages = [
                'No reagents found this time...',
                'The magical elements remain scattered...',
                'The gathering ritual was unsuccessful...',
                'No multiples - no reagents...'
            ];
            lastSpellEl.textContent = failMessages[Math.floor(Math.random() * failMessages.length)];
            payoutEl.textContent = 'No reagents';
            payoutEl.className = 'payout negative';
        }

        // Add temporary glow effect
        setTimeout(() => {
            payoutEl.className = 'payout';
        }, 500);
    }

    updateDisplay() {
        document.getElementById('level').textContent = this.gameState.level;
        document.getElementById('gold').textContent = this.gameState.gold;
        document.getElementById('xp').textContent = this.gameState.xp;
        document.getElementById('xpNext').textContent = this.gameState.getXpNeeded();
        
        // Update XP bar
        const xpProgress = (this.gameState.xp / this.gameState.getXpNeeded()) * 100;
        document.getElementById('xpBar').style.width = `${xpProgress}%`;

        // Update health bars
        const playerHealthPercent = (this.gameState.playerHealth / this.gameState.maxPlayerHealth) * 100;
        document.getElementById('playerHealthBar').style.width = `${playerHealthPercent}%`;
        document.getElementById('playerHealth').textContent = `${this.gameState.playerHealth}/${this.gameState.maxPlayerHealth}`;

        const enemyHealthPercent = (this.gameState.enemy.health / this.gameState.enemy.maxHealth) * 100;
        document.getElementById('enemyHealthBar').style.width = `${enemyHealthPercent}%`;
        document.getElementById('enemyHealth').textContent = `${this.gameState.enemy.health}/${this.gameState.enemy.maxHealth}`;
        document.getElementById('enemyName').textContent = this.gameState.enemy.name;

        // Update reagents display
        const reagentsEl = document.getElementById('reagents');
        const reagentEntries = Object.entries(this.gameState.reagents)
            .filter(([_, amount]) => amount > 0)
            .map(([type, amount]) => {
                const symbolMap = {
                    fire: '🔥', water: '💧', earth: '🌍', air: '💨', lightning: '⚡',
                    ice: '❄️', star: '🌟', crystal: '🔮', death: '💀', rainbow: '🌈'
                };
                return `<div class="reagent">${symbolMap[type]} ${amount}</div>`;
            });
        
        reagentsEl.innerHTML = reagentEntries.length > 0 ? reagentEntries.join('') : '<div class="reagent">No reagents</div>';
    }

    populateSpellList() {
        const spellListEl = document.getElementById('spellList');
        spellListEl.innerHTML = '';

        Object.entries(SPELLS).forEach(([name, spell]) => {
            const isUnlocked = this.gameState.unlockedSpells.has(name);
            const canCast = isUnlocked && this.canCastSpell(name);
            const spellEl = document.createElement('div');
            spellEl.className = `spell-item ${isUnlocked ? 'unlocked' : 'locked'} ${canCast ? 'castable' : ''}`;
            spellEl.style.opacity = isUnlocked ? '1' : '0.5';
            
            if (isUnlocked) {
                const symbolMap = {
                    fire: '🔥', water: '💧', earth: '🌍', air: '💨', lightning: '⚡',
                    ice: '❄️', star: '🌟', crystal: '🔮', death: '💀', rainbow: '🌈'
                };
                
                const costText = Object.entries(spell.cost)
                    .map(([reagent, amount]) => `${amount}${symbolMap[reagent]}`)
                    .join(' ');
                
                spellEl.innerHTML = `
                    <span class="spell-name">${name}</span>
                    <span class="spell-desc">${spell.effect}</span>
                    <span class="spell-cost">Cost: ${costText}</span>
                `;
                
                if (canCast) {
                    spellEl.style.cursor = 'pointer';
                    spellEl.addEventListener('click', () => {
                        this.castSpell(name);
                    });
                }
            } else {
                spellEl.innerHTML = `
                    <span class="spell-name">???</span>
                    <span class="spell-desc">Locked</span>
                    <span class="spell-cost">???</span>
                `;
            }
            
            spellListEl.appendChild(spellEl);
        });
    }

    updateAchievements() {
        const achievementsEl = document.getElementById('achievements');
        const achievements = [
            { id: 'first_gather', name: 'First Gather', icon: '🌟', desc: 'Gather your first reagents' },
            { id: 'gold_hoarder', name: 'Gold Hoarder', icon: '💰', desc: 'Reach 1000 gold' },
            { id: 'spell_master', name: 'Spell Master', icon: '⚡', desc: 'Reach level 10' },
            { id: 'reagent_collector', name: 'Reagent Collector', icon: '🧪', desc: 'Collect 50 total reagents' },
            { id: 'archmage', name: 'Archmage', icon: '🧙‍♂️', desc: 'Reach level 20' },
            { id: 'spell_collector', name: 'Spell Collector', icon: '📚', desc: 'Unlock 5 different spells' }
        ];

        achievementsEl.innerHTML = achievements.map(achievement => {
            const isUnlocked = this.gameState.achievements.has(achievement.id);
            return `
                <div class="achievement ${isUnlocked ? 'unlocked' : 'locked'}">
                    <span class="achievement-icon">${achievement.icon}</span>
                    <span class="achievement-name">${achievement.name}</span>
                    <span class="achievement-desc">${achievement.desc}</span>
                </div>
            `;
        }).join('');
    }
}

// Initialize game when page loads
let game;
document.addEventListener('DOMContentLoaded', () => {
    game = new SpellSlotsGame();
});

// Prevent page refresh on space bar (common in games)
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
    }
});