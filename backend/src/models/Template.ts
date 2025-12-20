import mongoose, { Document, Schema } from 'mongoose';

// Template - Master blueprint created by admins
export interface ITemplate extends Document {
  slug: string;
  name: string;
  description: string;
  category: 'wedding' | 'birthday' | 'anniversary' | 'corporate' | 'baby_shower' | 'engagement' | 'graduation' | 'other';
  thumbnail: string;
  currentVersion: number;
  isActive: boolean;
  isPremium: boolean;
  usageCount: number;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TemplateSchema = new Schema<ITemplate>({
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  category: { 
    type: String, 
    enum: ['wedding', 'birthday', 'anniversary', 'corporate', 'baby_shower', 'engagement', 'graduation', 'other'],
    default: 'other' 
  },
  thumbnail: { type: String, default: '' },
  currentVersion: { type: Number, default: 1 },
  isActive: { type: Boolean, default: false },
  isPremium: { type: Boolean, default: false },
  usageCount: { type: Number, default: 0 },
  createdBy: { type: Schema.Types.ObjectId, ref: 'AdminUser', required: true }
}, {
  timestamps: true
});

// Indexes
TemplateSchema.index({ slug: 1 }, { unique: true });
TemplateSchema.index({ isActive: 1, category: 1 });
TemplateSchema.index({ name: 'text', description: 'text' });
TemplateSchema.index({ createdAt: -1 });

export default mongoose.model<ITemplate>('Template', TemplateSchema);
