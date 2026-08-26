import generateID from "@/utils/generateID";
import mongoose, { Document, Schema } from "mongoose";
export type CargoType =
  | "MEDICAL"
  | "FOOD"
  | "FUEL"
  | "AGRICULTURAL"
  | "CONSTRUCTION"
  | "RELIEF"
  | "GENERAL";

export type Status = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";


export interface IMission extends Document {
  missionId: string,
  truckNo: string,
  cargoType: CargoType,
  cargoQuantity: string,
  origin: string,
  destination: string,
  targetArrival: Date,
  status: Status 
}


export const missionSchema = new Schema<IMission>({
  missionId: { type: String, required: true, unique: true },
  truckNo: { type: String, required: true },
  cargoType: { type: String, enum: ["MEDICAL", "FOOD", "FUEL", "AGRICULTURAL", "CONSTRUCTION", "RELIEF", "GENERAL"], required: true },
  cargoQuantity: { type: String, required: true },
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  targetArrival: { type: Date, required: true },
  status: { type: String, enum: ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"], default: "PENDING", required: true },
})


missionSchema.pre("save", function () {
  this.missionId = generateID("M");
})

export const Mission = mongoose.models.Mission || mongoose.model("Mission", missionSchema)