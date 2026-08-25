
import { Schema, model, models, Document, Types } from 'mongoose';


export type Role = 'user' | 'driver' | 'admin';

interface IDriverProfile {
  licenseNumber: string;
  licenseExpiry: Date;
  assignedVehicleId?: Types.ObjectId; 
  currentMissionId?: Types.ObjectId;
  status: 'available' | 'on_mission' | 'off_duty';
  vehicleType?: 'truck' | 'van' | 'other';
}

interface IAdminProfile {
  department: string;                       // e.g. "District Disaster Management"
  designation: string;                      // e.g. "Logistics Officer"
  jurisdictionDistrict?: string;             // which district they oversee
  // isVerifiedOfficial: boolean;              // government identity verification flag
}

export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  password: string;

  roles: Role[];                            // everything this account is permitted to do             

  driverProfile?: IDriverProfile;
  adminProfile?: IAdminProfile;

  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ---- Schema ----

const DriverProfileSchema = new Schema<IDriverProfile>({
  licenseNumber: { type: String, required: true },
  licenseExpiry: { type: Date, required: true },
  assignedVehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle' },
  currentMissionId: { type: Schema.Types.ObjectId, ref: 'Mission' },
  status: { type: String, enum: ['available', 'on_mission', 'off_duty'], default: 'available' },
  vehicleType: { type: String, enum: ['truck', 'van', 'other'] },
}, { _id: false });

const AdminProfileSchema = new Schema<IAdminProfile>({
  department: { type: String, required: true },
  designation: { type: String, required: true },
  jurisdictionDistrict: { type: String },
}, { _id: false });

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  roles: {
    type: [String],
    enum: ['user', 'driver', 'admin'],
    required: true,
  },
  driverProfile: { type: DriverProfileSchema, default: undefined },
  adminProfile: { type: AdminProfileSchema, default: undefined },

  isActive: { type: Boolean, default: true },
}, { timestamps: true });


export const User = models.User || model<IUser>('User', UserSchema);