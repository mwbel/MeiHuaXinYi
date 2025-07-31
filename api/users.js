const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI);

const UserSchema = new mongoose.Schema({
  username: String,
  email: String,
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.models.User || mongoose.model('User', UserSchema);

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    const users = await User.find();
    res.status(200).json(users);
  } else if (req.method === 'POST') {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
};