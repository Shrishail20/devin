import mongoose, { Document, Schema } from 'mongoose';

// Microsite - A user's personal event site created from a template
export interface IMicrosite extends Document {
  userId: mongoose.Types.ObjectId;
  templateId: mongoose.Types.ObjectId;
  versionId: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  colorScheme: string;
  fontPair: string;
  settings: {
    enableRsvp: boolean;
    enableWishes: boolean;
    requireWishApproval: boolean;
    rsvpDeadline?: Date;
    eventDate?: Date;
    eventEndDate?: Date;
    timezone: string;
  };
  viewCount: number;
  uniqueViewCount: number;
  lastViewedAt?: Date;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MicrositeSchema = new Schema<IMicrosite>({
  userId: { type: Schema.Types.ObjectId, ref: 'AdminUser', required: true },
  templateId: { type: Schema.Types.ObjectId, ref: 'Template', required: true },
  versionId: { type: Schema.Types.ObjectId, ref: 'TemplateVersion', required: true },
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  status: { 
    type: String, 
    enum: ['draft', 'published', 'archived'], 
    default: 'draft' 
  },
  colorScheme: { type: String, default: '' },
  fontPair: { type: String, default: '' },
  settings: {
    enableRsvp: { type: Boolean, default: true },
    enableWishes: { type: Boolean, default: true },
    requireWishApproval: { type: Boolean, default: true },
    rsvpDeadline: { type: Date },
    eventDate: { type: Date },
    eventEndDate: { type: Date },
    timezone: { type: String, default: 'UTC' }
  },
  viewCount: { type: Number, default: 0 },
  uniqueViewCount: { type: Number, default: 0 },
  lastViewedAt: { type: Date },
  publishedAt: { type: Date }
}, {
  timestamps: true
});

// Indexes
MicrositeSchema.index({ slug: 1 }, { unique: true });
MicrositeSchema.index({ userId: 1, updatedAt: -1 });
MicrositeSchema.index({ status: 1 });
MicrositeSchema.index({ templateId: 1 });
MicrositeSchema.index({ title: 'text' });

export default mongoose.model<IMicrosite>('Microsite', MicrositeSchema);
