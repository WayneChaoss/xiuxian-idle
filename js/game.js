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
            
            // 突破奖励灵石（根据境界）
            const stoneReward = Math.floor(next.required / 2);
            this.state.spiritStones += stoneReward;
            
            // 播放突破特效
            if (typeof playBreakthroughEffect === 'function') {
                playBreakthroughEffect();
            }
            
            const modal = document.getElementById('breakthrough-modal');
            const msg = document.getElementById('breakthrough-message');
            msg.innerHTML = `恭喜突破到 <strong style="color: var(--accent);">${next.name}</strong><br>获得 ${stoneReward} 灵石奖励！<br>自动修炼速度提升！`;
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

// 粒子效果系统
class ParticleSystem {
    constructor() {
        this.container = document.getElementById('particles-container');
        this.particles = [];
    }
    
    // 点击修炼时的粒子爆发
    spawnClickParticles(x, y) {
        for (let i = 0; i < 8; i++) {
            this.createParticle(x, y, 'gold');
        }
    }
    
    // 修为数字飘动
    spawnFloatingText(x, y, text, color = '#ffd700') {
        const el = document.createElement('div');
        el.className = 'floating-text';
        el.textContent = text;
        el.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            color: ${color};
            font-size: 20px;
            font-weight: bold;
            pointer-events: none;
            z-index: 1000;
            text-shadow: 0 0 10px ${color};
            animation: floatUp 1s ease-out forwards;
        `;
        this.container.appendChild(el);
        
        setTimeout(() => el.remove(), 1000);
    }
    
    createParticle(x, y, type) {
        const el = document.createElement('div');
        const colors = {
            gold: '#ffd700',
            cyan: '#00ffff',
            purple: '#9d4edd'
        };
        
        el.style.cssText = `
            position: fixed;
            width: 6px;
            height: 6px;
            background: ${colors[type] || colors.gold};
            border-radius: 50%;
            left: ${x}px;
            top: ${y}px;
            pointer-events: none;
            box-shadow: 0 0 6px ${colors[type] || colors.gold};
        `;
        
        this.container.appendChild(el);
        
        // 随机运动
        const angle = Math.random() * Math.PI * 2;
        const velocity = 2 + Math.random() * 3;
        let vx = Math.cos(angle) * velocity;
        let vy = Math.sin(angle) * velocity - 2;
        let opacity = 1;
        
        const animate = () => {
            const currentLeft = parseFloat(el.style.left);
            const currentTop = parseFloat(el.style.top);
            
            el.style.left = (currentLeft + vx) + 'px';
            el.style.top = (currentTop + vy) + 'px';
            el.style.opacity = opacity;
            
            vy += 0.2; // 重力
            opacity -= 0.02;
            
            if (opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                el.remove();
            }
        };
        
        requestAnimationFrame(animate);
    }
}

// 背景动画
class BackgroundAnimation {
    constructor() {
        this.canvas = document.getElementById('bg-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.stars = [];
        this.energy = [];
        this.init();
    }
    
    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        // 创建星星
        for (let i = 0; i < 100; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2,
                speed: 0.1 + Math.random() * 0.3
            });
        }
        
        // 创建灵气流动
        for (let i = 0; i < 20; i++) {
            this.energy.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: 20 + Math.random() * 30,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                life: Math.random()
            });
        }
        
        this.animate();
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    animate() {
        this.ctx.fillStyle = 'rgba(10, 10, 26, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制星星
        this.ctx.fillStyle = '#ffffff';
        this.stars.forEach(star => {
            this.ctx.globalAlpha = 0.3 + Math.random() * 0.7;
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fill();
            
            star.y += star.speed;
            if (star.y > this.canvas.height) {
                star.y = 0;
                star.x = Math.random() * this.canvas.width;
            }
        });
        
        // 绘制灵气
        this.energy.forEach(e => {
            const gradient = this.ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.size);
            gradient.addColorStop(0, `rgba(255, 215, 0, ${e.life * 0.1})`);
            gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
            this.ctx.fill();
            
            e.x += e.vx;
            e.y += e.vy;
            e.life += 0.005;
            
            if (e.life > 1 || e.x < 0 || e.x > this.canvas.width || 
                e.y < 0 || e.y > this.canvas.height) {
                e.x = Math.random() * this.canvas.width;
                e.y = Math.random() * this.canvas.height;
                e.life = 0;
            }
        });
        
        this.ctx.globalAlpha = 1;
        requestAnimationFrame(() => this.animate());
    }
}

// 突破特效
function playBreakthroughEffect() {
    const container = document.getElementById('particles-container');
    
    // 金色光环
    const ring = document.createElement('div');
    ring.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        border: 10px solid #ffd700;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        pointer-events: none;
        z-index: 999;
        box-shadow: 0 0 50px #ffd700;
    `;
    container.appendChild(ring);
    
    // 扩散动画
    let size = 0;
    const expand = () => {
        size += 20;
        ring.style.width = size + 'px';
        ring.style.height = size + 'px';
        ring.style.opacity = 1 - (size / 1000);
        
        if (size < 1000) {
            requestAnimationFrame(expand);
        } else {
            ring.remove();
        }
    };
    expand();
    
    // 粒子爆发
    const particles = new ParticleSystem();
    for (let i = 0; i < 30; i++) {
        setTimeout(() => {
            particles.createParticle(
                window.innerWidth / 2 + (Math.random() - 0.5) * 200,
                window.innerHeight / 2 + (Math.random() - 0.5) * 200,
                'gold'
            );
        }, i * 50);
    }
}

// 初始化视觉系统
document.addEventListener('DOMContentLoaded', () => {
    const bg = new BackgroundAnimation();
    const particles = new ParticleSystem();
    
    // 重写点击函数以添加特效
    const originalCultivate = game?.cultivate;
    
    // 修改点击区域添加粒子
    const cultivator = document.getElementById('cultivator');
    if (cultivator) {
        cultivator.addEventListener('click', (e) => {
            const rect = cultivator.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;
            
            particles.spawnClickParticles(x, y);
            
            const clickPower = game ? game.getClickPower() : 5;
            particles.spawnFloatingText(x, y - 50, '+' + clickPower + ' 修为');
        });
    }
});
