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

exports.phoneAuth = async (req, res) => {
  try {
    let { phone, name, address, district } = req.body || {};
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp số điện thoại' });
    }
    phone = phone.replace(/[^0-9]/g, '');

    let existing = await User.findOne({ phone });
    if (existing) {
      const resUser = existing.toObject();
      delete resUser.password;
      return res.json({ success: true, user: resUser });
    }

    const id = 'USR-TEL-' + phone.slice(-6);
    const newUser = new User({
      id,
      name: name || ('Khách Hàng ' + phone.slice(-4)),
      phone,
      email: phone + '@khachhang.tramhat.vn',
      address: address || 'TP.HCM',
      district: district || 'TP.HCM',
      role: 'customer',
      source: 'phone_auth',
      channelGroup: 'Direct / Phone Login',
      tier: 'Eco Citizen (Thành viên Mới)',
      points: 50,
      bottlesReturned: 0,
      ordersCount: 0
    });
    const saved = await newUser.save();
    const resUser = saved.toObject();
    delete resUser.password;
    res.status(201).json({ success: true, user: resUser });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.googleAuth = async (req, res) => {
  try {
    const { name, email, avatar, googleId } = req.body || {};
    if (!email) {
      return res.status(400).json({ success: false, message: 'Thiếu email Google' });
    }

    let existing = await User.findOne({ email });
    if (existing) {
      existing.name = name || existing.name;
      existing.avatar = avatar || existing.avatar;
      await existing.save();
      const resUser = existing.toObject();
      delete resUser.password;
      return res.json({ success: true, user: resUser });
    }

    const id = 'USR-GG-' + (googleId ? googleId.slice(-6) : Date.now().toString().slice(-6));
    const newUser = new User({
      id,
      name: name || 'Người Dùng Google',
      email,
      avatar: avatar || '',
      role: 'customer',
      source: 'google_oauth',
      channelGroup: 'Organic Search / Google OAuth',
      tier: 'Eco Citizen (Thành viên Google)',
      points: 50,
      bottlesReturned: 0,
      ordersCount: 0
    });
    const saved = await newUser.save();
    const resUser = saved.toObject();
    delete resUser.password;
    res.status(201).json({ success: true, user: resUser });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
