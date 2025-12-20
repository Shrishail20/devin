import mongoose, { Document, Schema } from 'mongoose';

export interface IGuest extends Document {
  siteId: mongoose.Types.ObjectId;
  name: string;
  email?: string;
  phone?: string;
  status: 'pending' | 'attending' | 'not_attending' | 'maybe';
  numberOfGuests: number;
  partySize: number;
  guestNames?: string[];
  mealChoice?: string;
  dietaryRestrictions?: string;
  dietaryNotes?: string;
  message?: string;
  customFields?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  submittedAt: Date;
  updatedAt: Date;
}

const GuestSchema = new Schema<IGuest>({
  siteId: { type: Schema.Types.ObjectId, ref: 'Site', required: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, trim: true, lowercase: true },
  phone: { type: String, trim: true },
  status: { 
    type: String, 
    enum: ['pending', 'attending', 'not_attending', 'maybe'], 
    default: 'pending' 
  },
  numberOfGuests: { type: Number, default: 1, min: 1 },
  partySize: { type: Number, default: 1, min: 1 },
  guestNames: [{ type: String }],
  mealChoice: { type: String },
  dietaryRestrictions: { type: String },
  dietaryNotes: { type: String },
  message: { type: String },
  customFields: { type: Schema.Types.Mixed, default: {} },
  ipAddress: { type: String },
  userAgent: { type: String },
  submittedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

GuestSchema.index({ siteId: 1 });
GuestSchema.index({ siteId: 1, email: 1 });
GuestSchema.index({ siteId: 1, status: 1 });
GuestSchema.index({ submittedAt: -1 });
GuestSchema.index({ name: 'text', email: 'text' });

export default mongoose.model<IGuest>('Guest', GuestSchema);
