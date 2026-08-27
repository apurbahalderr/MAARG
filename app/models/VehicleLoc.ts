import mongoose, { Document, Schema } from "mongoose";

export interface IVehicleLocation extends Document {
  truckNo: string;
  missionId?: string;

  location: {
    type: "Point";
    coordinates: [number, number];
  };

  speed?: number;
  heading?: number;

  timestamp: Date;
}

const vehicleLocationSchema =
  new Schema<IVehicleLocation>(
    {
      truckNo: {
        type: String,
        required: true,
        trim: true,
        uppercase: true,
        index: true,
      },

      missionId: {
        type: String,
        index: true,
      },

      location: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point",
        },

        coordinates: {
          type: [Number],
          required: true,
        },
      },

      speed: Number,

      heading: Number,

      timestamp: {
        type: Date,
        required: true,
        index: true,
      },
    },
    {
      timestamps: false,
    }
  );

vehicleLocationSchema.index({
  location: "2dsphere",
});

vehicleLocationSchema.index({
  truckNo: 1,
  timestamp: -1,
});

export const VehicleLoc =
  mongoose.models.VehicleLoc ||
  mongoose.model<IVehicleLocation>(
    "VehicleLoc",
    vehicleLocationSchema
  );