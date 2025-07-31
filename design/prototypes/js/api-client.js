/**
 * API 客户端
 * 处理与后端API的所有交互
 */

class APIClient {
    constructor() {
        this.baseURL = this.getBaseURL();
        this.token = this.getStoredToken();
        this.defaultHeaders = {
            'Content-Type': 'application/json'
        };
    }

    /**
     * 获取API基础URL
     */
    getBaseURL() {
        // 在生产环境中使用Vercel部署的API
        if (window.location.hostname.includes('vercel.app')) {
            return window.location.origin + '/api';
        }
        // 本地开发环境
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return 'http://localhost:3000/api';
        }
        // 默认使用当前域名
        return window.location.origin + '/api';
    }

    /**
     * 获取存储的Token
     */
    getStoredToken() {
        return localStorage.getItem('auth_token');
    }

    /**
     * 设置Token
     */
    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('auth_token', token);
        } else {
            localStorage.removeItem('auth_token');
        }
    }

    /**
     * 获取请求头
     */
    getHeaders(includeAuth = true) {
        const headers = { ...this.defaultHeaders };
        if (includeAuth && this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        return headers;
    }

    /**
     * 通用请求方法
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            method: 'GET',
            headers: this.getHeaders(options.auth !== false),
            ...options
        };

        if (config.body && typeof config.body === 'object') {
            config.body = JSON.stringify(config.body);
        }

        try {
            console.log(`🌐 API请求: ${config.method} ${url}`);
            const response = await fetch(url, config);
            
            // 处理响应
            const contentType = response.headers.get('content-type');
            let data;
            
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            if (!response.ok) {
                throw new APIError(data.error || data.message || '请求失败', response.status, data);
            }

            console.log(`✅ API响应成功: ${config.method} ${url}`, data);
            return data;

        } catch (error) {
            console.error(`❌ API请求失败: ${config.method} ${url}`, error);
            
            if (error instanceof APIError) {
                throw error;
            }
            
            // 网络错误或其他错误
            throw new APIError('网络连接失败，请检查网络设置', 0, { originalError: error.message });
        }
    }

    /**
     * GET 请求
     */
    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        return this.request(url);
    }

    /**
     * POST 请求
     */
    async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: data
        });
    }

    /**
     * PUT 请求
     */
    async put(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: data
        });
    }

    /**
     * DELETE 请求
     */
    async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    }

    // ==================== 认证相关 API ====================

    /**
     * 用户注册
     */
    async register(userData) {
        const response = await this.post('/auth/register', userData);
        if (response.success && response.token) {
            this.setToken(response.token);
        }
        return response;
    }

    /**
     * 用户登录
     */
    async login(credentials) {
        const response = await this.post('/auth/login', credentials);
        if (response.success && response.token) {
            this.setToken(response.token);
        }
        return response;
    }

    /**
     * 用户登出
     */
    logout() {
        this.setToken(null);
        return Promise.resolve({ success: true, message: '已退出登录' });
    }

    /**
     * 验证Token
     */
    async verifyToken() {
        if (!this.token) {
            return { valid: false, message: '未找到Token' };
        }

        try {
            const response = await this.get('/auth/verify');
            return { valid: true, user: response.user };
        } catch (error) {
            this.setToken(null);
            return { valid: false, message: error.message };
        }
    }

    // ==================== 占卜相关 API ====================

    /**
     * 执行占卜
     */
    async performDivination(divinationData) {
        return this.post('/divination/perform', divinationData);
    }

    /**
     * 获取占卜历史
     */
    async getDivinationHistory(params = {}) {
        return this.get('/divination/history', params);
    }

    /**
     * 获取占卜详情
     */
    async getDivinationDetail(divinationId) {
        return this.get(`/divination/${divinationId}`);
    }

    /**
     * 生成AI解读
     */
    async generateAIInterpretation(divinationId, userContext = {}) {
        return this.post('/ai/interpret', {
            divinationId,
            userContext
        });
    }

    // ==================== 用户相关 API ====================

    /**
     * 获取用户信息
     */
    async getUserProfile() {
        return this.get('/user/profile');
    }

    /**
     * 更新用户信息
     */
    async updateUserProfile(profileData) {
        return this.put('/user/profile', profileData);
    }

    /**
     * 获取用户统计
     */
    async getUserStats() {
        return this.get('/user/stats');
    }

    // ==================== 辅助功能 API ====================

    /**
     * 健康检查
     */
    async healthCheck() {
        return this.get('/health', {}, { auth: false });
    }

    /**
     * 获取卦象信息
     */
    async getHexagramInfo(hexagramId) {
        return this.get(`/hexagram/${hexagramId}`, {}, { auth: false });
    }

    /**
     * 搜索卦象
     */
    async searchHexagrams(keyword) {
        return this.get('/hexagram/search', { keyword }, { auth: false });
    }

    /**
     * 提交反馈
     */
    async submitFeedback(feedbackData) {
        return this.post('/feedback', feedbackData);
    }
}

/**
 * API 错误类
 */
class APIError extends Error {
    constructor(message, status = 0, data = {}) {
        super(message);
        this.name = 'APIError';
        this.status = status;
        this.data = data;
    }

    /**
     * 是否为认证错误
     */
    isAuthError() {
        return this.status === 401 || this.status === 403;
    }

    /**
     * 是否为网络错误
     */
    isNetworkError() {
        return this.status === 0;
    }

    /**
     * 是否为服务器错误
     */
    isServerError() {
        return this.status >= 500;
    }

    /**
     * 获取用户友好的错误信息
     */
    getUserMessage() {
        if (this.isNetworkError()) {
            return '网络连接失败，请检查网络设置';
        }
        if (this.isAuthError()) {
            return '登录已过期，请重新登录';
        }
        if (this.isServerError()) {
            return '服务器暂时不可用，请稍后重试';
        }
        return this.message || '操作失败，请重试';
    }
}

// 创建全局API客户端实例
window.apiClient = new APIClient();
window.APIError = APIError;

console.log('✅ API客户端已初始化');
