/**
 * 用户模型
 * 定义用户数据结构和相关方法
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    // 基本信息
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 20
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    nickname: {
        type: String,
        trim: true,
        maxlength: 30
    },
    avatar: {
        type: String,
        default: ''
    },

    // 个人信息
    profile: {
        gender: {
            type: String,
            enum: ['male', 'female', 'other'],
            default: 'other'
        },
        birthDate: {
            type: Date
        },
        location: {
            city: String,
            province: String,
            country: String
        },
        bio: {
            type: String,
            maxlength: 200
        }
    },

    // 生辰八字信息（用于AI顾问功能）
    birthInfo: {
        year: Number,
        month: Number,
        day: Number,
        hour: Number,
        timezone: {
            type: String,
            default: 'Asia/Shanghai'
        },
        location: {
            city: String,
            province: String,
            coordinates: [Number] // [经度, 纬度]
        }
    },

    // 账户状态
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'active'
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    lastLoginAt: {
        type: Date
    },

    // 使用统计
    usage: {
        totalDivinations: {
            type: Number,
            default: 0
        },
        freeCount: {
            type: Number,
            default: 3 // 免费占卜次数
        },
        lastDivinationAt: {
            type: Date
        },
        favoriteQuestionTypes: [{
            type: String
        }]
    },

    // 偏好设置
    preferences: {
        language: {
            type: String,
            default: 'zh-CN'
        },
        theme: {
            type: String,
            enum: ['light', 'dark', 'auto'],
            default: 'auto'
        },
        notifications: {
            email: {
                type: Boolean,
                default: true
            },
            push: {
                type: Boolean,
                default: true
            }
        },
        privacy: {
            showProfile: {
                type: Boolean,
                default: false
            },
            shareHistory: {
                type: Boolean,
                default: false
            }
        }
    },

    // 会员信息
    membership: {
        type: {
            type: String,
            enum: ['free', 'premium', 'vip'],
            default: 'free'
        },
        expiresAt: {
            type: Date
        },
        features: [{
            type: String
        }]
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// 索引
UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });
UserSchema.index({ 'usage.lastDivinationAt': -1 });
UserSchema.index({ createdAt: -1 });

// 虚拟字段
UserSchema.virtual('displayName').get(function() {
    return this.nickname || this.username;
});

UserSchema.virtual('isVip').get(function() {
    return this.membership.type !== 'free' &&
           this.membership.expiresAt &&
           this.membership.expiresAt > new Date();
});

UserSchema.virtual('canDivination').get(function() {
    return this.isVip || this.usage.freeCount > 0;
});

// 中间件：密码加密
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// 实例方法：验证密码
UserSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// 实例方法：更新登录时间
UserSchema.methods.updateLastLogin = function() {
    this.lastLoginAt = new Date();
    return this.save();
};

// 实例方法：消费占卜次数
UserSchema.methods.consumeDivination = function() {
    if (this.isVip) {
        // VIP用户不消费免费次数
        this.usage.totalDivinations += 1;
        this.usage.lastDivinationAt = new Date();
    } else if (this.usage.freeCount > 0) {
        this.usage.freeCount -= 1;
        this.usage.totalDivinations += 1;
        this.usage.lastDivinationAt = new Date();
    } else {
        throw new Error('占卜次数不足');
    }
    return this.save();
};

// 实例方法：获取安全的用户信息
UserSchema.methods.toSafeObject = function() {
    const userObject = this.toObject();
    delete userObject.password;
    delete userObject.__v;
    return userObject;
};

// 静态方法：根据邮箱或用户名查找用户
UserSchema.statics.findByEmailOrUsername = function(identifier) {
    return this.findOne({
        $or: [
            { email: identifier },
            { username: identifier }
        ]
    });
};

module.exports = mongoose.model('User', UserSchema);