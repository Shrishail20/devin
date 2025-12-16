import mongoose, { Document, Schema } from 'mongoose';

export interface IWish extends Document {
  siteId: mongoose.Types.ObjectId;
  authorName: string;
  authorEmail?: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  isHighlighted: boolean;
  ipAddress?: string;
  userAgent?: string;
  submittedAt: Date;
  moderatedAt?: Date;
  moderatedBy?: mongoose.Types.ObjectId;
}

const WishSchema = new Schema<IWish>({
  siteId: { type: Schema.Types.ObjectId, ref: 'Site', required: true },
  authorName: { type: String, required: true, trim: true },
  authorEmail: { type: String, trim: true, lowercase: true },
  message: { type: String, required: true, trim: true },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  isHighlighted: { type: Boolean, default: false },
  ipAddress: { type: String },
  userAgent: { type: String },
  submittedAt: { type: Date, default: Date.now },
  moderatedAt: { type: Date },
  moderatedBy: { type: Schema.Types.ObjectId, ref: 'AdminUser' }
}, {
  timestamps: true
});

WishSchema.index({ siteId: 1 });
WishSchema.index({ siteId: 1, status: 1 });
WishSchema.index({ siteId: 1, isHighlighted: 1 });
WishSchema.index({ submittedAt: -1 });
WishSchema.index({ authorName: 'text', message: 'text' });

export default mongoose.model<IWish>('Wish', WishSchema);
