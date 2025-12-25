import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IAdminUser extends Document {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'editor';
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const AdminUserSchema = new Schema<IAdminUser>({
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true,
    trim: true 
  },
  password: { type: String, required: true, select: false },
  name: { type: String, required: true, trim: true },
  role: { 
    type: String, 
    enum: ['admin', 'editor'], 
    default: 'editor' 
  },
  permissions: [{ type: String }]
}, {
  timestamps: true
});

AdminUserSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

AdminUserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

AdminUserSchema.index({ email: 1 });

export default mongoose.model<IAdminUser>('AdminUser', AdminUserSchema);
