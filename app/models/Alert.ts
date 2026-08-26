
import mongoose, { Document, Schema } from "mongoose";

export type AlertType =
  | "ROUTE_RISK"
  | "ROAD_BLOCKED"
  | "LANDSLIDE"
  | "FLOOD"
  | "TRAFFIC"
  | "DELAY"
  | "REROUTE";

export interface IAlert extends Document {
  alertId: string;

  missionId?: string;
  truckNo?: string;
  incidentId?: string;

  type: AlertType;

  severity: "INFO" | "WARNING" | "CRITICAL";

  message: string;

  acknowledged: boolean;
}

const alertSchema = new Schema<IAlert>(
  {
    alertId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    missionId: {
      type: String,
      index: true,
    },

    truckNo: {
      type: String,
      index: true,
    },

    incidentId: {
      type: String,
      index: true,
    },

    type: {
      type: String,
      enum: [
        "ROUTE_RISK",
        "ROAD_BLOCKED",
        "LANDSLIDE",
        "FLOOD",
        "TRAFFIC",
        "DELAY",
        "REROUTE",
      ],
      required: true,
    },

    severity: {
      type: String,
      enum: ["INFO", "WARNING", "CRITICAL"],
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    acknowledged: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Alert =
  mongoose.models.Alert ||
  mongoose.model<IAlert>("Alert", alertSchema);