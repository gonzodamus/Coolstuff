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
        
        // Load saved game if exists
        this.load();
    }

    save() {
        const saveData = {
            level: this.level,
            gold: this.gold,
            xp: this.xp,
            totalSpinCount: this.totalSpinCount,
            unlockedSpells: Array.from(this.unlockedSpells),
            achievements: Array.from(this.achievements),
            bonuses: this.bonuses
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
        localStorage.removeItem('spellSlotsGame');
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
            15: 'Meteor',
            20: 'Wish'
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
                id: 'first_spell',
                name: 'First Spell',
                icon: '🌟',
                desc: 'Cast your first spell',
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
                id: 'lucky_streak',
                name: 'Lucky Streak',
                icon: '🍀',
                desc: 'Win 5 spins in a row',
                condition: () => game.winStreak >= 5
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
        combo: ['🔥'],
        effect: 'Basic fire spell',
        goldMultiplier: 1.5,
        xpReward: 2
    },
    'Heal': {
        combo: ['💧', '🌟'],
        effect: 'Restores health and gives bonus gold',
        goldMultiplier: 2.0,
        xpReward: 5
    },
    'Lightning Bolt': {
        combo: ['⚡', '⚡'],
        effect: 'Powerful electric attack',
        goldMultiplier: 3.0,
        xpReward: 8
    },
    'Frost Armor': {
        combo: ['❄️', '🌍'],
        effect: 'Protective ice spell',
        goldMultiplier: 2.5,
        xpReward: 6
    },
    'Fireball': {
        combo: ['🔥', '🔥', '🔥'],
        effect: 'Devastating fire magic',
        goldMultiplier: 5.0,
        xpReward: 15
    },
    'Time Warp': {
        combo: ['🌟', '🔮'],
        effect: 'Manipulates time for extra rewards',
        goldMultiplier: 4.0,
        xpReward: 12
    },
    'Meteor': {
        combo: ['🔥', '🌍', '🌟'],
        effect: 'Calls down a meteor',
        goldMultiplier: 8.0,
        xpReward: 25
    },
    'Wish': {
        combo: ['🌈', '🌟', '🔮'],
        effect: 'Grants a powerful wish',
        goldMultiplier: 15.0,
        xpReward: 50
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
        
        this.initializeUI();
        this.updateDisplay();
        this.populateSpellList();
        this.updateAchievements();
    }

    initializeUI() {
        // Bet amount slider
        const betSlider = document.getElementById('betAmount');
        const betDisplay = document.getElementById('betDisplay');
        const spinBtn = document.getElementById('spinBtn');

        betSlider.addEventListener('input', () => {
            betDisplay.textContent = betSlider.value;
            spinBtn.textContent = `Cast Spell (${betSlider.value} Gold)`;
        });

        // Spin button
        spinBtn.addEventListener('click', () => this.spin());

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
                this.updateDisplay();
                this.populateSpellList();
                this.updateAchievements();
                this.showTemporaryMessage('New game started!');
            }
        });
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

    async spin() {
        const betAmount = parseInt(document.getElementById('betAmount').value);
        
        if (this.gameState.gold < betAmount) {
            alert('Not enough gold!');
            return;
        }

        if (this.isSpinning) return;

        this.isSpinning = true;
        this.gameState.gold -= betAmount;
        this.gameState.totalSpinCount++;

        // Disable spin button
        const spinBtn = document.getElementById('spinBtn');
        spinBtn.disabled = true;

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

        // Calculate result
        const result = this.calculateResult(symbols, betAmount);
        this.displayResult(result);
        
        // Update game state
        this.gameState.gold += result.goldWon;
        if (result.goldWon > 0) {
            this.gameState.addXp(result.xpEarned);
        }

        // Update win/loss streaks
        if (result.goldWon > betAmount) {
            this.winStreak++;
            this.lossStreak = 0;
        } else if (result.goldWon === 0) {
            this.lossStreak++;
            this.winStreak = 0;
            
            // Consolation mechanics to keep players engaged
            if (this.lossStreak >= 3) {
                const consolationGold = Math.floor(betAmount * 0.5);
                this.gameState.gold += consolationGold;
                this.showTemporaryMessage(`Luck bonus: +${consolationGold} gold!`);
            }
        } else {
            this.winStreak = 0;
            this.lossStreak = 0;
        }

        this.gameState.checkAchievements();
        this.updateDisplay();
        this.updateAchievements();
        this.gameState.save();

        // Re-enable spin button
        spinBtn.disabled = false;
        this.isSpinning = false;
    }

    calculateResult(symbols, betAmount) {
        let goldWon = 0;
        let xpEarned = 1; // Base XP for spinning
        let spellCast = null;

        // Check for matching symbols (basic payouts)
        const symbolCounts = {};
        symbols.forEach(symbol => {
            symbolCounts[symbol] = (symbolCounts[symbol] || 0) + 1;
        });

        // Basic matching payouts
        Object.entries(symbolCounts).forEach(([symbol, count]) => {
            if (count === 2) {
                goldWon += betAmount * 1.5;
            } else if (count === 3) {
                goldWon += betAmount * 5;
            }
        });

        // Check for spell combinations
        for (const [spellName, spell] of Object.entries(SPELLS)) {
            if (!this.gameState.unlockedSpells.has(spellName)) continue;

            if (this.matchesSpellCombo(symbols, spell.combo)) {
                spellCast = spellName;
                goldWon = Math.floor(betAmount * spell.goldMultiplier);
                xpEarned += spell.xpReward;
                break;
            }
        }

        // Special symbol bonuses
        if (symbols.includes('🌈')) goldWon = Math.floor(goldWon * 1.5);
        if (symbols.includes('💀') && Math.random() < 0.1) {
            goldWon = betAmount * 10; // Rare death bonus
            spellCast = 'Death\'s Gambit';
        }

        return {
            goldWon: Math.floor(goldWon * this.gameState.bonuses.goldMultiplier),
            xpEarned: Math.floor(xpEarned),
            spellCast,
            symbols
        };
    }

    matchesSpellCombo(symbols, combo) {
        if (combo.length === 1) {
            return symbols.includes(combo[0]);
        } else if (combo.length === 2) {
            return combo.every(symbol => symbols.includes(symbol));
        } else if (combo.length === 3) {
            return combo.every((symbol, index) => symbols[index] === symbol);
        }
        return false;
    }

    displayResult(result) {
        const lastSpellEl = document.getElementById('lastSpell');
        const payoutEl = document.getElementById('payout');

        if (result.spellCast) {
            lastSpellEl.textContent = `${result.spellCast} cast! ${SPELLS[result.spellCast]?.effect || ''}`;
        } else if (result.goldWon > 0) {
            lastSpellEl.textContent = 'Symbols aligned! Minor magical resonance detected.';
        } else {
            const failMessages = [
                'The spell fizzled out...',
                'Magical energies are unstable...',
                'The runes refuse to align...',
                'Spell components were ineffective...'
            ];
            lastSpellEl.textContent = failMessages[Math.floor(Math.random() * failMessages.length)];
        }

        if (result.goldWon > 0) {
            payoutEl.textContent = `+${result.goldWon} Gold`;
            payoutEl.className = 'payout positive';
        } else {
            payoutEl.textContent = 'No reward';
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

        // Update bonuses display
        const bonusesEl = document.getElementById('bonuses');
        bonusesEl.innerHTML = `
            <div class="bonus">Base XP: +1 per spin</div>
            <div class="bonus">Gold Multiplier: x${this.gameState.bonuses.goldMultiplier.toFixed(1)}</div>
            <div class="bonus">XP Multiplier: x${this.gameState.bonuses.xpMultiplier.toFixed(1)}</div>
            ${this.winStreak > 0 ? `<div class="bonus">Win Streak: ${this.winStreak}</div>` : ''}
        `;
    }

    populateSpellList() {
        const spellListEl = document.getElementById('spellList');
        spellListEl.innerHTML = '';

        Object.entries(SPELLS).forEach(([name, spell]) => {
            const isUnlocked = this.gameState.unlockedSpells.has(name);
            const spellEl = document.createElement('div');
            spellEl.className = `spell-item ${isUnlocked ? 'unlocked' : 'locked'}`;
            spellEl.style.opacity = isUnlocked ? '1' : '0.5';
            
            spellEl.innerHTML = `
                <span class="spell-name">${isUnlocked ? name : '???'}</span>
                <span class="spell-desc">${isUnlocked ? spell.effect : 'Locked'}</span>
                <span class="spell-combo">${isUnlocked ? spell.combo.join(' ') : '???'}</span>
            `;
            
            spellListEl.appendChild(spellEl);
        });
    }

    updateAchievements() {
        const achievementsEl = document.getElementById('achievements');
        const achievements = [
            { id: 'first_spell', name: 'First Spell', icon: '🌟', desc: 'Cast your first spell' },
            { id: 'gold_hoarder', name: 'Gold Hoarder', icon: '💰', desc: 'Reach 1000 gold' },
            { id: 'spell_master', name: 'Spell Master', icon: '⚡', desc: 'Reach level 10' },
            { id: 'lucky_streak', name: 'Lucky Streak', icon: '🍀', desc: 'Win 5 spins in a row' },
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