// src/lib/models/Voter.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IVoter extends Document {
  epicId: string;
  name: string;
  ward: string;
  partNo: string;
  serialNo: number;
  pollingSchool: string;
  mobile: string;
  savedAt: Date;
}

const VoterSchema = new Schema<IVoter>({
  epicId: { type: String, required: true },
  name: { type: String, required: true },
  ward: { type: String },
  partNo: { type: String },
  serialNo: { type: Number },
  pollingSchool: { type: String },
  mobile: { type: String, required: true },
  savedAt: { type: Date, default: Date.now },
});

const Voter: Model<IVoter> =
  mongoose.models.Voter || mongoose.model<IVoter>("Voter", VoterSchema);

export default Voter;
