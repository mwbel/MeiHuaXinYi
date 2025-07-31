const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI);

const TestSchema = new mongoose.Schema({ name: String });
const Test = mongoose.models.Test || mongoose.model('Test', TestSchema);

module.exports = async (req, res) => {
  try {
    const doc = await Test.create({ name: 'Hello MongoDB' });
    const docs = await Test.find();
    res.status(200).json({ inserted: doc, all: docs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
