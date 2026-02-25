/**
 * 修仙数据定义
 */

// 境界定义
const Realms = [
    { name: '凡人', required: 0, autoRate: 0, multiplier: 1 },
    { name: '炼气', required: 100, autoRate: 1, multiplier: 2 },
    { name: '筑基', required: 500, autoRate: 3, multiplier: 4 },
    { name: '金丹', required: 2000, autoRate: 10, multiplier: 8 },
    { name: '元婴', required: 10000, autoRate: 30, multiplier: 16 },
    { name: '化神', required: 50000, autoRate: 100, multiplier: 32 },
    { name: '渡劫', required: 200000, autoRate: 300, multiplier: 64 },
    { name: '大乘', required: 1000000, autoRate: 1000, multiplier: 128 },
    { name: '真仙', required: 5000000, autoRate: 3000, multiplier: 256 }
];

// 功法定义
const Techniques = [
    {
        id: 'basic_qi',
        name: '吐纳术',
        description: '基础呼吸法门',
        cost: 10,
        cultivationBonus: 1,
        autoBonus: 0
    },
    {
        id: 'spirit_gathering',
        name: '聚灵诀',
        description: '聚集天地灵气',
        cost: 100,
        cultivationBonus: 3,
        autoBonus: 1
    },
    {
        id: 'immortal_body',
        name: '金刚体',
        description: '淬炼肉身',
        cost: 500,
        cultivationBonus: 0,
        autoBonus: 5
    },
    {
        id: 'soul_refining',
        name: '炼神术',
        description: '凝练神识',
        cost: 2000,
        cultivationBonus: 10,
        autoBonus: 10
    },
    {
        id: 'five_elements',
        name: '五行大法',
        description: '掌控五行之力',
        cost: 10000,
        cultivationBonus: 30,
        autoBonus: 30
    },
    {
        id: 'heavenly_dao',
        name: '天道经',
        description: '感悟天道',
        cost: 50000,
        cultivationBonus: 100,
        autoBonus: 100
    }
];

// 洞府建设
const CaveItems = [
    {
        id: 'spirit_stone_mine',
        name: '灵石矿脉',
        description: '自动产出灵石',
        cost: 50,
        stoneRate: 1
    },
    {
        id: 'medicine_garden',
        name: '药园',
        description: '种植灵药加速修炼',
        cost: 200,
        cultivationRate: 2
    },
    {
        id: 'spirit_pool',
        name: '灵泉',
        description: '汇聚灵气',
        cost: 1000,
        cultivationRate: 5
    },
    {
        id: 'alchemy_furnace',
        name: '炼丹炉',
        description: '炼制丹药',
        cost: 5000,
        cultivationRate: 15
    }
];

/**
 * 获取当前境界信息
 */
function getCurrentRealm(level) {
    for (let i = Realms.length - 1; i >= 0; i--) {
        if (level >= Realms[i].required) {
            return Realms[i];
        }
    }
    return Realms[0];
}

/**
 * 获取下一境界
 */
function getNextRealm(level) {
    for (let realm of Realms) {
        if (realm.required > level) {
            return realm;
        }
    }
    return null;
}

/**
 * 计算突破成功率
 */
function getBreakthroughChance(currentLevel, nextRealm) {
    if (!nextRealm) return 0;
    const required = nextRealm.required;
    const ratio = currentLevel / required;
    
    if (ratio < 1) return 0;
    if (ratio >= 2) return 100;
    return Math.floor((ratio - 1) * 100);
}
