import mongoose from "mongoose";

const securityViolationSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  
  // User who triggered the violation
  userId: { type: String, required: true },
  
  // Type of action that triggered violation
  actionType: {
    type: String,
    enum: [
      'channelCreate',
      'channelDelete',
      'roleCreate',
      'roleDelete',
      'memberKick',
      'memberBan',
      'prune',
      'botAdd',
      'dangerousRoleGrant'
    ],
    required: true
  },
  
  // How many times the action was attempted
  attemptCount: { type: Number, required: true },
  
  // Limit that was set
  limitSet: { type: Number, required: true },
  
  // Punishment applied
  punishment: {
    type: {
      type: String,
      enum: ['kick', 'ban', 'removeRoles'],
      required: true
    },
    applied: { type: Boolean, default: true },
    appliedAt: { type: Date, default: Date.now }
  },
  
  // Additional context
  context: {
    actionDetails: { type: String, default: null },
    targetId: { type: String, default: null }
  },
  
  // Moderator intervention
  moderatorId: { type: String, default: null },
  moderatorNote: { type: String, default: null },
  
  resolvedAt: { type: Date, default: null }
}, { timestamps: true });

// Index for quick lookups
securityViolationSchema.index({ guildId: 1, userId: 1 });
securityViolationSchema.index({ guildId: 1, actionType: 1 });
securityViolationSchema.index({ createdAt: -1 });

export default mongoose.models.SecurityViolation || mongoose.model('SecurityViolation', securityViolationSchema);
