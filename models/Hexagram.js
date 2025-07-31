/**
 * 卦象模型
 * 存储六十四卦的详细信息
 */

const mongoose = require('mongoose');

const HexagramSchema = new mongoose.Schema({
    // 基本信息
    id: {
        type: Number,
        required: true,
        unique: true,
        min: 1,
        max: 64
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    
    // 卦象组成
    upperGua: {
        number: {
            type: Number,
            required: true,
            min: 1,
            max: 8
        },
        name: String,
        symbol: String,
        element: String,
        nature: String
    },
    lowerGua: {
        number: {
            type: Number,
            required: true,
            min: 1,
            max: 8
        },
        name: String,
        symbol: String,
        element: String,
        nature: String
    },
    
    // 传统经典内容
    traditional: {
        judgment: {
            type: String,
            required: true
        }, // 卦辞
        commentary: String, // 彖辞
        image: String, // 象辞
        lines: [{
            position: {
                type: Number,
                min: 1,
                max: 6
            },
            text: String, // 爻辞
            commentary: String // 爻辞解释
        }]
    },
    
    // 现代解读
    modern: {
        keywords: [{
            type: String,
            trim: true
        }],
        fortune: {
            type: String,
            enum: ['excellent', 'good', 'neutral', 'poor', 'bad'],
            default: 'neutral'
        },
        advice: String,
        timing: String,
        meaning: {
            general: String,
            career: String,
            relationship: String,
            health: String,
            wealth: String,
            study: String
        }
    },
    
    // 五行属性
    wuxing: {
        primary: {
            type: String,
            enum: ['金', '木', '水', '火', '土'],
            required: true
        },
        secondary: {
            type: String,
            enum: ['金', '木', '水', '火', '土']
        },
        strength: {
            type: String,
            enum: ['strong', 'medium', 'weak'],
            default: 'medium'
        }
    },
    
    // 卦象特征
    characteristics: {
        nature: String, // 卦性
        season: String, // 对应季节
        direction: String, // 对应方位
        color: String, // 对应颜色
        emotion: String, // 对应情感
        organ: String, // 对应脏腑
        animal: String, // 对应动物
        number: Number // 对应数字
    },
    
    // 应用场景
    applications: {
        bestFor: [String], // 最适合的问题类型
        avoid: [String], // 不适合的情况
        timing: {
            favorable: [String], // 有利时机
            unfavorable: [String] // 不利时机
        }
    },
    
    // 相关卦象
    relationships: {
        opposite: Number, // 对卦
        mutual: Number, // 互卦
        nuclear: Number, // 综卦
        related: [Number] // 相关卦象
    },
    
    // 统计信息
    statistics: {
        usageCount: {
            type: Number,
            default: 0
        },
        averageRating: {
            type: Number,
            default: 0
        },
        lastUsed: Date
    },
    
    // 元数据
    metadata: {
        difficulty: {
            type: String,
            enum: ['beginner', 'intermediate', 'advanced'],
            default: 'intermediate'
        },
        popularity: {
            type: Number,
            default: 0
        },
        accuracy: {
            type: Number,
            default: 0
        }
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// 索引
HexagramSchema.index({ id: 1 });
HexagramSchema.index({ name: 1 });
HexagramSchema.index({ 'wuxing.primary': 1 });
HexagramSchema.index({ 'modern.fortune': 1 });
HexagramSchema.index({ 'modern.keywords': 1 });
HexagramSchema.index({ 'statistics.usageCount': -1 });

// 虚拟字段
HexagramSchema.virtual('symbol').get(function() {
    return `${this.upperGua.symbol}${this.lowerGua.symbol}`;
});

HexagramSchema.virtual('fullName').get(function() {
    return `第${this.id}卦 ${this.name}`;
});

HexagramSchema.virtual('isPopular').get(function() {
    return this.statistics.usageCount > 100;
});

HexagramSchema.virtual('element').get(function() {
    return this.wuxing.primary;
});

// 实例方法：更新使用统计
HexagramSchema.methods.updateUsage = function() {
    this.statistics.usageCount += 1;
    this.statistics.lastUsed = new Date();
    return this.save();
};

// 实例方法：添加评分
HexagramSchema.methods.addRating = function(rating) {
    const currentRating = this.statistics.averageRating || 0;
    const currentCount = this.statistics.usageCount || 0;
    
    this.statistics.averageRating = 
        (currentRating * currentCount + rating) / (currentCount + 1);
    
    return this.save();
};

// 实例方法：获取相关建议
HexagramSchema.methods.getAdviceFor = function(questionType) {
    if (this.modern.meaning && this.modern.meaning[questionType]) {
        return this.modern.meaning[questionType];
    }
    return this.modern.advice || this.traditional.judgment;
};

// 静态方法：根据五行查找卦象
HexagramSchema.statics.findByElement = function(element) {
    return this.find({ 'wuxing.primary': element });
};

// 静态方法：根据运势查找卦象
HexagramSchema.statics.findByFortune = function(fortune) {
    return this.find({ 'modern.fortune': fortune });
};

// 静态方法：搜索卦象
HexagramSchema.statics.search = function(keyword) {
    return this.find({
        $or: [
            { name: { $regex: keyword, $options: 'i' } },
            { 'modern.keywords': { $in: [keyword] } },
            { 'traditional.judgment': { $regex: keyword, $options: 'i' } }
        ]
    });
};

// 静态方法：获取热门卦象
HexagramSchema.statics.getPopular = function(limit = 10) {
    return this.find()
        .sort({ 'statistics.usageCount': -1 })
        .limit(limit);
};

// 静态方法：获取随机卦象
HexagramSchema.statics.getRandom = function() {
    return this.aggregate([
        { $sample: { size: 1 } }
    ]);
};

// 静态方法：初始化基础数据
HexagramSchema.statics.initializeData = async function() {
    const count = await this.countDocuments();
    if (count === 0) {
        // 这里可以插入64卦的基础数据
        console.log('需要初始化六十四卦数据');
        return false;
    }
    return true;
};

module.exports = mongoose.model('Hexagram', HexagramSchema);
