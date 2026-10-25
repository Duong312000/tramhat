const User = require('../models/User');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { emailOrPhone, password, rememberMe } = req.body;
    const user = await User.findOne({
      $or: [{ email: emailOrPhone }, { phone: emailOrPhone }, { id: emailOrPhone }]
    });

    if (!user || user.password !== password) {
      return res.status(401).json({ success: false, message: 'Thông tin đăng nhập không chính xác' });
    }

    const userData = user.toObject();
    delete userData.password;

    const sessionDuration = rememberMe ? 7 * 24 * 3600 * 1000 : 2 * 3600 * 1000;
    const sessionToken = `th_sess_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    const expiresAt = Date.now() + sessionDuration;

    res.json({
      success: true,
      token: sessionToken,
      expiresAt,
      user: userData
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.validateSession = async (req, res) => {
  try {
    const token = req.headers.authorization ? req.headers.authorization.replace('Bearer ', '') : null;
    if (!token) {
      return res.status(401).json({ success: false, message: 'Không tìm thấy mã phiên' });
    }
    res.json({ success: true, valid: true, message: 'Phiên làm việc hợp lệ', token });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.register = async (req, res) => {
  try {
    const id = req.body.id || `user_${Date.now()}`;
    const newUser = new User({ ...req.body, id });
    const saved = await newUser.save();
    const resUser = saved.toObject();
    delete resUser.password;
    res.status(201).json({ success: true, user: resUser });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const updated = await User.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    ).select('-password');
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }
    res.json({ success: true, user: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
