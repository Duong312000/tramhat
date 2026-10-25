const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  key: { type: String, default: 'site_content', unique: true },
  hero: { type: mongoose.Schema.Types.Mixed },
  brandStats: { type: mongoose.Schema.Types.Mixed },
  craftProcess: { type: mongoose.Schema.Types.Mixed },
  qualityCommitments: [{ type: mongoose.Schema.Types.Mixed }],
  ecoMission: { type: mongoose.Schema.Types.Mixed },
  systemNotice: { type: mongoose.Schema.Types.Mixed }
}, {
  timestamps: true,
  strict: false
});

module.exports = mongoose.model('Content', contentSchema);
