import React, { useState, useMemo, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Menu as MenuIcon,
  FileText,
  Image as ImageIcon,
  Video,
  BellRing,
  Paperclip,
  Activity,
  SlidersHorizontal,
  Megaphone,
  Award,
  Globe2,
  Plus,
  Trash2,
  Edit,
  Upload,
  CheckCircle,
  Search,
  ExternalLink,
  Compass,
  ShieldCheck,
  RefreshCw,
  LogOut,
  Lock,
  User,
  Key,
  ArrowRight,
  AlertTriangle,
  Play,
  Settings,
  Bot,
  Download,
  ToggleLeft,
  ToggleRight,
  Copy,
  X,
  Trophy,
  Heart,
  UserCheck,
  Building,
  BookOpen,
  HelpCircle,
  BarChart3,
  Eye,
  EyeOff,
  CheckCircle2,
  Volume2,
  Camera,
  Save,
  Sparkles,
} from "lucide-react";

import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LiquidMetalButton } from "@/components/ui/liquid-metal-button";
import { toast } from "sonner";
import { formatISTDate } from "@/lib/dateUtils";
import RichTextEditor from "@/components/RichTextEditor";

type TabType =
  | "dashboard"
  | "pages"
  | "menus"
  | "gallery"
  | "videos"
  | "popups"
  | "marquee"
  | "activities"
  | "sliders"
  | "achievements"
  | "testimonials"
  | "leadership"
  | "facilities"
  | "feature_cards"
  | "departments"
  | "admission_steps"
  | "faqs"
  | "stats_metrics"
  | "attachments"
  | "tc"
  | "mun"
  | "site_settings"
  | "ai_settings"
  | "audit_logs";

export default function AdminCMS() {
  const utils = trpc.useUtils();
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [tabSearch, setTabSearch] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("dpsi_admin_token") || localStorage.getItem("dpsi_admin_auth") === "true";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isAuth = localStorage.getItem("dpsi_admin_auth") === "true";
      const token = localStorage.getItem("dpsi_admin_token");
      if (isAuth && !token) {
        localStorage.setItem("dpsi_admin_token", "admin-session-active");
      }
    }
  }, []);

  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [schoolCode, setSchoolCode] = useState("");
  const [activeTenantName, setActiveTenantName] = useState(
    typeof window !== "undefined" ? localStorage.getItem("dpsi_admin_tenant_name") || "Delhi Public School Indirapuram" : "Delhi Public School Indirapuram"
  );
  const [loginError, setLoginError] = useState("");

  // First-Time Password Change & Reset State
  const [isFirstTimePasswordModal, setIsFirstTimePasswordModal] = useState(false);
  const [changePasswordUsername, setChangePasswordUsername] = useState("");
  const [changePasswordCurrent, setChangePasswordCurrent] = useState("");
  const [changePasswordNew, setChangePasswordNew] = useState("");
  const [changePasswordConfirm, setChangePasswordConfirm] = useState("");
  const [changePasswordError, setChangePasswordError] = useState("");
  const [showPasswordCurrent, setShowPasswordCurrent] = useState(false);
  const [showPasswordNew, setShowPasswordNew] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const [pageModal, setPageModal] = useState(false);
  const [pageForm, setPageForm] = useState({ title: "", slug: "", content: "", category: "General" });

  const [menuModal, setMenuModal] = useState(false);
  const [menuForm, setMenuForm] = useState<{
    title: string;
    url: string;
    location: "header" | "footer_quick" | "footer_resources";
    parent: string;
    order: number;
    isActive: boolean;
  }>({
    title: "",
    url: "",
    location: "header",
    parent: "",
    order: 0,
    isActive: true,
  });

  const [popupModal, setPopupModal] = useState(false);
  const [popupForm, setPopupForm] = useState({
    title: "",
    content: "",
    imageUrl: "",
    linkUrl: "",
    badgeText: "Official Notice",
    buttonText: "Learn More",
  });

  // Queries
  const { data: stats, refetch: refetchStats } = trpc.cms.dashboardStats.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: pagesList, refetch: refetchPages } = trpc.cms.listPages.useQuery({ showTrash: false }, {
    enabled: isAuthenticated,
  });
  const { data: menusList, refetch: refetchMenus } = trpc.cms.listMenus.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: popupsList, refetch: refetchPopups } = trpc.cms.listPopups.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: marqueesList, refetch: refetchMarquees } = trpc.cms.listMarquees.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: activitiesList, refetch: refetchActivities } = trpc.cms.listActivities.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: slidersList, refetch: refetchSliders } = trpc.cms.listSliders.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: attachmentsList, refetch: refetchAttachments } = trpc.cms.listAttachments.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: galleryImages, refetch: refetchGallery } = trpc.cms.listGalleryImages.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: videoList, refetch: refetchVideos } = trpc.cms.listVideos.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const [tcSearch, setTcSearch] = useState("");
  const { data: tcList, refetch: refetchTc } = trpc.cms.listTc.useQuery({ search: tcSearch }, {
    enabled: isAuthenticated,
  });
  const { data: munList } = trpc.cms.listMunRegistrations.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: siteSettings, refetch: refetchSiteSettings } = trpc.cms.getSiteSettings.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: aiConfig, refetch: refetchAiConfig } = trpc.cms.getAiConfig.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: auditLogsList, refetch: refetchAuditLogs } = trpc.cms.listAuditLogs.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: auditVerification, refetch: refetchVerification } = trpc.cms.verifyAuditLedger.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: achievementsList, refetch: refetchAchievements } = trpc.achievements.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: testimonialsList, refetch: refetchTestimonials } = trpc.testimonials.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: leadershipList, refetch: refetchLeadership } = trpc.cms.listLeadership.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: facilitiesList, refetch: refetchFacilities } = trpc.cms.listFacilities.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: departmentsList, refetch: refetchDepartments } = trpc.cms.listDepartments.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: admissionStepsList, refetch: refetchAdmissionSteps } = trpc.cms.listAdmissionSteps.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: faqsList, refetch: refetchFaqs } = trpc.cms.listFaqs.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: statsMetricsList, refetch: refetchStatsMetrics } = trpc.stats.adminList.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Global Cross-CMS Universal Search State
  const [globalSearch, setGlobalSearch] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Cmd+K / Ctrl+K keyboard shortcut to focus global search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchOpen(true);
      }
      if (e.key === "Escape") {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Universal Cross-CMS Global Search Indexer
  const searchResults = useMemo(() => {
    const q = globalSearch.trim().toLowerCase();
    if (!q) return [];

    const results: Array<{
      tab: string;
      tabLabel: string;
      title: string;
      subtitle?: string;
      type: string;
      id?: string;
    }> = [];

    // 1. Pages
    pagesList?.forEach((p: any) => {
      if (p.title?.toLowerCase().includes(q) || p.slug?.toLowerCase().includes(q) || p.content?.toLowerCase().includes(q)) {
        results.push({ tab: "pages", tabLabel: "Manage Pages", title: p.title, subtitle: `Slug: /${p.slug}`, type: "Page", id: p._id });
      }
    });

    // 2. Menus
    menusList?.forEach((m: any) => {
      if (m.label?.toLowerCase().includes(q) || m.href?.toLowerCase().includes(q)) {
        results.push({ tab: "menus", tabLabel: "Manage Menus", title: m.label, subtitle: `Link: ${m.href}`, type: "Menu Item", id: m._id });
      }
    });

    // 3. Sliders (Images & Videos)
    slidersList?.forEach((s: any) => {
      if (s.title?.toLowerCase().includes(q) || s.subtitle?.toLowerCase().includes(q) || s.mediaType?.toLowerCase().includes(q)) {
        results.push({ tab: "sliders", tabLabel: "Home Sliders", title: s.title, subtitle: s.subtitle || `Media: ${s.mediaType || "image"}`, type: "Hero Slider", id: s._id });
      }
    });

    // 4. Attachments & Circulars
    attachmentsList?.forEach((a: any) => {
      if (a.title?.toLowerCase().includes(q) || a.category?.toLowerCase().includes(q) || a.fileName?.toLowerCase().includes(q)) {
        results.push({ tab: "attachments", tabLabel: "Attachments & Circulars", title: a.title, subtitle: `Category: ${a.category || "Circulars"}`, type: "Circular", id: a._id });
      }
    });

    // 5. Image Gallery
    galleryImages?.forEach((g: any) => {
      if (g.title?.toLowerCase().includes(q) || g.category?.toLowerCase().includes(q)) {
        results.push({ tab: "gallery", tabLabel: "Image Gallery", title: g.title, subtitle: `Category: ${g.category}`, type: "Photo", id: g._id });
      }
    });

    // 6. Video Gallery
    videoList?.forEach((v: any) => {
      if (v.title?.toLowerCase().includes(q) || v.category?.toLowerCase().includes(q)) {
        results.push({ tab: "videos", tabLabel: "Video Gallery", title: v.title, subtitle: `Category: ${v.category}`, type: "Video", id: v._id });
      }
    });

    // 7. Popups
    popupsList?.forEach((p: any) => {
      if (p.title?.toLowerCase().includes(q) || p.message?.toLowerCase().includes(q)) {
        results.push({ tab: "popups", tabLabel: "Popups & Alerts", title: p.title, subtitle: p.message, type: "Popup", id: p._id });
      }
    });

    // 8. Marquee
    marqueesList?.forEach((m: any) => {
      if (m.text?.toLowerCase().includes(q) || m.badgeText?.toLowerCase().includes(q)) {
        results.push({ tab: "marquee", tabLabel: "Marquee Ticker", title: m.text, subtitle: `Badge: ${m.badgeText || "Notice"}`, type: "Marquee", id: m._id });
      }
    });

    // 9. Activities
    activitiesList?.forEach((a: any) => {
      if (a.title?.toLowerCase().includes(q) || a.category?.toLowerCase().includes(q) || a.description?.toLowerCase().includes(q)) {
        results.push({ tab: "activities", tabLabel: "Activities", title: a.title, subtitle: `Category: ${a.category}`, type: "Activity", id: a._id });
      }
    });

    // 10. Academic Toppers & Achievements
    achievementsList?.forEach((ach: any) => {
      if (ach.studentName?.toLowerCase().includes(q) || ach.title?.toLowerCase().includes(q) || ach.category?.toLowerCase().includes(q)) {
        results.push({ tab: "achievements", tabLabel: "Academic Toppers", title: ach.studentName || ach.title, subtitle: `${ach.percentage ? ach.percentage + "%" : ""} ${ach.stream || ach.category || ""}`, type: "Achievement", id: ach._id });
      }
    });

    // 11. Testimonials
    testimonialsList?.forEach((t: any) => {
      if (t.name?.toLowerCase().includes(q) || t.role?.toLowerCase().includes(q) || t.quote?.toLowerCase().includes(q)) {
        results.push({ tab: "testimonials", tabLabel: "Testimonials", title: t.name, subtitle: `${t.role} - "${t.quote?.slice(0, 45)}..."`, type: "Testimonial", id: t._id });
      }
    });

    // 12. Leadership & Faculty
    leadershipList?.forEach((l: any) => {
      if (l.name?.toLowerCase().includes(q) || l.role?.toLowerCase().includes(q) || l.designation?.toLowerCase().includes(q)) {
        results.push({ tab: "leadership", tabLabel: "Leadership & Faculty", title: l.name, subtitle: l.role || l.designation, type: "Faculty", id: l._id });
      }
    });

    // 13. Facilities
    facilitiesList?.forEach((f: any) => {
      if (f.title?.toLowerCase().includes(q) || f.category?.toLowerCase().includes(q) || f.description?.toLowerCase().includes(q)) {
        results.push({ tab: "facilities", tabLabel: "Campus Facilities", title: f.title, subtitle: f.category, type: "Facility", id: f._id });
      }
    });

    // 14. Departments
    departmentsList?.forEach((d: any) => {
      if (d.name?.toLowerCase().includes(q) || d.headOfDepartment?.toLowerCase().includes(q) || d.description?.toLowerCase().includes(q)) {
        results.push({ tab: "departments", tabLabel: "Departments", title: d.name, subtitle: `Head: ${d.headOfDepartment || "N/A"}`, type: "Department", id: d._id });
      }
    });

    // 15. Admission Steps
    admissionStepsList?.forEach((step: any) => {
      if (step.title?.toLowerCase().includes(q) || step.description?.toLowerCase().includes(q)) {
        results.push({ tab: "admission_steps", tabLabel: "Admission Steps", title: step.title, subtitle: `Step ${step.stepNumber || 1}`, type: "Admission Step", id: step._id });
      }
    });

    // 16. FAQs
    faqsList?.forEach((faq: any) => {
      if (faq.question?.toLowerCase().includes(q) || faq.answer?.toLowerCase().includes(q) || faq.category?.toLowerCase().includes(q)) {
        results.push({ tab: "faqs", tabLabel: "Admissions FAQs", title: faq.question, subtitle: faq.answer?.slice(0, 50) + "...", type: "FAQ", id: faq._id });
      }
    });

    // 17. Transfer Certificates (TC)
    tcList?.forEach((tc: any) => {
      if (tc.studentName?.toLowerCase().includes(q) || tc.admissionNumber?.toLowerCase().includes(q) || tc.fatherName?.toLowerCase().includes(q)) {
        results.push({ tab: "tc", tabLabel: "Transfer Certificates", title: `${tc.studentName} (Adm: ${tc.admissionNumber})`, subtitle: `Father: ${tc.fatherName || "N/A"} • Status: ${tc.status}`, type: "TC", id: tc._id });
      }
    });

    // 18. MUN Registrations
    munList?.forEach((mun: any) => {
      if (mun.studentName?.toLowerCase().includes(q) || mun.schoolName?.toLowerCase().includes(q) || mun.email?.toLowerCase().includes(q)) {
        results.push({ tab: "mun", tabLabel: "MUN Registrations", title: mun.studentName, subtitle: `School: ${mun.schoolName} • ${mun.email}`, type: "MUN", id: mun._id });
      }
    });

    return results;
  }, [
    globalSearch,
    pagesList,
    menusList,
    slidersList,
    attachmentsList,
    galleryImages,
    videoList,
    popupsList,
    marqueesList,
    activitiesList,
    achievementsList,
    testimonialsList,
    leadershipList,
    facilitiesList,
    departmentsList,
    admissionStepsList,
    faqsList,
    tcList,
    munList,
  ]);

  // Mutations
  const adminLoginMutation = trpc.cms.adminLogin.useMutation();
  const uploadTranscode = trpc.cms.uploadAndTranscode.useMutation();
  const getUploadSignatureMutation = trpc.cms.getUploadSignature.useMutation();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    try {
      const res = await adminLoginMutation.mutateAsync({
        username: adminUsername,
        password: adminPassword,
        schoolCode: schoolCode.trim() || undefined,
      });

      if (res.success && res.token) {
        const clientName = res.tenant?.schoolName || "DPS Indirapuram";
        localStorage.setItem("dpsi_admin_token", res.token);
        localStorage.setItem("dpsi_admin_auth", "true");
        localStorage.setItem("dpsi_admin_user", res.user?.username || "Admin");
        localStorage.setItem("dpsi_admin_tenant", res.tenant?.tenantId || (res.user as any)?.tenantId || "dpsi");
        localStorage.setItem("dpsi_admin_tenant_name", clientName);
        setActiveTenantName(clientName);

        if (res.mustChangePassword) {
          setChangePasswordUsername(adminUsername || res.user?.username || "Admin");
          setChangePasswordCurrent(adminPassword);
          setIsFirstTimePasswordModal(true);
          toast.warning("First-Time Login: Please create a new permanent password.");
        } else {
          setIsAuthenticated(true);
          toast.success(`Welcome back, ${res.user?.username}! (${clientName})`);
        }
      } else {
        setLoginError(res.error || "Invalid username or password");
        toast.error(res.error || "Authentication failed");
      }
    } catch (err: any) {
      setLoginError(err.message || "Failed to authenticate");
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangePasswordError("");

    if (changePasswordNew.length < 8) {
      setChangePasswordError("New password must be at least 8 characters long.");
      return;
    }
    if (changePasswordNew !== changePasswordConfirm) {
      setChangePasswordError("New password and confirmation password do not match.");
      return;
    }
    if (changePasswordNew === changePasswordCurrent) {
      setChangePasswordError("New password cannot be identical to your temporary password.");
      return;
    }

    try {
      const res = await changePasswordMutation.mutateAsync({
        username: changePasswordUsername || adminUsername || localStorage.getItem("dpsi_admin_user") || "Admin",
        currentPassword: changePasswordCurrent,
        newPassword: changePasswordNew,
        schoolCode: schoolCode.trim() || undefined,
      });

      if (res.success && res.token) {
        const clientName = res.tenant?.schoolName || activeTenantName || "DPS Indirapuram";
        toast.success(res.message || "Password updated successfully! Welcome to CMS.");
        localStorage.setItem("dpsi_admin_token", res.token);
        localStorage.setItem("dpsi_admin_auth", "true");
        localStorage.setItem("dpsi_admin_user", res.user?.username || "Admin");
        localStorage.setItem("dpsi_admin_tenant", res.tenant?.tenantId || (res.user as any)?.tenantId || "dpsi");
        localStorage.setItem("dpsi_admin_tenant_name", clientName);
        setActiveTenantName(clientName);
        setIsAuthenticated(true);
        setIsFirstTimePasswordModal(false);
        setChangePasswordCurrent("");
        setChangePasswordNew("");
        setChangePasswordConfirm("");
        setChangePasswordError("");
      } else {
        setChangePasswordError(res.error || "Failed to update password.");
        toast.error(res.error || "Failed to update password.");
      }
    } catch (err: any) {
      setChangePasswordError(err.message || "Failed to change password.");
      toast.error(err.message || "Failed to change password.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("dpsi_admin_auth");
    localStorage.removeItem("dpsi_admin_user");
    localStorage.removeItem("dpsi_admin_token");
    localStorage.removeItem("dpsi_admin_tenant");
    localStorage.removeItem("dpsi_admin_tenant_name");
    setIsAuthenticated(false);
    toast.info("Logged out of Admin Portal");
  };

  // CRUD Mutations
  const createPage = trpc.cms.createPage.useMutation({
    onSuccess: () => {
      toast.success("Page published successfully!");
      refetchPages();
      refetchStats();
      utils.cms.listPages.invalidate();
      utils.cms.dashboardStats.invalidate();
      setPageModal(false);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create page");
    },
  });
  const deletePage = trpc.cms.deletePage.useMutation({
    onSuccess: () => {
      toast.success("Page deleted");
      refetchPages();
      refetchStats();
      utils.cms.listPages.invalidate();
      utils.cms.dashboardStats.invalidate();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete page");
    },
  });

  const createMenu = trpc.cms.createMenu.useMutation({
    onSuccess: () => {
      toast.success("Menu item created!");
      refetchMenus();
      utils.cms.listMenus.invalidate();
      setMenuModal(false);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create menu item");
    },
  });
  const updateMenu = trpc.cms.updateMenu.useMutation({
    onSuccess: () => {
      toast.success("Menu item updated!");
      refetchMenus();
      utils.cms.listMenus.invalidate();
      setMenuModal(false);
      setEditingMenuId(null);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update menu item");
    },
  });
  const deleteMenu = trpc.cms.deleteMenu.useMutation({
    onSuccess: () => {
      toast.success("Menu item deleted");
      refetchMenus();
      utils.cms.listMenus.invalidate();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete menu item");
    },
  });

  const [selectedMenuLocation, setSelectedMenuLocation] = useState<"all" | "header" | "footer_quick" | "footer_resources">("all");
  const [editingMenuId, setEditingMenuId] = useState<string | null>(null);

  const createPopup = trpc.cms.createPopup.useMutation({
    onSuccess: () => {
      toast.success("Popup notice published!");
      refetchPopups();
      refetchStats();
      utils.cms.listPopups.invalidate();
      utils.cms.dashboardStats.invalidate();
      setPopupModal(false);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create popup notice");
    },
  });
  const togglePopup = trpc.cms.togglePopup.useMutation({
    onSuccess: (data: any) => {
      toast.success(`Popup ${data?.isActive ? "enabled" : "disabled"} successfully!`);
      refetchPopups();
      refetchStats();
      utils.cms.listPopups.invalidate();
      utils.cms.dashboardStats.invalidate();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to toggle popup");
    },
  });
  const deletePopup = trpc.cms.deletePopup.useMutation({
    onSuccess: () => {
      toast.success("Popup deleted");
      refetchPopups();
      refetchStats();
      utils.cms.listPopups.invalidate();
      utils.cms.dashboardStats.invalidate();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete popup");
    },
  });

  const createMarquee = trpc.cms.createMarquee.useMutation({
    onSuccess: () => {
      toast.success("Marquee alert added!");
      refetchMarquees();
      utils.cms.listMarquees.invalidate();
      setMarqueeModal(false);
      setEditingMarquee(null);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to add marquee alert");
    },
  });
  const updateMarquee = trpc.cms.updateMarquee.useMutation({
    onSuccess: () => {
      toast.success("Marquee alert updated!");
      refetchMarquees();
      utils.cms.listMarquees.invalidate();
      setMarqueeModal(false);
      setEditingMarquee(null);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update marquee alert");
    },
  });
  const deleteMarquee = trpc.cms.deleteMarquee.useMutation({
    onSuccess: () => {
      toast.success("Marquee deleted");
      refetchMarquees();
      utils.cms.listMarquees.invalidate();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete marquee alert");
    },
  });


  const createActivity = trpc.cms.createActivity.useMutation({
    onSuccess: () => {
      toast.success("Activity item created!");
      refetchActivities();
      refetchStats();
      utils.cms.listActivities.invalidate();
      utils.cms.dashboardStats.invalidate();
      setActivityModal(false);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create activity");
    },
  });
  const deleteActivity = trpc.cms.deleteActivity.useMutation({
    onSuccess: () => {
      toast.success("Activity deleted");
      refetchActivities();
      refetchStats();
      utils.cms.listActivities.invalidate();
      utils.cms.dashboardStats.invalidate();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete activity");
    },
  });

  const createSlider = trpc.cms.createSlider.useMutation({
    onSuccess: () => {
      toast.success("Slider item created!");
      refetchSliders();
      refetchStats();
      utils.cms.listSliders.invalidate();
      utils.cms.dashboardStats.invalidate();
      setSliderModal(false);
      setEditingSlider(null);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create hero slider");
    },
  });
  const updateSlider = trpc.cms.updateSlider.useMutation({
    onSuccess: () => {
      toast.success("Slider updated!");
      refetchSliders();
      refetchStats();
      utils.cms.listSliders.invalidate();
      utils.cms.dashboardStats.invalidate();
      setSliderModal(false);
      setEditingSlider(null);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update hero slider");
    },
  });
  const deleteSlider = trpc.cms.deleteSlider.useMutation({
    onSuccess: () => {
      toast.success("Slider deleted");
      refetchSliders();
      refetchStats();
      utils.cms.listSliders.invalidate();
      utils.cms.dashboardStats.invalidate();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete hero slider");
    },
  });

  const createAttachment = trpc.cms.createAttachment.useMutation({
    onSuccess: () => {
      toast.success("Attachment/Circular added!");
      refetchAttachments();
      refetchStats();
      utils.cms.listAttachments.invalidate();
      utils.cms.dashboardStats.invalidate();
      setAttachmentModal(false);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to add attachment");
    },
  });
  const deleteAttachment = trpc.cms.deleteAttachment.useMutation({
    onSuccess: () => {
      toast.success("Attachment deleted");
      refetchAttachments();
      refetchStats();
      utils.cms.listAttachments.invalidate();
      utils.cms.dashboardStats.invalidate();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete attachment");
    },
  });

  const createGalleryImage = trpc.cms.createGalleryImage.useMutation({
    onSuccess: () => {
      toast.success("Image uploaded & transcoded to WebP via Cloudinary!");
      refetchGallery();
      refetchStats();
      utils.cms.listGalleryImages.invalidate();
      utils.cms.dashboardStats.invalidate();
      setGalleryModal(false);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to save gallery image");
    },
  });
  const deleteGalleryImage = trpc.cms.deleteGalleryImage.useMutation({
    onSuccess: () => {
      toast.success("Gallery photo deleted successfully!");
      refetchGallery();
      refetchStats();
      utils.cms.listGalleryImages.invalidate();
      utils.cms.dashboardStats.invalidate();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete gallery image");
    },
  });

  const createVideo = trpc.cms.createVideo.useMutation({
    onSuccess: () => {
      toast.success("Video added to Gallery!");
      refetchVideos();
      refetchStats();
      utils.cms.listVideos.invalidate();
      utils.cms.dashboardStats.invalidate();
      setVideoModal(false);
      setVideoForm({ title: "", category: "Events", youtubeUrl: "", thumbnailUrl: "" });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to add video showcase");
    },
  });
  const updateVideo = trpc.cms.updateVideo.useMutation({
    onSuccess: () => {
      toast.success("Video updated!");
      refetchVideos();
      refetchStats();
      utils.cms.listVideos.invalidate();
      utils.cms.dashboardStats.invalidate();
      setVideoModal(false);
      setEditingVideoId(null);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update video showcase");
    },
  });
  const deleteVideo = trpc.cms.deleteVideo.useMutation({
    onSuccess: () => {
      toast.success("Video deleted from Gallery!");
      refetchVideos();
      refetchStats();
      utils.cms.listVideos.invalidate();
      utils.cms.dashboardStats.invalidate();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete video");
    },
  });

  const createTc = trpc.cms.createTc.useMutation({
    onSuccess: () => {
      toast.success("Transfer Certificate record created!");
      refetchTc();
      refetchStats();
      utils.cms.listTc.invalidate();
      utils.cms.dashboardStats.invalidate();
      setTcModal(false);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create TC record");
    },
  });
  const bulkCreateTc = trpc.cms.bulkCreateTc.useMutation({
    onSuccess: (data) => {
      toast.success(`Bulk import complete: ${data.inserted} records inserted!`);
      refetchTc();
      refetchStats();
      utils.cms.listTc.invalidate();
      utils.cms.dashboardStats.invalidate();
      setBulkTcModal(false);
      setBulkCsvText("");
      setBulkPreviewRows([]);
    },
    onError: (err: any) => {
      toast.error(err.message || "Bulk import failed");
    },
  });
  const deleteTc = trpc.cms.deleteTc.useMutation({
    onSuccess: () => {
      toast.success("TC record deleted");
      refetchTc();
      refetchStats();
      utils.cms.listTc.invalidate();
      utils.cms.dashboardStats.invalidate();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete TC record");
    },
  });

  const updatePage = trpc.cms.updatePage.useMutation({
    onSuccess: () => {
      toast.success("Page updated!");
      refetchPages();
      refetchStats();
      utils.cms.listPages.invalidate();
      utils.cms.dashboardStats.invalidate();
      setPageModal(false);
      setEditingPageId(null);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update page");
    },
  });

  const updateActivity = trpc.cms.updateActivity.useMutation({
    onSuccess: () => {
      toast.success("Activity updated!");
      refetchActivities();
      refetchStats();
      utils.cms.listActivities.invalidate();
      utils.cms.dashboardStats.invalidate();
      setActivityModal(false);
      setEditingActivity(null);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update activity");
    },
  });

  const updateAttachment = trpc.cms.updateAttachment.useMutation({
    onSuccess: () => {
      toast.success("Attachment updated!");
      refetchAttachments();
      refetchStats();
      utils.cms.listAttachments.invalidate();
      utils.cms.dashboardStats.invalidate();
      setAttachmentModal(false);
      setEditingAttachment(null);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update attachment");
    },
  });

  const toggleMenuMutation = trpc.cms.toggleMenu.useMutation({
    onSuccess: (data: any) => {
      toast.success(`Menu item ${data?.isActive ? "shown" : "hidden"}`);
      refetchMenus();
      utils.cms.listMenus.invalidate();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to toggle menu item");
    },
  });

  const updateSiteSettingsMutation = trpc.cms.updateSiteSettings.useMutation({
    onSuccess: () => {
      toast.success("Site settings saved!");
      refetchSiteSettings();
      utils.cms.getSiteSettings.invalidate();
      utils.cms.listLeadership.invalidate();
      refetchLeadership();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update site settings");
    },
  });

  const changePasswordMutation = trpc.cms.changePassword.useMutation();

  const updateAiConfigMutation = trpc.cms.updateAiConfig.useMutation({
    onSuccess: () => {
      toast.success("AI configuration saved and active!");
      refetchAiConfig();
      utils.cms.getAiConfig.invalidate();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update AI configuration");
    },
  });

  const updatePopup = trpc.cms.updatePopup.useMutation({
    onSuccess: () => {
      toast.success("Popup updated!");
      refetchPopups();
      refetchStats();
      utils.cms.listPopups.invalidate();
      utils.cms.dashboardStats.invalidate();
      setPopupModal(false);
      setEditingPopup(null);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update popup");
    },
  });

  // --- NEW CRUD MUTATIONS FOR CMS-DRIVEN ARCHITECTURE ---
  const createAchievement = trpc.achievements.create.useMutation({
    onSuccess: () => {
      toast.success("Topper / Achievement added!");
      refetchAchievements();
      refetchStats();
      utils.achievements.list.invalidate();
      setAchievementModal(false);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to add achievement");
    },
  });
  const updateAchievement = trpc.achievements.update.useMutation({
    onSuccess: () => {
      toast.success("Achievement updated!");
      refetchAchievements();
      refetchStats();
      utils.achievements.list.invalidate();
      setAchievementModal(false);
      setEditingAchievementId(null);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update achievement");
    },
  });
  const deleteAchievement = trpc.achievements.delete.useMutation({
    onSuccess: () => {
      toast.success("Achievement deleted");
      refetchAchievements();
      refetchStats();
      utils.achievements.list.invalidate();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete achievement");
    },
  });

  const createTestimonial = trpc.testimonials.create.useMutation({
    onSuccess: () => {
      toast.success("Testimonial added!");
      refetchTestimonials();
      refetchStats();
      utils.testimonials.list.invalidate();
      setTestimonialModal(false);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to add testimonial");
    },
  });
  const updateTestimonial = trpc.testimonials.update.useMutation({
    onSuccess: () => {
      toast.success("Testimonial updated!");
      refetchTestimonials();
      refetchStats();
      utils.testimonials.list.invalidate();
      setTestimonialModal(false);
      setEditingTestimonialId(null);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update testimonial");
    },
  });
  const deleteTestimonial = trpc.testimonials.delete.useMutation({
    onSuccess: () => {
      toast.success("Testimonial deleted");
      refetchTestimonials();
      refetchStats();
      utils.testimonials.list.invalidate();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete testimonial");
    },
  });

  const createLeadership = trpc.cms.createLeadership.useMutation({
    onSuccess: () => {
      toast.success("Leadership member added!");
      refetchLeadership();
      refetchStats();
      utils.cms.listLeadership.invalidate();
      setLeadershipModal(false);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to add leadership profile");
    },
  });
  const updateLeadership = trpc.cms.updateLeadership.useMutation({
    onSuccess: () => {
      toast.success("Leadership member updated!");
      refetchLeadership();
      refetchStats();
      utils.cms.listLeadership.invalidate();
      utils.cms.getSiteSettings.invalidate();
      refetchSiteSettings();
      setLeadershipModal(false);
      setEditingLeadershipId(null);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update leadership profile");
    },
  });
  const deleteLeadership = trpc.cms.deleteLeadership.useMutation({
    onSuccess: () => {
      toast.success("Leadership member removed");
      refetchLeadership();
      refetchStats();
      utils.cms.listLeadership.invalidate();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete leadership profile");
    },
  });

  const createFacility = trpc.cms.createFacility.useMutation({
    onSuccess: () => {
      toast.success("Facility added!");
      refetchFacilities();
      refetchStats();
      utils.cms.listFacilities.invalidate();
      setFacilityModal(false);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to add facility");
    },
  });
  const updateFacility = trpc.cms.updateFacility.useMutation({
    onSuccess: () => {
      toast.success("Facility updated!");
      refetchFacilities();
      refetchStats();
      utils.cms.listFacilities.invalidate();
      setFacilityModal(false);
      setEditingFacilityId(null);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update facility");
    },
  });
  const deleteFacility = trpc.cms.deleteFacility.useMutation({
    onSuccess: () => {
      toast.success("Facility removed");
      refetchFacilities();
      refetchStats();
      utils.cms.listFacilities.invalidate();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete facility");
    },
  });

  const createDepartment = trpc.cms.createDepartment.useMutation({
    onSuccess: () => {
      toast.success("Department added!");
      refetchDepartments();
      refetchStats();
      utils.cms.listDepartments.invalidate();
      setDepartmentModal(false);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to add department");
    },
  });
  const updateDepartment = trpc.cms.updateDepartment.useMutation({
    onSuccess: () => {
      toast.success("Department updated!");
      refetchDepartments();
      refetchStats();
      utils.cms.listDepartments.invalidate();
      setDepartmentModal(false);
      setEditingDepartmentId(null);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update department");
    },
  });
  const deleteDepartment = trpc.cms.deleteDepartment.useMutation({
    onSuccess: () => {
      toast.success("Department deleted");
      refetchDepartments();
      refetchStats();
      utils.cms.listDepartments.invalidate();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete department");
    },
  });

  const createAdmissionStep = trpc.cms.createAdmissionStep.useMutation({
    onSuccess: () => {
      toast.success("Admission step added!");
      refetchAdmissionSteps();
      refetchStats();
      utils.cms.listAdmissionSteps.invalidate();
      setAdmissionStepModal(false);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to add admission step");
    },
  });
  const updateAdmissionStep = trpc.cms.updateAdmissionStep.useMutation({
    onSuccess: () => {
      toast.success("Admission step updated!");
      refetchAdmissionSteps();
      refetchStats();
      utils.cms.listAdmissionSteps.invalidate();
      setAdmissionStepModal(false);
      setEditingAdmissionStepId(null);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update admission step");
    },
  });
  const deleteAdmissionStep = trpc.cms.deleteAdmissionStep.useMutation({
    onSuccess: () => {
      toast.success("Admission step deleted");
      refetchAdmissionSteps();
      refetchStats();
      utils.cms.listAdmissionSteps.invalidate();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete admission step");
    },
  });

  const createFaq = trpc.cms.createFaq.useMutation({
    onSuccess: () => {
      toast.success("FAQ added!");
      refetchFaqs();
      refetchStats();
      utils.cms.listFaqs.invalidate();
      setFaqModal(false);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to add FAQ");
    },
  });
  const updateFaq = trpc.cms.updateFaq.useMutation({
    onSuccess: () => {
      toast.success("FAQ updated!");
      refetchFaqs();
      refetchStats();
      utils.cms.listFaqs.invalidate();
      setFaqModal(false);
      setEditingFaqId(null);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update FAQ");
    },
  });
  const deleteFaq = trpc.cms.deleteFaq.useMutation({
    onSuccess: () => {
      toast.success("FAQ deleted");
      refetchFaqs();
      refetchStats();
      utils.cms.listFaqs.invalidate();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete FAQ");
    },
  });

  const createStatMetric = trpc.stats.create.useMutation({
    onSuccess: () => {
      toast.success("Stat metric added!");
      refetchStatsMetrics();
      refetchStats();
      utils.stats.list.invalidate();
      setStatMetricModal(false);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to add stat metric");
    },
  });
  const updateStatMetric = trpc.stats.update.useMutation({
    onSuccess: () => {
      toast.success("Stat metric updated!");
      refetchStatsMetrics();
      refetchStats();
      utils.stats.list.invalidate();
      setStatMetricModal(false);
      setEditingStatMetricId(null);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update stat metric");
    },
  });
  const deleteStatMetric = trpc.stats.delete.useMutation({
    onSuccess: () => {
      toast.success("Stat metric deleted");
      refetchStatsMetrics();
      refetchStats();
      utils.stats.list.invalidate();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete stat metric");
    },
  });

  // Modal Form States
  const [achievementModal, setAchievementModal] = useState(false);
  const [achievementForm, setAchievementForm] = useState({
    studentName: "",
    className: "Class X",
    score: "",
    exam: "CBSE Board Examination",
    stream: "",
    rank: "",
    year: "2025-26",
    imageUrl: "",
    featured: true,
    order: 0,
  });
  const [editingAchievementId, setEditingAchievementId] = useState<string | null>(null);

  const [testimonialModal, setTestimonialModal] = useState(false);
  const [testimonialForm, setTestimonialForm] = useState({
    name: "",
    role: "",
    content: "",
    avatarUrl: "",
    rating: 5,
    featured: true,
    order: 0,
  });
  const [editingTestimonialId, setEditingTestimonialId] = useState<string | null>(null);

  const [leadershipModal, setLeadershipModal] = useState(false);
  const [editingLeadershipId, setEditingLeadershipId] = useState<string | null>(null);
  const [leadershipForm, setLeadershipForm] = useState({
    name: "",
    role: "",
    designation: "",
    bio: "",
    imageUrl: "",
    category: "Management",
    order: 0,
  });
  const { data: featureCardsList, refetch: refetchFeatureCards } = trpc.cms.listFeatureCards.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const createFeatureCard = trpc.cms.createFeatureCard.useMutation({
    onSuccess: () => {
      toast.success("3D Feature Card added!");
      refetchFeatureCards();
      refetchStats();
      utils.cms.listFeatureCards.invalidate();
      setFeatureCardModal(false);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to add feature card");
    },
  });
  const updateFeatureCard = trpc.cms.updateFeatureCard.useMutation({
    onSuccess: () => {
      toast.success("3D Feature Card updated!");
      refetchFeatureCards();
      refetchStats();
      utils.cms.listFeatureCards.invalidate();
      setFeatureCardModal(false);
      setEditingFeatureCardId(null);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update feature card");
    },
  });
  const deleteFeatureCard = trpc.cms.deleteFeatureCard.useMutation({
    onSuccess: () => {
      toast.success("3D Feature Card removed");
      refetchFeatureCards();
      refetchStats();
      utils.cms.listFeatureCards.invalidate();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete feature card");
    },
  });

  const [featureCardModal, setFeatureCardModal] = useState(false);
  const [featureCardForm, setFeatureCardForm] = useState({
    title: "",
    description: "",
    icon: "Bot",
    category: "AI Innovation Lab",
    order: 0,
  });
  const [editingFeatureCardId, setEditingFeatureCardId] = useState<string | null>(null);

  const [facilityModal, setFacilityModal] = useState(false);
  const [facilityForm, setFacilityForm] = useState({
    title: "",
    category: "Campus",
    description: "",
    icon: "Microscope",
    imageUrl: "",
    geometry: "torusKnot",
    color: "#10b981",
    accent: "#34d399",
    order: 0,
  });
  const [editingFacilityId, setEditingFacilityId] = useState<string | null>(null);


  const [departmentModal, setDepartmentModal] = useState(false);
  const [departmentForm, setDepartmentForm] = useState({
    name: "",
    subjects: "",
    icon: "BookOpen",
    color: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
    order: 0,
  });
  const [editingDepartmentId, setEditingDepartmentId] = useState<string | null>(null);

  const [admissionStepModal, setAdmissionStepModal] = useState(false);
  const [admissionStepForm, setAdmissionStepForm] = useState({
    stepNumber: 1,
    title: "",
    description: "",
    icon: "FileText",
    order: 0,
  });
  const [editingAdmissionStepId, setEditingAdmissionStepId] = useState<string | null>(null);

  const [faqModal, setFaqModal] = useState(false);
  const [faqForm, setFaqForm] = useState({
    question: "",
    answer: "",
    category: "Admissions",
    order: 0,
  });
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);

  const [statMetricModal, setStatMetricModal] = useState(false);
  const [statMetricForm, setStatMetricForm] = useState({
    label: "",
    value: "",
    icon: "GraduationCap",
    order: 0,
    active: true,
  });
  const [editingStatMetricId, setEditingStatMetricId] = useState<string | null>(null);

  const [marqueeModal, setMarqueeModal] = useState(false);
  const [marqueeForm, setMarqueeForm] = useState({
    text: "",
    linkUrl: "",
    speed: 50,
    textColor: "#10b981",
    bgColor: "#047857",
    badgeText: "Announcement",
    isTransparent: false,
    shape: "rectangle" as "rectangle" | "rounded" | "pill",
    borderRadius: "none" as "none" | "md" | "xl" | "full",
  });


  const [activityModal, setActivityModal] = useState(false);
  const [activityForm, setActivityForm] = useState({ title: "", category: "Academics", description: "", eventDate: "", imageUrl: "" });

  const [sliderModal, setSliderModal] = useState(false);
  const [sliderForm, setSliderForm] = useState({
    title: "",
    subtitle: "",
    imageUrl: "",
    videoUrl: "",
    mobileVideoUrl: "",
    useSeparateMobileVideo: false,
    mediaType: "image" as "image" | "video",
    buttonText: "Apply Now",
    buttonLink: "/admissions",
    order: 0,
  });

  const [attachmentModal, setAttachmentModal] = useState(false);
  const [attachmentForm, setAttachmentForm] = useState({ title: "", category: "Circulars", fileUrl: "", fileName: "" });

  const [galleryModal, setGalleryModal] = useState(false);
  const [galleryForm, setGalleryForm] = useState({ title: "", category: "Campus", imageUrl: "" });

  const [videoModal, setVideoModal] = useState(false);
  const [videoForm, setVideoForm] = useState({ title: "", category: "Events", youtubeUrl: "", thumbnailUrl: "" });

  const [tcModal, setTcModal] = useState(false);
  const [tcForm, setTcForm] = useState({
    admissionNumber: "",
    studentName: "",
    fatherName: "",
    motherName: "",
    classLeaving: "Class X",
    dateOfIssue: new Date().toISOString().split("T")[0],
    certificatePdfUrl: "",
    status: "Issued" as "Issued" | "Pending" | "Cancelled",
  });

  // Editing IDs for all sections
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editingSlider, setEditingSlider] = useState<any | null>(null);
  const [editingActivity, setEditingActivity] = useState<any | null>(null);
  const [editingMarquee, setEditingMarquee] = useState<any | null>(null);
  const [editingAttachment, setEditingAttachment] = useState<any | null>(null);
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const [editingPopup, setEditingPopup] = useState<any | null>(null);

  // Bulk TC Import
  const [bulkTcModal, setBulkTcModal] = useState(false);
  const [bulkCsvText, setBulkCsvText] = useState("");
  const [bulkPreviewRows, setBulkPreviewRows] = useState<any[]>([]);

  // Site Settings local state
  const [settingsEdits, setSettingsEdits] = useState<Record<string, string>>({});

  // AI Config local state
  const [aiPromptEdit, setAiPromptEdit] = useState("");
  const [aiModelEdit, setAiModelEdit] = useState("llama-3.3-70b-versatile");
  const [aiTempEdit, setAiTempEdit] = useState(0.4);
  const [aiTtsProviderEdit, setAiTtsProviderEdit] = useState<"google" | "elevenlabs" | "auto">("elevenlabs");
  const [aiGoogleKeyEdit, setAiGoogleKeyEdit] = useState("");
  const [aiGoogleVoiceEdit, setAiGoogleVoiceEdit] = useState("en-IN-Journey-F");
  const [aiElevenlabsKeyEdit, setAiElevenlabsKeyEdit] = useState("");
  const [aiElevenlabsVoiceEdit, setAiElevenlabsVoiceEdit] = useState("EXAVITQu4vr4xnSDxMaL");

  const safeIsoDate = (val: any) => {
    if (!val) return "";
    try {
      const d = new Date(val);
      if (isNaN(d.getTime())) return "";
      return d.toISOString().split("T")[0];
    } catch {
      return "";
    }
  };

  const safeFormatDate = (val: any) => {
    return formatISTDate(val);
  };

  const parseBulkCsv = (text: string) => {
    const lines = text.trim().split("\n").filter(l => l.trim());
    const rows: any[] = [];
    for (const line of lines) {
      const parts = line.split(",").map(p => p.trim());
      if (parts.length >= 5) {
        rows.push({
          admissionNumber: parts[0] || "",
          studentName: parts[1] || "",
          fatherName: parts[2] || "",
          motherName: parts[3] || "",
          classLeaving: parts[4] || "Class X",
          dateOfIssue: safeIsoDate(parts[5]) || new Date().toISOString().split("T")[0],
          status: (["Issued", "Pending", "Cancelled"].includes(parts[6]) ? parts[6] : "Issued") as "Issued" | "Pending" | "Cancelled",
        });
      }
    }
    return rows;
  };

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Client-side image pre-compression: transforms 10MB raw camera photos into ~200KB WebP in ~40ms, making CDN uploads 20x faster!
  const compressImageForUpload = async (
    file: File,
    maxDimension: number = 2048,
    quality: number = 0.84
  ): Promise<File> => {
    if (
      !file.type.startsWith("image/") ||
      file.type === "image/svg+xml" ||
      file.type === "image/gif" ||
      file.size < 80 * 1024
    ) {
      return file;
    }

    return new Promise<File>((resolve) => {
      try {
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);

        img.onload = () => {
          URL.revokeObjectURL(objectUrl);
          try {
            let { width, height } = img;

            if (width > maxDimension || height > maxDimension) {
              if (width > height) {
                height = Math.round((height * maxDimension) / width);
                width = maxDimension;
              } else {
                width = Math.round((width * maxDimension) / height);
                height = maxDimension;
              }
            }

            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d", { alpha: file.type === "image/png" });
            if (!ctx) return resolve(file);

            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
              (blob) => {
                if (!blob || blob.size >= file.size) {
                  resolve(file);
                } else {
                  const newName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
                  const optimizedFile = new File([blob], newName, { type: "image/webp" });
                  resolve(optimizedFile);
                }
              },
              "image/webp",
              quality
            );
          } catch {
            resolve(file);
          }
        };

        img.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          resolve(file);
        };

        img.src = objectUrl;
      } catch {
        resolve(file);
      }
    });
  };

  const handleMediaUpload = async (
    file: File,
    callback: (url: string) => void,
    options?: { resourceType?: "image" | "video" | "auto"; folder?: string }
  ) => {
    const isVideo = file.type.startsWith("video/") || options?.resourceType === "video";
    const resourceType = isVideo ? "video" : options?.resourceType || (file.type.startsWith("image/") ? "image" : "auto");
    const folder = options?.folder || (isVideo ? "dpsi_videos" : "dpsi_cms");

    setIsUploading(true);
    setUploadProgress(0);
    const toastId = toast.loading(
      isVideo ? `Preparing upload for video: ${file.name}...` : `Optimizing & uploading ${file.name}...`
    );

    try {
      // Step 1: Pre-compress images in browser canvas (drastically cuts upload payload from 10MB to ~200KB)
      let uploadFile = file;
      if (!isVideo && file.type.startsWith("image/")) {
        uploadFile = await compressImageForUpload(file);
      }

      // Step 2: Request signed upload credentials from server (bypasses Vercel 4.5MB payload limit)
      const sigData = await getUploadSignatureMutation.mutateAsync({
        folder,
        resourceType,
      });

      // Step 3: Upload directly to Cloudinary using FormData and XMLHttpRequest for live progress
      const uploadedUrl = await new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const endpoint = `https://api.cloudinary.com/v1_1/${sigData.cloudName}/${resourceType}/upload`;

        xhr.open("POST", endpoint, true);

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            setUploadProgress(percent);
            toast.loading(`Uploading to CDN: ${percent}%`, { id: toastId });
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const resp = JSON.parse(xhr.responseText);
              const secureUrl = resp.secure_url || resp.url;
              if (secureUrl) {
                resolve(secureUrl);
              } else {
                reject(new Error("Cloudinary response missing URL"));
              }
            } catch (err: any) {
              reject(new Error("Failed to parse Cloudinary response: " + err.message));
            }
          } else {
            let errMsg = `Upload failed with HTTP ${xhr.status}`;
            try {
              const errObj = JSON.parse(xhr.responseText);
              if (errObj.error?.message) errMsg = errObj.error.message;
            } catch {}
            reject(new Error(errMsg));
          }
        };

        xhr.onerror = () => {
          reject(new Error("Network error during file upload. Please check your connection."));
        };

        xhr.ontimeout = () => {
          reject(new Error("Upload timed out. Please check your network speed."));
        };

        const formData = new FormData();
        formData.append("file", uploadFile);
        formData.append("api_key", sigData.apiKey);
        formData.append("timestamp", String(sigData.timestamp));
        formData.append("signature", sigData.signature);
        formData.append("folder", sigData.folder);

        xhr.send(formData);
      });

      const sizeKb = Math.round(uploadFile.size / 1024);
      toast.success(
        isVideo ? `Video uploaded successfully to CDN! (${sizeKb} KB)` : `Photo optimized & uploaded to CDN! (${sizeKb} KB)`,
        { id: toastId }
      );
      callback(uploadedUrl);
    } catch (directErr: any) {
      console.warn("Direct upload error, checking fallback:", directErr);
      // Fallback for smaller files (< 4MB) if direct upload had issues
      if (file.size <= 4 * 1024 * 1024) {
        try {
          toast.loading("Retrying via serverless upload...", { id: toastId });
          await new Promise<void>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async () => {
              try {
                const base64Data = reader.result as string;
                const res = await uploadTranscode.mutateAsync({
                  fileName: file.name,
                  fileType: file.type,
                  base64Data,
                });
                if (res.success && res.dataUrl) {
                  toast.success("Uploaded successfully!", { id: toastId });
                  callback(res.dataUrl);
                  resolve();
                } else {
                  reject(new Error(res.error || "Failed to upload media"));
                }
              } catch (e) {
                reject(e);
              }
            };
            reader.onerror = () => reject(new Error("Failed to read file"));
            reader.readAsDataURL(file);
          });
        } catch (fbErr: any) {
          toast.error(fbErr.message || "Backup upload failed", { id: toastId });
        }
      } else {
        toast.error(directErr.message || "Upload failed. Please try a smaller video or check network.", { id: toastId });
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const navMenuItems = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" />, count: null },
    { id: "pages", label: "Manage Pages", icon: <FileText className="w-4 h-4" />, count: pagesList?.length ?? stats?.pages ?? 0 },
    { id: "menus", label: "Manage Menus", icon: <MenuIcon className="w-4 h-4" />, count: menusList?.length ?? 0 },
    { id: "gallery", label: "Image Gallery", icon: <ImageIcon className="w-4 h-4" />, count: galleryImages?.length ?? stats?.galleryImages ?? 0 },
    { id: "videos", label: "Video Gallery", icon: <Video className="w-4 h-4" />, count: videoList?.length ?? stats?.videos ?? 0 },
    { id: "popups", label: "Popups", icon: <BellRing className="w-4 h-4" />, count: popupsList?.length ?? stats?.popups ?? 0 },
    { id: "marquee", label: "Marquee Ticker", icon: <Megaphone className="w-4 h-4" />, count: marqueesList?.length ?? 0 },
    { id: "activities", label: "Activities", icon: <Activity className="w-4 h-4" />, count: activitiesList?.length ?? stats?.activities ?? 0 },
    { id: "sliders", label: "Home Sliders", icon: <SlidersHorizontal className="w-4 h-4" />, count: slidersList?.length ?? stats?.sliders ?? 0 },
    { id: "achievements", label: "Academic Toppers", icon: <Trophy className="w-4 h-4" />, count: achievementsList?.length ?? 0 },
    { id: "testimonials", label: "Testimonials", icon: <Heart className="w-4 h-4" />, count: testimonialsList?.length ?? 0 },
    { id: "leadership", label: "Leadership & Faculty", icon: <UserCheck className="w-4 h-4" />, count: leadershipList?.length ?? 0 },
    { id: "facilities", label: "Campus Facilities", icon: <Building className="w-4 h-4" />, count: facilitiesList?.length ?? 0 },
    { id: "departments", label: "Departments", icon: <BookOpen className="w-4 h-4" />, count: departmentsList?.length ?? 0 },
    { id: "admission_steps", label: "Admission Steps", icon: <FileText className="w-4 h-4" />, count: admissionStepsList?.length ?? 0 },
    { id: "faqs", label: "Admissions FAQs", icon: <HelpCircle className="w-4 h-4" />, count: faqsList?.length ?? 0 },
    { id: "stats_metrics", label: "Quick Stats & Counters", icon: <BarChart3 className="w-4 h-4" />, count: statsMetricsList?.length ?? 0 },
    { id: "attachments", label: "Attachments", icon: <Paperclip className="w-4 h-4" />, count: attachmentsList?.length ?? stats?.attachments ?? 0 },
    { id: "tc", label: "Transfer Certificate", icon: <Award className="w-4 h-4" />, count: stats?.transferCertificates ?? 0 },
    { id: "mun", label: "MUN Registration", icon: <Globe2 className="w-4 h-4" />, count: stats?.munRegistrations ?? 0 },
    { id: "site_settings", label: "Site Settings", icon: <Settings className="w-4 h-4" />, count: siteSettings?.length ?? null },
    { id: "ai_settings", label: "AI Configuration", icon: <Bot className="w-4 h-4" />, count: null },
    { id: "audit_logs", label: "Immutable Audit Logs", icon: <ShieldCheck className="w-4 h-4 text-emerald-600" />, count: auditLogsList?.length ?? null },
  ];



  // 🔒 LIGHT LOGIN VIEW / FIRST TIME PASSWORD RESET VIEW
  if (!isAuthenticated) {
    if (isFirstTimePasswordModal) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-xl shadow-slate-200/60 relative overflow-hidden"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/20 text-white">
                <Key className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Security Setup Required</h2>
              <p className="text-xs text-slate-500 mt-1">
                Your account is currently using an initial temporary password. For security compliance, please set your permanent password to continue.
              </p>
            </div>

            {changePasswordError && (
              <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{changePasswordError}</span>
              </div>
            )}

            <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Account Username</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <Input
                    type="text"
                    disabled
                    value={changePasswordUsername || adminUsername || "Admin"}
                    className="pl-10 bg-slate-100 border-slate-200 text-slate-600 rounded-xl cursor-not-allowed text-xs font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Current / Temporary Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <Input
                    type={showPasswordCurrent ? "text" : "password"}
                    required
                    value={changePasswordCurrent}
                    onChange={(e) => setChangePasswordCurrent(e.target.value)}
                    placeholder="Enter current temporary password"
                    className="pl-10 pr-10 bg-slate-50 border-slate-200 text-slate-900 rounded-xl focus:border-emerald-600 focus:bg-white text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordCurrent(!showPasswordCurrent)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPasswordCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">New Secure Password</label>
                <div className="relative">
                  <Key className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <Input
                    type={showPasswordNew ? "text" : "password"}
                    required
                    value={changePasswordNew}
                    onChange={(e) => setChangePasswordNew(e.target.value)}
                    placeholder="At least 8 characters"
                    className="pl-10 pr-10 bg-slate-50 border-slate-200 text-slate-900 rounded-xl focus:border-emerald-600 focus:bg-white text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordNew(!showPasswordNew)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPasswordNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Confirm New Password</label>
                <div className="relative">
                  <CheckCircle className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <Input
                    type={showPasswordConfirm ? "text" : "password"}
                    required
                    value={changePasswordConfirm}
                    onChange={(e) => setChangePasswordConfirm(e.target.value)}
                    placeholder="Re-type new password"
                    className="pl-10 pr-10 bg-slate-50 border-slate-200 text-slate-900 rounded-xl focus:border-emerald-600 focus:bg-white text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPasswordConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Live Password Rules */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1 text-[11px]">
                <div className={`flex items-center gap-1.5 ${changePasswordNew.length >= 8 ? "text-emerald-700 font-medium" : "text-slate-400"}`}>
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Minimum 8 characters</span>
                </div>
                <div className={`flex items-center gap-1.5 ${changePasswordNew && changePasswordNew === changePasswordConfirm ? "text-emerald-700 font-medium" : "text-slate-400"}`}>
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Passwords match</span>
                </div>
              </div>

              <Button
                type="submit"
                disabled={changePasswordMutation.isPending || changePasswordNew.length < 8 || changePasswordNew !== changePasswordConfirm}
                className="w-full mt-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {changePasswordMutation.isPending ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Save Password & Enter CMS <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>

              <button
                type="button"
                onClick={() => {
                  setIsFirstTimePasswordModal(false);
                  setChangePasswordError("");
                }}
                className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors text-center cursor-pointer"
              >
                ← Back to Login
              </button>
            </form>
          </motion.div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-xl shadow-slate-200/60 relative overflow-hidden"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-600/20 text-white">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">DPSI Admin Portal</h2>
            <p className="text-sm text-slate-500 mt-1">Delhi Public School Indirapuram CMS</p>
          </div>

          {loginError && (
            <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">School / Client Code</label>
                <span className="text-[10px] text-slate-400 font-normal">Optional (e.g. DPSI-60297, GDG-2026)</span>
              </div>
              <div className="relative">
                <Building className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <Input
                  type="text"
                  value={schoolCode}
                  onChange={(e) => setSchoolCode(e.target.value)}
                  placeholder="DPSI-60297"
                  className="pl-10 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus:border-emerald-600 focus:bg-white uppercase font-mono text-xs tracking-wider"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Username</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <Input
                  type="text"
                  required
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  placeholder="Admin"
                  className="pl-10 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus:border-emerald-600 focus:bg-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Password</label>
              <div className="relative">
                <Key className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <Input
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="pl-10 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus:border-emerald-600 focus:bg-white"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={adminLoginMutation.isPending}
              className="w-full mt-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              {adminLoginMutation.isPending ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In to CMS <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">
              Authorized Personnel Only • DPS Indirapuram IT Cell
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // 🔓 LIGHT THEME AUTHENTICATED DASHBOARD
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-16">
      {/* Dedicated Top Header Bar */}
      <div className="border-b border-slate-200 bg-white shadow-sm px-6 py-3 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-700 flex items-center justify-center text-white shadow-sm">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base text-slate-900">{activeTenantName} CMS</h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full">
                Admin: {localStorage.getItem("dpsi_admin_user") || "Admin"}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">Administrative Portal</p>
          </div>
        </div>

        {/* UNIVERSAL OMNISEARCH BAR */}
        <div className="relative flex-1 max-w-md mx-2 min-w-[260px]">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search across all CMS collections... (⌘K)"
              value={globalSearch}
              onChange={(e) => {
                setGlobalSearch(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white text-slate-900 pl-9 pr-8 py-1.5 rounded-xl text-xs placeholder:text-slate-400 outline-none transition-all shadow-xs"
            />
            {globalSearch ? (
              <button
                onClick={() => {
                  setGlobalSearch("");
                  setIsSearchOpen(false);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-slate-400 hover:text-slate-600 cursor-pointer"
                title="Clear Search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <kbd className="hidden sm:inline-block absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[9px] font-mono text-slate-400 bg-slate-200/60 rounded border border-slate-300">
                ⌘K
              </kbd>
            )}
          </div>

          {/* OMNISEARCH RESULTS DROPDOWN */}
          {isSearchOpen && globalSearch.trim().length > 0 && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsSearchOpen(false)}
              />
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 max-h-96 overflow-y-auto p-2 space-y-1">
                <div className="flex items-center justify-between px-3 py-1.5 text-[11px] font-semibold text-slate-400 border-b border-slate-100">
                  <span>Found {searchResults.length} {searchResults.length === 1 ? "result" : "results"}</span>
                  <span className="text-[10px] text-slate-400">Click to jump to module</span>
                </div>

                {searchResults.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No matching records found for "{globalSearch}"
                  </div>
                ) : (
                  searchResults.slice(0, 25).map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setActiveTab(item.tab as TabType);
                        setIsSearchOpen(false);
                      }}
                      className="w-full flex items-start justify-between gap-3 p-2.5 rounded-xl hover:bg-slate-50 text-left transition-colors cursor-pointer border border-transparent hover:border-slate-100 group"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 truncate group-hover:text-emerald-700">
                            {item.title}
                          </span>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                            {item.type}
                          </span>
                        </div>
                        {item.subtitle && (
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            {item.subtitle}
                          </p>
                        )}
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg shrink-0 border border-emerald-100 flex items-center gap-1 group-hover:bg-emerald-100">
                        {item.tabLabel} <ArrowRight className="w-3 h-3" />
                      </span>
                    </button>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors border border-slate-200"
          >
            <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
            <span>View Website</span>
          </a>
          <Button
            onClick={() => {
              refetchStats();
              refetchPages();
              refetchMenus();
              refetchPopups();
              refetchMarquees();
              refetchGallery();
              toast.success("Database synchronized successfully!");
            }}
            variant="outline"
            size="sm"
            className="text-xs border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Sync DB
          </Button>
          <Button
            onClick={() => {
              setChangePasswordUsername(localStorage.getItem("dpsi_admin_user") || "Admin");
              setChangePasswordCurrent("");
              setChangePasswordNew("");
              setChangePasswordConfirm("");
              setChangePasswordError("");
              setIsFirstTimePasswordModal(true);
            }}
            variant="outline"
            size="sm"
            className="text-xs border-amber-200 text-amber-800 bg-amber-50 hover:bg-amber-100 cursor-pointer"
          >
            <Key className="w-3.5 h-3.5 mr-1 text-amber-600" /> Change Password
          </Button>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="text-xs text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 mr-1" /> Logout
          </Button>
        </div>
      </div>


        <div className="max-w-[1750px] w-full mx-auto px-2 sm:px-4 lg:px-6 pt-5">
          <div className="flex flex-col lg:flex-row gap-5 items-start">
            {/* Left Nav Bar - Independent Sticky Scroll */}
            <div className="w-full lg:w-64 bg-white border border-slate-200 rounded-xl p-3 shadow-sm shrink-0 lg:sticky lg:top-[68px] lg:h-[calc(100vh-88px)] lg:overflow-y-auto custom-scrollbar">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 py-2">
                Menu Navigation
              </div>
              <div className="space-y-1">
                {navMenuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as TabType)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === item.id
                        ? "bg-emerald-800 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    {item.count !== null && item.count !== undefined && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          activeTab === item.id
                            ? "bg-emerald-950/50 text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {item.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Main Body Content Panel */}
            <div className="flex-1 w-full min-w-0">
              {/* 1. DASHBOARD */}
              {activeTab === "dashboard" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">System Overview</h2>
                    <p className="text-xs text-slate-500">Live operational metrics & database records</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
                    {[
                      { title: "Manage Page", val: stats?.pages ?? 0, icon: <FileText className="w-4 h-4" />, tab: "pages" },
                      { title: "Gallery WebP", val: stats?.galleryImages ?? 0, icon: <ImageIcon className="w-4 h-4" />, tab: "gallery" },
                      { title: "TC Records", val: stats?.transferCertificates ?? 0, icon: <Award className="w-4 h-4" />, tab: "tc" },
                      { title: "Activity Cards", val: stats?.activities ?? 0, icon: <Activity className="w-4 h-4" />, tab: "activities" },
                      { title: "Active Popups", val: stats?.popups ?? 0, icon: <BellRing className="w-4 h-4" />, tab: "popups" },
                      { title: "Home Sliders", val: stats?.sliders ?? 0, icon: <SlidersHorizontal className="w-4 h-4" />, tab: "sliders" },
                      { title: "Attachments", val: stats?.attachments ?? 0, icon: <Paperclip className="w-4 h-4" />, tab: "attachments" },
                      { title: "MUN Delegates", val: stats?.munRegistrations ?? 0, icon: <Globe2 className="w-4 h-4" />, tab: "mun" },
                    ].map((card, i) => (
                      <Card
                        key={i}
                        onClick={() => setActiveTab(card.tab as TabType)}
                        className="bg-white border-slate-200 hover:border-emerald-500 hover:shadow-md cursor-pointer transition-all group"
                      >
                        <CardContent className="p-4 flex items-center justify-between">
                          <div>
                            <p className="text-xs text-slate-500 group-hover:text-emerald-700 font-medium transition-colors">
                              {card.title}
                            </p>
                            <h3 className="text-2xl font-bold text-slate-900 mt-1">{card.val}</h3>
                          </div>
                          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                            {card.icon}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-white border-slate-200 shadow-sm">
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-600" /> Cloudinary CDN & Auto-WebP Active
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-2 text-xs text-slate-600 space-y-1.5">
                        <p>• All image formats (JPEG, PNG, HEIC) are converted to WebP and delivered from high-speed Cloudinary CDN.</p>
                        <p>• Gallery and TC data are preserved in isolated MongoDB database scopes.</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-white border-slate-200 shadow-sm">
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" /> Secure Admin Session
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-2 text-xs text-slate-600 space-y-1.5">
                        <p>• Logged in as: <strong className="text-slate-900">Admin</strong></p>
                        <p>• SHA-256 salted password hashing enabled on MongoDB cloud.</p>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              )}

              {/* 2. MANAGE PAGES */}
              {activeTab === "pages" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Manage Pages</h2>
                      <p className="text-xs text-slate-500">All Pages • Add Page • Page Trash</p>
                    </div>
                    <Button
                      onClick={() => {
                        setEditingPageId(null);
                        setPageForm({ title: "", slug: "", content: "", category: "General" });
                        setPageModal(true);
                      }}
                      size="sm"
                      className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Page
                    </Button>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3">Page Title</th>
                          <th className="px-4 py-3">Slug</th>
                          <th className="px-4 py-3">Category</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {pagesList?.map((p: any) => (
                          <tr key={p._id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 font-semibold text-slate-900">{p.title}</td>
                            <td className="px-4 py-3 font-mono text-emerald-700">
                              <a
                                href={`/${p.slug.replace(/^\/+/, "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline flex items-center gap-1 inline-flex"
                              >
                                /{p.slug} <ExternalLink className="w-3 h-3 text-slate-400" />
                              </a>
                            </td>
                            <td className="px-4 py-3 text-slate-500">{p.category || "General"}</td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                                Published
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right space-x-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-emerald-700 hover:bg-emerald-50 h-7 px-2"
                                title="View Live Page"
                                onClick={() => window.open(`/${p.slug.replace(/^\/+/, "")}`, "_blank")}
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-slate-600 hover:bg-slate-100 h-7 px-2"
                                title="Edit Page"
                                onClick={() => {
                                  setEditingPageId(p._id);
                                  setPageForm({
                                    title: p.title || "",
                                    slug: p.slug || "",
                                    content: p.content || "",
                                    category: p.category || "General",
                                  });
                                  setPageModal(true);
                                }}
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-600 hover:bg-red-50 h-7 px-2 cursor-pointer"
                                title="Delete Page"
                                disabled={deletePage.isPending}
                                onClick={() => {
                                  const pageId = String(p._id?._id || p._id || p.id || p.slug);
                                  if (confirm(`Are you sure you want to delete "${p.title || 'this page'}"?`)) {
                                    deletePage.mutate({ id: pageId });
                                  }
                                }}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                        {(!pagesList || pagesList.length === 0) && (
                          <tr>
                            <td colSpan={5} className="text-center py-8 text-slate-400">
                              No pages created yet. Click "Add Page" to create one.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {/* 3. IMAGE GALLERY */}
              {activeTab === "gallery" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Image Gallery (Auto-WebP)</h2>
                      <p className="text-xs text-slate-500">Cloudinary CDN Storage • Add Images • All Images</p>
                    </div>
                    <Button onClick={() => setGalleryModal(true)} size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs shadow-sm">
                      <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Images
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                    {galleryImages?.map((img: any) => {
                      const imageId = String(img._id || img.id);
                      return (
                        <div key={imageId} className="relative group rounded-xl overflow-hidden border border-slate-200 bg-white aspect-square shadow-sm">
                          <img src={img.imageUrl} alt={img.title} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2.5 flex flex-col justify-between pointer-events-none">
                            <span className="self-start px-1.5 py-0.5 rounded bg-emerald-500 text-[9px] font-bold text-black uppercase shadow-xs">
                              WebP
                            </span>
                            <div>
                              <p className="text-white text-xs font-semibold">{img.title}</p>
                              <p className="text-slate-300 text-[10px]">{img.category}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            title="Delete photo"
                            disabled={deleteGalleryImage.isPending}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (confirm(`Are you sure you want to delete "${img.title || 'this image'}"?`)) {
                                deleteGalleryImage.mutate({ id: imageId });
                              }
                            }}
                            className="absolute top-2 right-2 z-20 p-1.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white rounded-lg shadow-md cursor-pointer transition-all duration-200 opacity-90 group-hover:opacity-100"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                    {(!galleryImages || galleryImages.length === 0) && (
                      <div className="col-span-full text-center py-10 border border-dashed border-slate-300 rounded-xl text-slate-400 text-xs bg-white">
                        No gallery images yet. Upload any JPEG or PNG to auto-convert to WebP.
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* 4. TC (TRANSFER CERTIFICATE) */}
              {activeTab === "tc" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Transfer Certificate (TC) Portal</h2>
                      <p className="text-xs text-slate-500">Add TC • TC List • Trash TC (Database: `dpsi_tc`)</p>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <div className="relative flex-1 sm:w-60">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                        <Input
                          placeholder="Search Adm No / Name..."
                          value={tcSearch}
                          onChange={(e) => setTcSearch(e.target.value)}
                          className="pl-8 bg-white border-slate-200 text-slate-900 text-xs h-8"
                        />
                      </div>
                      <Button
                        onClick={() => { setBulkCsvText(""); setBulkPreviewRows([]); setBulkTcModal(true); }}
                        size="sm"
                        variant="outline"
                        className="border-slate-300 text-slate-700 text-xs h-8"
                      >
                        <Download className="w-3.5 h-3.5 mr-1" /> Bulk Import
                      </Button>
                      <Button onClick={() => setTcModal(true)} size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs h-8 shadow-sm">
                        <Plus className="w-3.5 h-3.5 mr-1" /> Add TC
                      </Button>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3">Adm No.</th>
                          <th className="px-4 py-3">Student Name</th>
                          <th className="px-4 py-3">Father's Name</th>
                          <th className="px-4 py-3">Class Leaving</th>
                          <th className="px-4 py-3">Date of Issue</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">Document</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {tcList?.map((tc: any) => (
                          <tr key={tc._id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 font-mono font-bold text-emerald-700">{tc.admissionNumber}</td>
                            <td className="px-4 py-3 font-medium text-slate-900">{tc.studentName}</td>
                            <td className="px-4 py-3 text-slate-600">{tc.fatherName}</td>
                            <td className="px-4 py-3 text-slate-500">{tc.classLeaving}</td>
                            <td className="px-4 py-3 text-slate-500">{safeFormatDate(tc.dateOfIssue)}</td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                                {tc.status}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              {tc.certificatePdfUrl ? (
                                <a
                                  href={tc.certificatePdfUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 text-[11px] font-medium transition-colors"
                                >
                                  <FileText className="w-3 h-3 text-emerald-600" />
                                  <span>View TC</span>
                                  <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                                </a>
                              ) : (
                                <span className="text-slate-400 text-[11px] italic">No file</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-600 hover:bg-red-50 h-7 px-2 cursor-pointer"
                                disabled={deleteTc.isPending}
                                title="Delete TC"
                                onClick={() => {
                                  const tcId = String(tc._id || tc.id);
                                  if (confirm(`Are you sure you want to delete TC for "${tc.studentName || tc.admissionNumber}"?`)) {
                                    deleteTc.mutate({ id: tcId });
                                  }
                                }}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                        {(!tcList || tcList.length === 0) && (
                          <tr>
                            <td colSpan={7} className="text-center py-8 text-slate-400">
                              No TC records found. Click "Add TC" to create a new record.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {/* 5. POPUP */}
              {activeTab === "popups" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Popup Notification</h2>
                      <p className="text-xs text-slate-500">Customizable website modal alert with image & CTA</p>
                    </div>
                    <Button
                      onClick={() => {
                        setEditingPopup(null);
                        setPopupForm({
                          title: "",
                          content: "",
                          imageUrl: "",
                          linkUrl: "",
                          badgeText: "Official Notice",
                          buttonText: "Learn More",
                        });
                        setPopupModal(true);
                      }}
                      size="sm"
                      className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs shadow-sm cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add Popup
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {popupsList?.map((p: any) => (
                      <Card key={String(p._id || p.id)} className="bg-white border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
                        <div>
                          {p.imageUrl && (
                            <div className="w-full h-36 bg-slate-50 border-b border-slate-100 overflow-hidden flex items-center justify-center">
                              <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover" />
                            </div>
                          )}
                          <CardContent className="p-4 space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                {p.badgeText || "Official Notice"}
                              </span>
                              <span
                                className={`px-2 py-0.5 text-[9px] rounded font-medium ${
                                  p.isActive ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {p.isActive ? "Active" : "Disabled"}
                              </span>
                            </div>
                            <h3 className="font-semibold text-slate-900 text-sm leading-snug">{p.title}</h3>
                            <p className="text-xs text-slate-500 line-clamp-3">{p.content || "No description"}</p>
                            {p.linkUrl && (
                              <div className="text-[11px] text-emerald-700 font-mono flex items-center gap-1 pt-1 truncate">
                                <ExternalLink className="w-3 h-3 shrink-0" />
                                <span className="truncate">{p.buttonText || "Button"}: {p.linkUrl}</span>
                              </div>
                            )}
                          </CardContent>
                        </div>
                        <div className="p-4 pt-0 flex items-center justify-between border-t border-slate-100 mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-slate-200 text-[10px] h-7 px-2 cursor-pointer"
                            disabled={togglePopup.isPending}
                            onClick={() => togglePopup.mutate({ id: String(p._id || p.id), isActive: !p.isActive })}
                          >
                            {p.isActive ? "Disable" : "Enable"}
                          </Button>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-slate-600 hover:bg-slate-100 h-7 px-2 cursor-pointer"
                              title="Edit Popup"
                              onClick={() => {
                                setEditingPopup(p._id ? String(p._id) : p.id);
                                setPopupForm({
                                  title: p.title || "",
                                  content: p.content || "",
                                  imageUrl: p.imageUrl || "",
                                  linkUrl: p.linkUrl || "",
                                  badgeText: p.badgeText || "Official Notice",
                                  buttonText: p.buttonText || "Learn More",
                                });
                                setPopupModal(true);
                              }}
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:bg-red-50 h-7 px-2 cursor-pointer"
                              disabled={deletePopup.isPending}
                              title="Delete Popup"
                              onClick={() => {
                                const popupId = String(p._id || p.id);
                                if (confirm(`Are you sure you want to delete modal banner "${p.title || 'this popup'}"?`)) {
                                  deletePopup.mutate({ id: popupId });
                                }
                              }}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                    {(!popupsList || popupsList.length === 0) && (
                      <div className="col-span-full text-center py-8 text-slate-400 text-xs bg-white rounded-xl border border-slate-200">
                        No popups created. Click "Add Popup" to create an announcement notice.
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* 6. MARQUEE */}
              {activeTab === "marquee" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Marquee Ticker & Announcements</h2>
                      <p className="text-xs text-slate-500">Live Website Ticker • Custom Colors • Speed & Links</p>
                    </div>
                    <Button
                      onClick={() => {
                        setEditingMarquee(null);
                        setMarqueeForm({
                          text: "",
                          linkUrl: "",
                          speed: 50,
                          textColor: "#ffffff",
                          bgColor: "#047857",
                          badgeText: "Announcement",
                          isTransparent: false,
                          shape: "rectangle",
                          borderRadius: "none",
                        });
                        setMarqueeModal(true);
                      }}
                      size="sm"
                      className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add Marquee
                    </Button>
                  </div>

                  {/* Live Marquee Preview Simulator */}
                  {marqueesList && marqueesList.filter((m: any) => m.isActive !== false).length > 0 && (
                    <div className="bg-slate-900 rounded-xl p-3 text-white border border-slate-800 shadow-sm overflow-hidden">
                      <div className="flex items-center gap-2 mb-1.5 text-[10px] uppercase font-bold text-slate-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Live Marquee Simulator Preview</span>
                      </div>
                      <div className="overflow-hidden whitespace-nowrap py-1 bg-black/40 rounded-lg px-3 flex items-center gap-6">
                        {marqueesList
                          .filter((m: any) => m.isActive !== false)
                          .map((m: any) => (
                            <span
                              key={m._id}
                              className={`inline-flex items-center gap-2 text-xs font-semibold px-2.5 py-1 transition-all shrink-0 ${
                                m.borderRadius === "full" || m.shape === "pill"
                                  ? "rounded-full"
                                  : m.borderRadius === "xl"
                                  ? "rounded-xl"
                                  : m.borderRadius === "md"
                                  ? "rounded-lg"
                                  : "rounded-none"
                              }`}
                              style={{
                                backgroundColor: m.isTransparent ? "transparent" : m.bgColor || "#047857",
                                color: m.textColor || (m.isTransparent ? "#0f172a" : "#ffffff"),
                                border: m.isTransparent ? "1px solid rgba(255,255,255,0.25)" : "none",
                              }}
                            >
                              <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 bg-black/25 ${
                                m.borderRadius === "none" ? "rounded-none" : "rounded"
                              }`}>
                                {m.badgeText || "Notice"}
                              </span>
                              <span>{m.text}</span>
                            </span>
                          ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    {marqueesList?.map((m: any) => (
                      <Card key={m._id} className="bg-white border-slate-200 shadow-sm hover:border-slate-300 transition-all">
                        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                            {/* Color Visual Badge Indicator */}
                            <div
                              className={`w-8 h-8 shrink-0 flex items-center justify-center shadow-xs border border-black/10 ${
                                m.borderRadius === "full" || m.shape === "pill"
                                  ? "rounded-full"
                                  : m.borderRadius === "xl"
                                  ? "rounded-xl"
                                  : m.borderRadius === "md"
                                  ? "rounded-lg"
                                  : "rounded-none"
                              }`}
                              style={{
                                backgroundColor: m.isTransparent ? "transparent" : m.bgColor || "#047857",
                                color: m.textColor || (m.isTransparent ? "#0f172a" : "#ffffff"),
                              }}
                              title={`Background: ${m.isTransparent ? "Transparent" : m.bgColor || "#047857"} | Text: ${m.textColor || "#ffffff"}`}
                            >
                              <Megaphone className="w-4 h-4" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span
                                  className={`text-[10px] font-bold uppercase px-2 py-0.5 shadow-2xs ${
                                    m.borderRadius === "full" || m.shape === "pill"
                                      ? "rounded-full"
                                      : m.borderRadius === "xl"
                                      ? "rounded-xl"
                                      : m.borderRadius === "md"
                                      ? "rounded-lg"
                                      : "rounded-none"
                                  }`}
                                  style={{
                                    backgroundColor: m.isTransparent ? "rgba(0,0,0,0.06)" : m.bgColor || "#047857",
                                    color: m.textColor || (m.isTransparent ? "#0f172a" : "#ffffff"),
                                    border: m.isTransparent ? "1px solid rgba(0,0,0,0.15)" : "none",
                                  }}
                                >
                                  {m.badgeText || "Announcement"}
                                </span>
                                <span
                                  className={`px-2 py-0.5 text-[9px] rounded font-medium ${
                                    m.isActive !== false
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                      : "bg-slate-100 text-slate-500"
                                  }`}
                                >
                                  {m.isActive !== false ? "Live Active" : "Disabled"}
                                </span>
                                <span className="px-2 py-0.5 text-[9px] rounded font-medium bg-slate-100 text-slate-700 border border-slate-200">
                                  {m.isTransparent ? "Transparent Glass" : "Solid Color"}
                                </span>
                                <span className="px-2 py-0.5 text-[9px] rounded font-medium bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                                  Shape: {m.borderRadius === "full" ? "Pill" : m.borderRadius === "xl" ? "Large Curve" : m.borderRadius === "md" ? "Soft Curve" : "Rectangle"}
                                </span>
                                {m.linkUrl && (
                                  <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1 truncate">
                                    <ExternalLink className="w-3 h-3 text-emerald-600" />
                                    {m.linkUrl}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-900 font-medium mt-1 leading-snug">{m.text}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                            {/* Color Swatch Indicators */}
                            <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-slate-50 rounded-lg border border-slate-200 text-[10px] text-slate-500 font-mono mr-1">
                              <span
                                className="w-3 h-3 rounded-full border border-black/20"
                                style={{ backgroundColor: m.bgColor || "#047857" }}
                                title={`Background: ${m.bgColor || "#047857"}`}
                              />
                              <span
                                className="w-3 h-3 rounded-full border border-black/20"
                                style={{ backgroundColor: m.textColor || "#10b981" }}
                                title={`Text: ${m.textColor || "#10b981"}`}
                              />
                            </div>

                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-slate-600 hover:bg-slate-100 h-8 px-2.5 text-xs"
                              title="Edit Marquee & Colors"
                              onClick={() => {
                                setEditingMarquee(m._id);
                                setMarqueeForm({
                                  text: m.text || "",
                                  linkUrl: m.linkUrl || "",
                                  speed: m.speed || 50,
                                  textColor: m.textColor || "#10b981",
                                  bgColor: m.bgColor || "#047857",
                                  badgeText: m.badgeText || "Notice",
                                  isTransparent: !!m.isTransparent,
                                  shape: (m.shape || "rectangle") as "rectangle" | "rounded" | "pill",
                                  borderRadius: (m.borderRadius || "none") as "none" | "md" | "xl" | "full",
                                });
                                setMarqueeModal(true);
                              }}
                            >
                              <Edit className="w-3.5 h-3.5 mr-1 text-emerald-700" /> Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:bg-red-50 h-8 px-2 cursor-pointer"
                              title="Delete Marquee"
                              disabled={deleteMarquee.isPending}
                              onClick={() => {
                                const mId = String(m._id || m.id);
                                if (confirm(`Are you sure you want to delete this marquee notice?`)) {
                                  deleteMarquee.mutate({ id: mId });
                                }
                              }}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {(!marqueesList || marqueesList.length === 0) && (
                      <div className="text-center py-10 text-slate-400 text-xs bg-white rounded-xl border border-slate-200">
                        No marquee announcements created yet. Click "Add Marquee" to create one with custom colors.
                      </div>
                    )}
                  </div>
                </motion.div>
              )}


              {/* 7. RECENT ACTIVITY */}
              {activeTab === "activities" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Recent Activity</h2>
                      <p className="text-xs text-slate-500">Manage Category • Add Recent Activity • Recent Activity List</p>
                    </div>
                    <Button
                      onClick={() => {
                        setEditingActivity(null);
                        setActivityForm({ title: "", category: "Sports", description: "", eventDate: "", imageUrl: "" });
                        setActivityModal(true);
                      }}
                      size="sm"
                      className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs shadow-sm cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add Activity
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {activitiesList?.map((act: any) => (
                      <Card key={String(act._id || act.id)} className="bg-white border-slate-200 shadow-sm overflow-hidden">
                        {act.imageUrl && (
                          <div className="h-36 w-full overflow-hidden bg-slate-100">
                            <img src={act.imageUrl} alt={act.title} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <CardContent className="p-3.5 flex items-start justify-between">
                          <div>
                            <span className="px-2 py-0.5 rounded text-[9px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {act.category}
                            </span>
                            <h3 className="font-semibold text-slate-900 text-xs mt-1.5">{act.title}</h3>
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{act.description}</p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-slate-600 hover:bg-slate-100 h-7 px-2 cursor-pointer"
                              title="Edit Activity"
                              onClick={() => {
                                setEditingActivity(act._id ? String(act._id) : act.id);
                                setActivityForm({
                                  title: act.title || "",
                                  category: act.category || "General",
                                  description: act.description || "",
                                  eventDate: safeIsoDate(act.eventDate),
                                  imageUrl: act.imageUrl || "",
                                });
                                setActivityModal(true);
                              }}
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:bg-red-50 h-7 px-2 cursor-pointer"
                              disabled={deleteActivity.isPending}
                              title="Delete Activity"
                              onClick={() => {
                                const actId = String(act._id || act.id);
                                if (confirm(`Are you sure you want to delete "${act.title || 'this activity'}"?`)) {
                                  deleteActivity.mutate({ id: actId });
                                }
                              }}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* 8. ATTACHMENT */}
              {activeTab === "attachments" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Attachment / Circulars</h2>
                      <p className="text-xs text-slate-500">Add Attachment • Attachment List</p>
                    </div>
                    <Button
                      onClick={() => {
                        setEditingAttachment(null);
                        setAttachmentForm({ title: "", category: "Circulars", fileUrl: "", fileName: "" });
                        setAttachmentModal(true);
                      }}
                      size="sm"
                      className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs shadow-sm cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add Attachment
                    </Button>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3">Title</th>
                          <th className="px-4 py-3">Category</th>
                          <th className="px-4 py-3">File Name</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {attachmentsList?.map((att: any) => (
                          <tr key={String(att._id || att.id)} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 font-medium text-slate-900 flex items-center gap-2">
                              <Paperclip className="w-3.5 h-3.5 text-emerald-700" />
                              {att.title}
                            </td>
                            <td className="px-4 py-3 text-slate-500">{att.category}</td>
                            <td className="px-4 py-3 font-mono text-slate-600">{att.fileName}</td>
                            <td className="px-4 py-3 text-right space-x-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-slate-600 hover:bg-slate-100 h-7 px-2 cursor-pointer"
                                title="Edit Attachment"
                                onClick={() => {
                                  setEditingAttachment(att._id ? String(att._id) : att.id);
                                  setAttachmentForm({
                                    title: att.title || "",
                                    category: att.category || "Circulars",
                                    fileUrl: att.fileUrl || "",
                                    fileName: att.fileName || "",
                                  });
                                  setAttachmentModal(true);
                                }}
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-600 hover:bg-red-50 h-7 px-2 cursor-pointer"
                                disabled={deleteAttachment.isPending}
                                title="Delete Attachment"
                                onClick={() => {
                                  const attId = String(att._id || att.id);
                                  if (confirm(`Are you sure you want to delete "${att.title || 'this circular'}"?`)) {
                                    deleteAttachment.mutate({ id: attId });
                                  }
                                }}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {/* 9. MUN REGISTRATIONS */}
              {activeTab === "mun" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">MUN Registration</h2>
                    <p className="text-xs text-slate-500">Registration List</p>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3">Delegate</th>
                          <th className="px-4 py-3">School / Grade</th>
                          <th className="px-4 py-3">Committee Pref</th>
                          <th className="px-4 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {munList?.map((m: any) => (
                          <tr key={m._id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3">
                              <p className="font-medium text-slate-900">{m.studentName}</p>
                              <p className="text-[10px] text-slate-500">{m.email} | {m.phone}</p>
                            </td>
                            <td className="px-4 py-3 text-slate-700">{m.schoolName}<br /><span className="text-slate-500">{m.grade}</span></td>
                            <td className="px-4 py-3 text-slate-700 font-mono">{m.committeePreference1}</td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-0.5 rounded text-[10px] bg-amber-50 text-amber-800 border border-amber-200 font-medium">
                                {m.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {(!munList || munList.length === 0) && (
                          <tr>
                            <td colSpan={4} className="text-center py-8 text-slate-400">No registrations yet.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {/* 10. HOME SLIDERS */}
              {activeTab === "sliders" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Hero Banners & Sliders</h2>
                      <p className="text-xs text-slate-500">Live Homepage Slider Images & Direct Videos • Order & Captions</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <Input
                          placeholder="Filter sliders..."
                          value={tabSearch}
                          onChange={(e) => setTabSearch(e.target.value)}
                          className="bg-white border-slate-200 text-xs pl-8 pr-7 h-8 w-44 sm:w-56"
                        />
                        {tabSearch && (
                          <button
                            onClick={() => setTabSearch("")}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <Button
                        onClick={() => {
                          setEditingSlider(null);
                          setSliderForm({
                            title: "",
                            subtitle: "",
                            imageUrl: "",
                            videoUrl: "",
                            mobileVideoUrl: "",
                            useSeparateMobileVideo: false,
                            mediaType: "image",
                            buttonText: "Apply Now",
                            buttonLink: "/admissions",
                            order: (slidersList?.length || 0) + 1,
                          });
                          setSliderModal(true);
                        }}
                        size="sm"
                        className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs shadow-sm cursor-pointer h-8"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" /> Add Slider
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {slidersList
                      ?.filter((s: any) =>
                        !tabSearch ||
                        s.title?.toLowerCase().includes(tabSearch.toLowerCase()) ||
                        s.subtitle?.toLowerCase().includes(tabSearch.toLowerCase()) ||
                        s.mediaType?.toLowerCase().includes(tabSearch.toLowerCase()) ||
                        s.buttonText?.toLowerCase().includes(tabSearch.toLowerCase())
                      )
                      .map((s: any) => (
                      <Card key={s._id} className="bg-white border-slate-200 shadow-sm overflow-hidden">
                        <div className="h-44 w-full overflow-hidden bg-slate-900 relative">
                          {s.mediaType === "video" || s.videoUrl ? (
                            <video src={s.videoUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                          ) : (
                            <img src={s.imageUrl} alt={s.title} className="w-full h-full object-cover" />
                          )}
                          <div className="absolute top-2 left-2 flex items-center gap-1.5 flex-wrap">
                            <span className="px-2 py-0.5 bg-black/60 rounded text-[10px] text-white font-mono">
                              Order: {s.order}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${s.mediaType === "video" || s.videoUrl ? "bg-purple-600" : "bg-sky-600"}`}>
                              {s.mediaType === "video" || s.videoUrl ? "Video" : "Image"}
                            </span>
                            {(s.mediaType === "video" || s.videoUrl) && (
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-xs ${
                                s.useSeparateMobileVideo && s.mobileVideoUrl
                                  ? "bg-emerald-600"
                                  : "bg-indigo-600"
                              }`}>
                                {s.useSeparateMobileVideo && s.mobileVideoUrl
                                  ? "📱 Dedicated Mobile"
                                  : "📱 Auto-Adapted (9:16)"}
                              </span>
                            )}
                          </div>
                        </div>
                        <CardContent className="p-4 flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-slate-900 text-sm">{s.title}</h3>
                            {s.subtitle && <p className="text-xs text-slate-500 mt-0.5">{s.subtitle}</p>}
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-[10px] px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 font-medium">
                                Button: {s.buttonText || "Apply Now"} ({s.buttonLink || "/"})
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-slate-600 hover:bg-slate-100 h-8 px-2 cursor-pointer"
                              title="Edit Slider"
                              onClick={() => {
                                setEditingSlider(s._id);
                                setSliderForm({
                                  title: s.title || "",
                                  subtitle: s.subtitle || "",
                                  imageUrl: s.imageUrl || "",
                                  videoUrl: s.videoUrl || "",
                                  mobileVideoUrl: s.mobileVideoUrl || "",
                                  useSeparateMobileVideo: Boolean(s.useSeparateMobileVideo),
                                  mediaType: (s.mediaType || (s.videoUrl ? "video" : "image")) as "image" | "video",
                                  buttonText: s.buttonText || "Apply Now",
                                  buttonLink: s.buttonLink || "/admissions",
                                  order: s.order || 0,
                                });
                                setSliderModal(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:bg-red-50 h-8 px-2 cursor-pointer"
                              title="Delete Slider"
                              onClick={() => deleteSlider.mutate({ id: s._id })}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {(!slidersList || slidersList.length === 0) && (
                      <div className="col-span-full text-center py-10 bg-white border border-dashed border-slate-300 rounded-2xl text-slate-400 text-xs">
                        No custom sliders created yet. Currently displaying default hero slides. Click "Add Slider" to customize the homepage banner!
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* 11. VIDEO GALLERY */}
              {activeTab === "videos" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Video Gallery</h2>
                      <p className="text-xs text-slate-500">YouTube Embeds — Managed from Admin Portal</p>
                    </div>
                    <Button onClick={() => { setEditingVideoId(null); setVideoForm({ title: "", category: "Events", youtubeUrl: "", thumbnailUrl: "" }); setVideoModal(true); }} size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs">
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add Video
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {videoList?.map((v: any) => (
                      <Card key={v._id} className="bg-white border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
                        <div>
                          <div className="h-40 w-full overflow-hidden bg-slate-900 relative">
                            {v.thumbnailUrl ? (
                              <img src={v.thumbnailUrl} alt={v.title} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-800 text-xs">No Thumbnail</div>
                            )}
                            <div className="absolute top-2 left-2 px-2 py-0.5 bg-red-600 rounded text-[10px] text-white font-bold">
                              {v.category || "Events"}
                            </div>
                          </div>
                          <div className="p-4">
                            <h3 className="font-bold text-slate-900 text-xs line-clamp-2">{v.title}</h3>
                            <p className="font-mono text-[10px] text-slate-400 mt-1 truncate">{v.youtubeUrl || v.videoUrl}</p>
                          </div>
                        </div>
                        <div className="p-4 pt-0 flex justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-slate-600 hover:bg-slate-100 h-7 px-2"
                            onClick={() => {
                              setEditingVideoId(v._id ? String(v._id) : v.id);
                              setVideoForm({
                                title: v.title || "",
                                category: v.category || "Events",
                                youtubeUrl: v.youtubeUrl || v.videoUrl || "",
                                thumbnailUrl: v.thumbnailUrl || "",
                              });
                              setVideoModal(true);
                            }}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:bg-red-50 h-7 px-2 cursor-pointer"
                            disabled={deleteVideo.isPending}
                            title="Delete Video"
                            onClick={() => {
                              const videoId = String(v._id || v.id);
                              if (confirm(`Are you sure you want to delete "${v.title || 'this video'}"?`)) {
                                deleteVideo.mutate({ id: videoId });
                              }
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                    {(!videoList || videoList.length === 0) && (
                      <div className="col-span-full text-center py-10 bg-white border border-dashed border-slate-300 rounded-lg text-slate-400 text-xs">
                        No videos added yet. Click "Add Video" to add a YouTube video.
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* --- 10. ACADEMIC TOPPERS / ACHIEVEMENTS --- */}
              {activeTab === "achievements" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Academic Toppers & Achievements</h2>
                      <p className="text-xs text-slate-500">Add Toppers • Manage Board Results • Academic Showcase</p>
                    </div>
                    <Button
                      onClick={() => {
                        setEditingAchievementId(null);
                        setAchievementForm({
                          studentName: "",
                          className: "Class X",
                          score: "99.2%",
                          exam: "CBSE Board Examination",
                          stream: "",
                          rank: "School Topper",
                          year: "2025-26",
                          imageUrl: "",
                          featured: true,
                          order: 0,
                        });
                        setAchievementModal(true);
                      }}
                      size="sm"
                      className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add Topper
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {achievementsList?.map((ach: any) => (
                      <Card key={String(ach._id || ach.id)} className="bg-white border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
                        <div>
                          <div className="h-44 w-full overflow-hidden bg-slate-900 relative">
                            {ach.imageUrl ? (
                              <img src={ach.imageUrl} alt={ach.studentName} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-800 text-xs">No Photo</div>
                            )}
                            <div className="absolute top-2 right-2 px-2 py-0.5 bg-amber-400 text-slate-950 font-black rounded text-[11px]">
                              {ach.score}
                            </div>
                            <div className="absolute top-2 left-2 px-2 py-0.5 bg-emerald-700 text-white font-bold rounded text-[10px]">
                              {ach.className} {ach.stream ? `• ${ach.stream}` : ""}
                            </div>
                          </div>
                          <div className="p-4">
                            <h3 className="font-bold text-slate-900 text-sm">{ach.studentName}</h3>
                            <p className="text-xs text-emerald-600 font-semibold mt-0.5">{ach.rank || ach.exam}</p>
                            <p className="text-[11px] text-slate-500 mt-1">Academic Year: {ach.year || "2025-26"}</p>
                          </div>
                        </div>
                        <div className="p-4 pt-0 flex justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-slate-600 hover:bg-slate-100 h-7 px-2 cursor-pointer"
                            onClick={() => {
                              setEditingAchievementId(ach._id ? String(ach._id) : ach.id);
                              setAchievementForm({
                                studentName: ach.studentName,
                                className: ach.className || "Class X",
                                score: ach.score || "",
                                exam: ach.exam || "CBSE Board Examination",
                                stream: ach.stream || "",
                                rank: ach.rank || "",
                                year: ach.year || "2025-26",
                                imageUrl: ach.imageUrl || "",
                                featured: ach.featured !== false,
                                order: ach.order || 0,
                              });
                              setAchievementModal(true);
                            }}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:bg-red-50 h-7 px-2 cursor-pointer"
                            disabled={deleteAchievement.isPending}
                            title="Delete Topper"
                            onClick={() => {
                              const achId = String(ach._id || ach.id);
                              if (confirm(`Are you sure you want to delete topper record "${ach.studentName || 'this record'}"?`)) {
                                deleteAchievement.mutate({ id: achId });
                              }
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                    {(!achievementsList || achievementsList.length === 0) && (
                      <div className="col-span-full text-center py-10 bg-white border border-dashed border-slate-300 rounded-lg text-slate-400 text-xs">
                        No toppers added yet. Click "Add Topper" to add one.
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* --- 11. TESTIMONIALS --- */}
              {activeTab === "testimonials" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Parent & Student Testimonials</h2>
                      <p className="text-xs text-slate-500">Manage real parent reviews, roles, ratings, and quotes displayed on the website</p>
                    </div>
                    <Button
                      onClick={() => {
                        setEditingTestimonialId(null);
                        setTestimonialForm({
                          name: "",
                          role: "Parent",
                          content: "",
                          avatarUrl: "",
                          rating: 5,
                          featured: true,
                          order: 0,
                        });
                        setTestimonialModal(true);
                      }}
                      size="sm"
                      className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add Testimonial
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {testimonialsList?.map((t: any) => (
                      <Card key={String(t._id || t.id)} className="bg-white border-slate-200 shadow-sm p-4 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-11 h-11 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                              {t.avatarUrl ? (
                                <img src={t.avatarUrl} alt={t.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center font-bold text-slate-400 text-sm">
                                  {t.name?.charAt(0) || "U"}
                                </div>
                              )}
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-900 text-xs">{t.name}</h3>
                              <p className="text-[11px] text-emerald-600 font-semibold">{t.role}</p>
                            </div>
                          </div>
                          <p className="text-xs text-slate-600 italic line-clamp-4 leading-relaxed mb-3">"{t.content}"</p>
                          <div className="text-amber-400 text-xs font-bold">{"★".repeat(t.rating || 5)}</div>
                        </div>
                        <div className="pt-3 border-t border-slate-100 flex justify-end gap-1 mt-3">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-slate-600 hover:bg-slate-100 h-7 px-2 cursor-pointer"
                            onClick={() => {
                              setEditingTestimonialId(t._id ? String(t._id) : t.id);
                              setTestimonialForm({
                                name: t.name,
                                role: t.role || "",
                                content: t.content || "",
                                avatarUrl: t.avatarUrl || "",
                                rating: t.rating || 5,
                                featured: t.featured !== false,
                                order: t.order || 0,
                              });
                              setTestimonialModal(true);
                            }}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:bg-red-50 h-7 px-2 cursor-pointer"
                            disabled={deleteTestimonial.isPending}
                            title="Delete Testimonial"
                            onClick={() => {
                              const tId = String(t._id || t.id);
                              if (confirm(`Are you sure you want to delete testimonial from "${t.name || 'this user'}"?`)) {
                                deleteTestimonial.mutate({ id: tId });
                              }
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                    {(!testimonialsList || testimonialsList.length === 0) && (
                      <div className="col-span-full text-center py-10 bg-white border border-dashed border-slate-300 rounded-lg text-slate-400 text-xs">
                        No testimonials added yet. Click "Add Testimonial" to add one.
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* --- 12. LEADERSHIP & FACULTY --- */}
              {activeTab === "leadership" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Leadership & Management</h2>
                      <p className="text-xs text-slate-500">Manage Chairman, Vice Chairperson, Principal, and senior administration</p>
                    </div>
                    <Button
                      onClick={() => {
                        setEditingLeadershipId(null);
                        setLeadershipForm({
                          name: "",
                          role: "",
                          designation: "",
                          bio: "",
                          imageUrl: "",
                          category: "Management",
                          order: 0,
                        });
                        setLeadershipModal(true);
                      }}
                      size="sm"
                      className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add Leader
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {leadershipList?.map((l: any) => (
                      <Card key={String(l._id || l.id)} className="bg-white border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
                        <div>
                          <div className="h-48 w-full overflow-hidden bg-slate-900 relative group">
                            {l.imageUrl ? (
                              <img src={l.imageUrl} alt={l.name} className="w-full h-full object-cover object-top" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-800 text-xs">No Photo</div>
                            )}
                            <div className="absolute top-2 left-2 px-2 py-0.5 bg-emerald-700 text-white font-bold rounded text-[10px]">
                              {l.category || "Management"}
                            </div>
                            <label className="absolute bottom-2 right-2 cursor-pointer bg-slate-900/85 hover:bg-slate-900 text-white text-[11px] font-medium px-2.5 py-1.5 rounded-lg shadow-lg backdrop-blur-sm flex items-center gap-1.5 transition-all hover:scale-105">
                              <Camera className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Change Photo</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const leadId = String(l._id || l.id);
                                    handleMediaUpload(file, (url) => {
                                      updateLeadership.mutate({ id: leadId, imageUrl: url });
                                    });
                                  }
                                }}
                              />
                            </label>
                          </div>
                          <div className="p-4">
                            <h3 className="font-bold text-slate-900 text-sm">{l.name}</h3>
                            <p className="text-xs text-emerald-600 font-semibold mt-0.5">{l.role}</p>
                            {l.bio && <p className="text-xs text-slate-500 mt-2 line-clamp-3">{l.bio}</p>}
                          </div>
                        </div>
                        <div className="p-4 pt-0 flex justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-slate-600 hover:bg-slate-100 h-7 px-2 cursor-pointer"
                            onClick={() => {
                              setEditingLeadershipId(l._id ? String(l._id) : l.id);
                              setLeadershipForm({
                                name: l.name,
                                role: l.role || "",
                                designation: l.designation || "",
                                bio: l.bio || "",
                                imageUrl: l.imageUrl || "",
                                category: l.category || "Management",
                                order: l.order || 0,
                              });
                              setLeadershipModal(true);
                            }}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:bg-red-50 h-7 px-2 cursor-pointer"
                            disabled={deleteLeadership.isPending}
                            title="Delete Leader"
                            onClick={() => {
                              const lId = String(l._id || l.id);
                              if (confirm(`Are you sure you want to delete profile for "${l.name || 'this member'}"?`)) {
                                deleteLeadership.mutate({ id: lId });
                              }
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                    {(!leadershipList || leadershipList.length === 0) && (
                      <div className="col-span-full text-center py-10 bg-white border border-dashed border-slate-300 rounded-lg text-slate-400 text-xs">
                        No leadership profiles added yet. Click "Add Leader" to add one.
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* --- 13. CAMPUS FACILITIES --- */}
              {activeTab === "facilities" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Campus Facilities & Infrastructure</h2>
                      <p className="text-xs text-slate-500">Manage Labs, Classrooms, Sports Complex, Library, and Studios</p>
                    </div>
                    <Button
                      onClick={() => {
                        setEditingFacilityId(null);
                        setFacilityForm({
                          title: "",
                          category: "Campus",
                          description: "",
                          icon: "Microscope",
                          imageUrl: "",
                          geometry: "torusKnot",
                          color: "#10b981",
                          accent: "#34d399",
                          order: 0,
                        });
                        setFacilityModal(true);
                      }}
                      size="sm"
                      className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add Facility
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {facilitiesList?.map((f: any) => (
                      <Card key={String(f._id || f.id)} className="bg-white border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
                        <div>
                          <div className="h-44 w-full overflow-hidden bg-slate-900 relative">
                            {f.imageUrl ? (
                              <img src={f.imageUrl} alt={f.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-800 text-xs">No Photo</div>
                            )}
                            <div className="absolute top-2 left-2 px-2 py-0.5 bg-emerald-700 text-white font-bold rounded text-[10px]">
                              {f.category || "Campus"}
                            </div>
                            {f.geometry && (
                              <div className="absolute top-2 right-2 px-2 py-0.5 bg-slate-950/80 border border-emerald-400/40 text-emerald-300 font-mono text-[10px] rounded">
                                3D: {f.geometry}
                              </div>
                            )}
                          </div>
                          <div className="p-4">
                            <h3 className="font-bold text-slate-900 text-sm">{f.title}</h3>
                            <p className="text-xs text-slate-500 mt-1 line-clamp-3 leading-relaxed">{f.description}</p>
                          </div>
                        </div>
                        <div className="p-4 pt-0 flex justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-slate-600 hover:bg-slate-100 h-7 px-2 cursor-pointer"
                            onClick={() => {
                              setEditingFacilityId(f._id ? String(f._id) : f.id);
                              setFacilityForm({
                                title: f.title,
                                category: f.category || "Campus",
                                description: f.description || "",
                                icon: f.icon || "Microscope",
                                imageUrl: f.imageUrl || "",
                                geometry: f.geometry || "torusKnot",
                                color: f.color || "#10b981",
                                accent: f.accent || "#34d399",
                                order: f.order || 0,
                              });
                              setFacilityModal(true);
                            }}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:bg-red-50 h-7 px-2 cursor-pointer"
                            disabled={deleteFacility.isPending}
                            title="Delete Facility"
                            onClick={() => {
                              const fId = String(f._id || f.id);
                              if (confirm(`Are you sure you want to delete facility "${f.title || 'this facility'}"?`)) {
                                deleteFacility.mutate({ id: fId });
                              }
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                    {(!facilitiesList || facilitiesList.length === 0) && (
                      <div className="col-span-full text-center py-10 bg-white border border-dashed border-slate-300 rounded-lg text-slate-400 text-xs">
                        No facilities added yet. Click "Add Facility" to add one.
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* --- 13B. 3D FEATURE CARDS (Home 2) --- */}
              {activeTab === "feature_cards" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">3D Robotics & Tech Feature Cards</h2>
                      <p className="text-xs text-slate-500">Manage interactive 3D highlight cards displayed on Home 2</p>
                    </div>
                    <Button
                      onClick={() => {
                        setEditingFeatureCardId(null);
                        setFeatureCardForm({
                          title: "",
                          description: "",
                          icon: "Bot",
                          category: "AI Innovation Lab",
                          order: (featureCardsList?.length || 0) + 1,
                        });
                        setFeatureCardModal(true);
                      }}
                      size="sm"
                      className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add Feature Card
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {featureCardsList?.map((card: any) => (
                      <Card key={String(card._id || card.id)} className="bg-white border-slate-200 shadow-sm p-4 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 bg-sky-100 text-sky-800 font-bold rounded text-[10px] uppercase">
                              Icon: {card.icon}
                            </span>
                            <span className="text-xs text-slate-400 font-mono">Order: #{card.order}</span>
                          </div>
                          <h3 className="font-bold text-slate-900 text-base">{card.title}</h3>
                          <p className="text-xs text-slate-600 leading-relaxed">{card.description}</p>
                          {card.category && (
                            <p className="text-[11px] text-slate-400 italic">Category: {card.category}</p>
                          )}
                        </div>
                        <div className="flex justify-end gap-1 pt-3 border-t border-slate-100 mt-3">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-slate-600 hover:bg-slate-100 h-7 px-2 cursor-pointer"
                            onClick={() => {
                              setEditingFeatureCardId(card._id ? String(card._id) : card.id);
                              setFeatureCardForm({
                                title: card.title,
                                description: card.description || "",
                                icon: card.icon || "Bot",
                                category: card.category || "AI Innovation Lab",
                                order: card.order || 0,
                              });
                              setFeatureCardModal(true);
                            }}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:bg-red-50 h-7 px-2 cursor-pointer"
                            disabled={deleteFeatureCard.isPending}
                            title="Delete Feature Card"
                            onClick={() => {
                              const cId = String(card._id || card.id);
                              if (confirm(`Are you sure you want to delete feature card "${card.title || 'this card'}"?`)) {
                                deleteFeatureCard.mutate({ id: cId });
                              }
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                    {(!featureCardsList || featureCardsList.length === 0) && (
                      <div className="col-span-full text-center py-10 bg-white border border-dashed border-slate-300 rounded-lg text-slate-400 text-xs">
                        No 3D feature cards configured. Click "Add Feature Card" to create one.
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* --- 14. DEPARTMENTS --- */}
              {activeTab === "departments" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Academic Departments & Disciplines</h2>
                      <p className="text-xs text-slate-500">Manage subjects, discipline cards, and icons on the Academics page</p>
                    </div>
                    <Button
                      onClick={() => {
                        setEditingDepartmentId(null);
                        setDepartmentForm({
                          name: "",
                          subjects: "",
                          icon: "BookOpen",
                          color: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
                          order: 0,
                        });
                        setDepartmentModal(true);
                      }}
                      size="sm"
                      className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add Department
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {departmentsList?.map((d: any) => (
                      <Card key={String(d._id || d.id)} className="bg-white border-slate-200 shadow-sm p-4 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700 font-bold">
                              <BookOpen className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-900 text-sm">{d.name}</h3>
                              <p className="text-[10px] text-slate-400 font-mono">Icon: {d.icon || "BookOpen"}</p>
                            </div>
                          </div>
                          <p className="text-xs text-slate-600 mt-2">{d.subjects}</p>
                        </div>
                        <div className="pt-3 border-t border-slate-100 flex justify-end gap-1 mt-3">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-slate-600 hover:bg-slate-100 h-7 px-2 cursor-pointer"
                            onClick={() => {
                              setEditingDepartmentId(d._id ? String(d._id) : d.id);
                              setDepartmentForm({
                                name: d.name,
                                subjects: d.subjects || "",
                                icon: d.icon || "BookOpen",
                                color: d.color || "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
                                order: d.order || 0,
                              });
                              setDepartmentModal(true);
                            }}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:bg-red-50 h-7 px-2 cursor-pointer"
                            disabled={deleteDepartment.isPending}
                            title="Delete Department"
                            onClick={() => {
                              const dId = String(d._id || d.id);
                              if (confirm(`Are you sure you want to delete department "${d.name || 'this department'}"?`)) {
                                deleteDepartment.mutate({ id: dId });
                              }
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* --- 15. ADMISSION STEPS --- */}
              {activeTab === "admission_steps" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Admission Process Steps</h2>
                      <p className="text-xs text-slate-500">The step-by-step guidance flow shown on the Admissions page</p>
                    </div>
                    <Button
                      onClick={() => {
                        setEditingAdmissionStepId(null);
                        setAdmissionStepForm({
                          stepNumber: (admissionStepsList?.length || 0) + 1,
                          title: "",
                          description: "",
                          icon: "FileText",
                          order: (admissionStepsList?.length || 0) + 1,
                        });
                        setAdmissionStepModal(true);
                      }}
                      size="sm"
                      className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add Step
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {admissionStepsList?.map((s: any) => (
                      <Card key={String(s._id || s.id)} className="bg-white border-slate-200 shadow-sm p-4 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
                              {s.stepNumber}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">{s.icon || "FileText"}</span>
                          </div>
                          <h3 className="font-bold text-slate-900 text-sm mb-1">{s.title}</h3>
                          <p className="text-xs text-slate-600">{s.description}</p>
                        </div>
                        <div className="pt-3 border-t border-slate-100 flex justify-end gap-1 mt-3">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-slate-600 hover:bg-slate-100 h-7 px-2 cursor-pointer"
                            onClick={() => {
                              setEditingAdmissionStepId(s._id ? String(s._id) : s.id);
                              setAdmissionStepForm({
                                stepNumber: s.stepNumber || 1,
                                title: s.title,
                                description: s.description || "",
                                icon: s.icon || "FileText",
                                order: s.order || 0,
                              });
                              setAdmissionStepModal(true);
                            }}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:bg-red-50 h-7 px-2 cursor-pointer"
                            disabled={deleteAdmissionStep.isPending}
                            title="Delete Step"
                            onClick={() => {
                              const sId = String(s._id || s.id);
                              if (confirm(`Are you sure you want to delete admission step "${s.title || s.stepNumber}"?`)) {
                                deleteAdmissionStep.mutate({ id: sId });
                              }
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* --- 16. FREQUENTLY ASKED QUESTIONS (FAQS) --- */}
              {activeTab === "faqs" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Frequently Asked Questions</h2>
                      <p className="text-xs text-slate-500">Manage Q&A items across Admissions and General FAQ sections</p>
                    </div>
                    <Button
                      onClick={() => {
                        setEditingFaqId(null);
                        setFaqForm({
                          question: "",
                          answer: "",
                          category: "Admissions",
                          order: 0,
                        });
                        setFaqModal(true);
                      }}
                      size="sm"
                      className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add FAQ
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {faqsList?.map((faq: any) => (
                      <div key={String(faq._id || faq.id)} className="bg-white border border-slate-200 rounded-xl p-4 flex items-start justify-between gap-4 shadow-sm">
                        <div className="space-y-1">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bold">{faq.category || "General"}</span>
                          <h4 className="text-xs font-bold text-slate-900">{faq.question}</h4>
                          <p className="text-xs text-slate-600">{faq.answer}</p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-slate-600 hover:bg-slate-100 h-7 px-2 cursor-pointer"
                            onClick={() => {
                              setEditingFaqId(faq._id ? String(faq._id) : faq.id);
                              setFaqForm({
                                question: faq.question,
                                answer: faq.answer,
                                category: faq.category || "Admissions",
                                order: faq.order || 0,
                              });
                              setFaqModal(true);
                            }}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:bg-red-50 h-7 px-2 cursor-pointer"
                            disabled={deleteFaq.isPending}
                            title="Delete FAQ"
                            onClick={() => {
                              const faqId = String(faq._id || faq.id);
                              if (confirm(`Are you sure you want to delete FAQ "${faq.question || 'this FAQ'}"?`)) {
                                deleteFaq.mutate({ id: faqId });
                              }
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* --- 16. QUICK STATS & COUNTERS --- */}
              {activeTab === "stats_metrics" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Quick Stats & Metrics</h2>
                      <p className="text-xs text-slate-500">Numerical achievement counters shown across homepage and hero sections</p>
                    </div>
                    <Button
                      onClick={() => {
                        setEditingStatMetricId(null);
                        setStatMetricForm({
                          label: "",
                          value: "",
                          icon: "GraduationCap",
                          order: 0,
                          active: true,
                        });
                        setStatMetricModal(true);
                      }}
                      size="sm"
                      className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add Counter
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {statsMetricsList?.map((s: any) => (
                      <Card key={String(s._id || s.id)} className="bg-white border-slate-200 shadow-sm p-4 flex flex-col justify-between text-center">
                        <div>
                          <div className="text-2xl font-black text-emerald-700 mb-1">{s.value}</div>
                          <div className="text-xs font-bold text-slate-800">{s.label}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-1">Icon: {s.icon}</div>
                        </div>
                        <div className="pt-3 border-t border-slate-100 flex justify-center gap-1 mt-3">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-slate-600 hover:bg-slate-100 h-7 px-2 cursor-pointer"
                            onClick={() => {
                              setEditingStatMetricId(s._id ? String(s._id) : s.id);
                              setStatMetricForm({
                                label: s.label,
                                value: s.value,
                                icon: s.icon || "GraduationCap",
                                order: s.order || 0,
                                active: s.active !== false,
                              });
                              setStatMetricModal(true);
                            }}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:bg-red-50 h-7 px-2 cursor-pointer"
                            disabled={deleteStatMetric.isPending}
                            title="Delete Stat"
                            onClick={() => {
                              const sId = String(s._id || s.id);
                              if (confirm(`Are you sure you want to delete stat metric "${s.label || 'this stat'}"?`)) {
                                deleteStatMetric.mutate({ id: sId });
                              }
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* 17. SITE SETTINGS */}
              {activeTab === "site_settings" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Site Settings</h2>
                      <p className="text-xs text-slate-500">Global School Information — Controls Contact, Social, Principal Quotes, and CTA Banners</p>
                    </div>
                    <Button
                      onClick={() => {
                        const updates = (siteSettings || []).map((s: any) => ({
                          key: s.key,
                          value: settingsEdits[s.key] !== undefined ? settingsEdits[s.key] : s.value,
                        }));
                        updateSiteSettingsMutation.mutate({ updates });
                      }}
                      size="sm"
                      className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs"
                      disabled={updateSiteSettingsMutation.isPending}
                    >
                      <CheckCircle className="w-3.5 h-3.5 mr-1" />
                      {updateSiteSettingsMutation.isPending ? "Saving..." : "Save All Settings"}
                    </Button>
                  </div>

                  {/* LOGO & BRANDING CUSTOMIZATION PANEL */}
                  <div className="bg-white border-2 border-emerald-500/30 rounded-xl overflow-hidden shadow-md">
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-3 border-b border-emerald-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Logo & Header Branding Customizer</h3>
                          <p className="text-[10px] text-slate-500">Live adjustments for Navbar & Footer logos across all devices</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Live Sync
                      </span>
                    </div>

                    <div className="p-5 space-y-5">
                      {/* Live Logo Preview Box */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold text-slate-600">Logo Live Preview</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Light Header Preview */}
                          <div className="p-4 rounded-xl border border-slate-200 bg-white/95 flex items-center justify-between shadow-xs">
                            <div className="flex items-center gap-3">
                              <img
                                src={settingsEdits["logo_url"] || (siteSettings || []).find((s: any) => s.key === "logo_url")?.value || "/images/dps/logo.webp"}
                                alt="Logo Preview"
                                style={{ height: `${Math.min(Math.max(parseInt(settingsEdits["logo_height"] || (siteSettings || []).find((s: any) => s.key === "logo_height")?.value || "52", 10), 32), 75)}px` }}
                                className={`w-auto object-contain transition-all ${
                                  (settingsEdits["logo_shape"] || (siteSettings || []).find((s: any) => s.key === "logo_shape")?.value || "default") === "circle"
                                    ? "rounded-full border border-slate-200"
                                    : (settingsEdits["logo_shape"] || (siteSettings || []).find((s: any) => s.key === "logo_shape")?.value || "default") === "rounded"
                                    ? "rounded-xl border border-slate-200"
                                    : (settingsEdits["logo_shape"] || (siteSettings || []).find((s: any) => s.key === "logo_shape")?.value || "default") === "rectangle"
                                    ? "rounded-none border border-slate-200"
                                    : ""
                                }`}
                              />
                              {((settingsEdits["logo_show_text"] || (siteSettings || []).find((s: any) => s.key === "logo_show_text")?.value || "false") === "true") && (
                                <div>
                                  <p className="text-xs font-extrabold text-slate-900 leading-tight">
                                    {settingsEdits["school_name"] || (siteSettings || []).find((s: any) => s.key === "school_name")?.value || "Delhi Public School Indirapuram"}
                                  </p>
                                  <p className="text-[10px] font-semibold text-emerald-700">
                                    {settingsEdits["school_tagline"] || (siteSettings || []).find((s: any) => s.key === "school_tagline")?.value || "Excellence in Education"}
                                  </p>
                                </div>
                              )}
                            </div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Light Header</span>
                          </div>

                          {/* Dark Header Preview */}
                          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 flex items-center justify-between shadow-xs">
                            <div className="flex items-center gap-3">
                              <img
                                src={settingsEdits["logo_url"] || (siteSettings || []).find((s: any) => s.key === "logo_url")?.value || "/images/dps/logo.webp"}
                                alt="Logo Preview Dark"
                                style={{ height: `${Math.min(Math.max(parseInt(settingsEdits["logo_height"] || (siteSettings || []).find((s: any) => s.key === "logo_height")?.value || "52", 10), 32), 75)}px` }}
                                className={`w-auto object-contain transition-all ${
                                  (settingsEdits["logo_shape"] || (siteSettings || []).find((s: any) => s.key === "logo_shape")?.value || "default") === "circle"
                                    ? "rounded-full border border-slate-700"
                                    : (settingsEdits["logo_shape"] || (siteSettings || []).find((s: any) => s.key === "logo_shape")?.value || "default") === "rounded"
                                    ? "rounded-xl border border-slate-700"
                                    : (settingsEdits["logo_shape"] || (siteSettings || []).find((s: any) => s.key === "logo_shape")?.value || "default") === "rectangle"
                                    ? "rounded-none border border-slate-700"
                                    : ""
                                }`}
                              />
                              {((settingsEdits["logo_show_text"] || (siteSettings || []).find((s: any) => s.key === "logo_show_text")?.value || "false") === "true") && (
                                <div>
                                  <p className="text-xs font-extrabold text-white leading-tight">
                                    {settingsEdits["school_name"] || (siteSettings || []).find((s: any) => s.key === "school_name")?.value || "Delhi Public School Indirapuram"}
                                  </p>
                                  <p className="text-[10px] font-semibold text-emerald-400">
                                    {settingsEdits["school_tagline"] || (siteSettings || []).find((s: any) => s.key === "school_tagline")?.value || "Excellence in Education"}
                                  </p>
                                </div>
                              )}
                            </div>
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Dark Header</span>
                          </div>
                        </div>
                      </div>

                      {/* Logo URL and Upload */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-600">Logo Image File / URL</label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="/images/dps/logo.webp or https://res.cloudinary.com/..."
                            value={settingsEdits["logo_url"] !== undefined ? settingsEdits["logo_url"] : ((siteSettings || []).find((s: any) => s.key === "logo_url")?.value || "/images/dps/logo.webp")}
                            onChange={(e) => setSettingsEdits({ ...settingsEdits, logo_url: e.target.value })}
                            className="bg-slate-50 border-slate-200 text-slate-900 text-xs font-mono"
                          />
                          <label className="cursor-pointer bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-xs transition-colors">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload Logo</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleMediaUpload(file, (url) => {
                                    setSettingsEdits({ ...settingsEdits, logo_url: url });
                                    toast.success("Logo uploaded and updated!");
                                  });
                                }
                              }}
                            />
                          </label>
                        </div>
                      </div>

                      {/* Dimensions and Adjustments */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                        {/* Logo Height Adjustment */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-semibold text-slate-600">Logo Height</label>
                            <span className="text-[11px] font-mono font-bold text-emerald-700">
                              {settingsEdits["logo_height"] || (siteSettings || []).find((s: any) => s.key === "logo_height")?.value || "52"}px
                            </span>
                          </div>
                          <input
                            type="range"
                            min={32}
                            max={75}
                            value={parseInt(settingsEdits["logo_height"] || (siteSettings || []).find((s: any) => s.key === "logo_height")?.value || "52", 10)}
                            onChange={(e) => setSettingsEdits({ ...settingsEdits, logo_height: e.target.value })}
                            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-700"
                          />
                          <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                            <span>32px (Compact)</span>
                            <span>52px (Default)</span>
                            <span>75px (Large)</span>
                          </div>
                        </div>

                        {/* Logo Corner Shape */}
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-semibold text-slate-600 block">Shape & Frame Curve</label>
                          <div className="grid grid-cols-4 gap-1.5">
                            {[
                              { id: "default", label: "Clean" },
                              { id: "rectangle", label: "Square" },
                              { id: "rounded", label: "Curve" },
                              { id: "circle", label: "Circle" },
                            ].map((shape) => (
                              <button
                                key={shape.id}
                                type="button"
                                onClick={() => setSettingsEdits({ ...settingsEdits, logo_shape: shape.id })}
                                className={`py-1.5 px-1 text-center rounded-lg text-[10px] border transition-all cursor-pointer ${
                                  (settingsEdits["logo_shape"] || (siteSettings || []).find((s: any) => s.key === "logo_shape")?.value || "default") === shape.id
                                    ? "bg-emerald-50 text-emerald-800 border-emerald-400 font-bold ring-1 ring-emerald-400"
                                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                                }`}
                              >
                                {shape.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Brand Text Beside Logo */}
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-semibold text-slate-600 block">School Name Beside Logo</label>
                          <div className="grid grid-cols-2 gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSettingsEdits({ ...settingsEdits, logo_show_text: "false" })}
                              className={`py-1.5 px-2 text-center rounded-lg text-[10px] border transition-all cursor-pointer ${
                                (settingsEdits["logo_show_text"] || (siteSettings || []).find((s: any) => s.key === "logo_show_text")?.value || "false") === "false"
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-400 font-bold ring-1 ring-emerald-400"
                                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                              }`}
                            >
                              Logo Only
                            </button>
                            <button
                              type="button"
                              onClick={() => setSettingsEdits({ ...settingsEdits, logo_show_text: "true" })}
                              className={`py-1.5 px-2 text-center rounded-lg text-[10px] border transition-all cursor-pointer ${
                                (settingsEdits["logo_show_text"] || (siteSettings || []).find((s: any) => s.key === "logo_show_text")?.value || "false") === "true"
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-400 font-bold ring-1 ring-emerald-400"
                                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                              }`}
                            >
                              Logo + Text
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SECONDARY SCHOOL LOGO & PARTNER EMBLEM PANEL */}
                  <div className="bg-white border-2 border-indigo-500/30 rounded-xl overflow-hidden shadow-md">
                    <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-slate-50 px-4 py-3 border-b border-indigo-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                          <Award className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Secondary School Logo & Partner Emblem</h3>
                          <p className="text-[10px] text-slate-500">Square emblem displayed before Light/Dark toggle on right of Explore button</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                          (settingsEdits["show_international_logo"] !== undefined ? settingsEdits["show_international_logo"] : (siteSettings || []).find((s: any) => s.key === "show_international_logo")?.value || "true") !== "false"
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                            : "bg-slate-100 text-slate-600 border-slate-300"
                        }`}>
                          {(settingsEdits["show_international_logo"] !== undefined ? settingsEdits["show_international_logo"] : (siteSettings || []).find((s: any) => s.key === "show_international_logo")?.value || "true") !== "false" ? "Active in Navbar" : "Hidden"}
                        </span>
                        <Button
                          size="sm"
                          onClick={() => {
                            const updates = [
                              { key: "international_logo_url", value: settingsEdits["international_logo_url"] !== undefined ? settingsEdits["international_logo_url"] : (siteSettings || []).find((s: any) => s.key === "international_logo_url")?.value || "/images/dps/international_logo.webp" },
                              { key: "show_international_logo", value: settingsEdits["show_international_logo"] !== undefined ? settingsEdits["show_international_logo"] : (siteSettings || []).find((s: any) => s.key === "show_international_logo")?.value || "true" },
                              { key: "secondary_logo_shape", value: settingsEdits["secondary_logo_shape"] !== undefined ? settingsEdits["secondary_logo_shape"] : (siteSettings || []).find((s: any) => s.key === "secondary_logo_shape")?.value || "square" },
                              { key: "secondary_logo_title", value: settingsEdits["secondary_logo_title"] !== undefined ? settingsEdits["secondary_logo_title"] : (siteSettings || []).find((s: any) => s.key === "secondary_logo_title")?.value || "Accreditation & Partner School" },
                            ];
                            updateSiteSettingsMutation.mutate({ updates });
                            toast.success("Secondary logo settings saved successfully!");
                          }}
                          disabled={updateSiteSettingsMutation.isPending}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-7 px-3 shadow-xs cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5 mr-1" />
                          {updateSiteSettingsMutation.isPending ? "Saving..." : "Save Secondary Logo"}
                        </Button>
                      </div>
                    </div>

                    <div className="p-5 space-y-5">
                      {/* Live Preview Box */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold text-slate-600">Secondary Logo Live Preview</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Light Header Preview */}
                          <div className="p-4 rounded-xl border border-slate-200 bg-white/95 flex items-center justify-between shadow-xs">
                            <div className="flex items-center gap-3">
                              <img
                                src={settingsEdits["international_logo_url"] || (siteSettings || []).find((s: any) => s.key === "international_logo_url")?.value || "/images/dps/international_logo.webp"}
                                alt="Secondary Logo Preview Light"
                                className="h-9 w-9 object-contain aspect-square shrink-0"
                              />
                              <div>
                                <p className="text-xs font-bold text-slate-800">
                                  {settingsEdits["secondary_logo_title"] !== undefined ? settingsEdits["secondary_logo_title"] : (siteSettings || []).find((s: any) => s.key === "secondary_logo_title")?.value || "Accreditation & Partner School"}
                                </p>
                                <p className="text-[10px] text-slate-400">Position: Right of Explore Campus button</p>
                              </div>
                            </div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Light Navbar</span>
                          </div>

                          {/* Dark Header Preview */}
                          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 flex items-center justify-between shadow-xs">
                            <div className="flex items-center gap-3">
                              <img
                                src={settingsEdits["international_logo_url"] || (siteSettings || []).find((s: any) => s.key === "international_logo_url")?.value || "/images/dps/international_logo.webp"}
                                alt="Secondary Logo Preview Dark"
                                className="h-9 w-9 object-contain aspect-square shrink-0"
                              />
                              <div>
                                <p className="text-xs font-bold text-slate-100">
                                  {settingsEdits["secondary_logo_title"] !== undefined ? settingsEdits["secondary_logo_title"] : (siteSettings || []).find((s: any) => s.key === "secondary_logo_title")?.value || "Accreditation & Partner School"}
                                </p>
                                <p className="text-[10px] text-slate-400">Position: Right of Explore Campus button</p>
                              </div>
                            </div>
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Dark Navbar</span>
                          </div>
                        </div>
                      </div>

                      {/* Logo URL and Upload */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-600">Secondary Logo Image File / URL</label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="/images/dps/international_logo.webp or https://res.cloudinary.com/..."
                            value={settingsEdits["international_logo_url"] !== undefined ? settingsEdits["international_logo_url"] : ((siteSettings || []).find((s: any) => s.key === "international_logo_url")?.value || "/images/dps/international_logo.webp")}
                            onChange={(e) => setSettingsEdits({ ...settingsEdits, international_logo_url: e.target.value })}
                            className="bg-slate-50 border-slate-200 text-slate-900 text-xs font-mono"
                          />
                          <label className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-xs transition-colors">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload Logo</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleMediaUpload(file, (url) => {
                                    setSettingsEdits({ ...settingsEdits, international_logo_url: url });
                                    toast.success("Secondary logo uploaded and updated!");
                                  });
                                }
                              }}
                            />
                          </label>
                        </div>
                      </div>

                      {/* Controls Grid: Shape, Visibility, Title */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                        {/* Shape Selector */}
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-semibold text-slate-600 block">Shape & Frame Style</label>
                          <div className="grid grid-cols-3 gap-1.5">
                            {[
                              { id: "square", label: "Square (Default)" },
                              { id: "rounded", label: "Rounded" },
                              { id: "circle", label: "Circle" },
                            ].map((shape) => (
                              <button
                                key={shape.id}
                                type="button"
                                onClick={() => setSettingsEdits({ ...settingsEdits, secondary_logo_shape: shape.id })}
                                className={`py-1.5 px-1 text-center rounded-lg text-[10px] border transition-all cursor-pointer ${
                                  (settingsEdits["secondary_logo_shape"] || (siteSettings || []).find((s: any) => s.key === "secondary_logo_shape")?.value || "square") === shape.id
                                    ? "bg-indigo-50 text-indigo-800 border-indigo-400 font-bold ring-1 ring-indigo-400"
                                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                                }`}
                              >
                                {shape.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Visibility Toggle */}
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-semibold text-slate-600 block">Navbar Visibility</label>
                          <div className="grid grid-cols-2 gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSettingsEdits({ ...settingsEdits, show_international_logo: "true" })}
                              className={`py-1.5 px-2 text-center rounded-lg text-[10px] border transition-all cursor-pointer ${
                                (settingsEdits["show_international_logo"] !== undefined ? settingsEdits["show_international_logo"] : (siteSettings || []).find((s: any) => s.key === "show_international_logo")?.value || "true") !== "false"
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-400 font-bold ring-1 ring-emerald-400"
                                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                              }`}
                            >
                              Visible
                            </button>
                            <button
                              type="button"
                              onClick={() => setSettingsEdits({ ...settingsEdits, show_international_logo: "false" })}
                              className={`py-1.5 px-2 text-center rounded-lg text-[10px] border transition-all cursor-pointer ${
                                (settingsEdits["show_international_logo"] !== undefined ? settingsEdits["show_international_logo"] : (siteSettings || []).find((s: any) => s.key === "show_international_logo")?.value || "true") === "false"
                                  ? "bg-rose-50 text-rose-800 border-rose-400 font-bold ring-1 ring-rose-400"
                                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                              }`}
                            >
                              Hidden
                            </button>
                          </div>
                        </div>

                        {/* Title / Tooltip Text */}
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-semibold text-slate-600 block">Tooltip / Alt Text</label>
                          <Input
                            placeholder="Accreditation & Partner School"
                            value={settingsEdits["secondary_logo_title"] !== undefined ? settingsEdits["secondary_logo_title"] : ((siteSettings || []).find((s: any) => s.key === "secondary_logo_title")?.value || "Accreditation & Partner School")}
                            onChange={(e) => setSettingsEdits({ ...settingsEdits, secondary_logo_title: e.target.value })}
                            className="bg-slate-50 border-slate-200 text-slate-900 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 360° VIRTUAL TOUR & VR SETTINGS PANEL */}
                  <div className="bg-white border-2 border-teal-500/30 rounded-xl overflow-hidden shadow-md">
                    <div className="bg-gradient-to-r from-teal-50 via-emerald-50 to-cyan-50 px-4 py-3 border-b border-teal-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center shadow-xs">
                          <Compass className="w-4 h-4 animate-spin-slow" />
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">360° Virtual Tour & VR Setting</h3>
                          <p className="text-[10px] text-slate-500">Configure destination link, button text, and visibility for the 360° View tour</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                          (settingsEdits["view_360_enabled"] !== undefined ? settingsEdits["view_360_enabled"] : (siteSettings || []).find((s: any) => s.key === "view_360_enabled")?.value || "false") === "true"
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                            : "bg-slate-100 text-slate-600 border-slate-300"
                        }`}>
                          {(settingsEdits["view_360_enabled"] !== undefined ? settingsEdits["view_360_enabled"] : (siteSettings || []).find((s: any) => s.key === "view_360_enabled")?.value || "false") === "true" ? "Active" : "Hidden"}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* URL input */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-semibold text-slate-700">360° VR Destination URL</label>
                            <a
                              href={settingsEdits["view_360_url"] !== undefined ? settingsEdits["view_360_url"] : (siteSettings || []).find((s: any) => s.key === "view_360_url")?.value || "https://dpsivr.vercel.app"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-1 hover:underline"
                            >
                              <span>Test Link</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                          <Input
                            placeholder="https://dpsivr.vercel.app"
                            value={settingsEdits["view_360_url"] !== undefined ? settingsEdits["view_360_url"] : (siteSettings || []).find((s: any) => s.key === "view_360_url")?.value || "https://dpsivr.vercel.app"}
                            onChange={(e) => setSettingsEdits({ ...settingsEdits, view_360_url: e.target.value })}
                            className="bg-slate-50 border-slate-200 text-slate-900 text-xs font-mono"
                          />
                          <p className="text-[10px] text-slate-400">Visitors will be redirected to this link when clicking the 360 View button.</p>
                        </div>

                        {/* Label input */}
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-slate-700">Button Display Text</label>
                          <Input
                            placeholder="360 View"
                            value={settingsEdits["view_360_label"] !== undefined ? settingsEdits["view_360_label"] : (siteSettings || []).find((s: any) => s.key === "view_360_label")?.value || "360 View"}
                            onChange={(e) => setSettingsEdits({ ...settingsEdits, view_360_label: e.target.value })}
                            className="bg-slate-50 border-slate-200 text-slate-900 text-xs"
                          />
                          <p className="text-[10px] text-slate-400">Custom label shown inside the button across the Navbar, Hero, and Facilities.</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100">
                        {/* Toggle active */}
                        <div className="flex items-center gap-3">
                          <label className="text-[11px] font-semibold text-slate-700">Display 360° View Button on Website:</label>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSettingsEdits({ ...settingsEdits, view_360_enabled: "true" })}
                              className={`px-3 py-1 text-xs rounded-lg font-semibold border transition-all cursor-pointer ${
                                (settingsEdits["view_360_enabled"] !== undefined ? settingsEdits["view_360_enabled"] : (siteSettings || []).find((s: any) => s.key === "view_360_enabled")?.value || "false") === "true"
                                  ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                                  : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                              }`}
                            >
                              Visible
                            </button>
                            <button
                              type="button"
                              onClick={() => setSettingsEdits({ ...settingsEdits, view_360_enabled: "false" })}
                              className={`px-3 py-1 text-xs rounded-lg font-semibold border transition-all cursor-pointer ${
                                (settingsEdits["view_360_enabled"] !== undefined ? settingsEdits["view_360_enabled"] : (siteSettings || []).find((s: any) => s.key === "view_360_enabled")?.value || "false") === "true"
                                  ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                                  : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                              }`}
                            >
                              Hidden
                            </button>
                          </div>
                        </div>

                        {/* Quick save button */}
                        <Button
                          size="sm"
                          onClick={() => {
                            const urlVal = settingsEdits["view_360_url"] !== undefined ? settingsEdits["view_360_url"] : (siteSettings || []).find((s: any) => s.key === "view_360_url")?.value || "https://dpsivr.vercel.app";
                            const labelVal = settingsEdits["view_360_label"] !== undefined ? settingsEdits["view_360_label"] : (siteSettings || []).find((s: any) => s.key === "view_360_label")?.value || "360 View";
                            const enabledVal = settingsEdits["view_360_enabled"] !== undefined ? settingsEdits["view_360_enabled"] : (siteSettings || []).find((s: any) => s.key === "view_360_enabled")?.value || "false";
                            updateSiteSettingsMutation.mutate({
                              updates: [
                                { key: "view_360_url", value: urlVal },
                                { key: "view_360_label", value: labelVal },
                                { key: "view_360_enabled", value: enabledVal },
                              ],
                            });
                          }}
                          disabled={updateSiteSettingsMutation.isPending}
                          className="bg-teal-700 hover:bg-teal-800 text-white text-xs shadow-sm cursor-pointer"
                        >
                          <CheckCircle className="w-3.5 h-3.5 mr-1" />
                          {updateSiteSettingsMutation.isPending ? "Saving..." : "Save 360° Tour Settings"}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* LIQUID METAL BUTTONS CONTROL CENTER (EXPLORE & AI BOT) */}
                  <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600/80 border border-indigo-400/40 text-white flex items-center justify-center shadow-sm">
                          <Sparkles className="w-4 h-4 text-indigo-200" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xs font-bold uppercase tracking-wide text-white">Liquid Metal Buttons (Explore & AI Assistant)</h3>
                            <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">WebGL Shader</span>
                          </div>
                          <p className="text-[10px] text-slate-300">Manage interactive 3D WebGL metallic buttons across Homepage Hero, Navbar, and AI Assistant</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            const updates = [
                              { key: "explore_button_text", value: settingsEdits["explore_button_text"] !== undefined ? settingsEdits["explore_button_text"] : (siteSettings || []).find((s: any) => s.key === "explore_button_text")?.value || "Explore Campus" },
                              { key: "explore_button_link", value: settingsEdits["explore_button_link"] !== undefined ? settingsEdits["explore_button_link"] : (siteSettings || []).find((s: any) => s.key === "explore_button_link")?.value || "#interactive-facilities" },
                              { key: "explore_action_type", value: settingsEdits["explore_action_type"] !== undefined ? settingsEdits["explore_action_type"] : (siteSettings || []).find((s: any) => s.key === "explore_action_type")?.value || "modal" },
                              { key: "explore_button_mode", value: settingsEdits["explore_button_mode"] !== undefined ? settingsEdits["explore_button_mode"] : (siteSettings || []).find((s: any) => s.key === "explore_button_mode")?.value || "text" },
                              { key: "explore_button_enabled", value: settingsEdits["explore_button_enabled"] !== undefined ? settingsEdits["explore_button_enabled"] : (siteSettings || []).find((s: any) => s.key === "explore_button_enabled")?.value || "true" },
                              { key: "explore_hero_enabled", value: settingsEdits["explore_hero_enabled"] !== undefined ? settingsEdits["explore_hero_enabled"] : (siteSettings || []).find((s: any) => s.key === "explore_hero_enabled")?.value || "false" },
                              { key: "ai_bot_button_text", value: settingsEdits["ai_bot_button_text"] !== undefined ? settingsEdits["ai_bot_button_text"] : (siteSettings || []).find((s: any) => s.key === "ai_bot_button_text")?.value || "Ask DPSI AI" },
                              { key: "ai_bot_button_style", value: settingsEdits["ai_bot_button_style"] !== undefined ? settingsEdits["ai_bot_button_style"] : (siteSettings || []).find((s: any) => s.key === "ai_bot_button_style")?.value || "liquid_metal" },
                              { key: "ai_bot_button_mode", value: settingsEdits["ai_bot_button_mode"] !== undefined ? settingsEdits["ai_bot_button_mode"] : (siteSettings || []).find((s: any) => s.key === "ai_bot_button_mode")?.value || "text" },
                              { key: "ai_bot_button_enabled", value: settingsEdits["ai_bot_button_enabled"] !== undefined ? settingsEdits["ai_bot_button_enabled"] : (siteSettings || []).find((s: any) => s.key === "ai_bot_button_enabled")?.value || "true" },
                              { key: "ai_bot_hero_enabled", value: settingsEdits["ai_bot_hero_enabled"] !== undefined ? settingsEdits["ai_bot_hero_enabled"] : (siteSettings || []).find((s: any) => s.key === "ai_bot_hero_enabled")?.value || "false" },
                            ];
                            updateSiteSettingsMutation.mutate({ updates });
                            toast.success("Liquid Metal Button settings updated successfully!");
                          }}
                          disabled={updateSiteSettingsMutation.isPending}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-7 px-3 shadow-sm cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5 mr-1" />
                          {updateSiteSettingsMutation.isPending ? "Saving..." : "Save Metal Buttons"}
                        </Button>
                      </div>
                    </div>

                    <div className="p-5 space-y-6">
                      {/* LIVE PREVIEW CANVAS */}
                      <div className="bg-slate-950 rounded-xl p-5 border border-slate-800 shadow-inner">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                            <Eye className="w-3.5 h-3.5 text-indigo-400" />
                            Live Interactive Metal Shader Preview
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">Move mouse or hover over buttons to inspect fluidity</span>
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-6 py-3 min-h-[70px]">
                          <div className="flex flex-col items-center gap-1.5">
                            <LiquidMetalButton
                              label={settingsEdits["explore_button_text"] !== undefined ? settingsEdits["explore_button_text"] : (siteSettings || []).find((s: any) => s.key === "explore_button_text")?.value || "Explore Campus"}
                              viewMode={(settingsEdits["explore_button_mode"] !== undefined ? settingsEdits["explore_button_mode"] : (siteSettings || []).find((s: any) => s.key === "explore_button_mode")?.value || "text") as "text" | "icon"}
                              icon={<Compass className="w-3.5 h-3.5 text-emerald-400" />}
                              title="Explore Button Live Preview"
                            />
                            <span className="text-[10px] text-slate-400 font-medium">Explore Button</span>
                          </div>

                          <div className="flex flex-col items-center gap-1.5">
                            <LiquidMetalButton
                              label={settingsEdits["ai_bot_button_text"] !== undefined ? settingsEdits["ai_bot_button_text"] : (siteSettings || []).find((s: any) => s.key === "ai_bot_button_text")?.value || "Ask DPSI AI"}
                              viewMode={(settingsEdits["ai_bot_button_mode"] !== undefined ? settingsEdits["ai_bot_button_mode"] : (siteSettings || []).find((s: any) => s.key === "ai_bot_button_mode")?.value || "text") as "text" | "icon"}
                              icon={<Bot className="w-3.5 h-3.5 text-cyan-400" />}
                              title="AI Bot Button Live Preview"
                            />
                            <span className="text-[10px] text-slate-400 font-medium">AI Bot Button</span>
                          </div>
                        </div>
                      </div>

                      {/* TWO-COLUMN CONTROLS: EXPLORE BUTTON & AI BOT BUTTON */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* EXPLORE BUTTON CONTROLS */}
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                            <div className="flex items-center gap-2">
                              <Compass className="w-4 h-4 text-emerald-600" />
                              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Explore Button Settings</h4>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              (settingsEdits["explore_button_enabled"] !== undefined ? settingsEdits["explore_button_enabled"] : (siteSettings || []).find((s: any) => s.key === "explore_button_enabled")?.value || "true") === "true"
                                ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                : "bg-rose-100 text-rose-800 border-rose-300"
                            }`}>
                              {(settingsEdits["explore_button_enabled"] !== undefined ? settingsEdits["explore_button_enabled"] : (siteSettings || []).find((s: any) => s.key === "explore_button_enabled")?.value || "true") === "true" ? "Navbar Enabled" : "Navbar Disabled"}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-slate-700">Button Label / Text</label>
                            <Input
                              placeholder="Explore Campus"
                              value={settingsEdits["explore_button_text"] !== undefined ? settingsEdits["explore_button_text"] : (siteSettings || []).find((s: any) => s.key === "explore_button_text")?.value || "Explore Campus"}
                              onChange={(e) => setSettingsEdits({ ...settingsEdits, explore_button_text: e.target.value })}
                              className="bg-white border-slate-200 text-slate-900 text-xs"
                            />
                            <p className="text-[10px] text-slate-400">Display text rendered on the liquid metal button</p>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-slate-700">Click Action Behavior</label>
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => setSettingsEdits({ ...settingsEdits, explore_action_type: "modal" })}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer text-left ${
                                  (settingsEdits["explore_action_type"] !== undefined ? settingsEdits["explore_action_type"] : (siteSettings || []).find((s: any) => s.key === "explore_action_type")?.value || "modal") === "modal"
                                    ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                                }`}
                              >
                                <span className="block font-bold">Interactive Modal</span>
                                <span className="text-[10px] opacity-80">Opens 3D explore portal</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setSettingsEdits({ ...settingsEdits, explore_action_type: "link" })}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer text-left ${
                                  (settingsEdits["explore_action_type"] !== undefined ? settingsEdits["explore_action_type"] : (siteSettings || []).find((s: any) => s.key === "explore_action_type")?.value || "modal") === "link"
                                    ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                                }`}
                              >
                                <span className="block font-bold">Direct URL / Anchor</span>
                                <span className="text-[10px] opacity-80">Smooth scrolls or links</span>
                              </button>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-slate-700">Destination URL or Anchor (When Action is Link)</label>
                            <Input
                              placeholder="#interactive-facilities"
                              value={settingsEdits["explore_button_link"] !== undefined ? settingsEdits["explore_button_link"] : (siteSettings || []).find((s: any) => s.key === "explore_button_link")?.value || "#interactive-facilities"}
                              onChange={(e) => setSettingsEdits({ ...settingsEdits, explore_button_link: e.target.value })}
                              className="bg-white border-slate-200 text-slate-900 text-xs font-mono"
                            />
                            <p className="text-[10px] text-slate-400">Target URL or section hash like #interactive-facilities or /facilities</p>
                          </div>

                          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                            <div>
                              <label className="text-[11px] font-semibold text-slate-700 block mb-1.5">Display Mode</label>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setSettingsEdits({ ...settingsEdits, explore_button_mode: "text" })}
                                  className={`px-2.5 py-1 text-xs rounded-md font-semibold border transition-all cursor-pointer ${
                                    (settingsEdits["explore_button_mode"] !== undefined ? settingsEdits["explore_button_mode"] : (siteSettings || []).find((s: any) => s.key === "explore_button_mode")?.value || "text") === "text"
                                      ? "bg-slate-800 text-white border-slate-800"
                                      : "bg-white text-slate-600 border-slate-200"
                                  }`}
                                >
                                  Text + Icon
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setSettingsEdits({ ...settingsEdits, explore_button_mode: "icon" })}
                                  className={`px-2.5 py-1 text-xs rounded-md font-semibold border transition-all cursor-pointer ${
                                    (settingsEdits["explore_button_mode"] !== undefined ? settingsEdits["explore_button_mode"] : (siteSettings || []).find((s: any) => s.key === "explore_button_mode")?.value || "text") === "icon"
                                      ? "bg-slate-800 text-white border-slate-800"
                                      : "bg-white text-slate-600 border-slate-200"
                                  }`}
                                >
                                  Icon Only
                                </button>
                              </div>
                            </div>

                            <div>
                              <label className="text-[11px] font-semibold text-slate-700 block mb-1.5">Hero Dock Visibility</label>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setSettingsEdits({ ...settingsEdits, explore_hero_enabled: "true" })}
                                  className={`px-2.5 py-1 text-xs rounded-md font-semibold border transition-all cursor-pointer ${
                                    (settingsEdits["explore_hero_enabled"] !== undefined ? settingsEdits["explore_hero_enabled"] : (siteSettings || []).find((s: any) => s.key === "explore_hero_enabled")?.value || "false") === "true"
                                      ? "bg-emerald-600 text-white border-emerald-600"
                                      : "bg-white text-slate-600 border-slate-200"
                                  }`}
                                >
                                  Visible
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setSettingsEdits({ ...settingsEdits, explore_hero_enabled: "false" })}
                                  className={`px-2.5 py-1 text-xs rounded-md font-semibold border transition-all cursor-pointer ${
                                    (settingsEdits["explore_hero_enabled"] !== undefined ? settingsEdits["explore_hero_enabled"] : (siteSettings || []).find((s: any) => s.key === "explore_hero_enabled")?.value || "false") === "false"
                                      ? "bg-rose-600 text-white border-rose-600"
                                      : "bg-white text-slate-600 border-slate-200"
                                  }`}
                                >
                                  Hidden
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* AI BOT BUTTON CONTROLS */}
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                            <div className="flex items-center gap-2">
                              <Bot className="w-4 h-4 text-cyan-600" />
                              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">AI Bot Button Settings</h4>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              (settingsEdits["ai_bot_button_enabled"] !== undefined ? settingsEdits["ai_bot_button_enabled"] : (siteSettings || []).find((s: any) => s.key === "ai_bot_button_enabled")?.value || "true") === "true"
                                ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                : "bg-rose-100 text-rose-800 border-rose-300"
                            }`}>
                              {(settingsEdits["ai_bot_button_enabled"] !== undefined ? settingsEdits["ai_bot_button_enabled"] : (siteSettings || []).find((s: any) => s.key === "ai_bot_button_enabled")?.value || "true") === "true" ? "Widget Enabled" : "Widget Disabled"}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-slate-700">AI Bot Button Label</label>
                            <Input
                              placeholder="Ask DPSI AI"
                              value={settingsEdits["ai_bot_button_text"] !== undefined ? settingsEdits["ai_bot_button_text"] : (siteSettings || []).find((s: any) => s.key === "ai_bot_button_text")?.value || "Ask DPSI AI"}
                              onChange={(e) => setSettingsEdits({ ...settingsEdits, ai_bot_button_text: e.target.value })}
                              className="bg-white border-slate-200 text-slate-900 text-xs"
                            />
                            <p className="text-[10px] text-slate-400">Custom label shown inside the AI assistant metal button</p>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-slate-700">Button Style</label>
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => setSettingsEdits({ ...settingsEdits, ai_bot_button_style: "liquid_metal" })}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer text-left ${
                                  (settingsEdits["ai_bot_button_style"] !== undefined ? settingsEdits["ai_bot_button_style"] : (siteSettings || []).find((s: any) => s.key === "ai_bot_button_style")?.value || "liquid_metal") === "liquid_metal"
                                    ? "bg-cyan-700 text-white border-cyan-700 shadow-xs"
                                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                                }`}
                              >
                                <span className="block font-bold">Liquid Metal</span>
                                <span className="text-[10px] opacity-80">WebGL Metallic Shader</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setSettingsEdits({ ...settingsEdits, ai_bot_button_style: "classic" })}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer text-left ${
                                  (settingsEdits["ai_bot_button_style"] !== undefined ? settingsEdits["ai_bot_button_style"] : (siteSettings || []).find((s: any) => s.key === "ai_bot_button_style")?.value || "liquid_metal") === "classic"
                                    ? "bg-cyan-700 text-white border-cyan-700 shadow-xs"
                                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                                }`}
                              >
                                <span className="block font-bold">Classic Pill</span>
                                <span className="text-[10px] opacity-80">Glassmorphism badge</span>
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                            <div>
                              <label className="text-[11px] font-semibold text-slate-700 block mb-1.5">Display Mode</label>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setSettingsEdits({ ...settingsEdits, ai_bot_button_mode: "text" })}
                                  className={`px-2.5 py-1 text-xs rounded-md font-semibold border transition-all cursor-pointer ${
                                    (settingsEdits["ai_bot_button_mode"] !== undefined ? settingsEdits["ai_bot_button_mode"] : (siteSettings || []).find((s: any) => s.key === "ai_bot_button_mode")?.value || "text") === "text"
                                      ? "bg-slate-800 text-white border-slate-800"
                                      : "bg-white text-slate-600 border-slate-200"
                                  }`}
                                >
                                  Text + Icon
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setSettingsEdits({ ...settingsEdits, ai_bot_button_mode: "icon" })}
                                  className={`px-2.5 py-1 text-xs rounded-md font-semibold border transition-all cursor-pointer ${
                                    (settingsEdits["ai_bot_button_mode"] !== undefined ? settingsEdits["ai_bot_button_mode"] : (siteSettings || []).find((s: any) => s.key === "ai_bot_button_mode")?.value || "text") === "icon"
                                      ? "bg-slate-800 text-white border-slate-800"
                                      : "bg-white text-slate-600 border-slate-200"
                                  }`}
                                >
                                  Icon Only
                                </button>
                              </div>
                            </div>

                            <div>
                              <label className="text-[11px] font-semibold text-slate-700 block mb-1.5">Hero Dock Visibility</label>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setSettingsEdits({ ...settingsEdits, ai_bot_hero_enabled: "true" })}
                                  className={`px-2.5 py-1 text-xs rounded-md font-semibold border transition-all cursor-pointer ${
                                    (settingsEdits["ai_bot_hero_enabled"] !== undefined ? settingsEdits["ai_bot_hero_enabled"] : (siteSettings || []).find((s: any) => s.key === "ai_bot_hero_enabled")?.value || "false") === "true"
                                      ? "bg-emerald-600 text-white border-emerald-600"
                                      : "bg-white text-slate-600 border-slate-200"
                                  }`}
                                >
                                  Visible
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setSettingsEdits({ ...settingsEdits, ai_bot_hero_enabled: "false" })}
                                  className={`px-2.5 py-1 text-xs rounded-md font-semibold border transition-all cursor-pointer ${
                                    (settingsEdits["ai_bot_hero_enabled"] !== undefined ? settingsEdits["ai_bot_hero_enabled"] : (siteSettings || []).find((s: any) => s.key === "ai_bot_hero_enabled")?.value || "false") === "false"
                                      ? "bg-rose-600 text-white border-rose-600"
                                      : "bg-white text-slate-600 border-slate-200"
                                  }`}
                                >
                                  Hidden
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {["general", "contact", "social", "principal", "cta", "admissions"].map((group) => (
                    <div key={group} className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                      <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">{group} Settings</h3>
                        <Button
                          size="sm"
                          onClick={() => {
                            const groupSettings = (siteSettings || []).filter((s: any) => s.group === group);
                            const updates = groupSettings.map((s: any) => ({
                              key: s.key,
                              value: settingsEdits[s.key] !== undefined ? settingsEdits[s.key] : s.value,
                            }));
                            updateSiteSettingsMutation.mutate({ updates });
                          }}
                          disabled={updateSiteSettingsMutation.isPending}
                          className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs h-7 px-3 cursor-pointer flex items-center gap-1 shadow-sm"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Save {group.charAt(0).toUpperCase() + group.slice(1)}</span>
                        </Button>
                      </div>
                      <div className="p-4 space-y-4">
                        {(siteSettings || []).filter((s: any) => s.group === group).map((s: any) => {
                          const isImageKey = s.key.includes("image") || s.key.includes("logo") || s.key.includes("photo");
                          const currentValue = settingsEdits[s.key] !== undefined ? settingsEdits[s.key] : s.value;

                          return (
                            <div key={s.key} className="space-y-1.5 pb-2 border-b border-slate-100 last:border-b-0 last:pb-0">
                              <div className="flex items-center justify-between">
                                <label className="text-[11px] font-semibold text-slate-700">{s.label}</label>
                                {isImageKey && currentValue && (
                                  <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3 text-emerald-500" /> Active CDN URL
                                  </span>
                                )}
                              </div>

                              {s.key.includes("message") || s.key.includes("subtitle") ? (
                                <Textarea
                                  rows={3}
                                  value={currentValue || ""}
                                  onChange={(e) => setSettingsEdits({ ...settingsEdits, [s.key]: e.target.value })}
                                  className="bg-slate-50 border-slate-200 text-slate-900 text-xs"
                                />
                              ) : isImageKey ? (
                                <div className="space-y-2">
                                  <div className="flex gap-2">
                                    <Input
                                      value={currentValue || ""}
                                      onChange={(e) => setSettingsEdits({ ...settingsEdits, [s.key]: e.target.value })}
                                      className="bg-slate-50 border-slate-200 text-slate-900 text-xs font-mono"
                                      placeholder="https://res.cloudinary.com/... or /images/..."
                                    />
                                    <label className="cursor-pointer bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 shadow-sm transition-all">
                                      <Upload className="w-3.5 h-3.5" />
                                      <span>Upload Image</span>
                                      <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) {
                                            handleMediaUpload(file, (url) => {
                                              setSettingsEdits((prev) => ({ ...prev, [s.key]: url }));
                                              // Auto-save immediately to database
                                              updateSiteSettingsMutation.mutate({
                                                updates: [{ key: s.key, value: url }],
                                              });
                                              toast.success(`${s.label} uploaded and saved to live website!`);
                                            });
                                          }
                                        }}
                                      />
                                    </label>
                                  </div>
                                  {currentValue && (
                                    <div className="flex items-center gap-3 p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                                      <div className="h-16 w-16 rounded-md overflow-hidden bg-white border border-slate-300 shrink-0 shadow-sm">
                                        <img
                                          src={currentValue}
                                          alt={s.label}
                                          className="h-full w-full object-cover object-top"
                                          onError={(e) => {
                                            (e.target as HTMLElement).style.display = "none";
                                          }}
                                        />
                                      </div>
                                      <div className="text-[11px] text-slate-600 overflow-hidden">
                                        <p className="font-semibold text-slate-800">Current Image Preview</p>
                                        <p className="truncate font-mono text-[10px] text-slate-400 max-w-sm">{currentValue}</p>
                                        <p className="text-[10px] text-emerald-600 font-medium mt-0.5">
                                          ✓ Live on website & auto-persisted to database
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <Input
                                  value={currentValue || ""}
                                  onChange={(e) => setSettingsEdits({ ...settingsEdits, [s.key]: e.target.value })}
                                  className="bg-slate-50 border-slate-200 text-slate-900 text-xs"
                                />
                              )}
                              <p className="text-[10px] text-slate-400 font-mono">{s.key}</p>
                            </div>
                          );
                        })}
                        {(siteSettings || []).filter((s: any) => s.group === group).length === 0 && (
                          <p className="text-xs text-slate-400">Loading settings...</p>
                        )}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

              {/* 14. AI CONFIGURATION */}
              {activeTab === "ai_settings" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">AI Chatbot Configuration</h2>
                    <p className="text-xs text-slate-500">Edit the AI assistant knowledge base and parameters — changes take effect immediately</p>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-xs text-amber-800 font-medium">The AI uses this knowledge base to answer all student and parent queries on the website. Keep it accurate and up to date.</p>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-600">AI Model</label>
                        <select
                          value={aiModelEdit || aiConfig?.modelId || "openai/gpt-oss-120b"}
                          onChange={(e) => setAiModelEdit(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg p-2.5 text-xs font-medium"
                        >
                          <option value="openai/gpt-oss-120b">GPT OSS 120B (Recommended — High Intelligence & Speed)</option>
                          <option value="qwen/qwen3.8-27b">Qwen 3.8 27B (Ultra-Fast 300ms)</option>
                          <option value="openai/gpt-oss-20b">GPT OSS 20B (Instant Compact)</option>
                          <option value="groq/compound-mini">Compound Mini</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-600">Temperature (Creativity: 0 = strict, 1 = creative)</label>
                        <Input
                          type="number"
                          min={0}
                          max={1}
                          step={0.1}
                          value={aiTempEdit || aiConfig?.temperature || 0.4}
                          onChange={(e) => setAiTempEdit(parseFloat(e.target.value) || 0.4)}
                          className="bg-slate-50 border-slate-200 text-slate-900 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-600">Max Response Length (tokens)</label>
                        <Input
                          type="number"
                          min={100}
                          max={2000}
                          value={700}
                          disabled
                          className="bg-slate-50 border-slate-200 text-slate-400 text-xs"
                        />
                      </div>
                    </div>

                    {/* Voice Synthesis Engine Selection & Configuration */}
                    <div className="border border-emerald-200 bg-emerald-50/50 rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Volume2 className="w-4 h-4 text-emerald-700" />
                          <h3 className="text-xs font-bold text-slate-900">Voice Synthesis Engine (Google Cloud Neural2 / Journey)</h3>
                        </div>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium">Broadcast Quality</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-slate-600">Active TTS Provider</label>
                          <select
                            value={aiTtsProviderEdit || aiConfig?.ttsProvider || "elevenlabs"}
                            onChange={(e) => setAiTtsProviderEdit(e.target.value as any)}
                            className="w-full bg-white border border-slate-200 text-slate-900 rounded-lg p-2.5 text-xs font-medium"
                          >
                            <option value="elevenlabs">ElevenLabs Turbo (AI Female Voice)</option>
                            <option value="google">Google Cloud (Neural2 & Journey Indian Voices)</option>
                            <option value="auto">Auto (ElevenLabs with Google Fallback)</option>
                          </select>
                          <p className="text-[10px] text-slate-500">Google Cloud Journey voices provide warm Indian conversational speech.</p>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-slate-600">Google Cloud API Key (AIza...)</label>
                          <Input
                            type="password"
                            placeholder={aiConfig?.googleTtsApiKey ? "••••••••••••••••••••••••" : "Paste Google Cloud TTS API Key"}
                            value={aiGoogleKeyEdit}
                            onChange={(e) => setAiGoogleKeyEdit(e.target.value)}
                            className="bg-white border-slate-200 text-slate-900 text-xs"
                          />
                          <p className="text-[10px] text-slate-500">Google Cloud API Key with Text-to-Speech API enabled.</p>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-slate-600">Google Voice Persona</label>
                          <select
                            value={aiGoogleVoiceEdit || aiConfig?.googleTtsVoice || "en-IN-Journey-F"}
                            onChange={(e) => setAiGoogleVoiceEdit(e.target.value)}
                            className="w-full bg-white border border-slate-200 text-slate-900 rounded-lg p-2.5 text-xs"
                          >
                            <option value="en-IN-Journey-F">en-IN-Journey-F (Indian English Warm Conversational Female)</option>
                            <option value="en-IN-Journey-D">en-IN-Journey-D (Indian English Natural Male)</option>
                            <option value="en-IN-Neural2-A">en-IN-Neural2-A (Indian English Neural2 Female)</option>
                            <option value="en-IN-Neural2-D">en-IN-Neural2-D (Indian English Neural2 Male)</option>
                            <option value="hi-IN-Neural2-A">hi-IN-Neural2-A (Hindi Native Female Neural2)</option>
                            <option value="hi-IN-Neural2-D">hi-IN-Neural2-D (Hindi Native Male Neural2)</option>
                          </select>
                          <p className="text-[10px] text-slate-500">Bilingual automatic switching for Hindi and English questions.</p>
                        </div>
                      </div>

                      {/* Optional ElevenLabs Configuration */}
                      <div className="pt-2 border-t border-emerald-200/60 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-slate-600">ElevenLabs API Key (sk_...)</label>
                          <Input
                            type="password"
                            placeholder={aiConfig?.elevenlabsApiKey ? "••••••••••••••••••••••••" : "Paste ElevenLabs sk_ key here"}
                            value={aiElevenlabsKeyEdit}
                            onChange={(e) => setAiElevenlabsKeyEdit(e.target.value)}
                            className="bg-white border-slate-200 text-slate-900 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-slate-600">ElevenLabs Voice ID</label>
                          <select
                            value={aiElevenlabsVoiceEdit || aiConfig?.elevenlabsVoiceId || "EXAVITQu4vr4xnSDxMaL"}
                            onChange={(e) => setAiElevenlabsVoiceEdit(e.target.value)}
                            className="w-full bg-white border border-slate-200 text-slate-900 rounded-lg p-2.5 text-xs"
                          >
                            <option value="EXAVITQu4vr4xnSDxMaL">Sarah (Warm, Reassuring, Professional Female)</option>
                            <option value="21m00Tcm4TlvDq8ikWAM">Rachel (Calm, Gentle, Conversational)</option>
                            <option value="9BWtsMINqrJLrRacOk9x">Aria (Expressive, Warm)</option>
                            <option value="pFZP5JQG7iQjIQuC4Bku">Lily (Polite Educator)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-semibold text-slate-600">School Knowledge Base (AI System Prompt)</label>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs text-slate-500 h-6 px-2"
                          onClick={() => setAiPromptEdit(aiConfig?.systemPrompt || "")}
                        >
                          <Copy className="w-3 h-3 mr-1" /> Load Current
                        </Button>
                      </div>
                      <Textarea
                        rows={18}
                        placeholder="Enter the complete school knowledge base here. Include: contact info, facilities, admissions, fee structure, leadership, achievements, etc."
                        value={aiPromptEdit || aiConfig?.systemPrompt || ""}
                        onChange={(e) => setAiPromptEdit(e.target.value)}
                        className="bg-slate-50 border-slate-200 text-slate-900 text-xs font-mono leading-relaxed"
                      />
                      <p className="text-[10px] text-slate-400">{(aiPromptEdit || aiConfig?.systemPrompt || "").length} characters. More detail = better AI answers.</p>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        onClick={() => updateAiConfigMutation.mutate({
                          systemPrompt: aiPromptEdit || aiConfig?.systemPrompt || "",
                          modelId: aiModelEdit || aiConfig?.modelId || "llama-3.3-70b-versatile",
                          temperature: aiTempEdit || aiConfig?.temperature || 0.4,
                          maxTokens: 700,
                          ttsProvider: aiTtsProviderEdit || undefined,
                          googleTtsApiKey: aiGoogleKeyEdit.trim() || undefined,
                          googleTtsVoice: aiGoogleVoiceEdit || undefined,
                          elevenlabsApiKey: aiElevenlabsKeyEdit.trim() || undefined,
                          elevenlabsVoiceId: aiElevenlabsVoiceEdit || undefined,
                        })}
                        disabled={updateAiConfigMutation.isPending}
                        className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs"
                      >
                        <Bot className="w-3.5 h-3.5 mr-1.5" />
                        {updateAiConfigMutation.isPending ? "Saving..." : "Save AI Configuration"}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* IMMUTABLE AUDIT LOGS LEDGER */}
              {activeTab === "audit_logs" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-sm">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-slate-900">Immutable Audit Logs Ledger</h2>
                          <p className="text-xs text-slate-500">Cryptographically Hash-Chained (SHA-256) Immutable Audit Trail</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => {
                          refetchAuditLogs();
                          refetchVerification();
                          toast.success("Cryptographic ledger re-verified against SHA-256 chain!");
                        }}
                        variant="outline"
                        size="sm"
                        className="text-xs border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5 mr-1" /> Re-Verify Chain
                      </Button>
                    </div>
                  </div>

                  {/* Verification Status Banner */}
                  <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs ${
                    auditVerification?.isTamperFree !== false
                      ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                      : "bg-red-50 border-red-200 text-red-950"
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                        auditVerification?.isTamperFree !== false
                          ? "bg-emerald-600 text-white"
                          : "bg-red-600 text-white"
                      }`}>
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold">
                            {auditVerification?.isTamperFree !== false
                              ? "Ledger Integrity 100% Cryptographically Verified"
                              : "⚠️ Ledger Integrity Compromise Detected!"}
                          </h3>
                          <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-full bg-emerald-200/80 text-emerald-900 border border-emerald-300">
                            SHA-256 Chained
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">
                          {auditVerification?.isTamperFree !== false
                            ? `All ${auditLogsList?.length || 0} audit records form an unbroken, mathematical block sequence in MongoDB. Logs are strictly append-only and cannot be altered or deleted.`
                            : `Compromised sequence block #${auditVerification?.compromisedSequence}. Check database records immediately.`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Total Recorded Logs</p>
                      <p className="text-xl font-black text-emerald-800">{auditLogsList?.length || 0}</p>
                    </div>
                  </div>

                  {/* Audit Logs Table */}
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/50">
                      <div className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2">
                        <span>Event Audit Trail</span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-mono">
                          {auditLogsList?.length || 0} Records
                        </span>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-slate-100/75 border-b border-slate-200 text-slate-600 font-semibold text-[11px] uppercase tracking-wider">
                            <th className="px-4 py-3">Seq #</th>
                            <th className="px-4 py-3">Timestamp</th>
                            <th className="px-4 py-3">Operator</th>
                            <th className="px-4 py-3">Module</th>
                            <th className="px-4 py-3">Action</th>
                            <th className="px-4 py-3">Details</th>
                            <th className="px-4 py-3 font-mono">Cryptographic Hash</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {(!auditLogsList || auditLogsList.length === 0) ? (
                            <tr>
                              <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                                No audit events logged yet. Every admin action (create, update, hard delete) will be recorded here automatically.
                              </td>
                            </tr>
                          ) : (
                            auditLogsList.map((log: any) => (
                              <tr key={log._id || log.sequenceNumber} className="hover:bg-slate-50/80 transition-colors">
                                <td className="px-4 py-3 font-mono font-bold text-slate-900">
                                  #{log.sequenceNumber}
                                </td>
                                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                                  {new Date(log.timestamp).toLocaleString("en-IN", {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    second: "2-digit",
                                  })}
                                </td>
                                <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">
                                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-[11px]">
                                    <User className="w-3 h-3 text-slate-500" />
                                    {log.performedBy}
                                  </span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                    {log.module}
                                  </span>
                                </td>
                                <td className="px-4 py-3 font-mono text-[11px] font-bold whitespace-nowrap">
                                  <span className={`px-2 py-0.5 rounded-md border ${
                                    log.action.includes("DELETE")
                                      ? "bg-red-50 text-red-700 border-red-200"
                                      : log.action.includes("CREATE")
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                      : "bg-blue-50 text-blue-700 border-blue-200"
                                  }`}>
                                    {log.action}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-slate-700 max-w-xs truncate" title={log.details}>
                                  {log.details}
                                </td>
                                <td className="px-4 py-3 font-mono text-[10px] text-slate-500 max-w-[140px] truncate" title={log.currentHash}>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(log.currentHash);
                                      toast.success("SHA-256 hash copied to clipboard!");
                                    }}
                                    className="hover:text-emerald-700 flex items-center gap-1 text-slate-600 transition-colors"
                                  >
                                    <Copy className="w-3 h-3 shrink-0" />
                                    <span>{log.currentHash ? `${log.currentHash.substring(0, 10)}...` : "N/A"}</span>
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 12. MANAGE MENUS */}
              {activeTab === "menus" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Manage Navigation Menus</h2>
                      <p className="text-xs text-slate-500">Header & Footer Nav Links • Fully Customizable & Live</p>
                    </div>
                    <Button
                      onClick={() => {
                        setEditingMenuId(null);
                        setMenuForm({ title: "", url: "", location: "header", parent: "", order: 1, isActive: true });
                        setMenuModal(true);
                      }}
                      size="sm"
                      className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add Menu Item
                    </Button>
                  </div>

                  <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                    {[
                      { id: "all", label: "All Menus" },
                      { id: "header", label: "Header Main Nav" },
                      { id: "footer_quick", label: "Footer Quick Links" },
                      { id: "footer_resources", label: "Footer Resources" },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setSelectedMenuLocation(tab.id as any)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          selectedMenuLocation === tab.id
                            ? "bg-emerald-700 text-white shadow-xs"
                            : "text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3">Menu Title</th>
                          <th className="px-4 py-3">Target URL</th>
                          <th className="px-4 py-3">Location</th>
                          <th className="px-4 py-3">Parent Menu</th>
                          <th className="px-4 py-3">Order</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>

                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(() => {
                          if (!menusList) return [];
                          const filtered = menusList.filter((m: any) =>
                            (selectedMenuLocation === "all" ? true : m.location === selectedMenuLocation) && !m.isDeleted
                          );

                          const parents = filtered
                            .filter((m: any) => !m.parent || m.parent.trim() === "" || m.parent === "None")
                            .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));

                          const result: any[] = [];
                          const addedIds = new Set<string>();

                          for (const parent of parents) {
                            if (!addedIds.has(parent._id)) {
                              result.push(parent);
                              addedIds.add(parent._id);
                            }

                            const pTitle = (parent.title || "").trim().toLowerCase();
                            const pId = parent._id ? parent._id.toString() : "";
                            const children = filtered
                              .filter((c: any) => {
                                if (!c.parent || c.parent.trim() === "" || c.parent === "None") return false;
                                if (c.location !== parent.location) return false;
                                const cParent = c.parent.trim().toLowerCase();
                                return cParent === pTitle || cParent === pId;
                              })
                              .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));

                            for (const child of children) {
                              if (!addedIds.has(child._id)) {
                                result.push(child);
                                addedIds.add(child._id);
                              }
                            }
                          }

                          const orphans = filtered
                            .filter((m: any) => !addedIds.has(m._id))
                            .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));

                          result.push(...orphans);
                          return result;
                        })().map((m: any) => (
                            <tr key={m._id} className={`transition-colors ${m.parent ? "bg-slate-50/50 hover:bg-slate-100/70" : "hover:bg-slate-50"}`}>
                              <td className="px-4 py-3 font-semibold text-slate-900 flex items-center gap-2">
                                {m.parent && <span className="text-emerald-600 font-mono pl-3 text-xs">└─</span>}
                                <span>{m.title}</span>
                              </td>
                              <td className="px-4 py-3 font-mono text-emerald-700">{m.url}</td>
                              <td className="px-4 py-3">
                                <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 font-medium capitalize">
                                  {m.location === "header"
                                    ? "Header Nav"
                                    : m.location === "footer_quick"
                                    ? "Footer Quick"
                                    : "Footer Resources"}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-slate-500">{m.parent || "—"}</td>
                              <td className="px-4 py-3 font-mono text-slate-600">{m.order}</td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${m.isActive !== false ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500"}`}>
                                  {m.isActive !== false ? "Visible" : "Hidden"}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right space-x-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-slate-500 hover:bg-slate-100 h-7 px-2 cursor-pointer"
                                  title={m.isActive !== false ? "Hide from nav" : "Show in nav"}
                                  disabled={toggleMenuMutation.isPending}
                                  onClick={() => toggleMenuMutation.mutate({ id: String(m._id || m.id), isActive: !(m.isActive !== false) })}
                                >
                                  {m.isActive !== false ? <ToggleRight className="w-3.5 h-3.5 text-emerald-600" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-slate-600 hover:bg-slate-100 h-7 px-2 cursor-pointer"
                                  title="Edit Menu"
                                  onClick={() => {
                                    setEditingMenuId(m._id ? String(m._id) : m.id);
                                    setMenuForm({
                                      title: m.title || "",
                                      url: m.url || "",
                                      location: m.location || "header",
                                      parent: m.parent || "",
                                      order: m.order ?? 0,
                                      isActive: m.isActive !== false,
                                    });
                                    setMenuModal(true);
                                  }}
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-600 hover:bg-red-50 h-7 px-2 cursor-pointer"
                                  disabled={deleteMenu.isPending}
                                  title="Delete Menu"
                                  onClick={() => {
                                    const menuId = String(m._id || m.id);
                                    if (confirm(`Are you sure you want to delete menu item "${m.title || 'this menu'}"?`)) {
                                      deleteMenu.mutate({ id: menuId });
                                    }
                                  }}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        {(!menusList || menusList.length === 0) && (
                          <tr>
                            <td colSpan={6} className="text-center py-8 text-slate-400">
                              No navigation items found. Click "Add Menu Item" to create one.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* LIGHT THEME MODALS */}
        {/* MODAL: ADD / EDIT PAGE */}
        {pageModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">
                  {editingPageId ? "Edit Page" : "Create New Page"}
                </h3>
                <button
                  onClick={() => {
                    setPageModal(false);
                    setEditingPageId(null);
                  }}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600">Page Title</label>
                  <Input
                    placeholder="e.g. Science Labs"
                    value={pageForm.title}
                    onChange={(e) => {
                      const newTitle = e.target.value;
                      if (!editingPageId) {
                        setPageForm({
                          ...pageForm,
                          title: newTitle,
                          slug: newTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
                        });
                      } else {
                        setPageForm({ ...pageForm, title: newTitle });
                      }
                    }}
                    className="bg-slate-50 border-slate-200 text-slate-900 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600">Category</label>
                  <select
                    value={pageForm.category || "General"}
                    onChange={(e) => setPageForm({ ...pageForm, category: e.target.value })}
                    className="w-full h-9 rounded-md bg-slate-50 border border-slate-200 text-slate-900 text-xs px-2.5 outline-none focus:border-emerald-600"
                  >
                    <option value="General">General</option>
                    <option value="About">About</option>
                    <option value="Academics">Academics</option>
                    <option value="Admissions">Admissions</option>
                    <option value="Facilities">Facilities</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Campus">Campus</option>
                    <option value="Policy">Policy</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600">URL Slug</label>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-mono text-slate-400">dpsindirapuram.com/</span>
                  <Input
                    placeholder="science-labs"
                    value={pageForm.slug}
                    onChange={(e) => setPageForm({ ...pageForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "") })}
                    className="bg-slate-50 border-slate-200 text-slate-900 font-mono text-xs flex-1"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600">Page Content (WYSIWYG Editor)</label>
                <RichTextEditor
                  value={pageForm.content}
                  onChange={(val) => setPageForm({ ...pageForm, content: val })}
                  placeholder="Design your page content, headings, formatting..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  variant="outline"
                  onClick={() => {
                    setPageModal(false);
                    setEditingPageId(null);
                  }}
                  className="text-slate-600 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (editingPageId) {
                      updatePage.mutate({ id: editingPageId, ...pageForm });
                    } else {
                      createPage.mutate(pageForm);
                    }
                  }}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs shadow-sm"
                >
                  {editingPageId ? "Save Changes" : "Publish Page"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: ADD GALLERY IMAGE */}
        {galleryModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Upload Gallery Image (Cloudinary Auto-WebP)</h3>
                <button
                  onClick={() => setGalleryModal(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <Input
                placeholder="Image Title / Caption"
                value={galleryForm.title}
                onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })}
                className="bg-slate-50 border-slate-200 text-slate-900 text-xs"
              />
              <select
                value={galleryForm.category}
                onChange={(e) => setGalleryForm({ ...galleryForm, category: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg p-2.5 text-xs"
              >
                <option value="Campus">Campus</option>
                <option value="Sports">Sports</option>
                <option value="Events">Events</option>
                <option value="Academics">Academics</option>
                <option value="Laboratories">Laboratories</option>
              </select>

              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-emerald-600 transition-colors bg-slate-50">
                <Upload className="w-8 h-8 text-emerald-700 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-800">Select JPEG, PNG, or HEIC file</p>
                <p className="text-[10px] text-slate-500 mt-1">Uploaded directly to Cloudinary CDN in WebP format</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleMediaUpload(file, (webpUrl) => {
                        setGalleryForm({ ...galleryForm, imageUrl: webpUrl });
                      });
                    }
                  }}
                  className="mt-4 text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-[11px] file:font-semibold file:bg-emerald-700 file:text-white hover:file:bg-emerald-800 cursor-pointer"
                />
              </div>

              {galleryForm.imageUrl && (
                <div className="relative rounded-lg overflow-hidden h-28 bg-slate-100 border border-slate-200">
                  <img src={galleryForm.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-emerald-700 text-[9px] text-white font-bold">
                    Cloudinary WebP Ready
                  </span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button variant="outline" onClick={() => setGalleryModal(false)} className="text-slate-600 text-xs">Cancel</Button>
                <Button
                  disabled={!galleryForm.imageUrl || isUploading}
                  onClick={() => createGalleryImage.mutate(galleryForm)}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs shadow-sm"
                >
                  Save Image
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: ADD / EDIT SLIDER */}
        {sliderModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">
                  {editingSlider ? "Edit Hero Banner" : "Add Hero Slider Banner"}
                </h3>
                <button
                  onClick={() => {
                    setSliderModal(false);
                    setEditingSlider(null);
                  }}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Media Type Selector */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Banner Media Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSliderForm({ ...sliderForm, mediaType: "image" })}
                    className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                      sliderForm.mediaType === "image"
                        ? "bg-sky-50 text-sky-700 border-sky-300 ring-1 ring-sky-300"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    🖼️ Photo Image
                  </button>
                  <button
                    type="button"
                    onClick={() => setSliderForm({ ...sliderForm, mediaType: "video" })}
                    className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                      sliderForm.mediaType === "video"
                        ? "bg-purple-50 text-purple-700 border-purple-300 ring-1 ring-purple-300"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    🎬 Direct Video
                  </button>
                </div>
              </div>

              <Input
                placeholder="Slider Title (Optional - leave empty for clean full-screen video)"
                value={sliderForm.title}
                onChange={(e) => setSliderForm({ ...sliderForm, title: e.target.value })}
                className="bg-slate-50 border-slate-200 text-slate-900 text-xs"
              />
              <Input
                placeholder="Subtitle (e.g. Excellence in CBSE Education)"
                value={sliderForm.subtitle}
                onChange={(e) => setSliderForm({ ...sliderForm, subtitle: e.target.value })}
                className="bg-slate-50 border-slate-200 text-slate-900 text-xs"
              />
              <div className="grid grid-cols-3 gap-2">
                <Input
                  placeholder="Button Text"
                  value={sliderForm.buttonText}
                  onChange={(e) => setSliderForm({ ...sliderForm, buttonText: e.target.value })}
                  className="bg-slate-50 border-slate-200 text-slate-900 text-xs"
                />
                <Input
                  placeholder="Button Link"
                  value={sliderForm.buttonLink}
                  onChange={(e) => setSliderForm({ ...sliderForm, buttonLink: e.target.value })}
                  className="bg-slate-50 border-slate-200 text-slate-900 text-xs"
                />
                <Input
                  type="number"
                  placeholder="Order (e.g. 1)"
                  value={sliderForm.order || ""}
                  onChange={(e) => setSliderForm({ ...sliderForm, order: parseInt(e.target.value) || 0 })}
                  className="bg-slate-50 border-slate-200 text-slate-900 text-xs"
                />
              </div>

              {/* MEDIA UPLOADER */}
              {sliderForm.mediaType === "video" ? (
                <div className="space-y-3">
                  {isUploading && (
                    <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between text-xs font-semibold text-purple-900 mb-1">
                          <span>Uploading video to CDN...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-purple-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.max(5, uploadProgress)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="border-2 border-dashed border-purple-300 rounded-lg p-5 text-center hover:border-purple-600 transition-colors bg-purple-50/40">
                    <Upload className="w-8 h-8 text-purple-700 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-800">Upload Video File</p>
                    <p className="text-[10px] text-slate-500 mt-1">MP4, WebM, MOV supported • High-speed direct CDN upload</p>
                    <input
                      type="file"
                      accept="video/*"
                      disabled={isUploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleMediaUpload(
                            file,
                            (videoUrl) => {
                              let autoPoster = sliderForm.imageUrl;
                              if (!autoPoster && videoUrl.includes("cloudinary.com")) {
                                autoPoster = videoUrl
                                  .replace("/video/upload/", "/video/upload/so_0,w_800,c_limit,q_auto,f_auto/")
                                  .replace(/\.[^/.]+$/, ".jpg");
                              }
                              setSliderForm((prev) => ({
                                ...prev,
                                videoUrl,
                                imageUrl: autoPoster || prev.imageUrl || "/images/dps/slider_1.webp",
                                mediaType: "video",
                              }));
                            },
                            { resourceType: "video", folder: "dpsi_videos" }
                          );
                        }
                      }}
                      className="mt-3 text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-[11px] file:font-semibold file:bg-purple-700 file:text-white hover:file:bg-purple-800 cursor-pointer disabled:opacity-50"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-500 text-[11px]">Or choose preset:</span>
                    <button
                      type="button"
                      onClick={() => setSliderForm({ ...sliderForm, videoUrl: "/videos/campus_hero.mp4", mediaType: "video" })}
                      className="px-2.5 py-1 rounded bg-purple-100 hover:bg-purple-200 text-purple-800 text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer border border-purple-200"
                    >
                      <span>🎬 Use Campus Video (/videos/campus_hero.mp4)</span>
                    </button>
                  </div>

                  <div className="relative">
                    <Input
                      placeholder="Or paste direct video URL (e.g. https://.../video.mp4 or /videos/campus_hero.mp4)"
                      value={sliderForm.videoUrl}
                      onChange={(e) => setSliderForm({ ...sliderForm, videoUrl: e.target.value, mediaType: "video" })}
                      className="bg-slate-50 border-slate-200 text-slate-900 text-xs font-mono"
                    />
                  </div>

                  {sliderForm.videoUrl && (
                    <div className="relative rounded-lg overflow-hidden h-44 bg-slate-950 border border-slate-200">
                      <video
                        src={sliderForm.videoUrl}
                        controls
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded bg-purple-700 text-[9px] text-white font-bold">
                          Video Ready
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSliderForm({ ...sliderForm, videoUrl: "" })}
                        className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/75 hover:bg-red-600 text-[10px] text-white font-semibold transition-colors cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  {/* MOBILE VIEW VIDEO ADAPTATION & DEDICATED UPLOAD */}
                  <div className="p-3.5 rounded-xl border border-purple-200 bg-purple-50/50 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <span>📱</span> Mobile View Video Configuration
                        </span>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Auto-adapt your main video or upload a separate vertical (9:16) video for phones.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setSliderForm((prev) => ({
                            ...prev,
                            useSeparateMobileVideo: !prev.useSeparateMobileVideo,
                          }))
                        }
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer border shrink-0 ${
                          sliderForm.useSeparateMobileVideo
                            ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                            : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        {sliderForm.useSeparateMobileVideo ? "Separate Video: ON" : "Auto-Resize: ON"}
                      </button>
                    </div>

                    {!sliderForm.useSeparateMobileVideo ? (
                      <div className="p-3 bg-white rounded-lg border border-purple-100 flex items-start gap-2.5 text-xs text-slate-600">
                        <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-purple-900 block">Automatic Mobile Adaptation Active</span>
                          On phones and mobile viewports, the primary video automatically adapts to 9:16 portrait using AI gravity cropping and CDN optimization.
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3 pt-1">
                        <div className="border-2 border-dashed border-purple-300 rounded-lg p-4 text-center hover:border-purple-600 transition-colors bg-white">
                          <Upload className="w-6 h-6 text-purple-700 mx-auto mb-1.5" />
                          <p className="text-xs font-semibold text-slate-800">Upload Mobile Vertical Video (9:16)</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">MP4, WebM, MOV portrait video optimized for smartphones</p>
                          <input
                            type="file"
                            accept="video/*"
                            disabled={isUploading}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleMediaUpload(
                                  file,
                                  (mobileVideoUrl) => {
                                    setSliderForm((prev) => ({
                                      ...prev,
                                      mobileVideoUrl,
                                      useSeparateMobileVideo: true,
                                    }));
                                  },
                                  { resourceType: "video", folder: "dpsi_mobile_videos" }
                                );
                              }
                            }}
                            className="mt-2 text-xs text-slate-500 file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-[11px] file:font-semibold file:bg-purple-700 file:text-white hover:file:bg-purple-800 cursor-pointer disabled:opacity-50"
                          />
                        </div>

                        <Input
                          placeholder="Or paste direct mobile vertical video URL (https://...)"
                          value={sliderForm.mobileVideoUrl}
                          onChange={(e) =>
                            setSliderForm({
                              ...sliderForm,
                              mobileVideoUrl: e.target.value,
                              useSeparateMobileVideo: true,
                            })
                          }
                          className="bg-white border-purple-200 text-slate-900 text-xs font-mono"
                        />

                        {sliderForm.mobileVideoUrl && (
                          <div className="relative rounded-lg overflow-hidden h-48 w-32 mx-auto bg-slate-950 border border-purple-300 shadow-md">
                            <video
                              src={sliderForm.mobileVideoUrl}
                              controls
                              autoPlay
                              loop
                              muted
                              playsInline
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-1.5 left-1.5">
                              <span className="px-1.5 py-0.5 rounded bg-purple-700 text-[8px] text-white font-bold">
                                Mobile 9:16
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setSliderForm({ ...sliderForm, mobileVideoUrl: "" })}
                              className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/75 hover:bg-red-600 text-[9px] text-white font-semibold transition-colors cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-5 text-center hover:border-emerald-600 transition-colors bg-slate-50">
                    <Upload className="w-8 h-8 text-emerald-700 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-800">Select Banner Image</p>
                    <p className="text-[10px] text-slate-500 mt-1">Uploaded directly to Cloudinary CDN in WebP format</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleMediaUpload(file, (webpUrl) => {
                            setSliderForm({ ...sliderForm, imageUrl: webpUrl, mediaType: "image" });
                          });
                        }
                      }}
                      className="mt-3 text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-[11px] file:font-semibold file:bg-emerald-700 file:text-white hover:file:bg-emerald-800 cursor-pointer"
                    />
                  </div>

                  <Input
                    placeholder="Or enter direct image URL (https://...)"
                    value={sliderForm.imageUrl}
                    onChange={(e) => setSliderForm({ ...sliderForm, imageUrl: e.target.value, mediaType: "image" })}
                    className="bg-slate-50 border-slate-200 text-slate-900 text-xs"
                  />

                  {sliderForm.imageUrl && (
                    <div className="relative rounded-lg overflow-hidden h-32 bg-slate-100 border border-slate-200">
                      <img src={sliderForm.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-emerald-700 text-[9px] text-white font-bold">
                        WebP Ready
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSliderModal(false);
                    setEditingSlider(null);
                  }}
                  className="text-slate-600 text-xs cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  disabled={
                    (sliderForm.mediaType === "video" ? !sliderForm.videoUrl : !sliderForm.imageUrl) ||
                    isUploading
                  }
                  onClick={() => {
                    const payload = { ...sliderForm };
                    if (payload.mediaType === "video" && !payload.imageUrl) {
                      payload.imageUrl = "/images/dps/slider_1.webp";
                    }
                    if (editingSlider) {
                      updateSlider.mutate({ id: editingSlider, ...payload });
                    } else {
                      createSlider.mutate(payload);
                    }
                  }}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs shadow-sm cursor-pointer"
                >
                  {isUploading ? "Uploading..." : editingSlider ? "Update Slider" : "Save Slider"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: ADD / EDIT VIDEO */}
        {videoModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">
                  {editingVideoId ? "Edit Video" : "Add Video to Gallery"}
                </h3>
                <button
                  onClick={() => {
                    setVideoModal(false);
                    setEditingVideoId(null);
                  }}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600">Video Title *</label>
                <Input
                  placeholder="Video Title (e.g. Annual Sports Day 2026 / AI Innovation Lab)"
                  value={videoForm.title}
                  onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                  className="bg-slate-50 border-slate-200 text-slate-900 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600">YouTube URL, Video ID, or Direct MP4 Link *</label>
                <Input
                  placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ or shorts/live/youtu.be link"
                  value={videoForm.youtubeUrl}
                  onChange={(e) => {
                    const val = e.target.value;
                    let thumbUrl = videoForm.thumbnailUrl;
                    const match = val.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed\/|v\/|shorts\/|live\/|watch\?(?:.*&)?v=))([\w-]{11})/i);
                    const vid = match ? match[1] : val.trim().length === 11 && /^[\w-]{11}$/.test(val.trim()) ? val.trim() : "";
                    if (vid) {
                      thumbUrl = `https://img.youtube.com/vi/${vid}/hqdefault.jpg`;
                    }
                    setVideoForm({ ...videoForm, youtubeUrl: val, thumbnailUrl: thumbUrl });
                  }}
                  className="bg-slate-50 border-slate-200 text-slate-900 text-xs font-mono"
                />
                <p className="text-[10px] text-slate-400">Supports regular YouTube URLs, YouTube Shorts, Live streams, youtu.be shortlinks, or 11-char video IDs.</p>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600">Category</label>
                <select
                  value={videoForm.category}
                  onChange={(e) => setVideoForm({ ...videoForm, category: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg p-2.5 text-xs"
                >
                  <option value="Events">Events</option>
                  <option value="Campus">Campus</option>
                  <option value="Sports">Sports</option>
                  <option value="Academics">Academics</option>
                  <option value="Robotics">Robotics</option>
                  <option value="MUN">MUN</option>
                  <option value="Cultural">Cultural</option>
                </select>
              </div>

              {/* Custom Thumbnail URL & Upload */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600">Cover Thumbnail URL (Auto-Generated or Custom)</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://img.youtube.com/vi/... or custom image URL"
                    value={videoForm.thumbnailUrl}
                    onChange={(e) => setVideoForm({ ...videoForm, thumbnailUrl: e.target.value })}
                    className="bg-slate-50 border-slate-200 text-slate-900 text-xs font-mono"
                  />
                  <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold flex items-center gap-1 shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleMediaUpload(file, (url) => {
                            setVideoForm({ ...videoForm, thumbnailUrl: url });
                          });
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              {videoForm.thumbnailUrl && (
                <div className="relative rounded-lg overflow-hidden h-36 bg-slate-900 border border-slate-200">
                  <img
                    src={videoForm.thumbnailUrl}
                    alt="Thumbnail preview"
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <Play className="w-8 h-8 fill-white text-white drop-shadow-md" />
                  </div>
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-mono">
                    Live Video Preview
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  variant="outline"
                  onClick={() => {
                    setVideoModal(false);
                    setEditingVideoId(null);
                    setVideoForm({ title: "", category: "Events", youtubeUrl: "", thumbnailUrl: "" });
                  }}
                  className="text-slate-600 text-xs cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  disabled={!videoForm.title.trim() || !videoForm.youtubeUrl.trim() || createVideo.isPending || updateVideo.isPending}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const payload = {
                      title: videoForm.title.trim(),
                      category: videoForm.category || "Events",
                      youtubeUrl: videoForm.youtubeUrl.trim(),
                      thumbnailUrl: videoForm.thumbnailUrl.trim(),
                    };
                    if (editingVideoId) {
                      updateVideo.mutate({ id: String(editingVideoId), ...payload });
                    } else {
                      createVideo.mutate(payload);
                    }
                  }}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs cursor-pointer shadow-sm font-semibold"
                >
                  {createVideo.isPending || updateVideo.isPending
                    ? "Saving..."
                    : editingVideoId
                    ? "Update Video"
                    : "Save Video"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: ADD / EDIT MENU ITEM */}
        {menuModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">
                  {editingMenuId ? "Edit Navigation Menu Item" : "Add Navigation Menu Item"}
                </h3>
                <button
                  onClick={() => {
                    setMenuModal(false);
                    setEditingMenuId(null);
                  }}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600">Menu Title</label>
                <Input
                  placeholder="e.g. Admissions, Curriculum, About Us"
                  value={menuForm.title}
                  onChange={(e) => setMenuForm({ ...menuForm, title: e.target.value })}
                  className="bg-slate-50 border-slate-200 text-slate-900 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600">Target URL / Link</label>
                <Input
                  placeholder="e.g. /admissions, /about#vision, or https://..."
                  value={menuForm.url}
                  onChange={(e) => setMenuForm({ ...menuForm, url: e.target.value })}
                  className="bg-slate-50 border-slate-200 text-slate-900 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600">Menu Placement Location</label>
                <select
                  value={menuForm.location}
                  onChange={(e) => setMenuForm({ ...menuForm, location: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg p-2 text-xs"
                >
                  <option value="header">Header Main Nav (Top Bar)</option>
                  <option value="footer_quick">Footer Quick Links (Bottom Left)</option>
                  <option value="footer_resources">Footer Resources & Portals (Bottom Right)</option>
                </select>
              </div>

              {menuForm.location === "header" && (
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600">Parent Menu (For Dropdowns)</label>
                  <select
                    value={menuForm.parent}
                    onChange={(e) => setMenuForm({ ...menuForm, parent: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg p-2 text-xs"
                  >
                    <option value="">None (Top-Level Navigation Tab)</option>
                    {menusList
                      ?.filter((m: any) => m.location === "header" && !m.parent && m._id !== editingMenuId)
                      .map((p: any) => (
                        <option key={p._id} value={p.title}>
                          Inside: {p.title} (Dropdown Item)
                        </option>
                      ))}
                  </select>
                </div>
              )}


              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600">Display Order</label>
                <Input
                  type="number"
                  placeholder="1"
                  value={menuForm.order}
                  onChange={(e) => setMenuForm({ ...menuForm, order: parseInt(e.target.value) || 0 })}
                  className="bg-slate-50 border-slate-200 text-slate-900 text-xs"
                />
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <div>
                  <p className="text-xs font-semibold text-slate-700">Display in Navigation</p>
                  <p className="text-[10px] text-slate-400">Make this menu link visible to visitors</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={menuForm.isActive}
                    onChange={(e) => setMenuForm({ ...menuForm, isActive: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  variant="outline"
                  onClick={() => {
                    setMenuModal(false);
                    setEditingMenuId(null);
                  }}
                  className="text-slate-600 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  disabled={!menuForm.title || !menuForm.url || updateMenu.isPending || createMenu.isPending}
                  onClick={() => {
                    if (editingMenuId) {
                      updateMenu.mutate({
                        id: editingMenuId,
                        ...menuForm,
                        isDeleted: false,
                      });
                    } else {
                      createMenu.mutate(menuForm);
                    }
                  }}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs shadow-sm"
                >
                  {editingMenuId
                    ? (updateMenu.isPending ? "Updating..." : "Update Menu Item")
                    : (createMenu.isPending ? "Saving..." : "Save Menu Item")}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: ADD TC RECORD */}
        {tcModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Add Transfer Certificate (TC)</h3>
                <button
                  onClick={() => setTcModal(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="Admission No. (e.g. DPSI-1082)"
                  value={tcForm.admissionNumber}
                  onChange={(e) => setTcForm({ ...tcForm, admissionNumber: e.target.value })}
                  className="bg-slate-50 border-slate-200 text-slate-900 font-mono text-xs"
                />
                <Input
                  placeholder="Student Full Name"
                  value={tcForm.studentName}
                  onChange={(e) => setTcForm({ ...tcForm, studentName: e.target.value })}
                  className="bg-slate-50 border-slate-200 text-slate-900 text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="Father's Name"
                  value={tcForm.fatherName}
                  onChange={(e) => setTcForm({ ...tcForm, fatherName: e.target.value })}
                  className="bg-slate-50 border-slate-200 text-slate-900 text-xs"
                />
                <Input
                  placeholder="Class Leaving (e.g. Class X)"
                  value={tcForm.classLeaving}
                  onChange={(e) => setTcForm({ ...tcForm, classLeaving: e.target.value })}
                  className="bg-slate-50 border-slate-200 text-slate-900 text-xs"
                />
              </div>
              <Input
                type="date"
                value={tcForm.dateOfIssue}
                onChange={(e) => setTcForm({ ...tcForm, dateOfIssue: e.target.value })}
                className="bg-slate-50 border-slate-200 text-slate-900 text-xs"
              />
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-700">TC Certificate Document (PDF / Scan)</label>
                
                {/* Upload from Local Device Dropzone / Button */}
                <div className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-xl p-4 bg-slate-50/70 hover:bg-emerald-50/30 transition-all text-center">
                  <input
                    type="file"
                    id="tc-file-upload-input"
                    accept=".pdf,application/pdf,image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleMediaUpload(file, (url) => {
                          setTcForm({ ...tcForm, certificatePdfUrl: url });
                        });
                      }
                    }}
                  />
                  <label
                    htmlFor="tc-file-upload-input"
                    className="cursor-pointer flex flex-col items-center justify-center gap-1.5"
                  >
                    <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-sm">
                      <Upload className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                      {isUploading ? "Uploading to Cloudinary CDN..." : "Upload TC Document from Device"}
                    </span>
                    <span className="text-[10px] text-slate-500">Supports PDF documents and scanned images (Max 15MB)</span>
                  </label>
                </div>

                {/* Uploaded File Link / Preview */}
                {tcForm.certificatePdfUrl ? (
                  <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="text-emerald-900 font-medium truncate font-mono text-[11px]">
                        {tcForm.certificatePdfUrl}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <a
                        href={tcForm.certificatePdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-[10px] flex items-center gap-1 shadow-sm"
                      >
                        <span>Preview</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                      <button
                        type="button"
                        onClick={() => setTcForm({ ...tcForm, certificatePdfUrl: "" })}
                        className="p-1 text-slate-400 hover:text-red-600 rounded"
                        title="Remove file"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Or paste direct TC Certificate PDF / Scan URL"
                      value={tcForm.certificatePdfUrl}
                      onChange={(e) => setTcForm({ ...tcForm, certificatePdfUrl: e.target.value })}
                      className="bg-slate-50 border-slate-200 text-slate-900 text-xs"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button variant="outline" onClick={() => setTcModal(false)} className="text-slate-600 text-xs">Cancel</Button>
                <Button
                  disabled={!tcForm.admissionNumber || !tcForm.studentName}
                  onClick={() => createTc.mutate({
                    ...tcForm,
                    certificatePdfUrl: tcForm.certificatePdfUrl || "https://dpsindirapuram.com/tc/sample.pdf",
                  })}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs shadow-sm"
                >
                  Save TC Record
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: ADD / EDIT POPUP */}
        {popupModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">
                  {editingPopup ? "Edit Popup Notice" : "Create Popup Notice"}
                </h3>
                <button
                  onClick={() => {
                    setPopupModal(false);
                    setEditingPopup(null);
                  }}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Popup Banner Image Upload & Direct URL */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-600">Popup Banner Image (Optional)</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Image URL or Cloudinary CDN link"
                    value={popupForm.imageUrl}
                    onChange={(e) => setPopupForm({ ...popupForm, imageUrl: e.target.value })}
                    className="bg-slate-50 border-slate-200 text-slate-900 text-xs"
                  />
                  <label className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-3 py-2 rounded-lg cursor-pointer flex items-center gap-1 shrink-0 border border-slate-200 font-medium">
                    <Upload className="w-3.5 h-3.5" /> Upload
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleMediaUpload(file, (url) => setPopupForm({ ...popupForm, imageUrl: url }));
                        }
                      }}
                    />
                  </label>
                </div>
                {popupForm.imageUrl && (
                  <div className="mt-2 rounded-lg overflow-hidden border border-slate-200 max-h-32 bg-slate-50 flex items-center justify-center">
                    <img src={popupForm.imageUrl} alt="Preview" className="max-h-32 object-contain" />
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-600">Badge Tag (e.g. Official Notice, Admissions Open)</label>
                <Input
                  placeholder="Official Notice"
                  value={popupForm.badgeText}
                  onChange={(e) => setPopupForm({ ...popupForm, badgeText: e.target.value })}
                  className="bg-slate-50 border-slate-200 text-slate-900 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-600">Popup Title</label>
                <Input
                  placeholder="e.g. Admissions Open for Academic Session 2026-27"
                  value={popupForm.title}
                  onChange={(e) => setPopupForm({ ...popupForm, title: e.target.value })}
                  className="bg-slate-50 border-slate-200 text-slate-900 text-xs font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-600">Notice Content</label>
                <Textarea
                  placeholder="Enter notice description or announcements..."
                  rows={3}
                  value={popupForm.content}
                  onChange={(e) => setPopupForm({ ...popupForm, content: e.target.value })}
                  className="bg-slate-50 border-slate-200 text-slate-900 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-600">Button Text</label>
                  <Input
                    placeholder="Learn More"
                    value={popupForm.buttonText}
                    onChange={(e) => setPopupForm({ ...popupForm, buttonText: e.target.value })}
                    className="bg-slate-50 border-slate-200 text-slate-900 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-600">Action Link URL</label>
                  <Input
                    placeholder="/admissions or https://..."
                    value={popupForm.linkUrl}
                    onChange={(e) => setPopupForm({ ...popupForm, linkUrl: e.target.value })}
                    className="bg-slate-50 border-slate-200 text-slate-900 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  variant="outline"
                  onClick={() => {
                    setPopupModal(false);
                    setEditingPopup(null);
                  }}
                  className="text-slate-600 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  disabled={!popupForm.title}
                  onClick={() => {
                    if (editingPopup) {
                      updatePopup.mutate({ id: editingPopup, ...popupForm });
                    } else {
                      createPopup.mutate(popupForm);
                    }
                  }}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs shadow-sm"
                >
                  {editingPopup ? "Update Popup" : "Publish Popup"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: ADD / EDIT MARQUEE */}
        {marqueeModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">
                  {editingMarquee ? "Edit Marquee Announcement" : "Add Marquee Announcement"}
                </h3>
                <button
                  onClick={() => {
                    setMarqueeModal(false);
                    setEditingMarquee(null);
                  }}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Live Preview Box */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600">Live Preview</label>
                <div
                  className={`p-3 border flex items-center justify-between gap-3 shadow-xs transition-all ${
                    marqueeForm.borderRadius === "full" || marqueeForm.shape === "pill"
                      ? "rounded-full"
                      : marqueeForm.borderRadius === "xl"
                      ? "rounded-2xl"
                      : marqueeForm.borderRadius === "md"
                      ? "rounded-lg"
                      : "rounded-none"
                  }`}
                  style={{
                    backgroundColor: marqueeForm.isTransparent ? "transparent" : marqueeForm.bgColor || "#047857",
                    color: marqueeForm.textColor || (marqueeForm.isTransparent ? "#0f172a" : "#ffffff"),
                    borderColor: marqueeForm.isTransparent ? "rgba(0,0,0,0.15)" : "rgba(0,0,0,0.1)",
                    backdropFilter: marqueeForm.isTransparent ? "blur(8px)" : "none",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 ${marqueeForm.borderRadius === "none" ? "rounded-none" : "rounded"} bg-black/25`}>
                      {marqueeForm.badgeText || "Notice"}
                    </span>
                    <span className="text-xs font-semibold">
                      {marqueeForm.text || "Your announcement text will display here..."}
                    </span>
                  </div>
                  <Megaphone className="w-4 h-4 shrink-0 opacity-80" />
                </div>
              </div>

              {/* Background Style: Solid vs Transparent */}
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1.5">Background Style</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMarqueeForm({ ...marqueeForm, isTransparent: false })}
                    className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                      !marqueeForm.isTransparent
                        ? "bg-emerald-50 text-emerald-800 border-emerald-300 ring-1 ring-emerald-300"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    🎨 Solid Theme Color
                  </button>
                  <button
                    type="button"
                    onClick={() => setMarqueeForm({ ...marqueeForm, isTransparent: true })}
                    className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                      marqueeForm.isTransparent
                        ? "bg-sky-50 text-sky-800 border-sky-300 ring-1 ring-sky-300"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    ✨ Transparent Glass
                  </button>
                </div>
              </div>

              {/* Shape Curve / Corner Radius Adjustment */}
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1.5">Box Shape & Corner Curve</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: "none", label: "Rectangle", shape: "rectangle" as const, desc: "0px Sharp" },
                    { id: "md", label: "Soft Curve", shape: "rounded" as const, desc: "8px Round" },
                    { id: "xl", label: "Large Curve", shape: "rounded" as const, desc: "16px Round" },
                    { id: "full", label: "Pill Box", shape: "pill" as const, desc: "Full Round" },
                  ].map((curve) => (
                    <button
                      key={curve.id}
                      type="button"
                      onClick={() =>
                        setMarqueeForm({
                          ...marqueeForm,
                          borderRadius: curve.id as any,
                          shape: curve.shape,
                        })
                      }
                      className={`py-2 px-2 text-center rounded-lg border transition-all cursor-pointer ${
                        (marqueeForm.borderRadius || "none") === curve.id
                          ? "bg-emerald-50 text-emerald-800 border-emerald-400 ring-1 ring-emerald-400 font-bold"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <span className="text-[11px] block">{curve.label}</span>
                      <span className="text-[9px] text-slate-400 block">{curve.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600">Marquee Announcement Text *</label>
                <Input
                  placeholder="e.g. ADMISSIONS OPEN FOR SESSION 2026–27"
                  value={marqueeForm.text}
                  onChange={(e) => setMarqueeForm({ ...marqueeForm, text: e.target.value })}
                  className="bg-slate-50 border-slate-200 text-slate-900 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600">Badge Label (Short)</label>
                  <Input
                    placeholder="Notice, Admissions, Alert"
                    value={marqueeForm.badgeText}
                    onChange={(e) => setMarqueeForm({ ...marqueeForm, badgeText: e.target.value })}
                    className="bg-slate-50 border-slate-200 text-slate-900 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600">Optional Target Link</label>
                  <Input
                    placeholder="/admissions or https://..."
                    value={marqueeForm.linkUrl}
                    onChange={(e) => setMarqueeForm({ ...marqueeForm, linkUrl: e.target.value })}
                    className="bg-slate-50 border-slate-200 text-slate-900 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Color Presets (When Solid Color mode is active) */}
              {!marqueeForm.isTransparent && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-600">Theme Color Presets</label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {[
                      { label: "Emerald", bg: "#047857", text: "#ffffff" },
                      { label: "Amber", bg: "#b45309", text: "#fef3c7" },
                      { label: "Navy", bg: "#1e3a8a", text: "#dbeafe" },
                      { label: "Crimson", bg: "#9f1239", text: "#ffe4e6" },
                      { label: "Purple", bg: "#581c87", text: "#f3e8ff" },
                      { label: "Slate", bg: "#0f172a", text: "#f8fafc" },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() =>
                          setMarqueeForm({
                            ...marqueeForm,
                            bgColor: preset.bg,
                            textColor: preset.text,
                          })
                        }
                        className="p-1.5 rounded-lg border text-center transition-all hover:scale-105 cursor-pointer"
                        style={{
                          backgroundColor: preset.bg,
                          color: preset.text,
                          borderColor: marqueeForm.bgColor === preset.bg ? "#000000" : "transparent",
                        }}
                      >
                        <span className="text-[10px] font-bold block">{preset.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Color Pickers */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                {!marqueeForm.isTransparent && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600">Custom Background Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={marqueeForm.bgColor || "#047857"}
                        onChange={(e) => setMarqueeForm({ ...marqueeForm, bgColor: e.target.value })}
                        className="w-8 h-8 rounded-lg border border-slate-300 p-0.5 cursor-pointer bg-white shrink-0"
                      />
                      <Input
                        value={marqueeForm.bgColor || "#047857"}
                        onChange={(e) => setMarqueeForm({ ...marqueeForm, bgColor: e.target.value })}
                        className="bg-slate-50 border-slate-200 text-slate-900 text-xs font-mono uppercase"
                      />
                    </div>
                  </div>
                )}

                <div className={`space-y-1 ${marqueeForm.isTransparent ? "col-span-2" : ""}`}>
                  <label className="text-[11px] font-semibold text-slate-600">Custom Text / Font Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={marqueeForm.textColor || (marqueeForm.isTransparent ? "#0f172a" : "#ffffff")}
                      onChange={(e) => setMarqueeForm({ ...marqueeForm, textColor: e.target.value })}
                      className="w-8 h-8 rounded-lg border border-slate-300 p-0.5 cursor-pointer bg-white shrink-0"
                    />
                    <Input
                      value={marqueeForm.textColor || (marqueeForm.isTransparent ? "#0f172a" : "#ffffff")}
                      onChange={(e) => setMarqueeForm({ ...marqueeForm, textColor: e.target.value })}
                      className="bg-slate-50 border-slate-200 text-slate-900 text-xs font-mono uppercase"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  variant="outline"
                  onClick={() => {
                    setMarqueeModal(false);
                    setEditingMarquee(null);
                  }}
                  className="text-slate-600 text-xs cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  disabled={!marqueeForm.text.trim()}
                  onClick={() => {
                    if (editingMarquee) {
                      updateMarquee.mutate({ id: editingMarquee, ...marqueeForm });
                    } else {
                      createMarquee.mutate(marqueeForm);
                    }
                  }}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs shadow-sm cursor-pointer"
                >
                  {editingMarquee ? "Update Marquee" : "Save Marquee"}
                </Button>
              </div>
            </div>
          </div>
        )}


        {/* MODAL: ADD / EDIT ACTIVITY */}
        {activityModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">
                  {editingActivity ? "Edit Activity" : "Add Activity"}
                </h3>
                <button
                  onClick={() => {
                    setActivityModal(false);
                    setEditingActivity(null);
                  }}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <Input
                placeholder="Activity Title"
                value={activityForm.title}
                onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })}
                className="bg-slate-50 border-slate-200 text-slate-900 text-xs"
              />
              <Input
                placeholder="Category (e.g. Sports, Robotics, Arts)"
                value={activityForm.category}
                onChange={(e) => setActivityForm({ ...activityForm, category: e.target.value })}
                className="bg-slate-50 border-slate-200 text-slate-900 text-xs"
              />
              <Textarea
                placeholder="Activity Description"
                rows={3}
                value={activityForm.description}
                onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
                className="bg-slate-50 border-slate-200 text-slate-900 text-xs"
              />
              <Input
                placeholder="Image URL (Optional)"
                value={activityForm.imageUrl}
                onChange={(e) => setActivityForm({ ...activityForm, imageUrl: e.target.value })}
                className="bg-slate-50 border-slate-200 text-slate-900 text-xs"
              />
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  variant="outline"
                  onClick={() => {
                    setActivityModal(false);
                    setEditingActivity(null);
                  }}
                  className="text-slate-600 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (editingActivity) {
                      updateActivity.mutate({ id: editingActivity, ...activityForm });
                    } else {
                      createActivity.mutate(activityForm);
                    }
                  }}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs shadow-sm"
                >
                  {editingActivity ? "Update Activity" : "Save Activity"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: ADD / EDIT ATTACHMENT */}
        {attachmentModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">
                  {editingAttachment ? "Edit Attachment / Circular" : "Add Attachment / Circular"}
                </h3>
                <button
                  onClick={() => {
                    setAttachmentModal(false);
                    setEditingAttachment(null);
                  }}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <Input
                placeholder="Document Title"
                value={attachmentForm.title}
                onChange={(e) => setAttachmentForm({ ...attachmentForm, title: e.target.value })}
                className="bg-slate-50 border-slate-200 text-slate-900 text-xs"
              />
              <Input
                placeholder="Category (e.g. Circulars, DateSheet, Syllabus)"
                value={attachmentForm.category}
                onChange={(e) => setAttachmentForm({ ...attachmentForm, category: e.target.value })}
                className="bg-slate-50 border-slate-200 text-slate-900 text-xs"
              />
              <Input
                placeholder="File URL / PDF Link"
                value={attachmentForm.fileUrl}
                onChange={(e) => setAttachmentForm({ ...attachmentForm, fileUrl: e.target.value, fileName: e.target.value.split("/").pop() || "doc.pdf" })}
                className="bg-slate-50 border-slate-200 text-slate-900 text-xs"
              />
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  variant="outline"
                  onClick={() => {
                    setAttachmentModal(false);
                    setEditingAttachment(null);
                  }}
                  className="text-slate-600 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (editingAttachment) {
                      updateAttachment.mutate({ id: editingAttachment, ...attachmentForm });
                    } else {
                      createAttachment.mutate(attachmentForm);
                    }
                  }}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs shadow-sm"
                >
                  {editingAttachment ? "Update Attachment" : "Save Attachment"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: BULK TC IMPORT */}
        {bulkTcModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-lg max-w-3xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-base font-bold text-slate-900">Bulk Import Transfer Certificates</h3>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs font-semibold text-blue-800 mb-1">CSV Format (one student per line):</p>
                <code className="text-[10px] text-blue-700 font-mono block">
                  admissionNumber, studentName, fatherName, motherName, classLeaving, dateOfIssue (YYYY-MM-DD), status (Issued/Pending/Cancelled)
                </code>
                <p className="text-[10px] text-blue-600 mt-1">Example: DPSI-1082, Rahul Sharma, Rajesh Sharma, Priya Sharma, Class X, 2025-04-15, Issued</p>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600">Paste CSV Data</label>
                <Textarea
                  rows={8}
                  placeholder={"DPSI-1001, Rahul Sharma, Rajesh Sharma, Priya Sharma, Class X, 2025-04-15, Issued\nDPSI-1002, Priya Verma, Suresh Verma, Meena Verma, Class XII, 2025-04-20, Issued"}
                  value={bulkCsvText}
                  onChange={(e) => setBulkCsvText(e.target.value)}
                  className="bg-slate-50 border-slate-200 text-slate-900 text-xs font-mono"
                />
              </div>

              <Button
                variant="outline"
                size="sm"
                className="text-xs border-slate-300"
                onClick={() => {
                  const rows = parseBulkCsv(bulkCsvText);
                  setBulkPreviewRows(rows);
                  if (rows.length === 0) toast.error("No valid rows found. Check the format.");
                  else toast.info(`Found ${rows.length} valid records. Review below then confirm.`);
                }}
              >
                Parse & Preview ({parseBulkCsv(bulkCsvText).length} rows)
              </Button>

              {bulkPreviewRows.length > 0 && (
                <div className="border border-slate-200 rounded-lg overflow-auto max-h-52">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="px-3 py-2">Adm No.</th>
                        <th className="px-3 py-2">Student</th>
                        <th className="px-3 py-2">Father</th>
                        <th className="px-3 py-2">Class</th>
                        <th className="px-3 py-2">Date</th>
                        <th className="px-3 py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {bulkPreviewRows.map((r, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="px-3 py-1.5 font-mono font-bold text-emerald-700">{r.admissionNumber}</td>
                          <td className="px-3 py-1.5">{r.studentName}</td>
                          <td className="px-3 py-1.5 text-slate-500">{r.fatherName}</td>
                          <td className="px-3 py-1.5 text-slate-500">{r.classLeaving}</td>
                          <td className="px-3 py-1.5 text-slate-500">{r.dateOfIssue}</td>
                          <td className="px-3 py-1.5">
                            <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">{r.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => { setBulkTcModal(false); setBulkCsvText(""); setBulkPreviewRows([]); }} className="text-slate-600 text-xs">Cancel</Button>
                <Button
                  disabled={bulkPreviewRows.length === 0 || bulkCreateTc.isPending}
                  onClick={() => bulkCreateTc.mutate({ records: bulkPreviewRows })}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs"
                >
                  {bulkCreateTc.isPending ? "Importing..." : `Import ${bulkPreviewRows.length} Records`}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* --- ACHIEVEMENTS / TOPPERS MODAL --- */}
        {achievementModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">{editingAchievementId ? "Edit Topper" : "Add New Topper"}</h3>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setAchievementModal(false)}><X className="w-4 h-4" /></Button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Student Name *</label>
                  <Input value={achievementForm.studentName} onChange={(e) => setAchievementForm({ ...achievementForm, studentName: e.target.value })} placeholder="e.g. Aarav Sharma" className="text-xs" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Class / Grade *</label>
                    <Input value={achievementForm.className} onChange={(e) => setAchievementForm({ ...achievementForm, className: e.target.value })} placeholder="Class X / Class XII" className="text-xs" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Score / Percentage *</label>
                    <Input value={achievementForm.score} onChange={(e) => setAchievementForm({ ...achievementForm, score: e.target.value })} placeholder="99.6% or AIR 14" className="text-xs" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Rank / Title</label>
                    <Input value={achievementForm.rank} onChange={(e) => setAchievementForm({ ...achievementForm, rank: e.target.value })} placeholder="School Topper / District 1st" className="text-xs" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Stream (Optional)</label>
                    <Input value={achievementForm.stream} onChange={(e) => setAchievementForm({ ...achievementForm, stream: e.target.value })} placeholder="Science / Commerce / Humanities" className="text-xs" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Examination</label>
                    <Input value={achievementForm.exam} onChange={(e) => setAchievementForm({ ...achievementForm, exam: e.target.value })} placeholder="CBSE Board Examination" className="text-xs" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Academic Year</label>
                    <Input value={achievementForm.year} onChange={(e) => setAchievementForm({ ...achievementForm, year: e.target.value })} placeholder="2025-26" className="text-xs" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Student Photo</label>
                  <div className="flex gap-2">
                    <Input value={achievementForm.imageUrl} onChange={(e) => setAchievementForm({ ...achievementForm, imageUrl: e.target.value })} placeholder="Image URL (Cloudinary CDN)" className="text-xs" />
                    <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold flex items-center gap-1 shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleMediaUpload(file, (url) => {
                              setAchievementForm((prev) => ({ ...prev, imageUrl: url }));
                            });
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setAchievementModal(false)}>Cancel</Button>
                <Button
                  size="sm"
                  className="bg-emerald-700 hover:bg-emerald-800 text-white"
                  onClick={() => {
                    if (!achievementForm.studentName || !achievementForm.score) {
                      toast.error("Please enter student name and score");
                      return;
                    }
                    if (editingAchievementId) {
                      updateAchievement.mutate({ id: editingAchievementId, ...achievementForm });
                    } else {
                      createAchievement.mutate(achievementForm);
                    }
                  }}
                >
                  {editingAchievementId ? "Save Changes" : "Create Topper"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* --- TESTIMONIAL MODAL --- */}
        {testimonialModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">{editingTestimonialId ? "Edit Testimonial" : "Add Testimonial"}</h3>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setTestimonialModal(false)}><X className="w-4 h-4" /></Button>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Author Name *</label>
                    <Input value={testimonialForm.name} onChange={(e) => setTestimonialForm({ ...testimonialForm, name: e.target.value })} placeholder="e.g. Dr. Sunita Rao" className="text-xs" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Role / Relation *</label>
                    <Input value={testimonialForm.role} onChange={(e) => setTestimonialForm({ ...testimonialForm, role: e.target.value })} placeholder="Parent of Class X Student" className="text-xs" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Review / Testimonial Text *</label>
                  <Textarea rows={4} value={testimonialForm.content} onChange={(e) => setTestimonialForm({ ...testimonialForm, content: e.target.value })} placeholder="Write parent feedback..." className="text-xs" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Star Rating (1-5)</label>
                    <Input type="number" min={1} max={5} value={testimonialForm.rating} onChange={(e) => setTestimonialForm({ ...testimonialForm, rating: parseInt(e.target.value) || 5 })} className="text-xs" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Photo / Avatar</label>
                    <div className="flex gap-2">
                      <Input value={testimonialForm.avatarUrl} onChange={(e) => setTestimonialForm({ ...testimonialForm, avatarUrl: e.target.value })} placeholder="Avatar URL" className="text-xs" />
                      <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold flex items-center gap-1 shrink-0">
                        <Upload className="w-3.5 h-3.5" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleMediaUpload(file, (url) => {
                                setTestimonialForm((prev) => ({ ...prev, avatarUrl: url }));
                              });
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setTestimonialModal(false)}>Cancel</Button>
                <Button
                  size="sm"
                  className="bg-emerald-700 hover:bg-emerald-800 text-white"
                  onClick={() => {
                    if (!testimonialForm.name || !testimonialForm.content) {
                      toast.error("Please enter author name and review text");
                      return;
                    }
                    if (editingTestimonialId) {
                      updateTestimonial.mutate({ id: editingTestimonialId, ...testimonialForm });
                    } else {
                      createTestimonial.mutate(testimonialForm);
                    }
                  }}
                >
                  {editingTestimonialId ? "Save Changes" : "Create Testimonial"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* --- LEADERSHIP MODAL --- */}
        {leadershipModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">{editingLeadershipId ? "Edit Leader Profile" : "Add Leader Profile"}</h3>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => { setLeadershipModal(false); setEditingLeadershipId(null); }}><X className="w-4 h-4" /></Button>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Full Name *</label>
                    <Input value={leadershipForm.name} onChange={(e) => setLeadershipForm({ ...leadershipForm, name: e.target.value })} placeholder="e.g. Ms. Priya Elizabeth John" className="text-xs" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Role / Title *</label>
                    <Input value={leadershipForm.role} onChange={(e) => setLeadershipForm({ ...leadershipForm, role: e.target.value })} placeholder="Principal, DPS Indirapuram" className="text-xs" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Category</label>
                    <select
                      value={leadershipForm.category}
                      onChange={(e) => setLeadershipForm({ ...leadershipForm, category: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg p-2 text-xs"
                    >
                      <option value="Management">Management / Managing Committee</option>
                      <option value="Principal">Principal</option>
                      <option value="Vice Principal">Vice Principal</option>
                      <option value="Headmistress">Headmistress</option>
                      <option value="Faculty">Faculty & Academic Staff</option>
                      <option value="Administration">Administration</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Display Order</label>
                    <Input
                      type="number"
                      value={leadershipForm.order}
                      onChange={(e) => setLeadershipForm({ ...leadershipForm, order: parseInt(e.target.value) || 0 })}
                      placeholder="1"
                      className="text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Biography / Summary</label>
                  <Textarea rows={3} value={leadershipForm.bio} onChange={(e) => setLeadershipForm({ ...leadershipForm, bio: e.target.value })} placeholder="Short professional background..." className="text-xs" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Profile Photo</label>
                  <div className="flex gap-2">
                    <Input
                      value={leadershipForm.imageUrl}
                      onChange={(e) => setLeadershipForm({ ...leadershipForm, imageUrl: e.target.value })}
                      placeholder="Photo URL (Cloudinary CDN)"
                      className="text-xs font-mono"
                    />
                    <label className="cursor-pointer bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 shadow-sm transition-all">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleMediaUpload(file, (url) => {
                              setLeadershipForm((prev) => ({ ...prev, imageUrl: url }));
                              toast.success("Photo uploaded to CDN! Click Save Changes to apply.");
                            });
                          }
                        }}
                      />
                    </label>
                  </div>
                  {leadershipForm.imageUrl && (
                    <div className="mt-2.5 p-2 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-3">
                      <div className="rounded-lg overflow-hidden border border-slate-300 h-16 w-16 bg-white shrink-0 shadow-sm">
                        <img src={leadershipForm.imageUrl} alt="Preview" className="h-full w-full object-cover object-top" />
                      </div>
                      <div className="text-[11px] text-slate-600 overflow-hidden">
                        <p className="font-semibold text-slate-800">Photo Uploaded</p>
                        <p className="truncate font-mono text-[10px] text-slate-400 max-w-xs">{leadershipForm.imageUrl}</p>
                        <p className="text-[10px] text-emerald-600 font-medium">Ready to save with profile</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => { setLeadershipModal(false); setEditingLeadershipId(null); }}>Cancel</Button>
                <Button
                  size="sm"
                  className="bg-emerald-700 hover:bg-emerald-800 text-white"
                  onClick={() => {
                    if (!leadershipForm.name || !leadershipForm.role) {
                      toast.error("Please enter name and role");
                      return;
                    }
                    if (editingLeadershipId) {
                      updateLeadership.mutate({ id: String(editingLeadershipId), ...leadershipForm });
                    } else {
                      createLeadership.mutate(leadershipForm);
                    }
                  }}
                >
                  {editingLeadershipId ? "Save Changes" : "Create Leader"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* --- FACILITIES MODAL --- */}
        {facilityModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">{editingFacilityId ? "Edit Facility" : "Add Facility"}</h3>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setFacilityModal(false)}><X className="w-4 h-4" /></Button>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Facility Title *</label>
                    <Input value={facilityForm.title} onChange={(e) => setFacilityForm({ ...facilityForm, title: e.target.value })} placeholder="e.g. AI & Robotics Lab" className="text-xs" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Category</label>
                    <Input value={facilityForm.category} onChange={(e) => setFacilityForm({ ...facilityForm, category: e.target.value })} placeholder="Innovation / Labs / Sports" className="text-xs" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Description *</label>
                  <Textarea rows={3} value={facilityForm.description} onChange={(e) => setFacilityForm({ ...facilityForm, description: e.target.value })} placeholder="Detailed description of facility and equipment..." className="text-xs" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Icon Name</label>
                    <Input value={facilityForm.icon} onChange={(e) => setFacilityForm({ ...facilityForm, icon: e.target.value })} placeholder="Microscope / FlaskConical / Dumbbell" className="text-xs" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Facility Photo</label>
                    <div className="flex gap-2">
                      <Input value={facilityForm.imageUrl} onChange={(e) => setFacilityForm({ ...facilityForm, imageUrl: e.target.value })} placeholder="Photo URL" className="text-xs" />
                      <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold flex items-center gap-1 shrink-0">
                        <Upload className="w-3.5 h-3.5" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleMediaUpload(file, (url) => {
                                setFacilityForm((prev) => ({ ...prev, imageUrl: url }));
                              });
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">

                  <div>
                    <label className="text-xs font-semibold text-slate-700">3D Geometry</label>
                    <select
                      value={facilityForm.geometry}
                      onChange={(e) => setFacilityForm({ ...facilityForm, geometry: e.target.value })}
                      className="w-full h-9 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="torusKnot">Torus Knot (3D Ring)</option>
                      <option value="icosahedron">Icosahedron (20-sided)</option>
                      <option value="dodecahedron">Dodecahedron (12-sided)</option>
                      <option value="octahedron">Octahedron (8-sided)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Primary Color</label>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <input
                        type="color"
                        value={facilityForm.color}
                        onChange={(e) => setFacilityForm({ ...facilityForm, color: e.target.value })}
                        className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0.5"
                      />
                      <Input
                        value={facilityForm.color}
                        onChange={(e) => setFacilityForm({ ...facilityForm, color: e.target.value })}
                        placeholder="#10b981"
                        className="text-xs font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Glow Accent</label>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <input
                        type="color"
                        value={facilityForm.accent}
                        onChange={(e) => setFacilityForm({ ...facilityForm, accent: e.target.value })}
                        className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0.5"
                      />
                      <Input
                        value={facilityForm.accent}
                        onChange={(e) => setFacilityForm({ ...facilityForm, accent: e.target.value })}
                        placeholder="#34d399"
                        className="text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setFacilityModal(false)}>Cancel</Button>
                <Button
                  size="sm"
                  className="bg-emerald-700 hover:bg-emerald-800 text-white"
                  onClick={() => {
                    if (!facilityForm.title || !facilityForm.description) {
                      toast.error("Please enter facility title and description");
                      return;
                    }
                    if (editingFacilityId) {
                      updateFacility.mutate({ id: editingFacilityId, ...facilityForm });
                    } else {
                      createFacility.mutate(facilityForm);
                    }
                  }}
                >
                  {editingFacilityId ? "Save Changes" : "Create Facility"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* --- 3D FEATURE CARD MODAL (Home 2) --- */}
        {featureCardModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">{editingFeatureCardId ? "Edit 3D Feature Card" : "Add 3D Feature Card"}</h3>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setFeatureCardModal(false)}><X className="w-4 h-4" /></Button>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Card Title *</label>
                    <Input value={featureCardForm.title} onChange={(e) => setFeatureCardForm({ ...featureCardForm, title: e.target.value })} placeholder="e.g. Humanoid Robotics" className="text-xs" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Sub-Badge / Category</label>
                    <Input value={featureCardForm.category} onChange={(e) => setFeatureCardForm({ ...featureCardForm, category: e.target.value })} placeholder="AI Innovation Lab" className="text-xs" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Description / Subtitle *</label>
                  <Textarea rows={2} value={featureCardForm.description} onChange={(e) => setFeatureCardForm({ ...featureCardForm, description: e.target.value })} placeholder="Brief 1-2 sentence description..." className="text-xs" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Card Icon *</label>
                    <select
                      value={featureCardForm.icon}
                      onChange={(e) => setFeatureCardForm({ ...featureCardForm, icon: e.target.value })}
                      className="w-full h-9 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="Bot">Bot (Robotics & AI)</option>
                      <option value="Cpu">Cpu (MakerSpace & Tech)</option>
                      <option value="Rocket">Rocket (Next-Gen Curriculum)</option>
                      <option value="Sparkles">Sparkles (Innovation)</option>
                      <option value="Code">Code (Programming)</option>
                      <option value="GraduationCap">GraduationCap (Academics)</option>
                      <option value="Laptop">Laptop (Digital Learning)</option>
                      <option value="Microscope">Microscope (Science & Research)</option>
                      <option value="Atom">Atom (Physics & STEM)</option>
                      <option value="Globe">Globe (Global Citizenship)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Display Order</label>
                    <Input type="number" value={featureCardForm.order} onChange={(e) => setFeatureCardForm({ ...featureCardForm, order: parseInt(e.target.value) || 0 })} placeholder="1" className="text-xs" />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setFeatureCardModal(false)}>Cancel</Button>
                <Button
                  size="sm"
                  className="bg-emerald-700 hover:bg-emerald-800 text-white"
                  onClick={() => {
                    if (!featureCardForm.title || !featureCardForm.description) {
                      toast.error("Please enter title and description");
                      return;
                    }
                    if (editingFeatureCardId) {
                      updateFeatureCard.mutate({ id: editingFeatureCardId, ...featureCardForm });
                    } else {
                      createFeatureCard.mutate(featureCardForm);
                    }
                  }}
                >
                  {editingFeatureCardId ? "Save Changes" : "Create Feature Card"}
                </Button>
              </div>
            </div>
          </div>
        )}


        {/* --- DEPARTMENTS MODAL --- */}
        {departmentModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">{editingDepartmentId ? "Edit Department" : "Add Department"}</h3>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setDepartmentModal(false)}><X className="w-4 h-4" /></Button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Department Name *</label>
                  <Input value={departmentForm.name} onChange={(e) => setDepartmentForm({ ...departmentForm, name: e.target.value })} placeholder="e.g. Science / Mathematics" className="text-xs" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Subjects / Disciplines *</label>
                  <Input value={departmentForm.subjects} onChange={(e) => setDepartmentForm({ ...departmentForm, subjects: e.target.value })} placeholder="Physics, Chemistry, Biology, Biotechnology" className="text-xs" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Icon Name</label>
                  <Input value={departmentForm.icon} onChange={(e) => setDepartmentForm({ ...departmentForm, icon: e.target.value })} placeholder="FlaskConical / Calculator / Cpu / Globe" className="text-xs" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setDepartmentModal(false)}>Cancel</Button>
                <Button
                  size="sm"
                  className="bg-emerald-700 hover:bg-emerald-800 text-white"
                  onClick={() => {
                    if (!departmentForm.name || !departmentForm.subjects) {
                      toast.error("Please enter department name and subjects");
                      return;
                    }
                    if (editingDepartmentId) {
                      updateDepartment.mutate({ id: editingDepartmentId, ...departmentForm });
                    } else {
                      createDepartment.mutate(departmentForm);
                    }
                  }}
                >
                  {editingDepartmentId ? "Save Changes" : "Create Department"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* --- ADMISSION STEP MODAL --- */}
        {admissionStepModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">{editingAdmissionStepId ? "Edit Step" : "Add Step"}</h3>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setAdmissionStepModal(false)}><X className="w-4 h-4" /></Button>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Step Number</label>
                    <Input type="number" value={admissionStepForm.stepNumber} onChange={(e) => setAdmissionStepForm({ ...admissionStepForm, stepNumber: parseInt(e.target.value) || 1 })} className="text-xs" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Icon Name</label>
                    <Input value={admissionStepForm.icon} onChange={(e) => setAdmissionStepForm({ ...admissionStepForm, icon: e.target.value })} placeholder="FileText / ClipboardList / CreditCard" className="text-xs" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Step Title *</label>
                  <Input value={admissionStepForm.title} onChange={(e) => setAdmissionStepForm({ ...admissionStepForm, title: e.target.value })} placeholder="e.g. Online Application" className="text-xs" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Description *</label>
                  <Textarea rows={3} value={admissionStepForm.description} onChange={(e) => setAdmissionStepForm({ ...admissionStepForm, description: e.target.value })} placeholder="Instructions for this step..." className="text-xs" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setAdmissionStepModal(false)}>Cancel</Button>
                <Button
                  size="sm"
                  className="bg-emerald-700 hover:bg-emerald-800 text-white"
                  onClick={() => {
                    if (!admissionStepForm.title || !admissionStepForm.description) {
                      toast.error("Please enter step title and description");
                      return;
                    }
                    if (editingAdmissionStepId) {
                      updateAdmissionStep.mutate({ id: editingAdmissionStepId, ...admissionStepForm });
                    } else {
                      createAdmissionStep.mutate(admissionStepForm);
                    }
                  }}
                >
                  {editingAdmissionStepId ? "Save Changes" : "Create Step"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* --- FAQ MODAL --- */}
        {faqModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">{editingFaqId ? "Edit FAQ" : "Add FAQ"}</h3>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setFaqModal(false)}><X className="w-4 h-4" /></Button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Category</label>
                  <Input value={faqForm.category} onChange={(e) => setFaqForm({ ...faqForm, category: e.target.value })} placeholder="Admissions / General / Transport" className="text-xs" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Question *</label>
                  <Input value={faqForm.question} onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })} placeholder="e.g. What is the age criteria for Nursery?" className="text-xs" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Answer *</label>
                  <Textarea rows={4} value={faqForm.answer} onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })} placeholder="Detailed answer..." className="text-xs" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setFaqModal(false)}>Cancel</Button>
                <Button
                  size="sm"
                  className="bg-emerald-700 hover:bg-emerald-800 text-white"
                  onClick={() => {
                    if (!faqForm.question || !faqForm.answer) {
                      toast.error("Please enter question and answer");
                      return;
                    }
                    if (editingFaqId) {
                      updateFaq.mutate({ id: editingFaqId, ...faqForm });
                    } else {
                      createFaq.mutate(faqForm);
                    }
                  }}
                >
                  {editingFaqId ? "Save Changes" : "Create FAQ"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* --- STAT METRIC MODAL --- */}
        {statMetricModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">{editingStatMetricId ? "Edit Counter" : "Add Counter"}</h3>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setStatMetricModal(false)}><X className="w-4 h-4" /></Button>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Metric Value *</label>
                    <Input value={statMetricForm.value} onChange={(e) => setStatMetricForm({ ...statMetricForm, value: e.target.value })} placeholder="e.g. 20+ / 99.9% / 5000+" className="text-xs" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Icon Name</label>
                    <Input value={statMetricForm.icon} onChange={(e) => setStatMetricForm({ ...statMetricForm, icon: e.target.value })} placeholder="GraduationCap / Award / Trophy" className="text-xs" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Metric Label *</label>
                  <Input value={statMetricForm.label} onChange={(e) => setStatMetricForm({ ...statMetricForm, label: e.target.value })} placeholder="e.g. Years of Academic Excellence" className="text-xs" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setStatMetricModal(false)}>Cancel</Button>
                <Button
                  size="sm"
                  className="bg-emerald-700 hover:bg-emerald-800 text-white"
                  onClick={() => {
                    if (!statMetricForm.label || !statMetricForm.value) {
                      toast.error("Please enter metric label and value");
                      return;
                    }
                    if (editingStatMetricId) {
                      updateStatMetric.mutate({ id: editingStatMetricId, ...statMetricForm });
                    } else {
                      createStatMetric.mutate(statMetricForm);
                    }
                  }}
                >
                  {editingStatMetricId ? "Save Changes" : "Create Counter"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* --- CHANGE PASSWORD MODAL (AUTHENTICATED) --- */}
        {isFirstTimePasswordModal && isAuthenticated && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                    <Key className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Change Admin Password</h3>
                    <p className="text-[11px] text-slate-500">Update your security credentials</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 rounded-full"
                  onClick={() => {
                    setIsFirstTimePasswordModal(false);
                    setChangePasswordError("");
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {changePasswordError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{changePasswordError}</span>
                </div>
              )}

              <form onSubmit={handleChangePasswordSubmit} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Account Username</label>
                  <Input
                    type="text"
                    disabled
                    value={localStorage.getItem("dpsi_admin_user") || "Admin"}
                    className="bg-slate-100 border-slate-200 text-slate-600 rounded-xl cursor-not-allowed text-xs font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Current / Temporary Password</label>
                  <div className="relative">
                    <Input
                      type={showPasswordCurrent ? "text" : "password"}
                      required
                      value={changePasswordCurrent}
                      onChange={(e) => setChangePasswordCurrent(e.target.value)}
                      placeholder="Current password"
                      className="pr-10 bg-slate-50 border-slate-200 text-slate-900 rounded-xl text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordCurrent(!showPasswordCurrent)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPasswordCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">New Password</label>
                  <div className="relative">
                    <Input
                      type={showPasswordNew ? "text" : "password"}
                      required
                      value={changePasswordNew}
                      onChange={(e) => setChangePasswordNew(e.target.value)}
                      placeholder="At least 8 characters"
                      className="pr-10 bg-slate-50 border-slate-200 text-slate-900 rounded-xl text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordNew(!showPasswordNew)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPasswordNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Confirm New Password</label>
                  <div className="relative">
                    <Input
                      type={showPasswordConfirm ? "text" : "password"}
                      required
                      value={changePasswordConfirm}
                      onChange={(e) => setChangePasswordConfirm(e.target.value)}
                      placeholder="Re-type new password"
                      className="pr-10 bg-slate-50 border-slate-200 text-slate-900 rounded-xl text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPasswordConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-[11px]">
                  <div className={`flex items-center gap-1.5 ${changePasswordNew.length >= 8 ? "text-emerald-700 font-medium" : "text-slate-400"}`}>
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Minimum 8 characters</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${changePasswordNew && changePasswordNew === changePasswordConfirm ? "text-emerald-700 font-medium" : "text-slate-400"}`}>
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Passwords match</span>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsFirstTimePasswordModal(false);
                      setChangePasswordError("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={changePasswordMutation.isPending || changePasswordNew.length < 8 || changePasswordNew !== changePasswordConfirm}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-1.5"
                  >
                    {changePasswordMutation.isPending ? (
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      "Update Password"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
  );
}


