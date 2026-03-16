import mongoose from "mongoose";

const securityConfigSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  
  // Global enable/disable
  enabled: { type: Boolean, default: false },
  
  // Captcha verification requirement
  captchaRequired: { type: Boolean, default: true },
  
  // Protection toggles
  protections: {
    antiChannelCreate: { type: Boolean, default: false },
    antiChannelDelete: { type: Boolean, default: false },
    antiRoleCreate: { type: Boolean, default: false },
    antiRoleDelete: { type: Boolean, default: false },
    antiMemberKick: { type: Boolean, default: false },
    antiMemberBan: { type: Boolean, default: false },
    antiPrune: { type: Boolean, default: false },
    antiBotAdd: { type: Boolean, default: false },
    antiDangerousRoleGrant: { type: Boolean, default: false }
  },
  
  // Action limits (number of actions allowed in timeframe)
  limits: {
    channelCreateLimit: { type: Number, default: 5 },
    channelDeleteLimit: { type: Number, default: 5 },
    roleCreateLimit: { type: Number, default: 5 },
    roleDeleteLimit: { type: Number, default: 5 },
    memberKickLimit: { type: Number, default: 3 },
    memberBanLimit: { type: Number, default: 3 },
    botAddLimit: { type: Number, default: 1 },
    
    // Timeframe in seconds (default 5 minutes)
    timeframe: { type: Number, default: 300 }
  },
  
  // Punishment configuration
  punishment: {
    type: { 
      type: String, 
      enum: ['kick', 'ban', 'removeRoles'], 
      default: 'ban'
    },
    // For removeRoles: array of role IDs to remove
    rolesToRemove: [String]
  },
  
  // Logging
  securityLogChannelId: { type: String, default: null }
}, { timestamps: true });

export default mongoose.models.SecurityConfig || mongoose.model('SecurityConfig', securityConfigSchema);
