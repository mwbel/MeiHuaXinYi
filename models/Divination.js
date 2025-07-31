/**
 * 占卜记录模型
 * 存储占卜结果和相关信息
 */

const mongoose = require('mongoose');

const DivinationSchema = new mongoose.Schema({
    // 基本信息
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    question: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },
    questionType: {
        type: String,
        enum: ['career', 'relationship', 'health', 'wealth', 'study', 'general'],
        default: 'general'
    },
    
    // 起卦信息
    method: {
        type: String,
        enum: ['time', 'number'],
        required: true
    },
    parameters: {
        time: {
            year: Number,
            month: Number,
            day: Number,
            hour: Number
        },
        numbers: {
            number1: Number,
            number2: Number
        }
    },
    
    // 卦象信息
    hexagrams: {
        ben: {
            id: Number,
            name: String,
            upperGua: {
                number: Number,
                name: String,
                symbol: String,
                element: String,
                nature: String
            },
            lowerGua: {
                number: Number,
                name: String,
                symbol: String,
                element: String,
                nature: String
            },
            lines: [Number], // 六爻线数组
            element: String,
            nature: String,
            symbol: String
        },
        hu: {
            id: Number,
            name: String,
            upperGua: Object,
            lowerGua: Object,
            lines: [Number],
            element: String,
            nature: String,
            symbol: String
        },
        bian: {
            id: Number,
            name: String,
            upperGua: Object,
            lowerGua: Object,
            lines: [Number],
            element: String,
            nature: String,
            symbol: String
        }
    },
    
    movingLine: {
        type: Number,
        min: 1,
        max: 6,
        required: true
    },
    
    // 五行分析
    wuxingAnalysis: {
        ben: String,
        hu: String,
        bian: String,
        relationships: {
            benToHu: {
                type: String,
                strength: String,
                meaning: String,
                description: String,
                effect: String
            },
            benToBian: {
                type: String,
                strength: String,
                meaning: String,
                description: String,
                effect: String
            },
            huToBian: {
                type: String,
                strength: String,
                meaning: String,
                description: String,
                effect: String
            }
        },
        fortune: {
            type: String,
            enum: ['excellent', 'good', 'neutral', 'poor', 'bad']
        },
        strength: Object,
        analysis: String,
        advice: String
    },
    
    // 基础解读
    basicInterpretation: {
        summary: String,
        benGua: Object,
        bianGua: Object,
        wuxing: String,
        timing: String,
        advice: String
    },
    
    // AI解读（如果有）
    aiInterpretation: {
        content: String,
        confidence: {
            type: Number,
            min: 0,
            max: 1
        },
        model: String,
        generatedAt: Date
    },
    
    // 元数据
    confidence: {
        type: Number,
        min: 0,
        max: 1,
        default: 0.8
    },
    processingTime: {
        type: Number, // 毫秒
        default: 0
    },
    
    // 用户反馈
    userFeedback: {
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        comment: {
            type: String,
            maxlength: 500
        },
        helpful: Boolean,
        accuracy: {
            type: Number,
            min: 1,
            max: 5
        },
        submittedAt: Date
    },
    
    // 状态
    status: {
        type: String,
        enum: ['active', 'archived', 'deleted'],
        default: 'active'
    },
    
    // 分享设置
    sharing: {
        isPublic: {
            type: Boolean,
            default: false
        },
        shareCode: {
            type: String,
            unique: true,
            sparse: true
        },
        viewCount: {
            type: Number,
            default: 0
        }
    },
    
    // 标签
    tags: [{
        type: String,
        trim: true
    }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// 索引
DivinationSchema.index({ userId: 1, createdAt: -1 });
DivinationSchema.index({ questionType: 1 });
DivinationSchema.index({ 'hexagrams.ben.id': 1 });
DivinationSchema.index({ 'wuxingAnalysis.fortune': 1 });
DivinationSchema.index({ 'sharing.shareCode': 1 });
DivinationSchema.index({ createdAt: -1 });

// 虚拟字段
DivinationSchema.virtual('isRecent').get(function() {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    return this.createdAt > threeDaysAgo;
});

DivinationSchema.virtual('hasAI').get(function() {
    return this.aiInterpretation && this.aiInterpretation.content;
});

DivinationSchema.virtual('overallRating').get(function() {
    if (this.userFeedback && this.userFeedback.rating) {
        return this.userFeedback.rating;
    }
    // 基于置信度和运势计算默认评分
    let rating = 3;
    if (this.wuxingAnalysis && this.wuxingAnalysis.fortune) {
        switch (this.wuxingAnalysis.fortune) {
            case 'excellent': rating = 5; break;
            case 'good': rating = 4; break;
            case 'neutral': rating = 3; break;
            case 'poor': rating = 2; break;
            case 'bad': rating = 1; break;
        }
    }
    return rating;
});

// 实例方法：生成分享代码
DivinationSchema.methods.generateShareCode = function() {
    if (!this.sharing.shareCode) {
        this.sharing.shareCode = `div_${this._id.toString().slice(-8)}_${Date.now().toString(36)}`;
    }
    return this.sharing.shareCode;
};

// 实例方法：增加查看次数
DivinationSchema.methods.incrementViewCount = function() {
    this.sharing.viewCount += 1;
    return this.save();
};

// 实例方法：添加用户反馈
DivinationSchema.methods.addFeedback = function(feedback) {
    this.userFeedback = {
        ...feedback,
        submittedAt: new Date()
    };
    return this.save();
};

// 静态方法：获取用户占卜统计
DivinationSchema.statics.getUserStats = function(userId) {
    return this.aggregate([
        { $match: { userId: mongoose.Types.ObjectId(userId), status: 'active' } },
        {
            $group: {
                _id: null,
                totalCount: { $sum: 1 },
                avgRating: { $avg: '$userFeedback.rating' },
                questionTypes: { $push: '$questionType' },
                fortuneDistribution: { $push: '$wuxingAnalysis.fortune' }
            }
        }
    ]);
};

// 静态方法：获取热门问题类型
DivinationSchema.statics.getPopularQuestionTypes = function() {
    return this.aggregate([
        { $match: { status: 'active' } },
        { $group: { _id: '$questionType', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
    ]);
};

module.exports = mongoose.model('Divination', DivinationSchema);
