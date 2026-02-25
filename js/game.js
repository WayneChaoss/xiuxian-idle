/**
 * 修仙放置 - 核心游戏逻辑
 */
class XiuxianGame {
    constructor() {
        this.state = {
            spiritStones: 0,
            cultivation: 0,
            realmLevel: 0,
            gameTime: 0,
            techniques: {},
            cave: {},
            lastTick: Date.now(),
            lastSave: Date.now()
        };
        
        // 初始化功法
        Techniques.forEach(t => this.state.techniques[t.id] = 0);
        CaveItems.forEach(c => this.state.cave[c.id] = 0);
        
        this.init();
    }
    
    init() {
        this.load();
        this.processOffline();
        this.startLoop();
        this.render();
    }
    
    // 处理离线收益
    processOffline() {
        const now = Date.now();
        const offlineTime = (now - this.state.lastSave) / 1000;
        
        if (offlineTime > 60) {
            const rate = this.getAutoRate();
            const maxTime = Math.min(offlineTime, 7200); // 最多2小时
            const gain = Math.floor(rate * maxTime * 0.5);
            
            if (gain > 0) {
                const hours = Math.floor(offlineTime / 3600);
                const mins = Math.floor((offlineTime % 3600) / 60);
                
                const modal = document.getElementById('offline-modal');
                const msg = document.getElementById('offline-message');
                msg.textContent = `闭关 ${hours}小时${mins}分钟，获得 ${gain} 修为`;
                modal.classList.remove('hidden');
                
                this.state.cultivation += gain;
            }
        }
    }
    
    dismissOffline() {
        document.getElementById('offline-modal').classList.add('hidden');
    }
    
    // 游戏循环
    startLoop() {
        setInterval(() => this.tick(), 1000);
        setInterval(() => this.save(), 30000);
    }
    
    tick() {
        this.state.gameTime++;
        
        // 自动修炼
        const rate = this.getAutoRate();
        this.state.cultivation += rate;
        
        // 灵石产出
        const stoneRate = this.getStoneRate();
        this.state.spiritStones += stoneRate;
        
        this.render();
    }
    
    // 打坐修炼（点击）
    cultivate() {
        const clickPower = this.getClickPower();
        this.state.cultivation += clickPower;
        
        // 视觉反馈
        const icon = document.getElementById('cultivator-icon');
        icon.style.transform = 'scale(1.2)';
        setTimeout(() => icon.style.transform = '', 100);
        
        this.render();
    }
    
    // 尝试突破
    attemptBreakthrough() {
        const current = getCurrentRealm(this.state.cultivation);
        const next = getNextRealm(this.state.realmLevel);
        
        if (!next) {
            alert('已达到最高境界！');
            return;
        }
        
        const chance = getBreakthroughChance(this.state.cultivation, next);
        
        if (Math.random() * 100 < chance) {
            // 突破成功
            this.state.realmLevel = next.required;
            
            const modal = document.getElementById('breakthrough-modal');
            const msg = document.getElementById('breakthrough-message');
            msg.innerHTML = `恭喜突破到 <strong style="color: var(--accent);">${next.name}</strong><br>自动修炼速度提升！`;
            modal.classList.remove('hidden');
        } else {
            // 突破失败，损失部分修为
            this.state.cultivation = Math.floor(this.state.cultivation * 0.8);
            alert('突破失败，修为损失20%，请继续努力！');
        }
        
        this.render();
    }
    
    dismissBreakthrough() {
        document.getElementById('breakthrough-modal').classList.add('hidden');
    }
    
    // 学习功法
    learnTechnique(techId) {
        const tech = Techniques.find(t => t.id === techId);
        const cost = tech.cost * Math.pow(1.5, this.state.techniques[techId]);
        
        if (this.state.spiritStones >= cost) {
            this.state.spiritStones -= cost;
            this.state.techniques[techId]++;
            this.render();
        }
    }
    
    // 建设洞府
    buildCave(itemId) {
        const item = CaveItems.find(c => c.id === itemId);
        const cost = item.cost * Math.pow(1.5, this.state.cave[itemId]);
        
        if (this.state.spiritStones >= cost) {
            this.state.spiritStones -= cost;
            this.state.cave[itemId]++;
            this.render();
        }
    }
    
    // 计算点击修为（基础5，随境界增长）
    getClickPower() {
        let power = 5; // 基础点击修为
        const realm = getCurrentRealm(this.state.realmLevel);
        power *= realm.multiplier;
        
        Techniques.forEach(t => {
            const level = this.state.techniques[t.id];
            power += t.cultivationBonus * level;
        });
        
        return power;
    }
    
    // 计算自动修炼速度
    getAutoRate() {
        let rate = 0;
        const realm = getCurrentRealm(this.state.realmLevel);
        rate += realm.autoRate;
        
        Techniques.forEach(t => {
            const level = this.state.techniques[t.id];
            rate += t.autoBonus * level;
        });
        
        CaveItems.forEach(c => {
            const level = this.state.cave[c.id];
            if (c.cultivationRate) {
                rate += c.cultivationRate * level;
            }
        });
        
        return rate;
    }
    
    // 计算灵石产出
    getStoneRate() {
        let rate = 0;
        CaveItems.forEach(c => {
            const level = this.state.cave[c.id];
            if (c.stoneRate) {
                rate += c.stoneRate * level;
            }
        });
        return rate;
    }
    
    // 渲染界面
    render() {
        const realm = getCurrentRealm(this.state.realmLevel);
        const next = getNextRealm(this.state.realmLevel);
        
        // 顶部统计
        document.getElementById('spirit-stones').textContent = this.formatNumber(this.state.spiritStones);
        document.getElementById('cultivation').textContent = this.formatNumber(this.state.cultivation);
        document.getElementById('cultivation-rate').textContent = `(+${this.getAutoRate()}/秒)`;
        document.getElementById('realm').textContent = realm.name;
        document.getElementById('game-time').textContent = `${Math.floor(this.state.gameTime / 3600)}年`;
        
        // 突破进度
        if (next) {
            const progress = Math.min(100, (this.state.cultivation / next.required) * 100);
            document.getElementById('progress-fill').style.width = progress + '%';
            document.getElementById('progress-text').textContent = 
                `${this.formatNumber(this.state.cultivation)} / ${this.formatNumber(next.required)}`;
            
            const chance = getBreakthroughChance(this.state.cultivation, next);
            const btn = document.getElementById('breakthrough-btn');
            btn.disabled = chance <= 0;
            btn.textContent = chance >= 100 ? '🔮 突破境界 (100%)' : `🔮 突破境界 (${chance}%)`;
        } else {
            document.getElementById('progress-fill').style.width = '100%';
            document.getElementById('progress-text').textContent = '已达到最高境界';
            document.getElementById('breakthrough-btn').disabled = true;
            document.getElementById('breakthrough-btn').textContent = '🔮 已登峰造极';
        }
        
        // 功法列表
        const techList = document.getElementById('techniques-list');
        techList.innerHTML = '';
        Techniques.forEach(tech => {
            const level = this.state.techniques[tech.id];
            const cost = Math.floor(tech.cost * Math.pow(1.5, level));
            const canAfford = this.state.spiritStones >= cost;
            
            const div = document.createElement('div');
            div.className = `technique-card ${canAfford ? '' : 'disabled'}`;
            div.onclick = () => this.learnTechnique(tech.id);
            div.innerHTML = `
                <div class="item-name">${tech.name} Lv.${level}</div>
                <div class="item-desc">${tech.description}</div>
                <div class="item-effect">+${tech.cultivationBonus}点击 / +${tech.autoBonus}自动</div>
                <div class="item-cost">💎 ${this.formatNumber(cost)}</div>
            `;
            techList.appendChild(div);
        });
        
        // 洞府列表
        const caveList = document.getElementById('cave-list');
        caveList.innerHTML = '';
        CaveItems.forEach(item => {
            const level = this.state.cave[item.id];
            const cost = Math.floor(item.cost * Math.pow(1.5, level));
            const canAfford = this.state.spiritStones >= cost;
            
            const div = document.createElement('div');
            div.className = `cave-item ${canAfford ? '' : 'disabled'}`;
            div.onclick = () => this.buildCave(item.id);
            div.innerHTML = `
                <div class="item-name">${item.name} Lv.${level}</div>
                <div class="item-desc">${item.description}</div>
                <div class="item-effect">+${item.cultivationRate || item.stoneRate}/秒</div>
                <div class="item-cost">💎 ${this.formatNumber(cost)}</div>
            `;
            caveList.appendChild(div);
        });
    }
    
    formatNumber(num) {
        if (num >= 1000000000) return (num / 1000000000).toFixed(1) + '亿';
        if (num >= 10000) return (num / 10000).toFixed(1) + '万';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return Math.floor(num).toString();
    }
    
    // 存档
    save() {
        try {
            localStorage.setItem('xiuxian_save', JSON.stringify({
                state: this.state,
                timestamp: Date.now()
            }));
            this.state.lastSave = Date.now();
        } catch (e) {
            console.error('保存失败:', e);
        }
    }
    
    load() {
        try {
            const data = JSON.parse(localStorage.getItem('xiuxian_save'));
            if (data?.state) {
                this.state = { ...this.state, ...data.state };
            }
        } catch (e) {
            console.error('加载失败:', e);
        }
    }
    
    exportSave() {
        const saveString = btoa(JSON.stringify({ state: this.state }));
        navigator.clipboard.writeText(saveString).then(() => {
            alert('存档已复制！');
        }).catch(() => {
            prompt('复制存档：', saveString);
        });
    }
    
    importSave() {
        const code = prompt('请输入存档：');
        if (code) {
            try {
                this.state = JSON.parse(atob(code)).state;
                this.render();
                alert('存档加载成功！');
            } catch (e) {
                alert('存档无效！');
            }
        }
    }
    
    hardReset() {
        if (confirm('确定重置？此操作不可恢复！')) {
            localStorage.removeItem('xiuxian_save');
            location.reload();
        }
    }
}

// 全局实例
let game;
document.addEventListener('DOMContentLoaded', () => {
    game = new XiuxianGame();
});
