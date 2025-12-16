import mongoose, { Document, Schema } from 'mongoose';

export interface IMedia extends Document {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  gridFSId: mongoose.Types.ObjectId;
  uploadedBy: mongoose.Types.ObjectId;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const MediaSchema = new Schema<IMedia>({
  filename: { type: String, required: true, unique: true },
  originalName: { type: String, required: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true },
  url: { type: String, required: true },
  gridFSId: { type: Schema.Types.ObjectId, required: true },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'AdminUser' },
  tags: [{ type: String }]
}, {
  timestamps: true
});

MediaSchema.index({ filename: 1 });
MediaSchema.index({ tags: 1 });
MediaSchema.index({ createdAt: -1 });

export default mongoose.model<IMedia>('Media', MediaSchema);
