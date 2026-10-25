const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  excerpt: { type: String },
  date: { type: String },
  author: { type: String, default: 'Ban Dinh Dưỡng Trạm Hạt' },
  category: { type: String },
  img: { type: String },
  tags: [{ type: String }],
  readTime: { type: String, default: '4 phút đọc' },
  content: { type: mongoose.Schema.Types.Mixed }
}, {
  timestamps: true
});

module.exports = mongoose.model('Article', articleSchema);
