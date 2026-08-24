import mongoose, { Schema, Document } from "mongoose";
import { getDbConnection } from "../lib/mongodb";

export interface ITenant extends Document {
  tenantId: string;
  schoolName: string;
  schoolCode: string;
  domain?: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  status: "active" | "suspended";
  features: {
    aiChatbot: boolean;
    tcPortal: boolean;
    gallery: boolean;
    munRegistration: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const TenantSchema = new Schema<ITenant>(
  {
    tenantId: { type: String, required: true, unique: true, index: true },
    schoolName: { type: String, required: true },
    schoolCode: { type: String, required: true, unique: true, index: true },
    domain: { type: String, index: true },
    logoUrl: { type: String, default: "/logo.webp" },
    faviconUrl: { type: String, default: "/favicon.ico" },
    primaryColor: { type: String, default: "#047857" },
    secondaryColor: { type: String, default: "#065f46" },
    contactEmail: { type: String },
    contactPhone: { type: String },
    address: { type: String },
    status: { type: String, enum: ["active", "suspended"], default: "active" },
    features: {
      aiChatbot: { type: Boolean, default: true },
      tcPortal: { type: Boolean, default: true },
      gallery: { type: Boolean, default: true },
      munRegistration: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

export async function getTenantModel() {
  const conn = await getDbConnection("dpsi_admin");
  return conn.models.Tenant || conn.model<ITenant>("Tenant", TenantSchema);
}
