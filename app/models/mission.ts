import mongoose, { Document, Schema, Types } from "mongoose";

export type CargoType =
  | "MEDICAL"
  | "FOOD"
  | "FUEL"
  | "AGRICULTURAL"
  | "CONSTRUCTION"
  | "RELIEF"
  | "GENERAL";

export type MissionStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export interface IMission extends Document {
  missionId: string;
  truckNo: string;
  driverId?: Types.ObjectId;  // manually fetch the id of the driver from the User collection based on truck no
  cargoType: CargoType;
  cargoQuantity: string;

  // coordinates of the origin and destination locations
  origin: string;
  destination: string;

  originAddress?: string;
  destinationAddress?: string;

  targetArrival: Date;
  status: MissionStatus;
}

const missionSchema = new Schema<IMission>(
  {
    missionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    truckNo: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    driverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },

    cargoType: {
      type: String,
      enum: [
        "MEDICAL",
        "FOOD",
        "FUEL",
        "AGRICULTURAL",
        "CONSTRUCTION",
        "RELIEF",
        "GENERAL",
      ],
      required: true,
    },

    cargoQuantity: {
      type: String,
      required: true,
    },

    origin: {
      type: String,
      required: true,
    },

    destination: {
      type: String,
      required: true,
    },

    originAddress: {
      type: String,
      trim: true,
    },

    destinationAddress: {
      type: String,
      trim: true,
    },

    targetArrival: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "PENDING",
        "IN_PROGRESS",
        "COMPLETED",
        "CANCELLED",
      ],
      default: "PENDING",
    },
  },
  { timestamps: true }
);

missionSchema.index({ truckNo: 1, status: 1 });

export const Mission =
  mongoose.models.Mission ||
  mongoose.model<IMission>("Mission", missionSchema);