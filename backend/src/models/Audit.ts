import mongoose from "mongoose";

const AuditSchema = new mongoose.Schema({
  pdfId: String,
  originalHash: String,
  signedHash: String,
  fields: [{}],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Audit", AuditSchema);