import mongoose, { Document, Schema } from 'mongoose';

// Microsite Section - User's content for each section (separate docs for easy editing)
export interface IMicrositeSection extends Document {
  micrositeId: mongoose.Types.ObjectId;
  sectionId: string;
  type: string;
  order: number;
  enabled: boolean;
  values: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const MicrositeSectionSchema = new Schema<IMicrositeSection>({
  micrositeId: { type: Schema.Types.ObjectId, ref: 'Microsite', required: true },
  sectionId: { type: String, required: true },
  type: { type: String, required: true },
  order: { type: Number, required: true },
  enabled: { type: Boolean, default: true },
  values: { type: Schema.Types.Mixed, default: {} }
}, {
  timestamps: true
});

// Indexes
MicrositeSectionSchema.index({ micrositeId: 1, order: 1 });
MicrositeSectionSchema.index({ micrositeId: 1, sectionId: 1 }, { unique: true });
MicrositeSectionSchema.index({ micrositeId: 1, enabled: 1 });

export default mongoose.model<IMicrositeSection>('MicrositeSection', MicrositeSectionSchema);
