import mongoose, { Document, Schema } from 'mongoose';

// User's content for a section
export interface ISectionContent {
  sectionId: string;
  visible: boolean;
  order: number;
  content: Record<string, unknown>; // fieldId -> value
}

export interface ISite extends Document {
  userId: mongoose.Types.ObjectId;
  templateId: mongoose.Types.ObjectId;
  templateVersion: number;
  title: string;
  slug: string;
  description: string;
  status: 'draft' | 'published';
  sections: ISectionContent[];
  selectedColorScheme: string; // colorScheme id
  selectedFontPair: string; // fontPair id
  settings: {
    enableRsvp: boolean;
    enableWishes: boolean;
    requireWishApproval: boolean;
    maxHighlightedWishes: number;
    rsvpDeadline?: Date;
    eventDate?: Date;
    eventEndDate?: Date;
    timezone?: string;
  };
  stats: {
    views: number;
    uniqueVisitors: number;
    rsvpCount: number;
    wishCount: number;
  };
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SectionContentSchema = new Schema<ISectionContent>({
  sectionId: { type: String, required: true },
  visible: { type: Boolean, default: true },
  order: { type: Number, required: true },
  content: { type: Schema.Types.Mixed, default: {} }
}, { _id: false });

const SiteSchema = new Schema<ISite>({
  userId: { type: Schema.Types.ObjectId, ref: 'AdminUser', required: true },
  templateId: { type: Schema.Types.ObjectId, ref: 'Template', required: true },
  templateVersion: { type: Number, required: true },
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['draft', 'published'], 
    default: 'draft' 
  },
  sections: [SectionContentSchema],
  selectedColorScheme: { type: String, default: '' },
  selectedFontPair: { type: String, default: '' },
  settings: {
    enableRsvp: { type: Boolean, default: true },
    enableWishes: { type: Boolean, default: true },
    requireWishApproval: { type: Boolean, default: true },
    maxHighlightedWishes: { type: Number, default: 5 },
    rsvpDeadline: { type: Date },
    eventDate: { type: Date },
    eventEndDate: { type: Date },
    timezone: { type: String, default: 'UTC' }
  },
  stats: {
    views: { type: Number, default: 0 },
    uniqueVisitors: { type: Number, default: 0 },
    rsvpCount: { type: Number, default: 0 },
    wishCount: { type: Number, default: 0 }
  },
  publishedAt: { type: Date }
}, {
  timestamps: true
});

SiteSchema.index({ userId: 1 });
SiteSchema.index({ slug: 1 }, { unique: true });
SiteSchema.index({ status: 1 });
SiteSchema.index({ templateId: 1 });
SiteSchema.index({ createdAt: -1 });
SiteSchema.index({ title: 'text', description: 'text' });

export default mongoose.model<ISite>('Site', SiteSchema);
