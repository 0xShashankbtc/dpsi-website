import { Schema, Document } from "mongoose";
import { getDbConnection } from "../lib/mongodb";

export interface IAdminUser extends Document {
  username: string;
  email?: string;
  passwordHash: string;
  role: "superadmin" | "admin" | "editor";
  tenantId?: string; // e.g. "dpsi", "gd_goenka", or "all"
  mustChangePassword?: boolean;
  lastLogin?: Date;
  createdAt: Date;
}

const AdminUserSchema = new Schema<IAdminUser>(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String },
    passwordHash: { type: String, required: true },
    role: { type: String, default: "admin" },
    tenantId: { type: String, default: "dpsi" },
    mustChangePassword: { type: Boolean, default: false },
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

export async function getAdminUserModel() {
  const conn = await getDbConnection("dpsi_admin");
  return conn.models.AdminUser || conn.model<IAdminUser>("AdminUser", AdminUserSchema);
}
