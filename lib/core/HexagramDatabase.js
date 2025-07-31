/**
 * 卦象数据库
 * 存储六十四卦的详细信息和解释
 */

class HexagramDatabase {
    constructor() {
        this.initializeHexagramData();
    }

    /**
     * 初始化六十四卦数据
     */
    initializeHexagramData() {
        this.hexagramData = {
            1: {
                name: '乾为天',
                judgment: '乾：元，亨，利，贞。',
                commentary: '大哉乾元，万物资始，乃统天。',
                image: '天行健，君子以自强不息。',
                meaning: {
                    general: '刚健中正，自强不息，大吉大利',
                    career: '事业蒸蒸日上，但需要持续努力',
                    relationship: '感情稳定向上，但要避免过于强势',
                    health: '身体健康，精力充沛',
                    wealth: '财运亨通，投资有利'
                },
                keywords: ['刚健', '领导', '创始', '成功'],
                fortune: 'excellent'
            },
            2: {
                name: '坤为地',
                judgment: '坤：元，亨，利牝马之贞。',
                commentary: '至哉坤元，万物资生，乃顺承天。',
                image: '地势坤，君子以厚德载物。',
                meaning: {
                    general: '柔顺承载，厚德载物，顺势而为',
                    career: '宜辅助他人，不宜独当一面',
                    relationship: '感情和谐，以柔克刚',
                    health: '注意脾胃，宜静养',
                    wealth: '财运平稳，宜保守理财'
                },
                keywords: ['柔顺', '承载', '包容', '稳定'],
                fortune: 'good'
            },
            3: {
                name: '水雷屯',
                judgment: '屯：元亨，利贞，勿用，有攸往，利建侯。',
                commentary: '屯，刚柔始交而难生。',
                image: '云雷屯，君子以经纶。',
                meaning: {
                    general: '初始困难，需要坚持，终有所成',
                    career: '创业初期，困难重重，需要耐心',
                    relationship: '感情初期有波折，需要磨合',
                    health: '身体有小恙，注意调养',
                    wealth: '财运初期不佳，后期转好'
                },
                keywords: ['困难', '初始', '坚持', '建立'],
                fortune: 'neutral'
            },
            4: {
                name: '山水蒙',
                judgment: '蒙：亨。匪我求童蒙，童蒙求我。',
                commentary: '蒙，山下有险，险而止，蒙。',
                image: '山下出泉，蒙；君子以果行育德。',
                meaning: {
                    general: '启蒙教育，学习成长，需要指导',
                    career: '需要学习新技能，寻求指导',
                    relationship: '感情需要沟通理解',
                    health: '注意心理健康，保持学习心态',
                    wealth: '理财需要学习，不宜冒险'
                },
                keywords: ['启蒙', '学习', '指导', '成长'],
                fortune: 'neutral'
            },
            5: {
                name: '水天需',
                judgment: '需：有孚，光亨，贞吉，利涉大川。',
                commentary: '需，须也，险在前也。',
                image: '云上于天，需；君子以饮食宴乐。',
                meaning: {
                    general: '等待时机，需要耐心，终有所获',
                    career: '时机未到，需要等待和准备',
                    relationship: '感情需要时间培养',
                    health: '身体需要调养，不宜过劳',
                    wealth: '财运需要等待，不宜急进'
                },
                keywords: ['等待', '耐心', '准备', '时机'],
                fortune: 'neutral'
            }
            // 这里只列出前5卦作为示例，实际应用中需要完整的64卦数据
        };

        // 为简化，其他卦象使用基础模板
        this.initializeRemainingHexagrams();
    }

    /**
     * 初始化其余卦象的基础数据
     */
    initializeRemainingHexagrams() {
        const hexagramNames = {
            6: '天水讼', 7: '地水师', 8: '水地比', 9: '风天小畜', 10: '天泽履',
            11: '地天泰', 12: '天地否', 13: '天火同人', 14: '火天大有', 15: '地山谦',
            16: '雷地豫', 17: '泽雷随', 18: '山风蛊', 19: '地泽临', 20: '风地观',
            21: '火雷噬嗑', 22: '山火贲', 23: '山地剥', 24: '地雷复', 25: '天雷无妄',
            26: '山天大畜', 27: '山雷颐', 28: '泽风大过', 29: '坎为水', 30: '离为火',
            31: '泽山咸', 32: '雷风恒', 33: '天山遁', 34: '雷天大壮', 35: '火地晋',
            36: '地火明夷', 37: '风火家人', 38: '火泽睽', 39: '水山蹇', 40: '雷水解',
            41: '山泽损', 42: '风雷益', 43: '泽天夬', 44: '天风姤', 45: '泽地萃',
            46: '地风升', 47: '泽水困', 48: '水风井', 49: '泽火革', 50: '火风鼎',
            51: '震为雷', 52: '艮为山', 53: '风山渐', 54: '雷泽归妹', 55: '雷火丰',
            56: '火山旅', 57: '巽为风', 58: '兑为泽', 59: '风水涣', 60: '水泽节',
            61: '风泽中孚', 62: '雷山小过', 63: '水火既济', 64: '火水未济'
        };

        // 为每个卦象生成基础数据
        for (let i = 6; i <= 64; i++) {
            if (!this.hexagramData[i]) {
                this.hexagramData[i] = this.generateBasicHexagramData(i, hexagramNames[i]);
            }
        }
    }

    /**
     * 生成基础卦象数据
     */
    generateBasicHexagramData(id, name) {
        const fortuneTypes = ['excellent', 'good', 'neutral', 'poor'];
        const randomFortune = fortuneTypes[Math.floor(Math.random() * fortuneTypes.length)];

        return {
            name: name,
            judgment: `${name}：待完善卦辞。`,
            commentary: `${name}的彖辞解释。`,
            image: `${name}的象辞说明。`,
            meaning: {
                general: `${name}的总体含义`,
                career: '事业方面的指导',
                relationship: '感情方面的建议',
                health: '健康方面的提醒',
                wealth: '财运方面的分析'
            },
            keywords: ['待完善', '关键词'],
            fortune: randomFortune
        };
    }

    /**
     * 获取卦象含义
     */
    getHexagramMeaning(hexagramId) {
        const data = this.hexagramData[hexagramId];
        if (!data) {
            return {
                name: `第${hexagramId}卦`,
                general: '卦象含义待查询',
                fortune: 'neutral'
            };
        }

        return {
            name: data.name,
            judgment: data.judgment,
            commentary: data.commentary,
            image: data.image,
            general: data.meaning.general,
            career: data.meaning.career,
            relationship: data.meaning.relationship,
            health: data.meaning.health,
            wealth: data.meaning.wealth,
            keywords: data.keywords,
            fortune: data.fortune
        };
    }

    /**
     * 获取卦象详细信息
     */
    getHexagramDetails(hexagramId) {
        return this.hexagramData[hexagramId] || null;
    }

    /**
     * 根据关键词搜索卦象
     */
    searchByKeyword(keyword) {
        const results = [];
        
        for (let id = 1; id <= 64; id++) {
            const data = this.hexagramData[id];
            if (data && (
                data.name.includes(keyword) ||
                data.keywords.some(k => k.includes(keyword)) ||
                data.meaning.general.includes(keyword)
            )) {
                results.push({
                    id: id,
                    name: data.name,
                    relevance: this.calculateRelevance(data, keyword)
                });
            }
        }

        return results.sort((a, b) => b.relevance - a.relevance);
    }

    /**
     * 计算关键词相关性
     */
    calculateRelevance(data, keyword) {
        let score = 0;
        
        if (data.name.includes(keyword)) score += 10;
        if (data.keywords.some(k => k.includes(keyword))) score += 5;
        if (data.meaning.general.includes(keyword)) score += 3;
        
        return score;
    }

    /**
     * 获取所有卦象名称
     */
    getAllHexagramNames() {
        const names = {};
        for (let i = 1; i <= 64; i++) {
            names[i] = this.hexagramData[i]?.name || `第${i}卦`;
        }
        return names;
    }

    /**
     * 根据运势等级获取卦象
     */
    getHexagramsByFortune(fortuneLevel) {
        const results = [];
        
        for (let id = 1; id <= 64; id++) {
            const data = this.hexagramData[id];
            if (data && data.fortune === fortuneLevel) {
                results.push({
                    id: id,
                    name: data.name,
                    fortune: data.fortune
                });
            }
        }
        
        return results;
    }

    /**
     * 获取随机卦象
     */
    getRandomHexagram() {
        const randomId = Math.floor(Math.random() * 64) + 1;
        return {
            id: randomId,
            ...this.getHexagramMeaning(randomId)
        };
    }

    /**
     * 验证卦象ID
     */
    isValidHexagramId(id) {
        return Number.isInteger(id) && id >= 1 && id <= 64;
    }

    /**
     * 获取卦象统计信息
     */
    getStatistics() {
        const stats = {
            total: 64,
            byFortune: {
                excellent: 0,
                good: 0,
                neutral: 0,
                poor: 0
            }
        };

        for (let i = 1; i <= 64; i++) {
            const data = this.hexagramData[i];
            if (data && data.fortune) {
                stats.byFortune[data.fortune]++;
            }
        }

        return stats;
    }
}

module.exports = HexagramDatabase;
