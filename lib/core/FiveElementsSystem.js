/**
 * 五行分析系统
 * 实现五行生克关系、吉凶判断、运势分析
 */

class FiveElementsSystem {
    constructor() {
        this.elements = ['金', '木', '水', '火', '土'];
        this.initializeRelations();
    }

    /**
     * 初始化五行关系
     */
    initializeRelations() {
        // 五行相生关系：金生水，水生木，木生火，火生土，土生金
        this.generationRelations = {
            '金': '水',
            '水': '木', 
            '木': '火',
            '火': '土',
            '土': '金'
        };

        // 五行相克关系：金克木，木克土，土克水，水克火，火克金
        this.destructionRelations = {
            '金': '木',
            '木': '土',
            '土': '水', 
            '水': '火',
            '火': '金'
        };

        // 五行属性
        this.elementProperties = {
            '金': {
                nature: '收敛',
                season: '秋',
                direction: '西',
                color: '白',
                emotion: '悲',
                organ: '肺',
                characteristics: ['坚硬', '肃杀', '收敛', '清洁']
            },
            '木': {
                nature: '生发',
                season: '春',
                direction: '东',
                color: '青',
                emotion: '怒',
                organ: '肝',
                characteristics: ['生长', '条达', '舒畅', '向上']
            },
            '水': {
                nature: '润下',
                season: '冬',
                direction: '北',
                color: '黑',
                emotion: '恐',
                organ: '肾',
                characteristics: ['寒冷', '向下', '滋润', '藏匿']
            },
            '火': {
                nature: '炎上',
                season: '夏',
                direction: '南',
                color: '红',
                emotion: '喜',
                organ: '心',
                characteristics: ['炎热', '向上', '光明', '温暖']
            },
            '土': {
                nature: '稼穑',
                season: '长夏',
                direction: '中',
                color: '黄',
                emotion: '思',
                organ: '脾',
                characteristics: ['承载', '生化', '包容', '稳定']
            }
        };
    }

    /**
     * 分析三卦五行关系
     */
    analyzeFiveElements(benGua, huGua, bianGua) {
        const benElement = this.getHexagramElement(benGua);
        const huElement = this.getHexagramElement(huGua);
        const bianElement = this.getHexagramElement(bianGua);

        const relationships = {
            benToHu: this.getRelationship(benElement, huElement),
            benToBian: this.getRelationship(benElement, bianElement),
            huToBian: this.getRelationship(huElement, bianElement)
        };

        const fortune = this.calculateFortune(benElement, huElement, bianElement, relationships);
        const strength = this.calculateElementStrength(benElement, huElement, bianElement);

        return {
            ben: benElement,
            hu: huElement,
            bian: bianElement,
            relationships,
            fortune,
            strength,
            analysis: this.generateAnalysis(relationships, fortune),
            advice: this.generateElementAdvice(relationships, fortune)
        };
    }

    /**
     * 获取卦象五行
     */
    getHexagramElement(hexagram) {
        // 以上卦五行为主
        return hexagram.upperGua.element;
    }

    /**
     * 获取两个五行之间的关系
     */
    getRelationship(element1, element2) {
        if (this.generationRelations[element1] === element2) {
            return { 
                type: 'generation', 
                strength: 'strong', 
                meaning: '生',
                description: `${element1}生${element2}`,
                effect: 'positive'
            };
        } else if (this.destructionRelations[element1] === element2) {
            return { 
                type: 'destruction', 
                strength: 'strong', 
                meaning: '克',
                description: `${element1}克${element2}`,
                effect: 'negative'
            };
        } else if (element1 === element2) {
            return { 
                type: 'same', 
                strength: 'neutral', 
                meaning: '同',
                description: `${element1}同${element2}`,
                effect: 'stable'
            };
        } else {
            return { 
                type: 'neutral', 
                strength: 'weak', 
                meaning: '平',
                description: `${element1}与${element2}无直接关系`,
                effect: 'neutral'
            };
        }
    }

    /**
     * 计算总体运势
     */
    calculateFortune(benElement, huElement, bianElement, relationships) {
        let score = 50; // 基础分数

        // 本卦到互卦的影响
        if (relationships.benToHu.effect === 'positive') {
            score += 20;
        } else if (relationships.benToHu.effect === 'negative') {
            score -= 15;
        }

        // 本卦到变卦的影响
        if (relationships.benToBian.effect === 'positive') {
            score += 25;
        } else if (relationships.benToBian.effect === 'negative') {
            score -= 20;
        }

        // 互卦到变卦的影响
        if (relationships.huToBian.effect === 'positive') {
            score += 15;
        } else if (relationships.huToBian.effect === 'negative') {
            score -= 10;
        }

        // 五行平衡加分
        const elements = [benElement, huElement, bianElement];
        const uniqueElements = [...new Set(elements)];
        if (uniqueElements.length === 3) {
            score += 10; // 三种不同五行，变化丰富
        }

        // 转换为等级
        if (score >= 85) return 'excellent';
        if (score >= 70) return 'good';
        if (score >= 50) return 'neutral';
        if (score >= 30) return 'poor';
        return 'bad';
    }

    /**
     * 计算五行力量强度
     */
    calculateElementStrength(benElement, huElement, bianElement) {
        const elementCount = {};
        [benElement, huElement, bianElement].forEach(element => {
            elementCount[element] = (elementCount[element] || 0) + 1;
        });

        const strength = {};
        this.elements.forEach(element => {
            let power = elementCount[element] || 0;
            
            // 检查是否被其他五行生助
            [benElement, huElement, bianElement].forEach(otherElement => {
                if (this.generationRelations[otherElement] === element) {
                    power += 0.5;
                }
                if (this.destructionRelations[otherElement] === element) {
                    power -= 0.3;
                }
            });

            strength[element] = Math.max(0, power);
        });

        return strength;
    }

    /**
     * 生成五行分析
     */
    generateAnalysis(relationships, fortune) {
        const analysis = [];

        // 分析本卦到互卦
        if (relationships.benToHu.effect === 'positive') {
            analysis.push('当前状态向好的方向发展');
        } else if (relationships.benToHu.effect === 'negative') {
            analysis.push('当前状态面临一些阻力');
        }

        // 分析本卦到变卦
        if (relationships.benToBian.effect === 'positive') {
            analysis.push('最终结果较为理想');
        } else if (relationships.benToBian.effect === 'negative') {
            analysis.push('需要注意最终结果的变化');
        }

        // 总体运势分析
        switch (fortune) {
            case 'excellent':
                analysis.push('五行配合极佳，大吉之象');
                break;
            case 'good':
                analysis.push('五行配合良好，吉利之象');
                break;
            case 'neutral':
                analysis.push('五行配合平平，需要努力');
                break;
            case 'poor':
                analysis.push('五行配合不佳，需要谨慎');
                break;
            case 'bad':
                analysis.push('五行冲突严重，需要化解');
                break;
        }

        return analysis.join('；');
    }

    /**
     * 生成五行建议
     */
    generateElementAdvice(relationships, fortune) {
        const advice = [];

        // 根据五行关系给出建议
        if (relationships.benToHu.type === 'destruction') {
            advice.push('当前阶段宜以柔克刚，避免硬碰硬');
        }

        if (relationships.benToBian.type === 'generation') {
            advice.push('坚持当前方向，会有好的结果');
        }

        // 根据运势给出建议
        switch (fortune) {
            case 'excellent':
                advice.push('时机极佳，可大胆行动');
                break;
            case 'good':
                advice.push('时机良好，可积极推进');
                break;
            case 'neutral':
                advice.push('保持稳定，循序渐进');
                break;
            case 'poor':
                advice.push('宜守不宜攻，等待时机');
                break;
            case 'bad':
                advice.push('暂停行动，寻求化解之道');
                break;
        }

        return advice.length > 0 ? advice.join('；') : '顺其自然，保持平常心';
    }

    /**
     * 获取五行属性
     */
    getElementProperties(element) {
        return this.elementProperties[element] || null;
    }

    /**
     * 获取相生关系
     */
    getGenerationChain(element) {
        const chain = [element];
        let current = element;
        
        for (let i = 0; i < 4; i++) {
            current = this.generationRelations[current];
            chain.push(current);
        }
        
        return chain;
    }

    /**
     * 获取相克关系
     */
    getDestructionChain(element) {
        const chain = [element];
        let current = element;
        
        for (let i = 0; i < 4; i++) {
            current = this.destructionRelations[current];
            chain.push(current);
        }
        
        return chain;
    }

    /**
     * 判断五行是否平衡
     */
    isElementsBalanced(elements) {
        const count = {};
        elements.forEach(element => {
            count[element] = (count[element] || 0) + 1;
        });

        const values = Object.values(count);
        const max = Math.max(...values);
        const min = Math.min(...values);
        
        return (max - min) <= 1;
    }
}

module.exports = FiveElementsSystem;
