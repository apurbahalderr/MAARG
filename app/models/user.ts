import { Schema, model, models, Document } from "mongoose";

export type Role = "user" | "driver" | "admin";

interface IDriverProfile {
  licenseNumber: string;
  licenseExpiry: Date;
  truckNo: string;
  currentMissionId?: string;
  status: "available" | "on_mission" | "off_duty";
  vehicleType?: "truck" | "van" | "other";
}

interface IAdminProfile {
  department: string;
  designation: string;
  jurisdictionDistrict?: string;  // the admin is of which district
}

export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  password: string;

  roles: Role[];

  driverProfile?: IDriverProfile;
  adminProfile?: IAdminProfile;

  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const DriverProfileSchema = new Schema<IDriverProfile>(
  {
    licenseNumber: {
      type: String,
      required: true,
    },

    licenseExpiry: {
      type: Date,
      required: true,
    },

    truckNo: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    currentMissionId: {
      type: String,
    },

    status: {
      type: String,
      enum: ["available", "on_mission", "off_duty"],
      default: "available",
    },

    vehicleType: {
      type: String,
      enum: ["truck", "van", "other"],
    },
  },
  { _id: false }
);

const AdminProfileSchema = new Schema<IAdminProfile>(
  {
    department: {
      type: String,
      required: true,
    },

    designation: {
      type: String,
      required: true,
    },

    jurisdictionDistrict: String,
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    roles: {
      type: [String],
      enum: ["user", "driver", "admin"],
      required: true,
    },

    driverProfile: {
      type: DriverProfileSchema,
      default: undefined,
    },

    adminProfile: {
      type: AdminProfileSchema,
      default: undefined,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

UserSchema.index(
  { "driverProfile.truckNo": 1 },
  { unique: true, sparse: true }
);

export const User =
  models.User || model<IUser>("User", UserSchema);