module.exports = async (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    message: 'MeiHuaXinYi API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
};
