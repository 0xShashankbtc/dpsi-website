import type { QueryClient } from "@tanstack/react-query";

export const DEFAULT_SITE_SETTINGS = [
  { key: "school_name", value: "Delhi Public School Indirapuram", label: "School Name", group: "general" },
  { key: "school_tagline", value: "Service Before Self • Nurturing Global Leaders", label: "School Tagline", group: "general" },
  { key: "cbse_affiliation_no", value: "2130663", label: "CBSE Affiliation No.", group: "general" },
  { key: "school_code", value: "60297", label: "School Code", group: "general" },
  { key: "contact_phone", value: "+91-0120-4660000, 4670000", label: "Primary Phone", group: "contact" },
  { key: "contact_email", value: "info@dpsindirapuram.com", label: "General Email", group: "contact" },
  { key: "contact_admissions_email", value: "admissions@dpsindirapuram.com", label: "Admissions Email", group: "contact" },
  { key: "contact_address", value: "526/1, Ahinsa Khand-II, Indirapuram, Ghaziabad, U.P. - 201014", label: "Campus Address", group: "contact" },
  { key: "office_hours", value: "Monday – Saturday: 8:00 AM – 3:00 PM (Second & Fourth Saturdays Closed)", label: "Visiting Hours", group: "contact" },
  { key: "google_map_embed_url", value: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3501.9961138244976!2d77.37397757620296!3d28.63073038421833!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cf007c65c2b09%3A0xe5a36378e9b88235!2sDelhi%20Public%20School%20Indirapuram!5e0!3m2!1sen!2sin!4v1700000000000", label: "Google Maps Embed URL", group: "contact" },
  { key: "social_facebook", value: "https://www.facebook.com/DPSIndirapuramGhaziabad", label: "Facebook Page", group: "social" },
  { key: "social_instagram", value: "https://www.instagram.com/dps_indirapuram/", label: "Instagram Profile", group: "social" },
  { key: "social_youtube", value: "https://www.youtube.com/channel/UC-jQAVRh4pBXEktpml3yeIQ/videos", label: "YouTube Channel", group: "social" },
  { key: "social_linkedin", value: "https://www.linkedin.com/school/dps-indirapuram/", label: "LinkedIn Page", group: "social" },
  { key: "social_twitter", value: "https://twitter.com/dps_indirapuram", label: "Twitter / X Profile", group: "social" },
  { key: "principal_name", value: "Ms. Priya Elizabeth John", label: "Principal Name", group: "principal" },
  { key: "principal_title", value: "Principal, DPS Indirapuram", label: "Principal Title", group: "principal" },
  { key: "principal_badge", value: "Principal's Message", label: "Principal Badge", group: "principal" },
  { key: "principal_headline", value: "Nurturing Future Leaders with Values & Innovation", label: "Principal Headline", group: "principal" },
  { key: "principal_image", value: "/images/leadership/priya_john.webp", label: "Principal Image URL", group: "principal" },
  { key: "principal_message_p1", value: "Welcome to Delhi Public School Indirapuram, where we believe in empowering every child to discover their unique potential. Our institution stands as a beacon of excellence, combining traditional values with futuristic pedagogical methods.", label: "Principal Message (Paragraph 1)", group: "principal" },
  { key: "principal_message_p2", value: "With over two decades of educational leadership, our state-of-the-art facilities, dedicated educators, and holistic curricula ensure that every student thrives with confidence, character, and intellect.", label: "Principal Message (Paragraph 2)", group: "principal" },
  { key: "cta_badge", value: "Admissions Open 2026-27", label: "CTA Badge", group: "cta" },
  { key: "cta_title", value: "Ready to Shape Your Child's Bright Future?", label: "CTA Title", group: "cta" },
  { key: "cta_button_link", value: "/admissions", label: "CTA Button Link", group: "cta" },
  { key: "footer_copyright", value: "© 2026 Delhi Public School Indirapuram. All rights reserved.", label: "Footer Copyright", group: "general" },
  { key: "footer_credit", value: "Developed by : Shashank Jangid (Orange)", label: "Footer / Credit Text", group: "general" },
  { key: "footer_tagline", value: "Delhi Public School Indirapuram, established in 2003, is a premier institution under the DPS Society, committed to holistic education and excellence.", label: "Footer Tagline", group: "general" },
  { key: "chat_welcome_message", value: "Hello! I am DPSI AI. I can assist you with Admissions, Exam Schedules, Vacations, Academic Streams, and Campus Facilities.", label: "AI Chat Welcome Message", group: "ai" },
  { key: "calendar_pdf_url", value: "https://www.dpsindirapuram.com/calendar/annual-academic-calendar.pdf", label: "Academic Calendar PDF URL", group: "ai" },
];

export const DEFAULT_HEADER_MENUS = [
  { _id: "m1", title: "Home", url: "/", location: "header", order: 1, isActive: true },
  { _id: "m2", title: "About", url: "/about", location: "header", order: 2, isActive: true },
  { _id: "m2_1", title: "Vision & Mission", url: "/about#vision", location: "header", parent: "About", order: 1, isActive: true },
  { _id: "m2_2", title: "Leadership", url: "/about#leadership", location: "header", parent: "About", order: 2, isActive: true },
  { _id: "m3", title: "Academics", url: "/academics", location: "header", order: 3, isActive: true },
  { _id: "m3_1", title: "Curriculum", url: "/academics#curriculum", location: "header", parent: "Academics", order: 1, isActive: true },
  { _id: "m3_2", title: "Departments", url: "/academics#departments", location: "header", parent: "Academics", order: 2, isActive: true },
  { _id: "m4", title: "Admissions", url: "/admissions", location: "header", order: 4, isActive: true },
  { _id: "m5", title: "Facilities", url: "/facilities", location: "header", order: 5, isActive: true },
  { _id: "m6", title: "News & Events", url: "/news-events", location: "header", order: 6, isActive: true },
  { _id: "m7", title: "Gallery", url: "/gallery", location: "header", order: 7, isActive: true },
  { _id: "m8", title: "Contact", url: "/contact", location: "header", order: 8, isActive: true },
];

export const DEFAULT_FOOTER_QUICK_MENUS = [
  { _id: "fq1", title: "About Us", url: "/about", location: "footer_quick", order: 1, isActive: true },
  { _id: "fq2", title: "Academic Streams", url: "/academics", location: "footer_quick", order: 2, isActive: true },
  { _id: "fq3", title: "Admissions Criteria", url: "/admissions", location: "footer_quick", order: 3, isActive: true },
  { _id: "fq4", title: "Campus Facilities", url: "/facilities", location: "footer_quick", order: 4, isActive: true },
];

export const DEFAULT_FOOTER_RESOURCE_MENUS = [
  { _id: "fr1", title: "SchoolsOS Portal Login", url: "https://dpsindp.schoolforschools.ai/login", location: "footer_resources", order: 1, isActive: true },
  { _id: "fr2", title: "Transfer Certificate (TC)", url: "/transfer-certificate", location: "footer_resources", order: 2, isActive: true },
  { _id: "fr3", title: "Annual Academic Calendar", url: "https://www.dpsindirapuram.com/calendar/annual-academic-calendar.pdf", location: "footer_resources", order: 3, isActive: true },
  { _id: "fr4", title: "Mandatory Public Disclosure", url: "/attachments", location: "footer_resources", order: 4, isActive: true },
];

export const DEFAULT_MARQUEES = [
  {
    _id: "mq1",
    text: "ADMISSIONS OPEN FOR SESSION 2026–27 (PRE-NURSERY TO CLASS IX & XI)",
    linkUrl: "/admissions",
    speed: 50,
    textColor: "#ffffff",
    bgColor: "#047857",
    badgeText: "Admissions",
    isActive: true,
    isDeleted: false,
  },
  {
    _id: "mq2",
    text: "CBSE CLASS XII & X BOARD RESULTS DECLARED — TOP SCORE 99.4%",
    linkUrl: "/academics",
    speed: 50,
    textColor: "#fef3c7",
    bgColor: "#b45309",
    badgeText: "Exam Alert",
    isActive: true,
    isDeleted: false,
  },
  {
    _id: "mq3",
    text: "TIMES EDUCATION ICONS 2024 AWARD WINNER — #1 CBSE SCHOOL IN GHAZIABAD",
    linkUrl: "/about",
    speed: 50,
    textColor: "#dbeafe",
    bgColor: "#1e3a8a",
    badgeText: "Award",
    isActive: true,
    isDeleted: false,
  },
];

export const DEFAULT_STATS = [
  { id: "st1", _id: "st1", label: "Students Enrolled", value: "3,500+", icon: "GraduationCap", order: 1, active: true },
  { id: "st2", _id: "st2", label: "CBSE Board Average", value: "88.6%", icon: "Award", order: 2, active: true },
  { id: "st3", _id: "st3", label: "Expert Educators", value: "220+", icon: "Users", order: 3, active: true },
  { id: "st4", _id: "st4", label: "Campus Area", value: "10 Acres", icon: "Building", order: 4, active: true },
];

export const DEFAULT_SLIDERS = [
  {
    _id: "sl1",
    title: "Empowering Minds, Shaping Tomorrow",
    subtitle: "Ranked among the Top CBSE Schools in the National Capital Region with 20+ Years of Academic Legacy",
    imageUrl: "/images/dps/slider_1.webp",
    videoUrl: "/videos/campus_hero.mp4",
    mobileVideoUrl: "/videos/campus_hero.mp4",
    useSeparateMobileVideo: false,
    mediaType: "video",
    buttonText: "Explore Campus",
    buttonLink: "/about",
    order: 1,
    isActive: true,
    isDeleted: false,
  },
  {
    _id: "sl2",
    title: "Futuristic AI & Robotics Innovation",
    subtitle: "Equipping young minds with humanoid robotics, 3D prototyping, and cutting-edge STEM labs",
    imageUrl: "/images/dps/slider_2.webp",
    buttonText: "Discover Facilities",
    buttonLink: "/facilities",
    order: 2,
    isActive: true,
    isDeleted: false,
  },
  {
    _id: "sl3",
    title: "Admissions Open for Academic Session 2026-27",
    subtitle: "Give your child the foundation of holistic education, global exposure, and athletic excellence",
    imageUrl: "/images/dps/slider_3.webp",
    buttonText: "Apply Online",
    buttonLink: "/admissions",
    order: 3,
    isActive: true,
    isDeleted: false,
  },
];

export const DEFAULT_FACILITIES = [
  {
    _id: "fac1",
    title: "Design, Robotics & Ai Lab",
    category: "Innovation & Technology",
    description: "State-of-the-art AI & Robotics innovation center equipped with humanoid robots, Arduino/Raspberry Pi workstations, 3D printers, IoT microcontrollers, and CAD software.",
    icon: "Bot",
    imageUrl: "/images/facilities/ai_robotics_lab.webp",
    geometry: "torusKnot",
    color: "#047857",
    accent: "#10b981",
    order: 1,
    isActive: true,
    isDeleted: false,
  },
  {
    _id: "fac2",
    title: "MakerSpace",
    category: "Innovation & Creativity",
    description: "A collaborative hands-on creative workspace where students design, build, and invent using digital fabrication, woodworking, rapid prototyping, and electronics tools.",
    icon: "Boxes",
    imageUrl: "/images/facilities/art_craft_studio.webp",
    geometry: "octahedron",
    color: "#0284c7",
    accent: "#38bdf8",
    order: 2,
    isActive: true,
    isDeleted: false,
  },
  {
    _id: "fac3",
    title: "Innovation Club",
    category: "Student Clubs & Research",
    description: "A vibrant incubator hub for student-led science projects, patent exploration, hackathons, STEAM challenges, and inter-school innovation summits.",
    icon: "Rocket",
    imageUrl: "/images/facilities/smart_classroom.webp",
    geometry: "icosahedron",
    color: "#d97706",
    accent: "#f59e0b",
    order: 3,
    isActive: true,
    isDeleted: false,
  },
  {
    _id: "fac4",
    title: "Advanced Science Laboratories",
    category: "Academics",
    description: "State-of-the-art Physics, Chemistry, and Biology laboratories equipped with modern precision apparatus and safety systems.",
    icon: "FlaskConical",
    imageUrl: "/images/facilities/science_lab.webp",
    geometry: "dodecahedron",
    color: "#1d4ed8",
    accent: "#60a5fa",
    order: 4,
    isActive: true,
    isDeleted: false,
  },
  {
    _id: "fac5",
    title: "Next-Gen Smart Classrooms",
    category: "Infrastructure",
    description: "Equipped with interactive digital touchboards, ergonomic learning pods, and high-speed gigabit connectivity.",
    icon: "Wifi",
    imageUrl: "/images/facilities/smart_classroom.webp",
    geometry: "icosahedron",
    color: "#7c3aed",
    accent: "#a78bfa",
    order: 5,
    isActive: true,
    isDeleted: false,
  },
  {
    _id: "fac6",
    title: "Sports & Aquatic Complex",
    category: "Sports",
    description: "Olympic-size swimming pool, basketball courts, cricket ground, athletics track, and indoor badminton courts.",
    icon: "Dumbbell",
    imageUrl: "/images/facilities/swimming_pool.webp",
    geometry: "octahedron",
    color: "#059669",
    accent: "#34d399",
    order: 6,
    isActive: true,
    isDeleted: false,
  },
];

export const DEFAULT_ACTIVITIES = [
  {
    _id: "act1",
    id: "act1",
    title: "Annual Sports Day & Athletic Meet 2026",
    category: "Sports & Fitness",
    description: "Students demonstrated athletic prowess, teamwork, and sportsmanship across track and field events with international guest dignitaries.",
    imageUrl: "/images/dps/slider_1.webp",
    eventDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    isPublished: true,
    isDeleted: false,
  },
  {
    _id: "act2",
    id: "act2",
    title: "Inter-School Robotics & AI Hackathon",
    category: "Innovation",
    description: "Over 40 schools competed in our MakerSpace lab to build sustainable urban robotics solutions and autonomous navigation rovers.",
    imageUrl: "/images/dps/slider_2.webp",
    eventDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    isPublished: true,
    isDeleted: false,
  },
  {
    _id: "act3",
    id: "act3",
    title: "Global Mun Summit & Leadership Conclave",
    category: "Academic Conclave",
    description: "Young diplomats gathered for three days of intense debate, geopolitical resolution drafting, and consensus building on global peace.",
    imageUrl: "/images/dps/slider_3.webp",
    eventDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    isPublished: true,
    isDeleted: false,
  },
];

export const DEFAULT_ANNOUNCEMENTS = DEFAULT_MARQUEES.map((m, idx) => ({
  id: m._id || String(idx + 1),
  title: m.text,
  link: m.linkUrl || "/admissions",
  active: m.isActive,
  priority: m.speed || 50,
}));

export const DEFAULT_FEATURED_NEWS = DEFAULT_ACTIVITIES.map((a) => ({
  id: a._id,
  title: a.title,
  slug: a.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
  excerpt: a.description,
  content: a.description,
  image: a.imageUrl,
  category: a.category,
  published: true,
  featured: true,
  createdAt: a.eventDate,
}));

export const DEFAULT_ACHIEVEMENTS = [
  {
    id: "ach1",
    studentName: "Siddhant Tiwari",
    className: "Class X",
    score: "99.4%",
    exam: "CBSE Board Examination",
    stream: "All India Rank #1",
    rank: "#1 Rank (Class X)",
    year: "2025-26",
    imageUrl: "/images/dps/topper_siddhant.webp",
    featured: true,
    order: 1,
  },
  {
    id: "ach2",
    studentName: "Ansh Pathak",
    className: "Class X",
    score: "99.4%",
    exam: "CBSE Board Examination",
    stream: "All India Rank #1",
    rank: "#1 Rank (Class X)",
    year: "2025-26",
    imageUrl: "/images/dps/topper_ansh.webp",
    featured: true,
    order: 2,
  },
  {
    id: "ach3",
    studentName: "Aayush Jha",
    className: "Class X",
    score: "99.2%",
    exam: "CBSE Board Examination",
    stream: "All India Rank #2",
    rank: "#2 Rank (Class X)",
    year: "2025-26",
    imageUrl: "/images/dps/topper_aayush.webp",
    featured: true,
    order: 3,
  },
];

export const DEFAULT_TESTIMONIALS = [
  {
    id: "t1",
    name: "Dr. Rajesh Sharma",
    role: "Parent of Class XII Student",
    content: "The holistic environment and focus on futuristic technology like AI & Robotics at DPS Indirapuram helped my child excel academically while developing strong leadership skills.",
    avatarUrl: "/images/leadership/priya_john.webp",
    rating: 5,
    featured: true,
  },
  {
    id: "t2",
    name: "Meenakshi Verma",
    role: "Parent of Class X Student",
    content: "The dedicated faculty, Olympic-level sports facilities, and personal attention given to each student makes DPS Indirapuram truly the top school in the NCR.",
    avatarUrl: "/images/leadership/santosh_bansal.webp",
    rating: 5,
    featured: true,
  },
  {
    id: "t3",
    name: "Col. Sanjeev Tyagi",
    role: "Parent of Class VIII Student",
    content: "Discipline, character building, and academic brilliance are ingrained in every DPS Indirapuram student. We are proud parents!",
    avatarUrl: "/images/leadership/vk_shunglu.webp",
    rating: 5,
    featured: true,
  },
];

/**
 * Injects baseline snapshots directly into TanStack QueryClient if no cached data exists,
 * guaranteeing instantaneous (0.00ms) first-paint render on first load without layout shifts.
 */
export function seedInitialQueryData(queryClient: QueryClient): void {
  const seedIfMissing = (key: any[], data: any) => {
    try {
      if (queryClient.getQueryData(key) === undefined) {
        queryClient.setQueryData(key, data);
      }
    } catch {
      // safe fallback
    }
  };

  seedIfMissing([["cms", "getSiteSettings"], { type: "query" }], DEFAULT_SITE_SETTINGS);
  seedIfMissing([["cms", "listMenus"], { input: { location: "header" }, type: "query" }], DEFAULT_HEADER_MENUS);
  seedIfMissing([["cms", "listMenus"], { input: { location: "footer_quick" }, type: "query" }], DEFAULT_FOOTER_QUICK_MENUS);
  seedIfMissing([["cms", "listMenus"], { input: { location: "footer_resources" }, type: "query" }], DEFAULT_FOOTER_RESOURCE_MENUS);
  seedIfMissing([["cms", "listMarquees"], { type: "query" }], DEFAULT_MARQUEES);
  seedIfMissing([["announcements", "list"], { type: "query" }], DEFAULT_ANNOUNCEMENTS);
  seedIfMissing([["stats", "list"], { type: "query" }], DEFAULT_STATS);
  seedIfMissing([["cms", "listSliders"], { type: "query" }], DEFAULT_SLIDERS);
  seedIfMissing([["cms", "listFacilities"], { type: "query" }], DEFAULT_FACILITIES);
  seedIfMissing([["cms", "listActivities"], { type: "query" }], DEFAULT_ACTIVITIES);
  seedIfMissing([["news", "featured"], { type: "query" }], DEFAULT_FEATURED_NEWS);
  seedIfMissing([["achievements", "list"], { type: "query" }], DEFAULT_ACHIEVEMENTS);
  seedIfMissing([["testimonials", "featured"], { type: "query" }], DEFAULT_TESTIMONIALS);
}
