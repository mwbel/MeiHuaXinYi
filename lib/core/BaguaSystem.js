/**
 * 八卦系统实现
 * 实现先天八卦、六十四卦的数据结构和操作方法
 */

class BaguaSystem {
    constructor() {
        this.initializeBaguaData();
        this.initializeHexagramData();
    }

    /**
     * 初始化八卦基础数据
     */
    initializeBaguaData() {
        // 先天八卦数字对应关系
        this.BAGUA_NAMES = {
            1: '乾', 2: '兑', 3: '离', 4: '震',
            5: '巽', 6: '坎', 7: '艮', 8: '坤'
        };

        this.BAGUA_SYMBOLS = {
            1: '☰', 2: '☱', 3: '☲', 4: '☳',
            5: '☴', 6: '☵', 7: '☶', 8: '☷'
        };

        this.BAGUA_ELEMENTS = {
            1: '金', 2: '金', 3: '火', 4: '木',
            5: '木', 6: '水', 7: '土', 8: '土'
        };

        this.BAGUA_NATURES = {
            1: '天', 2: '泽', 3: '火', 4: '雷',
            5: '风', 6: '水', 7: '山', 8: '地'
        };

        this.BAGUA_DIRECTIONS = {
            1: '南', 2: '东南', 3: '东', 4: '东北',
            5: '西南', 6: '西', 7: '西北', 8: '北'
        };

        this.BAGUA_ATTRIBUTES = {
            1: { strength: '刚健', character: '君父', season: '秋冬之交' },
            2: { strength: '喜悦', character: '少女', season: '秋' },
            3: { strength: '光明', character: '中女', season: '夏' },
            4: { strength: '震动', character: '长男', season: '春' },
            5: { strength: '顺从', character: '长女', season: '春夏之交' },
            6: { strength: '险陷', character: '中男', season: '冬' },
            7: { strength: '静止', character: '少男', season: '冬春之交' },
            8: { strength: '柔顺', character: '母', season: '夏秋之交' }
        };

        // 八卦爻线组合 (从下到上)
        this.BAGUA_LINES = {
            1: [1, 1, 1], // 乾 ☰
            2: [0, 1, 1], // 兑 ☱
            3: [1, 0, 1], // 离 ☲
            4: [0, 0, 1], // 震 ☳
            5: [1, 1, 0], // 巽 ☴
            6: [0, 1, 0], // 坎 ☵
            7: [1, 0, 0], // 艮 ☶
            8: [0, 0, 0]  // 坤 ☷
        };
    }

    /**
     * 初始化六十四卦数据
     */
    initializeHexagramData() {
        // 六十四卦名称映射
        this.HEXAGRAM_NAMES = {
            1: '乾为天', 2: '坤为地', 3: '水雷屯', 4: '山水蒙', 5: '水天需', 6: '天水讼',
            7: '地水师', 8: '水地比', 9: '风天小畜', 10: '天泽履', 11: '地天泰', 12: '天地否',
            13: '天火同人', 14: '火天大有', 15: '地山谦', 16: '雷地豫', 17: '泽雷随', 18: '山风蛊',
            19: '地泽临', 20: '风地观', 21: '火雷噬嗑', 22: '山火贲', 23: '山地剥', 24: '地雷复',
            25: '天雷无妄', 26: '山天大畜', 27: '山雷颐', 28: '泽风大过', 29: '坎为水', 30: '离为火',
            31: '泽山咸', 32: '雷风恒', 33: '天山遁', 34: '雷天大壮', 35: '火地晋', 36: '地火明夷',
            37: '风火家人', 38: '火泽睽', 39: '水山蹇', 40: '雷水解', 41: '山泽损', 42: '风雷益',
            43: '泽天夬', 44: '天风姤', 45: '泽地萃', 46: '地风升', 47: '泽水困', 48: '水风井',
            49: '泽火革', 50: '火风鼎', 51: '震为雷', 52: '艮为山', 53: '风山渐', 54: '雷泽归妹',
            55: '雷火丰', 56: '火山旅', 57: '巽为风', 58: '兑为泽', 59: '风水涣', 60: '水泽节',
            61: '风泽中孚', 62: '雷山小过', 63: '水火既济', 64: '火水未济'
        };
    }

    /**
     * 获取八卦属性
     */
    getBaguaProperties(number) {
        if (number < 1 || number > 8) {
            throw new Error('八卦编号必须在1-8之间');
        }

        return {
            number: number,
            name: this.BAGUA_NAMES[number],
            symbol: this.BAGUA_SYMBOLS[number],
            element: this.BAGUA_ELEMENTS[number],
            nature: this.BAGUA_NATURES[number],
            direction: this.BAGUA_DIRECTIONS[number],
            attributes: this.BAGUA_ATTRIBUTES[number],
            lines: this.BAGUA_LINES[number]
        };
    }

    /**
     * 创建六十四卦
     */
    createHexagram(upperGua, lowerGua) {
        const hexagramNumber = this.getHexagramNumber(upperGua, lowerGua);
        const upperBagua = this.getBaguaProperties(upperGua);
        const lowerBagua = this.getBaguaProperties(lowerGua);

        return {
            id: hexagramNumber,
            name: this.HEXAGRAM_NAMES[hexagramNumber],
            upperGua: upperBagua,
            lowerGua: lowerBagua,
            lines: this.generateHexagramLines(upperGua, lowerGua),
            element: this.getHexagramElement(upperBagua, lowerBagua),
            nature: `${upperBagua.nature}${lowerBagua.nature}`,
            symbol: `${upperBagua.symbol}${lowerBagua.symbol}`
        };
    }

    /**
     * 计算六十四卦编号
     */
    getHexagramNumber(upperGua, lowerGua) {
        // 根据上下卦组合计算六十四卦编号
        const mapping = {
            '11': 1, '18': 2, '16': 3, '17': 4, '15': 5, '61': 6, '81': 7, '86': 8,
            '51': 9, '12': 10, '81': 11, '18': 12, '13': 13, '31': 14, '87': 15, '48': 16,
            '24': 17, '75': 18, '82': 19, '58': 20, '34': 21, '73': 22, '78': 23, '84': 24,
            '14': 25, '71': 26, '74': 27, '25': 28, '66': 29, '33': 30, '72': 31, '45': 32,
            '17': 33, '41': 34, '38': 35, '83': 36, '53': 37, '32': 38, '67': 39, '46': 40,
            '72': 41, '54': 42, '21': 43, '15': 44, '28': 45, '85': 46, '26': 47, '65': 48,
            '23': 49, '35': 50, '44': 51, '77': 52, '75': 53, '42': 54, '43': 55, '37': 56,
            '55': 57, '22': 58, '56': 59, '62': 60, '52': 61, '74': 62, '63': 63, '36': 64
        };

        const key = `${upperGua}${lowerGua}`;
        return mapping[key] || this.calculateHexagramId(upperGua, lowerGua);
    }

    /**
     * 备用计算方法
     */
    calculateHexagramId(upperGua, lowerGua) {
        return ((upperGua - 1) * 8) + lowerGua;
    }

    /**
     * 生成六爻线
     */
    generateHexagramLines(upperGua, lowerGua) {
        const upperLines = this.BAGUA_LINES[upperGua];
        const lowerLines = this.BAGUA_LINES[lowerGua];
        
        // 从下到上排列：下卦三爻 + 上卦三爻
        return [...lowerLines, ...upperLines];
    }

    /**
     * 获取卦象主要五行
     */
    getHexagramElement(upperBagua, lowerBagua) {
        // 以上卦五行为主，下卦五行为辅
        return upperBagua.element;
    }

    /**
     * 根据卦象ID获取卦名
     */
    getHexagramName(hexagramId) {
        return this.HEXAGRAM_NAMES[hexagramId] || `第${hexagramId}卦`;
    }

    /**
     * 验证八卦编号
     */
    isValidBaguaNumber(number) {
        return Number.isInteger(number) && number >= 1 && number <= 8;
    }

    /**
     * 验证六十四卦编号
     */
    isValidHexagramNumber(number) {
        return Number.isInteger(number) && number >= 1 && number <= 64;
    }

    /**
     * 获取所有八卦信息
     */
    getAllBagua() {
        const result = {};
        for (let i = 1; i <= 8; i++) {
            result[i] = this.getBaguaProperties(i);
        }
        return result;
    }

    /**
     * 获取所有六十四卦名称
     */
    getAllHexagramNames() {
        return { ...this.HEXAGRAM_NAMES };
    }
}

module.exports = BaguaSystem;
