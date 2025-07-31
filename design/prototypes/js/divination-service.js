/**
 * 占卜服务
 * 处理占卜相关的业务逻辑
 */

class DivinationService {
    constructor() {
        this.apiClient = window.apiClient;
        this.currentDivination = null;
    }

    /**
     * 执行占卜
     */
    async performDivination(questionData) {
        try {
            // 显示加载状态
            this.showLoadingState();

            // 验证问题数据
            this.validateQuestionData(questionData);

            // 调用API执行占卜
            const response = await this.apiClient.performDivination(questionData);

            if (response.success) {
                this.currentDivination = response.data;
                
                // 保存到本地存储
                this.saveDivinationToLocal(response.data);
                
                // 更新用户状态
                if (response.user) {
                    window.appState.setState('user.freeCount', response.user.freeCount);
                    window.appState.setState('user.totalDivinations', response.user.totalDivinations);
                }

                return response.data;
            } else {
                throw new Error(response.message || '占卜执行失败');
            }

        } catch (error) {
            console.error('❌ 占卜执行失败:', error);
            this.handleDivinationError(error);
            throw error;
        } finally {
            this.hideLoadingState();
        }
    }

    /**
     * 验证问题数据
     */
    validateQuestionData(questionData) {
        if (!questionData.question || questionData.question.trim().length < 5) {
            throw new Error('问题内容至少需要5个字符');
        }

        if (questionData.question.length > 500) {
            throw new Error('问题内容不能超过500个字符');
        }

        if (questionData.method === 'number') {
            if (!questionData.parameters || !questionData.parameters.numbers) {
                throw new Error('数字起卦需要提供两个数字');
            }
            
            const { number1, number2 } = questionData.parameters.numbers;
            if (!number1 || !number2 || number1 < 1 || number2 < 1 || number1 > 999 || number2 > 999) {
                throw new Error('数字必须在1-999之间');
            }
        }
    }

    /**
     * 生成AI解读
     */
    async generateAIInterpretation(divinationId, userContext = {}) {
        try {
            this.showAILoadingState();

            const response = await this.apiClient.generateAIInterpretation(divinationId, userContext);

            if (response.success) {
                // 更新当前占卜记录
                if (this.currentDivination && this.currentDivination.id === divinationId) {
                    this.currentDivination.aiInterpretation = response.data.interpretation;
                    this.saveDivinationToLocal(this.currentDivination);
                }

                return response.data;
            } else {
                throw new Error(response.message || 'AI解读生成失败');
            }

        } catch (error) {
            console.error('❌ AI解读生成失败:', error);
            this.handleAIError(error);
            throw error;
        } finally {
            this.hideAILoadingState();
        }
    }

    /**
     * 获取占卜历史
     */
    async getDivinationHistory(params = {}) {
        try {
            const response = await this.apiClient.getDivinationHistory(params);
            
            if (response.success) {
                return {
                    divinations: response.data,
                    pagination: response.pagination,
                    statistics: response.statistics
                };
            } else {
                throw new Error(response.message || '获取历史记录失败');
            }

        } catch (error) {
            console.error('❌ 获取历史记录失败:', error);
            throw error;
        }
    }

    /**
     * 保存占卜到本地存储
     */
    saveDivinationToLocal(divination) {
        try {
            const key = `divination_${divination.id}`;
            const data = {
                ...divination,
                savedAt: new Date().toISOString()
            };
            localStorage.setItem(key, JSON.stringify(data));
            
            // 更新最近占卜列表
            this.updateRecentDivinations(divination);
            
        } catch (error) {
            console.warn('⚠️ 保存占卜记录到本地失败:', error);
        }
    }

    /**
     * 更新最近占卜列表
     */
    updateRecentDivinations(divination) {
        try {
            const recentKey = 'recent_divinations';
            let recent = JSON.parse(localStorage.getItem(recentKey) || '[]');
            
            // 移除重复项
            recent = recent.filter(item => item.id !== divination.id);
            
            // 添加到开头
            recent.unshift({
                id: divination.id,
                question: divination.question,
                questionType: divination.questionType,
                timestamp: divination.timestamp,
                fortune: divination.wuxingAnalysis?.fortune
            });
            
            // 只保留最近10条
            recent = recent.slice(0, 10);
            
            localStorage.setItem(recentKey, JSON.stringify(recent));
            
        } catch (error) {
            console.warn('⚠️ 更新最近占卜列表失败:', error);
        }
    }

    /**
     * 从本地获取占卜记录
     */
    getDivinationFromLocal(divinationId) {
        try {
            const key = `divination_${divinationId}`;
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.warn('⚠️ 从本地获取占卜记录失败:', error);
            return null;
        }
    }

    /**
     * 获取最近占卜列表
     */
    getRecentDivinations() {
        try {
            const recentKey = 'recent_divinations';
            return JSON.parse(localStorage.getItem(recentKey) || '[]');
        } catch (error) {
            console.warn('⚠️ 获取最近占卜列表失败:', error);
            return [];
        }
    }

    /**
     * 显示占卜加载状态
     */
    showLoadingState() {
        if (window.Utils && window.Utils.showToast) {
            window.Utils.showToast('正在为您占卜...', 'info');
        }
        
        // 可以在这里添加更多的加载状态UI
        const loadingElements = document.querySelectorAll('.divination-loading');
        loadingElements.forEach(el => el.style.display = 'block');
    }

    /**
     * 隐藏占卜加载状态
     */
    hideLoadingState() {
        const loadingElements = document.querySelectorAll('.divination-loading');
        loadingElements.forEach(el => el.style.display = 'none');
    }

    /**
     * 显示AI加载状态
     */
    showAILoadingState() {
        if (window.Utils && window.Utils.showToast) {
            window.Utils.showToast('AI正在生成解读...', 'info');
        }
        
        const aiLoadingElements = document.querySelectorAll('.ai-loading');
        aiLoadingElements.forEach(el => el.style.display = 'block');
    }

    /**
     * 隐藏AI加载状态
     */
    hideAILoadingState() {
        const aiLoadingElements = document.querySelectorAll('.ai-loading');
        aiLoadingElements.forEach(el => el.style.display = 'none');
    }

    /**
     * 处理占卜错误
     */
    handleDivinationError(error) {
        let message = '占卜执行失败';
        
        if (error instanceof window.APIError) {
            if (error.isAuthError()) {
                message = '登录已过期，请重新登录';
                // 可以触发重新登录流程
                window.router?.navigate('login');
            } else if (error.status === 403) {
                message = error.getUserMessage();
                // 可以显示升级VIP的提示
            } else {
                message = error.getUserMessage();
            }
        } else {
            message = error.message || message;
        }

        if (window.Utils && window.Utils.showToast) {
            window.Utils.showToast(message, 'error');
        } else {
            alert(message);
        }
    }

    /**
     * 处理AI错误
     */
    handleAIError(error) {
        let message = 'AI解读生成失败';
        
        if (error instanceof window.APIError) {
            if (error.status === 403) {
                message = 'AI解读需要VIP权限，请升级会员';
            } else if (error.status === 503) {
                message = 'AI服务暂时不可用，请稍后重试';
            } else {
                message = error.getUserMessage();
            }
        } else {
            message = error.message || message;
        }

        if (window.Utils && window.Utils.showToast) {
            window.Utils.showToast(message, 'error');
        } else {
            alert(message);
        }
    }

    /**
     * 获取当前占卜
     */
    getCurrentDivination() {
        return this.currentDivination;
    }

    /**
     * 清除当前占卜
     */
    clearCurrentDivination() {
        this.currentDivination = null;
    }
}

// 创建全局占卜服务实例
window.divinationService = new DivinationService();

console.log('✅ 占卜服务已初始化');
