const Order = require('../models/Order');

exports.getAllOrders = async (req, res) => {
  try {
    const filter = {};
    if (req.query.phone) {
      const cleanPhone = req.query.phone.replace(/[^0-9]/g, '');
      filter.phone = new RegExp(cleanPhone, 'i');
    }
    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const id = req.body.id || `#TH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder = new Order({ ...req.body, id });
    const saved = await newOrder.save();
    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate(
      { id: req.params.id },
      { status: req.body.status },
      { new: true }
    );
    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
