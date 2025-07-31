/**
 * AI智能解读 API
 */

require('dotenv').config();

// CORS 处理
function enableCors(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  return false;
}

// 模拟AI解读（实际应用中会调用Claude API）
function generateAIInterpretation(divinationResult, userContext = {}) {
  const interpretations = {
    career: {
      excellent: '事业运势极佳！当前是推进重要项目的绝佳时机，你的努力将得到认可和回报。建议积极主动，把握机会。',
      good: '事业发展稳中有升，虽然可能遇到一些小挑战，但整体趋势向好。保持耐心和专注，成功在望。',
      neutral: '事业处于平稳期，需要你主动寻找突破点。可以考虑学习新技能或拓展人脉关系。',
      poor: '事业可能面临一些阻力，建议暂缓重大决策，专注于巩固现有基础，等待更好的时机。'
    },
    relationship: {
      excellent: '感情运势非常好！单身者有望遇到心仪对象，有伴侣者关系将更加和谐甜蜜。',
      good: '感情生活总体顺利，可能会有一些小摩擦，但通过沟通能够很好解决。',
      neutral: '感情状况平平，需要你更多的主动和用心经营。真诚待人，必有回报。',
      poor: '感情可能遇到考验，建议多一些理解和包容，避免冲动的决定。'
    },
    health: {
      excellent: '身体状况良好，精力充沛。继续保持良好的生活习惯，适当运动。',
      good: '健康状况稳定，注意劳逸结合，避免过度疲劳。',
      neutral: '身体处于亚健康状态，建议调整作息，加强锻炼。',
      poor: '需要特别关注身体健康，建议及时体检，注意休息。'
    },
    wealth: {
      excellent: '财运亨通！投资理财都有不错的收益，但仍需谨慎理性。',
      good: '财运稳中有升，适合稳健的投资方式，避免高风险项目。',
      neutral: '财运平平，收支基本平衡，建议开源节流。',
      poor: '财运不佳，建议保守理财，避免大额投资和借贷。'
    },
    general: {
      excellent: '整体运势极佳，各方面都有不错的发展，是实现目标的好时机。',
      good: '运势良好，虽有小波折但不影响大局，保持积极心态。',
      neutral: '运势平稳，需要你主动创造机会，积极面对挑战。',
      poor: '运势低迷，建议韬光养晦，积蓄力量，等待转机。'
    }
  };

  const questionType = userContext.questionType || 'general';
  const fortune = divinationResult.fortune || 'neutral';
  
  const baseInterpretation = interpretations[questionType]?.[fortune] || 
                           interpretations.general[fortune];

  return {
    content: `## AI智能解读\n\n${baseInterpretation}\n\n### 详细分析\n\n根据您的卦象显示，${divinationResult.benGua?.name || '当前卦象'}蕴含着深刻的寓意。${divinationResult.interpretation || '建议您保持积极的心态，顺应自然规律。'}\n\n### 行动建议\n\n${divinationResult.advice || '建议您根据实际情况，做出明智的选择。'}记住，占卜只是参考，最终的决定权在您自己手中。\n\n### 时机把握\n\n当前时机${fortune === 'excellent' ? '极佳' : fortune === 'good' ? '良好' : fortune === 'neutral' ? '平平' : '需要谨慎'}，建议您${fortune === 'excellent' || fortune === 'good' ? '积极行动' : '耐心等待'}。`,
    confidence: 0.85,
    model: 'meihua-ai-v1',
    generatedAt: new Date().toISOString()
  };
}

module.exports = async (req, res) => {
  // 处理 CORS
  if (enableCors(req, res)) return;

  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: '方法不允许',
      allowedMethods: ['POST']
    });
  }

  try {
    const { divinationResult, userContext = {} } = req.body;

    if (!divinationResult) {
      return res.status(400).json({
        error: '缺少占卜结果',
        message: '需要提供占卜结果才能生成AI解读'
      });
    }

    // 生成AI解读
    const aiInterpretation = generateAIInterpretation(divinationResult, userContext);

    // 返回结果
    res.status(200).json({
      success: true,
      message: 'AI解读生成成功',
      data: {
        interpretation: aiInterpretation,
        processingTime: Math.random() * 2000 + 1000 // 模拟处理时间
      }
    });

  } catch (err) {
    console.error('❌ AI解读生成失败:', err);
    res.status(500).json({
      error: 'AI解读生成失败',
      message: err.message || '服务器内部错误'
    });
  }
};
