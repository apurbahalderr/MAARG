
import mongoose, { Document, Schema } from "mongoose";

export type IncidentType =
  | "LANDSLIDE"
  | "FLOOD"
  | "ROAD_BLOCK"
  | "ROAD_DAMAGE"
  | "BRIDGE_DAMAGE"
  | "ACCIDENT"
  | "TRAFFIC"
  | "OTHER";

export type IncidentSeverity =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "CRITICAL";

export interface IIncident extends Document {
  incidentId: string;

  type: IncidentType;
  severity: IncidentSeverity;

  location: {
    type: "Point";
    coordinates: [number, number];
  };

  description?: string;

  source:
    | "FIELD_REPORT"
    | "ADMIN"
    | "API"
    | "HISTORICAL";

  status: "ACTIVE" | "RESOLVED";

  missionId?: string;
  truckNo?: string;

  occurredAt: Date;
}

const incidentSchema = new Schema<IIncident>(
  {
    incidentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    type: {
      type: String,
      enum: [
        "LANDSLIDE",
        "FLOOD",
        "ROAD_BLOCK",
        "ROAD_DAMAGE",
        "BRIDGE_DAMAGE",
        "ACCIDENT",
        "TRAFFIC",
        "OTHER",
      ],
      required: true,
    },

    severity: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      required: true,
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

    description: String,

    source: {
      type: String,
      enum: [
        "FIELD_REPORT",
        "ADMIN",
        "API",
        "HISTORICAL",
      ],
      required: true,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "RESOLVED"],
      default: "ACTIVE",
    },

    missionId: {
      type: String,
      index: true,
    },

    truckNo: {
      type: String,
      index: true,
    },

    occurredAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

incidentSchema.index({
  location: "2dsphere",
});

export const Incident =
  mongoose.models.Incident ||
  mongoose.model<IIncident>("Incident", incidentSchema);