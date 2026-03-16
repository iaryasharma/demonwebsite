import mongoose from "mongoose";

const securityWhitelistSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  
  // Either userId or roleId (one of them must exist)
  userId: { type: String, default: null },
  roleId: { type: String, default: null },
  
  // Type of whitelist entry
  entryType: { 
    type: String, 
    enum: ['user', 'role'], 
    required: true
  },
  
  // Whitelist categories
  categories: [{
    type: String,
    enum: [
      'all',
      'role',
      'channel',
      'kick',
      'ban',
      'prune',
      'adminActions',
      'addBots'
    ],
    default: 'all'
  }],
  
  // Who added this entry
  addedBy: { type: String, default: null },
  
  // Reason for whitelisting
  reason: { type: String, default: null },

  // System-protected entries (bot/owner) — cannot be deleted via dashboard
  isProtected: { type: Boolean, default: false }
}, { timestamps: true });

// Compound unique index
securityWhitelistSchema.index({ guildId: 1, userId: 1 }, { sparse: true });
securityWhitelistSchema.index({ guildId: 1, roleId: 1 }, { sparse: true });

export default mongoose.models.SecurityWhitelist || mongoose.model('SecurityWhitelist', securityWhitelistSchema);
