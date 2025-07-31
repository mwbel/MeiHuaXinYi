/**
 * 数据库初始化脚本
 * 初始化六十四卦基础数据
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Hexagram = require('../models/Hexagram');

// 六十四卦基础数据
const hexagramsData = [
    {
        id: 1, name: '乾为天',
        upperGua: { number: 1, name: '乾', symbol: '☰', element: '金', nature: '天' },
        lowerGua: { number: 1, name: '乾', symbol: '☰', element: '金', nature: '天' },
        traditional: {
            judgment: '乾：元，亨，利，贞。',
            commentary: '大哉乾元，万物资始，乃统天。',
            image: '天行健，君子以自强不息。'
        },
        modern: {
            keywords: ['刚健', '领导', '创始', '成功'],
            fortune: 'excellent',
            meaning: {
                general: '刚健中正，自强不息，大吉大利',
                career: '事业蒸蒸日上，但需要持续努力',
                relationship: '感情稳定向上，但要避免过于强势',
                health: '身体健康，精力充沛',
                wealth: '财运亨通，投资有利'
            }
        },
        wuxing: { primary: '金', strength: 'strong' }
    },
    {
        id: 2, name: '坤为地',
        upperGua: { number: 8, name: '坤', symbol: '☷', element: '土', nature: '地' },
        lowerGua: { number: 8, name: '坤', symbol: '☷', element: '土', nature: '地' },
        traditional: {
            judgment: '坤：元，亨，利牝马之贞。',
            commentary: '至哉坤元，万物资生，乃顺承天。',
            image: '地势坤，君子以厚德载物。'
        },
        modern: {
            keywords: ['柔顺', '承载', '包容', '稳定'],
            fortune: 'good',
            meaning: {
                general: '柔顺承载，厚德载物，顺势而为',
                career: '宜辅助他人，不宜独当一面',
                relationship: '感情和谐，以柔克刚',
                health: '注意脾胃，宜静养',
                wealth: '财运平稳，宜保守理财'
            }
        },
        wuxing: { primary: '土', strength: 'strong' }
    }
    // 这里只列出前2卦作为示例，实际应用中需要完整的64卦数据
];

// 生成其余62卦的基础数据
function generateRemainingHexagrams() {
    const hexagramNames = {
        3: '水雷屯', 4: '山水蒙', 5: '水天需', 6: '天水讼', 7: '地水师', 8: '水地比',
        9: '风天小畜', 10: '天泽履', 11: '地天泰', 12: '天地否', 13: '天火同人', 14: '火天大有',
        15: '地山谦', 16: '雷地豫', 17: '泽雷随', 18: '山风蛊', 19: '地泽临', 20: '风地观',
        21: '火雷噬嗑', 22: '山火贲', 23: '山地剥', 24: '地雷复', 25: '天雷无妄', 26: '山天大畜',
        27: '山雷颐', 28: '泽风大过', 29: '坎为水', 30: '离为火', 31: '泽山咸', 32: '雷风恒',
        33: '天山遁', 34: '雷天大壮', 35: '火地晋', 36: '地火明夷', 37: '风火家人', 38: '火泽睽',
        39: '水山蹇', 40: '雷水解', 41: '山泽损', 42: '风雷益', 43: '泽天夬', 44: '天风姤',
        45: '泽地萃', 46: '地风升', 47: '泽水困', 48: '水风井', 49: '泽火革', 50: '火风鼎',
        51: '震为雷', 52: '艮为山', 53: '风山渐', 54: '雷泽归妹', 55: '雷火丰', 56: '火山旅',
        57: '巽为风', 58: '兑为泽', 59: '风水涣', 60: '水泽节', 61: '风泽中孚', 62: '雷山小过',
        63: '水火既济', 64: '火水未济'
    };

    const baguaMapping = {
        1: { name: '乾', symbol: '☰', element: '金', nature: '天' },
        2: { name: '兑', symbol: '☱', element: '金', nature: '泽' },
        3: { name: '离', symbol: '☲', element: '火', nature: '火' },
        4: { name: '震', symbol: '☳', element: '木', nature: '雷' },
        5: { name: '巽', symbol: '☴', element: '木', nature: '风' },
        6: { name: '坎', symbol: '☵', element: '水', nature: '水' },
        7: { name: '艮', symbol: '☶', element: '土', nature: '山' },
        8: { name: '坤', symbol: '☷', element: '土', nature: '地' }
    };

    const fortuneTypes = ['excellent', 'good', 'neutral', 'poor'];

    for (let i = 3; i <= 64; i++) {
        const upperGuaNum = Math.floor((i - 1) / 8) + 1;
        const lowerGuaNum = ((i - 1) % 8) + 1;
        
        const upperGua = { number: upperGuaNum, ...baguaMapping[upperGuaNum] };
        const lowerGua = { number: lowerGuaNum, ...baguaMapping[lowerGuaNum] };

        hexagramsData.push({
            id: i,
            name: hexagramNames[i],
            upperGua,
            lowerGua,
            traditional: {
                judgment: `${hexagramNames[i]}：待完善卦辞。`,
                commentary: `${hexagramNames[i]}的彖辞解释。`,
                image: `${hexagramNames[i]}的象辞说明。`
            },
            modern: {
                keywords: ['待完善', '关键词'],
                fortune: fortuneTypes[Math.floor(Math.random() * fortuneTypes.length)],
                meaning: {
                    general: `${hexagramNames[i]}的总体含义`,
                    career: '事业方面的指导',
                    relationship: '感情方面的建议',
                    health: '健康方面的提醒',
                    wealth: '财运方面的分析'
                }
            },
            wuxing: { 
                primary: upperGua.element, 
                secondary: lowerGua.element,
                strength: 'medium' 
            }
        });
    }
}

// 连接数据库
async function connectDatabase() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ MongoDB 连接成功');
    } catch (error) {
        console.error('❌ MongoDB 连接失败:', error);
        process.exit(1);
    }
}

// 初始化六十四卦数据
async function initializeHexagrams() {
    try {
        // 检查是否已有数据
        const count = await Hexagram.countDocuments();
        if (count > 0) {
            console.log(`📊 数据库中已有 ${count} 条卦象记录`);
            return;
        }

        // 生成完整的64卦数据
        generateRemainingHexagrams();

        // 批量插入数据
        await Hexagram.insertMany(hexagramsData);
        console.log('✅ 六十四卦数据初始化完成');

        // 验证数据
        const insertedCount = await Hexagram.countDocuments();
        console.log(`📊 成功插入 ${insertedCount} 条卦象记录`);

    } catch (error) {
        console.error('❌ 初始化卦象数据失败:', error);
        throw error;
    }
}

// 创建索引
async function createIndexes() {
    try {
        await Hexagram.createIndexes();
        console.log('✅ 数据库索引创建完成');
    } catch (error) {
        console.error('❌ 创建索引失败:', error);
        throw error;
    }
}

// 主函数
async function main() {
    try {
        console.log('🚀 开始初始化数据库...');
        
        await connectDatabase();
        await initializeHexagrams();
        await createIndexes();
        
        console.log('🎉 数据库初始化完成！');
        
    } catch (error) {
        console.error('❌ 数据库初始化失败:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 数据库连接已关闭');
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    main();
}

module.exports = {
    initializeHexagrams,
    createIndexes,
    hexagramsData
};
