/**
 * Claude AI 集成模块
 * 实现与 Claude API 的交互
 */

const axios = require('axios');

class ClaudeAI {
    constructor() {
        this.apiKey = process.env.CLAUDE_API_KEY;
        this.baseURL = 'https://api.anthropic.com/v1';
        this.model = 'claude-3-sonnet-20240229';
        
        if (!this.apiKey) {
            console.warn('⚠️ Claude API Key 未配置，AI功能将不可用');
        }
    }

    /**
     * 生成AI解读
     * @param {Object} divinationResult - 占卜结果
     * @param {Object} userContext - 用户上下文
     * @returns {Object} AI解读结果
     */
    async generateInterpretation(divinationResult, userContext = {}) {
        if (!this.apiKey) {
            throw new Error('Claude API Key 未配置');
        }

        try {
            const prompt = this.buildInterpretationPrompt(divinationResult, userContext);
            const response = await this.callClaude(prompt);
            
            return {
                content: response.content,
                confidence: this.calculateConfidence(response),
                model: this.model,
                generatedAt: new Date(),
                tokens: response.usage || {}
            };
        } catch (error) {
            console.error('❌ Claude AI 调用失败:', error);
            throw new Error(`AI解读生成失败: ${error.message}`);
        }
    }

    /**
     * 构建解读提示词
     */
    buildInterpretationPrompt(divinationResult, userContext) {
        const { question, hexagrams, wuxingAnalysis, basicInterpretation } = divinationResult;
        const { questionType = 'general' } = userContext;

        return `你是一位精通梅花易数的专业占卜师，请基于以下卦象信息为用户提供专业解读：

**用户问题**：${question}
**问题类型**：${this.getQuestionTypeDescription(questionType)}

**卦象信息**：
- 本卦：${hexagrams.ben.name}（${hexagrams.ben.upperGua.name}${hexagrams.ben.lowerGua.name}）
- 互卦：${hexagrams.hu.name}（${hexagrams.hu.upperGua.name}${hexagrams.hu.lowerGua.name}）
- 变卦：${hexagrams.bian.name}（${hexagrams.bian.upperGua.name}${hexagrams.bian.lowerGua.name}）
- 动爻：第${divinationResult.movingLine}爻

**五行分析**：
- 本卦五行：${wuxingAnalysis.ben}
- 互卦五行：${wuxingAnalysis.hu}
- 变卦五行：${wuxingAnalysis.bian}
- 五行关系：${this.formatWuxingRelationships(wuxingAnalysis.relationships)}
- 总体运势：${this.getFortuneDescription(wuxingAnalysis.fortune)}

**基础解读**：
${basicInterpretation.summary}

请提供：
1. **卦象总体含义**（100-150字）：解释卦象的核心寓意
2. **针对具体问题的分析**（150-200字）：结合用户问题进行深入分析
3. **实用建议和指导**（100-120字）：给出具体可行的建议
4. **时机把握**（50-80字）：分析行动的最佳时机

要求：
- 语言亲和、积极正面、具有指导意义
- 避免过于玄虚或消极的表述
- 结合现代生活实际情况
- 保持专业性和准确性

请按照以下格式回复：

## 卦象总体含义
[在此填写卦象总体含义]

## 针对问题的分析
[在此填写针对具体问题的分析]

## 实用建议
[在此填写实用建议和指导]

## 时机把握
[在此填写时机分析]`;
    }

    /**
     * 调用 Claude API
     */
    async callClaude(prompt, maxTokens = 1000) {
        const headers = {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
            'anthropic-version': '2023-06-01'
        };

        const data = {
            model: this.model,
            max_tokens: maxTokens,
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.7,
            top_p: 0.9
        };

        try {
            const response = await axios.post(`${this.baseURL}/messages`, data, { headers });
            
            if (response.data && response.data.content && response.data.content.length > 0) {
                return {
                    content: response.data.content[0].text,
                    usage: response.data.usage,
                    model: response.data.model
                };
            } else {
                throw new Error('Claude API 返回格式异常');
            }
        } catch (error) {
            if (error.response) {
                const { status, data } = error.response;
                throw new Error(`Claude API 错误 (${status}): ${data.error?.message || '未知错误'}`);
            } else if (error.request) {
                throw new Error('网络连接失败，请检查网络设置');
            } else {
                throw new Error(`请求配置错误: ${error.message}`);
            }
        }
    }

    /**
     * 计算AI回答的置信度
     */
    calculateConfidence(response) {
        let confidence = 0.8; // 基础置信度

        // 基于回答长度调整
        const contentLength = response.content.length;
        if (contentLength > 500) confidence += 0.1;
        if (contentLength < 200) confidence -= 0.1;

        // 基于结构完整性调整
        const hasStructure = response.content.includes('##') && 
                           response.content.includes('卦象总体含义') &&
                           response.content.includes('实用建议');
        if (hasStructure) confidence += 0.1;

        return Math.max(0.5, Math.min(0.95, confidence));
    }

    /**
     * 获取问题类型描述
     */
    getQuestionTypeDescription(questionType) {
        const descriptions = {
            career: '事业发展',
            relationship: '感情婚姻',
            health: '健康状况',
            wealth: '财运投资',
            study: '学业考试',
            general: '综合运势'
        };
        return descriptions[questionType] || '综合运势';
    }

    /**
     * 格式化五行关系
     */
    formatWuxingRelationships(relationships) {
        const parts = [];
        if (relationships.benToHu) {
            parts.push(`本卦${relationships.benToHu.meaning}互卦`);
        }
        if (relationships.benToBian) {
            parts.push(`本卦${relationships.benToBian.meaning}变卦`);
        }
        return parts.join('，');
    }

    /**
     * 获取运势描述
     */
    getFortuneDescription(fortune) {
        const descriptions = {
            excellent: '大吉',
            good: '吉利',
            neutral: '平平',
            poor: '不利',
            bad: '凶险'
        };
        return descriptions[fortune] || '待定';
    }

    /**
     * 测试API连接
     */
    async testConnection() {
        if (!this.apiKey) {
            return { success: false, message: 'API Key 未配置' };
        }

        try {
            const response = await this.callClaude('请回复"连接测试成功"', 50);
            return { 
                success: true, 
                message: '连接测试成功',
                response: response.content 
            };
        } catch (error) {
            return { 
                success: false, 
                message: `连接测试失败: ${error.message}` 
            };
        }
    }

    /**
     * 获取API使用统计
     */
    getUsageStats() {
        // 这里可以实现API使用统计功能
        return {
            totalRequests: 0,
            totalTokens: 0,
            averageResponseTime: 0,
            lastRequestTime: null
        };
    }
}

module.exports = ClaudeAI;
