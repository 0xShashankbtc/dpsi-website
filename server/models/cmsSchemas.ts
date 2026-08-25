import mongoose, { Schema, Document } from "mongoose";
import crypto from "crypto";
import { getDbConnection } from "../lib/mongodb";

// --- 1. MAIN CMS MODELS (dpsi_main) ---

export interface IPage extends Document {
  title: string;
  slug: string;
  content: string;
  category?: string;
  metaTitle?: string;
  metaDescription?: string;
  isPublished: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PageSchema = new Schema<IPage>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, default: "" },
    category: { type: String, default: "General" },
    metaTitle: { type: String },
    metaDescription: { type: String },
    isPublished: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export interface IMenu extends Document {
  title: string;
  url: string;
  location: "header" | "footer_quick" | "footer_resources";
  parent?: string;
  order: number;
  isActive: boolean;
  isDeleted: boolean;
}

const MenuSchema = new Schema<IMenu>(
  {
    title: { type: String, required: true },
    url: { type: String, required: true },
    location: { type: String, enum: ["header", "footer_quick", "footer_resources"], default: "header" },
    parent: { type: String, default: null },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export interface IPopup extends Document {
  title: string;
  content?: string;
  imageUrl?: string;
  linkUrl?: string;
  badgeText?: string;
  buttonText?: string;
  showOnLoad: boolean;
  isActive: boolean;
  isDeleted: boolean;
  startDate?: Date;
  endDate?: Date;
}

const PopupSchema = new Schema<IPopup>(
  {
    title: { type: String, required: true },
    content: { type: String },
    imageUrl: { type: String },
    linkUrl: { type: String },
    badgeText: { type: String, default: "Official Announcement" },
    buttonText: { type: String, default: "Learn More" },
    showOnLoad: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    startDate: { type: Date },
    endDate: { type: Date },
  },
  { timestamps: true }
);

export interface IMarquee extends Document {
  text: string;
  linkUrl?: string;
  speed: number;
  textColor?: string;
  bgColor?: string;
  badgeText?: string;
  isTransparent?: boolean;
  shape?: "rectangle" | "rounded" | "pill";
  borderRadius?: "none" | "md" | "xl" | "full";
  isActive: boolean;
  isDeleted: boolean;
}

const MarqueeSchema = new Schema<IMarquee>(
  {
    text: { type: String, required: true },
    linkUrl: { type: String },
    speed: { type: Number, default: 50 },
    textColor: { type: String, default: "#10b981" },
    bgColor: { type: String, default: "#047857" },
    badgeText: { type: String, default: "Notice" },
    isTransparent: { type: Boolean, default: false },
    shape: { type: String, enum: ["rectangle", "rounded", "pill"], default: "rectangle" },
    borderRadius: { type: String, enum: ["none", "md", "xl", "full"], default: "none" },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);


export interface IActivity extends Document {
  title: string;
  category: string;
  description: string;
  eventDate: Date;
  imageUrl?: string;
  isPublished: boolean;
  isDeleted: boolean;
}

const ActivitySchema = new Schema<IActivity>(
  {
    title: { type: String, required: true },
    category: { type: String, default: "General" },
    description: { type: String, required: true },
    eventDate: { type: Date, default: Date.now },
    imageUrl: { type: String },
    isPublished: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export interface ISlider extends Document {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  videoUrl?: string;
  mediaType: "image" | "video";
  buttonText?: string;
  buttonLink?: string;
  order: number;
  isActive: boolean;
  isDeleted: boolean;
}

const SliderSchema = new Schema<ISlider>(
  {
    title: { type: String, required: true },
    subtitle: { type: String },
    imageUrl: { type: String, default: "" },
    videoUrl: { type: String, default: "" },
    mediaType: { type: String, enum: ["image", "video"], default: "image" },
    buttonText: { type: String },
    buttonLink: { type: String },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export interface IAttachment extends Document {
  title: string;
  category: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize?: number;
  isDeleted: boolean;
}

const AttachmentSchema = new Schema<IAttachment>(
  {
    title: { type: String, required: true },
    category: { type: String, default: "Circulars" },
    fileUrl: { type: String, required: true },
    fileName: { type: String, required: true },
    fileType: { type: String, default: "pdf" },
    fileSize: { type: Number },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export interface IMunRegistration extends Document {
  studentName: string;
  email: string;
  phone: string;
  schoolName: string;
  grade: string;
  committeePreference1: string;
  committeePreference2?: string;
  portfolioPreference1?: string;
  portfolioPreference2?: string;
  status: "pending" | "approved" | "rejected";
  paymentStatus: "unpaid" | "paid";
  isDeleted: boolean;
}

const MunRegistrationSchema = new Schema<IMunRegistration>(
  {
    studentName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    schoolName: { type: String, required: true },
    grade: { type: String, required: true },
    committeePreference1: { type: String, required: true },
    committeePreference2: { type: String },
    portfolioPreference1: { type: String },
    portfolioPreference2: { type: String },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    paymentStatus: { type: String, enum: ["unpaid", "paid"], default: "unpaid" },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// --- 2. GALLERY MODELS (dpsi_gallery) ---

export interface IGalleryCategory extends Document {
  name: string;
  slug: string;
  description?: string;
  coverImage?: string;
  isDeleted: boolean;
}

const GalleryCategorySchema = new Schema<IGalleryCategory>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    coverImage: { type: String },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export interface IGalleryImage extends Document {
  title: string;
  category: string;
  categoryId?: mongoose.Types.ObjectId;
  imageUrl: string; // Auto-converted WebP URL
  originalUrl?: string;
  width?: number;
  height?: number;
  isPublished: boolean;
  isDeleted: boolean;
}

const GalleryImageSchema = new Schema<IGalleryImage>(
  {
    title: { type: String, required: true },
    category: { type: String, default: "Campus" },
    categoryId: { type: Schema.Types.ObjectId, ref: "GalleryCategory" },
    imageUrl: { type: String, required: true },
    originalUrl: { type: String },
    width: { type: Number },
    height: { type: Number },
    isPublished: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export interface IVideoGallery extends Document {
  title: string;
  category: string;
  youtubeUrl?: string;
  videoUrl?: string; // WebM URL
  thumbnailUrl?: string;
  isPublished: boolean;
  isDeleted: boolean;
}

const VideoGallerySchema = new Schema<IVideoGallery>(
  {
    title: { type: String, required: true },
    category: { type: String, default: "Events" },
    youtubeUrl: { type: String },
    videoUrl: { type: String },
    thumbnailUrl: { type: String },
    isPublished: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// --- 3. TC (TRANSFER CERTIFICATE) MODELS (dpsi_tc) ---

export interface ITransferCertificate extends Document {
  admissionNumber: string;
  studentName: string;
  fatherName: string;
  motherName?: string;
  classLeaving: string;
  dateOfIssue: Date;
  certificatePdfUrl: string;
  status: "Issued" | "Pending" | "Cancelled";
  remarks?: string;
  isDeleted: boolean;
}

const TransferCertificateSchema = new Schema<ITransferCertificate>(
  {
    admissionNumber: { type: String, required: true, index: true },
    studentName: { type: String, required: true, index: true },
    fatherName: { type: String, required: true },
    motherName: { type: String },
    classLeaving: { type: String, required: true },
    dateOfIssue: { type: Date, required: true },
    certificatePdfUrl: { type: String, required: true },
    status: { type: String, enum: ["Issued", "Pending", "Cancelled"], default: "Issued" },
    remarks: { type: String },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// --- 4. SITE SETTINGS (dpsi_main) ---

export interface ISiteSettings extends Document {
  key: string;
  value: string;
  label: string;
  group: string;
}

const SiteSettingsSchema = new Schema<ISiteSettings>(
  {
    key: { type: String, required: true, unique: true },
    value: { type: String, default: "" },
    label: { type: String, default: "" },
    group: { type: String, default: "general" },
  },
  { timestamps: true }
);

// --- 5. AI CONFIG (dpsi_main) ---

export interface IAiConfig extends Document {
  systemPrompt: string;
  modelId: string;
  temperature: number;
  maxTokens: number;
}

const AiConfigSchema = new Schema<IAiConfig>(
  {
    systemPrompt: { type: String, required: true },
    modelId: { type: String, default: "llama-3.3-70b-versatile" },
    temperature: { type: Number, default: 0.4 },
    maxTokens: { type: Number, default: 700 },
  },
  { timestamps: true }
);

// --- 6. ADDITIONAL CMS STRUCTURED CONTENT MODELS (dpsi_main) ---

export interface IAchievement extends Document {
  studentName: string;
  className: string;
  score: string;
  exam: string;
  stream?: string;
  rank?: string;
  year: string;
  imageUrl?: string;
  featured: boolean;
  order: number;
  isActive: boolean;
  isDeleted: boolean;
}

const AchievementSchema = new Schema<IAchievement>(
  {
    studentName: { type: String, required: true },
    className: { type: String, required: true },
    score: { type: String, required: true },
    exam: { type: String, required: true },
    stream: { type: String },
    rank: { type: String },
    year: { type: String, default: "2025-26" },
    imageUrl: { type: String },
    featured: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export interface ITestimonial extends Document {
  name: string;
  role: string;
  content: string;
  avatarUrl?: string;
  rating: number;
  featured: boolean;
  order: number;
  isActive: boolean;
  isDeleted: boolean;
}

const TestimonialSchema = new Schema<ITestimonial>(
  {
    name: { type: String, required: true },
    role: { type: String, required: true },
    content: { type: String, required: true },
    avatarUrl: { type: String },
    rating: { type: Number, default: 5 },
    featured: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export interface ILeadership extends Document {
  name: string;
  role: string;
  designation?: string;
  bio?: string;
  imageUrl?: string;
  order: number;
  category: string;
  isActive: boolean;
  isDeleted: boolean;
}

const LeadershipSchema = new Schema<ILeadership>(
  {
    name: { type: String, required: true },
    role: { type: String, required: true },
    designation: { type: String },
    bio: { type: String },
    imageUrl: { type: String },
    order: { type: Number, default: 0 },
    category: { type: String, default: "Management" },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export interface IFacility extends Document {
  title: string;
  category: string;
  description: string;
  icon?: string;
  imageUrl?: string;
  geometry?: string;
  color?: string;
  accent?: string;
  order: number;
  isActive: boolean;
  isDeleted: boolean;
}

const FacilitySchema = new Schema<IFacility>(
  {
    title: { type: String, required: true },
    category: { type: String, default: "Campus" },
    description: { type: String, required: true },
    icon: { type: String, default: "Microscope" },
    imageUrl: { type: String },
    geometry: { type: String, default: "torusKnot" },
    color: { type: String, default: "#10b981" },
    accent: { type: String, default: "#34d399" },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export interface IFeatureCard extends Document {
  title: string;
  description: string;
  icon: string;
  category?: string;
  order: number;
  isActive: boolean;
  isDeleted: boolean;
}

const FeatureCardSchema = new Schema<IFeatureCard>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, default: "Bot" },
    category: { type: String, default: "Innovation" },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);


export interface IDepartment extends Document {
  name: string;
  subjects: string;
  icon?: string;
  color?: string;
  order: number;
  isActive: boolean;
  isDeleted: boolean;
}

const DepartmentSchema = new Schema<IDepartment>(
  {
    name: { type: String, required: true },
    subjects: { type: String, required: true },
    icon: { type: String, default: "BookOpen" },
    color: { type: String, default: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400" },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export interface IAdmissionStep extends Document {
  stepNumber: number;
  title: string;
  description: string;
  icon?: string;
  order: number;
  isActive: boolean;
  isDeleted: boolean;
}

const AdmissionStepSchema = new Schema<IAdmissionStep>(
  {
    stepNumber: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, default: "FileText" },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export interface IFaq extends Document {
  question: string;
  answer: string;
  category: string;
  order: number;
  isActive: boolean;
  isDeleted: boolean;
}

const FaqSchema = new Schema<IFaq>(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    category: { type: String, default: "Admissions" },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export interface IQuickStat extends Document {
  label: string;
  value: string;
  icon?: string;
  order: number;
  isActive: boolean;
  isDeleted: boolean;
}

const QuickStatSchema = new Schema<IQuickStat>(
  {
    label: { type: String, required: true },
    value: { type: String, required: true },
    icon: { type: String, default: "GraduationCap" },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export interface ITimelineItem extends Document {
  year: string;
  title: string;
  description: string;
  order: number;
  isActive: boolean;
  isDeleted: boolean;
}

const TimelineItemSchema = new Schema<ITimelineItem>(
  {
    year: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export interface ICoreValue extends Document {
  title: string;
  description: string;
  icon?: string;
  order: number;
  isActive: boolean;
  isDeleted: boolean;
}

const CoreValueSchema = new Schema<ICoreValue>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, default: "Target" },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export interface IRateLimit extends Document {
  key: string;
  count: number;
  expiresAt: Date;
}

const RateLimitSchema = new Schema<IRateLimit>(
  {
    key: { type: String, required: true, unique: true, index: true },
    count: { type: Number, default: 1 },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  { timestamps: true }
);

// --- MODEL GETTERS TIED TO SPECIFIC TENANT DATABASES ---
import { AsyncLocalStorage } from "async_hooks";
import { resolveDbName } from "../lib/mongodb";

export const tenantContextStorage = new AsyncLocalStorage<string>();

export function getActiveTenantId(): string {
  return tenantContextStorage.getStore() || "dpsi";
}

export async function getMainModels(tenantId?: string) {
  const targetTenant = tenantId || getActiveTenantId();
  const dbName = resolveDbName(targetTenant, "main");
  const conn = await getDbConnection(dbName);
  return {
    Page: conn.models.Page || conn.model<IPage>("Page", PageSchema),
    Menu: conn.models.Menu || conn.model<IMenu>("Menu", MenuSchema),
    Popup: conn.models.Popup || conn.model<IPopup>("Popup", PopupSchema),
    Marquee: conn.models.Marquee || conn.model<IMarquee>("Marquee", MarqueeSchema),
    Activity: conn.models.Activity || conn.model<IActivity>("Activity", ActivitySchema),
    Slider: conn.models.Slider || conn.model<ISlider>("Slider", SliderSchema),
    Attachment: conn.models.Attachment || conn.model<IAttachment>("Attachment", AttachmentSchema),
    MunRegistration: conn.models.MunRegistration || conn.model<IMunRegistration>("MunRegistration", MunRegistrationSchema),
    SiteSettings: conn.models.SiteSettings || conn.model<ISiteSettings>("SiteSettings", SiteSettingsSchema),
    AiConfig: conn.models.AiConfig || conn.model<IAiConfig>("AiConfig", AiConfigSchema),
    Achievement: conn.models.Achievement || conn.model<IAchievement>("Achievement", AchievementSchema),
    Testimonial: conn.models.Testimonial || conn.model<ITestimonial>("Testimonial", TestimonialSchema),
    Leadership: conn.models.Leadership || conn.model<ILeadership>("Leadership", LeadershipSchema),
    Facility: conn.models.Facility || conn.model<IFacility>("Facility", FacilitySchema),
    Department: conn.models.Department || conn.model<IDepartment>("Department", DepartmentSchema),
    AdmissionStep: conn.models.AdmissionStep || conn.model<IAdmissionStep>("AdmissionStep", AdmissionStepSchema),
    Faq: conn.models.Faq || conn.model<IFaq>("Faq", FaqSchema),
    QuickStat: conn.models.QuickStat || conn.model<IQuickStat>("QuickStat", QuickStatSchema),
    TimelineItem: conn.models.TimelineItem || conn.model<ITimelineItem>("TimelineItem", TimelineItemSchema),
    CoreValue: conn.models.CoreValue || conn.model<ICoreValue>("CoreValue", CoreValueSchema),
    FeatureCard: conn.models.FeatureCard || conn.model<IFeatureCard>("FeatureCard", FeatureCardSchema),
    RateLimit: conn.models.RateLimit || conn.model<IRateLimit>("RateLimit", RateLimitSchema),
    AuditLog: conn.models.AuditLog || conn.model<IAuditLog>("AuditLog", AuditLogSchema),
  };
}

export interface IAuditLog extends Document {
  sequenceNumber: number;
  action: string;
  module: string;
  performedBy: string;
  documentId?: string;
  details?: string;
  ipAddress?: string;
  previousHash: string;
  currentHash: string;
  timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    sequenceNumber: { type: Number, required: true, index: true },
    action: { type: String, required: true },
    module: { type: String, required: true },
    performedBy: { type: String, default: "Admin" },
    documentId: { type: String },
    details: { type: String },
    ipAddress: { type: String },
    previousHash: { type: String, required: true },
    currentHash: { type: String, required: true, unique: true },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

// IMMUTABLE LEDGER PROTECTION HOOKS
// Any update or delete action throws a strict security error
AuditLogSchema.pre(/(updateOne|updateMany|findOneAndUpdate|replaceOne|deleteOne|deleteMany|findOneAndDelete|findOneAndRemove)/, function (next: any) {
  next(new Error("SECURITY VIOLATION: AuditLog ledger is strictly immutable. Modification and deletion are prohibited by database security policy."));
});

export async function createImmutableAuditLog(
  data: {
    action: string;
    module: string;
    performedBy?: string;
    documentId?: string;
    details?: string;
    ipAddress?: string;
  },
  tenantId?: string
) {
  try {
    const targetTenant = tenantId || getActiveTenantId();
    const { AuditLog } = await getMainModels(targetTenant);
    const lastLog = await AuditLog.findOne().sort({ sequenceNumber: -1 });
    const sequenceNumber = (lastLog?.sequenceNumber || 0) + 1;
    const previousHash = lastLog?.currentHash || "GENESIS_BLOCK_00000000000000000000000000000000000000000000000000000000";
    const timestamp = new Date();
    
    const hashPayload = `${sequenceNumber}:${data.action}:${data.module}:${data.performedBy || "Admin"}:${data.documentId || ""}:${data.details || ""}:${previousHash}:${timestamp.toISOString()}`;
    const currentHash = crypto.createHash("sha256").update(hashPayload).digest("hex");

    return await AuditLog.create({
      sequenceNumber,
      action: data.action,
      module: data.module,
      performedBy: data.performedBy || "Admin",
      documentId: data.documentId,
      details: data.details,
      ipAddress: data.ipAddress,
      previousHash,
      currentHash,
      timestamp,
    });
  } catch (err) {
    console.error("Failed to write immutable audit log:", err);
  }
}

/**
 * Atomic persistent rate-limiting across distributed serverless function invocations using MongoDB TTL.
 */
export async function checkPersistentRateLimit(
  key: string,
  limit: number = 40,
  windowSeconds: number = 60,
  tenantId?: string
): Promise<boolean> {
  try {
    const targetTenant = tenantId || getActiveTenantId();
    const { RateLimit } = await getMainModels(targetTenant);
    const expiresAt = new Date(Date.now() + windowSeconds * 1000);

    const doc = await RateLimit.findOneAndUpdate(
      { key },
      {
        $inc: { count: 1 },
        $setOnInsert: { expiresAt },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    if (doc && doc.count > limit) {
      return false;
    }
    return true;
  } catch {
    // Graceful fallback to allow request if database is unreachable
    return true;
  }
}

export async function getGalleryModels(tenantId?: string) {
  const targetTenant = tenantId || getActiveTenantId();
  const dbName = resolveDbName(targetTenant, "gallery");
  const conn = await getDbConnection(dbName);
  return {
    GalleryCategory: conn.models.GalleryCategory || conn.model<IGalleryCategory>("GalleryCategory", GalleryCategorySchema),
    GalleryImage: conn.models.GalleryImage || conn.model<IGalleryImage>("GalleryImage", GalleryImageSchema),
    VideoGallery: conn.models.VideoGallery || conn.model<IVideoGallery>("VideoGallery", VideoGallerySchema),
  };
}

export async function getTcModels(tenantId?: string) {
  const targetTenant = tenantId || getActiveTenantId();
  const dbName = resolveDbName(targetTenant, "tc");
  const conn = await getDbConnection(dbName);
  return {
    TransferCertificate: conn.models.TransferCertificate || conn.model<ITransferCertificate>("TransferCertificate", TransferCertificateSchema),
  };
}
