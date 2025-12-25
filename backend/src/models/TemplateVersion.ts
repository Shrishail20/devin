import mongoose, { Document, Schema } from 'mongoose';

// Color scheme option
export interface IColorScheme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  accent: string;
}

// Font pair option
export interface IFontPair {
  id: string;
  name: string;
  heading: string;
  body: string;
  headingWeight: number;
  bodyWeight: number;
}

// Sample profile option (for multiple preview data sets)
export interface ISampleProfile {
  id: string;
  name: string;
  description?: string;
}

// Template Version - Allows template updates without breaking existing user sites
export interface ITemplateVersion extends Document {
  templateId: mongoose.Types.ObjectId;
  version: number;
  colorSchemes: IColorScheme[];
  fontPairs: IFontPair[];
  sampleProfiles: ISampleProfile[];
  defaultColorScheme: string;
  defaultFontPair: string;
  defaultSampleProfile: string;
  changelog: string;
  createdAt: Date;
}

const ColorSchemeSchema = new Schema<IColorScheme>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  primary: { type: String, required: true },
  secondary: { type: String, required: true },
  background: { type: String, required: true, default: '#FFFFFF' },
  surface: { type: String, required: true, default: '#FAFAFA' },
  text: { type: String, required: true, default: '#212121' },
  textMuted: { type: String, required: true, default: '#757575' },
  accent: { type: String, required: true }
}, { _id: false });

const FontPairSchema = new Schema<IFontPair>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  heading: { type: String, required: true },
  body: { type: String, required: true },
  headingWeight: { type: Number, default: 700 },
  bodyWeight: { type: Number, default: 400 }
}, { _id: false });

const SampleProfileSchema = new Schema<ISampleProfile>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, default: '' }
}, { _id: false });

const TemplateVersionSchema = new Schema<ITemplateVersion>({
  templateId: { type: Schema.Types.ObjectId, ref: 'Template', required: true },
  version: { type: Number, required: true },
  colorSchemes: [ColorSchemeSchema],
  fontPairs: [FontPairSchema],
  sampleProfiles: [SampleProfileSchema],
  defaultColorScheme: { type: String, default: '' },
  defaultFontPair: { type: String, default: '' },
  defaultSampleProfile: { type: String, default: 'default' },
  changelog: { type: String, default: '' }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

// Indexes
TemplateVersionSchema.index({ templateId: 1, version: 1 }, { unique: true });
TemplateVersionSchema.index({ templateId: 1 });

export default mongoose.model<ITemplateVersion>('TemplateVersion', TemplateVersionSchema);
