/**
 * 修仙数据定义
 */

// 境界定义（降低突破要求）
const Realms = [
    { name: '凡人', required: 0, autoRate: 0, multiplier: 1 },
    { name: '炼气', required: 50, autoRate: 2, multiplier: 2 },
    { name: '筑基', required: 150, autoRate: 5, multiplier: 3 },
    { name: '金丹', required: 500, autoRate: 12, multiplier: 4 },
    { name: '元婴', required: 1500, autoRate: 30, multiplier: 5 },
    { name: '化神', required: 5000, autoRate: 80, multiplier: 6 },
    { name: '渡劫', required: 20000, autoRate: 200, multiplier: 8 },
    { name: '大乘', required: 80000, autoRate: 500, multiplier: 10 },
    { name: '真仙', required: 500000, autoRate: 1500, multiplier: 15 }
];

// 功法定义（降低前期成本）
const Techniques = [
    {
        id: 'basic_qi',
        name: '吐纳术',
        description: '基础呼吸法门',
        cost: 5,
        cultivationBonus: 2,
        autoBonus: 0
    },
    {
        id: 'spirit_gathering',
        name: '聚灵诀',
        description: '聚集天地灵气',
        cost: 20,
        cultivationBonus: 5,
        autoBonus: 2
    },
    {
        id: 'immortal_body',
        name: '金刚体',
        description: '淬炼肉身',
        cost: 100,
        cultivationBonus: 0,
        autoBonus: 8
    },
    {
        id: 'soul_refining',
        name: '炼神术',
        description: '凝练神识',
        cost: 500,
        cultivationBonus: 15,
        autoBonus: 15
    },
    {
        id: 'five_elements',
        name: '五行大法',
        description: '掌控五行之力',
        cost: 2000,
        cultivationBonus: 40,
        autoBonus: 40
    },
    {
        id: 'heavenly_dao',
        name: '天道经',
        description: '感悟天道',
        cost: 10000,
        cultivationBonus: 120,
        autoBonus: 120
    }
];

// 洞府建设（降低前期成本，提高灵石产出）
const CaveItems = [
    {
        id: 'spirit_stone_mine',
        name: '灵石矿脉',
        description: '自动产出灵石',
        cost: 10,
        stoneRate: 2
    },
    {
        id: 'medicine_garden',
        name: '药园',
        description: '种植灵药加速修炼',
        cost: 50,
        cultivationRate: 3
    },
    {
        id: 'spirit_pool',
        name: '灵泉',
        description: '汇聚灵气',
        cost: 200,
        cultivationRate: 8
    },
    {
        id: 'alchemy_furnace',
        name: '炼丹炉',
        description: '炼制丹药',
        cost: 1000,
        cultivationRate: 20
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
