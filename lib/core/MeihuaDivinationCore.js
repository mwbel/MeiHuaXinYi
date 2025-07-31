/**
 * 梅花易数核心算法实现
 * 基于传统梅花易数理论，实现起卦、排卦、解卦的完整流程
 */

const BaguaSystem = require('./BaguaSystem');
const FiveElementsSystem = require('./FiveElementsSystem');
const HexagramDatabase = require('./HexagramDatabase');

class MeihuaDivinationCore {
    constructor() {
        this.baguaSystem = new BaguaSystem();
        this.fiveElements = new FiveElementsSystem();
        this.hexagramDatabase = new HexagramDatabase();
    }

    /**
     * 执行占卜的主要方法
     * @param {string} question - 占卜问题
     * @param {string} method - 起卦方法：'time' | 'number'
     * @param {Object} params - 起卦参数
     * @returns {Object} 占卜结果
     */
    async performDivination(question, method = 'time', params = {}) {
        try {
            // 1. 验证输入
            this.validateInput(question, method, params);
            
            // 2. 起卦计算
            const primaryResult = this.calculatePrimaryGua(method, params);
            
            // 3. 生成三卦
            const benGua = this.createHexagram(primaryResult.upperGua, primaryResult.lowerGua);
            const huGua = this.calculateHuGua(benGua);
            const bianGua = this.calculateBianGua(benGua, primaryResult.movingLine);
            
            // 4. 五行分析
            const wuxingAnalysis = this.analyzeFiveElements(benGua, huGua, bianGua);
            
            // 5. 基础解读
            const basicInterpretation = this.getBasicInterpretation(benGua, huGua, bianGua, wuxingAnalysis);
            
            return {
                id: this.generateDivinationId(),
                question,
                timestamp: new Date(),
                method,
                parameters: params,
                hexagrams: {
                    ben: benGua,      // 本卦
                    hu: huGua,        // 互卦  
                    bian: bianGua     // 变卦
                },
                movingLine: primaryResult.movingLine,
                wuxingAnalysis,
                basicInterpretation,
                confidence: this.calculateConfidence(benGua, huGua, bianGua)
            };
        } catch (error) {
            throw new Error(`占卜执行失败: ${error.message}`);
        }
    }

    /**
     * 验证输入参数
     */
    validateInput(question, method, params) {
        if (!question || typeof question !== 'string' || question.trim().length === 0) {
            throw new Error('问题不能为空');
        }
        
        if (!['time', 'number'].includes(method)) {
            throw new Error('起卦方法必须是 time 或 number');
        }
        
        if (method === 'number') {
            if (!params.numbers || !params.numbers.number1 || !params.numbers.number2) {
                throw new Error('数字起卦需要提供两个数字');
            }
        }
    }

    /**
     * 计算主卦
     */
    calculatePrimaryGua(method, params) {
        if (method === 'time') {
            return this.timeBasedDivination(params.time);
        } else if (method === 'number') {
            return this.numberBasedDivination(params.numbers.number1, params.numbers.number2);
        }
    }

    /**
     * 时间起卦法
     */
    timeBasedDivination(timeParams) {
        const now = timeParams || new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const day = now.getDate();
        const hour = now.getHours();
        
        // 获取地支序数
        const earthlyBranch = this.getEarthlyBranch(year);
        const baseNumber = earthlyBranch + month + day;
        
        const upperGua = (baseNumber % 8) || 8;
        const lowerGua = ((baseNumber + hour) % 8) || 8;
        const movingLine = ((baseNumber + hour) % 6) || 6;
        
        return { upperGua, lowerGua, movingLine };
    }

    /**
     * 数字起卦法
     */
    numberBasedDivination(number1, number2) {
        const upperGua = (number1 % 8) || 8;
        const lowerGua = (number2 % 8) || 8;
        const movingLine = ((number1 + number2) % 6) || 6;
        
        return { upperGua, lowerGua, movingLine };
    }

    /**
     * 获取地支序数
     */
    getEarthlyBranch(year) {
        const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
        const branchIndex = (year - 4) % 12;
        return branchIndex + 1;
    }

    /**
     * 创建卦象
     */
    createHexagram(upperGua, lowerGua) {
        return this.baguaSystem.createHexagram(upperGua, lowerGua);
    }

    /**
     * 计算互卦
     */
    calculateHuGua(hexagram) {
        const lines = hexagram.lines;
        // 取2、3、4爻为上卦，3、4、5爻为下卦
        const upperLines = [lines[1], lines[2], lines[3]];
        const lowerLines = [lines[2], lines[3], lines[4]];
        
        const upperGua = this.linesToGua(upperLines);
        const lowerGua = this.linesToGua(lowerLines);
        
        return this.baguaSystem.createHexagram(upperGua, lowerGua);
    }

    /**
     * 计算变卦
     */
    calculateBianGua(hexagram, movingLine) {
        const lines = [...hexagram.lines];
        // 动爻变化：阳变阴，阴变阳
        lines[movingLine - 1] = lines[movingLine - 1] === 1 ? 0 : 1;
        
        const upperLines = lines.slice(3, 6);
        const lowerLines = lines.slice(0, 3);
        
        const upperGua = this.linesToGua(upperLines);
        const lowerGua = this.linesToGua(lowerLines);
        
        return this.baguaSystem.createHexagram(upperGua, lowerGua);
    }

    /**
     * 爻线转换为卦
     */
    linesToGua(lines) {
        // 将三个爻线转换为八卦编号
        const binaryStr = lines.map(line => line.toString()).join('');
        const decimal = parseInt(binaryStr, 2);
        
        // 映射到八卦编号 (1-8)
        const mapping = [8, 7, 6, 5, 4, 3, 2, 1]; // 对应坤、艮、坎、巽、震、离、兑、乾
        return mapping[decimal] || 1;
    }

    /**
     * 五行分析
     */
    analyzeFiveElements(benGua, huGua, bianGua) {
        return this.fiveElements.analyzeFiveElements(benGua, huGua, bianGua);
    }

    /**
     * 基础解读
     */
    getBasicInterpretation(benGua, huGua, bianGua, wuxingAnalysis) {
        const benMeaning = this.hexagramDatabase.getHexagramMeaning(benGua.id);
        const bianMeaning = this.hexagramDatabase.getHexagramMeaning(bianGua.id);
        
        return {
            summary: `本卦${benGua.name}，变卦${bianGua.name}`,
            benGua: benMeaning,
            bianGua: bianMeaning,
            wuxing: wuxingAnalysis.fortune,
            timing: this.calculateTiming(wuxingAnalysis),
            advice: this.generateAdvice(wuxingAnalysis)
        };
    }

    /**
     * 计算时机
     */
    calculateTiming(wuxingAnalysis) {
        const { fortune } = wuxingAnalysis;
        if (fortune === 'excellent') return '时机极佳，宜立即行动';
        if (fortune === 'good') return '时机良好，可以行动';
        if (fortune === 'neutral') return '时机平平，需谨慎考虑';
        if (fortune === 'poor') return '时机不佳，宜等待';
        return '时机凶险，不宜行动';
    }

    /**
     * 生成建议
     */
    generateAdvice(wuxingAnalysis) {
        const { relationships } = wuxingAnalysis;
        const advice = [];
        
        if (relationships.benToHu.type === 'generation') {
            advice.push('当前状态有利发展，可积极推进');
        }
        if (relationships.benToBian.type === 'destruction') {
            advice.push('需要注意变化中的阻力，做好应对准备');
        }
        
        return advice.length > 0 ? advice.join('；') : '保持现状，顺其自然';
    }

    /**
     * 计算置信度
     */
    calculateConfidence(benGua, huGua, bianGua) {
        // 基于卦象的复杂度和一致性计算置信度
        let confidence = 0.8;
        
        // 如果本卦和变卦差异较大，置信度稍低
        if (Math.abs(benGua.id - bianGua.id) > 32) {
            confidence -= 0.1;
        }
        
        // 如果互卦与本卦相近，置信度提高
        if (Math.abs(benGua.id - huGua.id) < 16) {
            confidence += 0.1;
        }
        
        return Math.max(0.6, Math.min(0.95, confidence));
    }

    /**
     * 生成占卜ID
     */
    generateDivinationId() {
        return `div_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}

module.exports = MeihuaDivinationCore;
