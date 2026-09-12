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
    title: "AI & Humanoid Robotics Incubator",
    category: "STEM & Innovation",
    tagline: "NITI Aayog Atal Tinkering Lab Certified",
    description: "A state-of-the-art innovation incubator equipped with dual-extrusion 3D printers, IoT microcontrollers, drone test rigs, and high-performance workstations for Python, ROS, and computer vision.",
    highlights: [
      "Hands-on AI, Computer Vision & ROS robotics curriculum",
      "National Robotics & Drone Championship training arena",
      "Dual-extrusion rapid 3D printing & sensor telemetry rigs",
    ],
    metrics: [
      { value: "50+", label: "AI Workstations" },
      { value: "100%", label: "Practical Immersion" },
      { value: "15+", label: "National Laurels" },
    ],
    icon: "Cpu",
    imageUrl: "/images/facilities/ai_robotics_lab.webp",
    geometry: "torusKnot",
    color: "#064e3b",
    accent: "#10b981",
    order: 1,
    isActive: true,
    isDeleted: false,
  },
  {
    _id: "fac2",
    title: "Olympic Aquatics & Sports Complex",
    category: "Sports & Athletics",
    tagline: "Half-Olympic 25m Heated Pool & Floodlit Courts",
    description: "All-weather temperature-regulated 25m swimming pool paired with floodlit synthetic tennis courts, FIBA-spec basketball arenas, shock-absorbent wooden badminton halls, and automated cricket bowling rigs.",
    highlights: [
      "25m half-Olympic competition pool with year-round climate heating",
      "Floodlit synthetic tennis & FIBA-spec indoor basketball courts",
      "NIS-accredited professional coaching faculty across 8+ sports",
    ],
    metrics: [
      { value: "25m", label: "Heated Pool" },
      { value: "8+", label: "Sports Arenas" },
      { value: "100%", label: "NIS Coaches" },
    ],
    icon: "Waves",
    imageUrl: "/images/facilities/swimming_pool.webp",
    geometry: "octahedron",
    color: "#047857",
    accent: "#34d399",
    order: 2,
    isActive: true,
    isDeleted: false,
  },
  {
    _id: "fac3",
    title: "Research-Grade Science Laboratories",
    category: "Experiential Sciences",
    tagline: "Research-Grade Experimental Suites",
    description: "Dedicated senior suites for Physics, Chemistry, Biology, and Biotechnology equipped with German optical glassware, digital spectrophotometers, and automated emergency safety showers exceeding CBSE safety benchmarks.",
    highlights: [
      "Individual student workstations ensuring 1:1 apparatus handling",
      "High-precision digital spectrophotometers and analytical sensors",
      "Automated emergency eye-wash & chemical shower safety systems",
    ],
    metrics: [
      { value: "4", label: "Dedicated Subject Labs" },
      { value: "1:1", label: "Student Apparatus" },
      { value: "Zero", label: "Safety Compromises" },
    ],
    icon: "FlaskConical",
    imageUrl: "/images/facilities/science_lab.webp",
    geometry: "dodecahedron",
    color: "#d97706",
    accent: "#fbbf24",
    order: 3,
    isActive: true,
    isDeleted: false,
  },
  {
    _id: "fac4",
    title: "Grand 1,200-Seat Acoustic Auditorium",
    category: "Arts & Performing Culture",
    tagline: "Sound-Engineered Performing Arts Amphitheatre",
    description: "A majestic venue for theatre, symphonies, and international Model UNs. Equipped with acoustically calculated timber panelling, motorized stage rigging, JBL line-array audio, and 4K cinema projection.",
    highlights: [
      "1,200-seat sound-engineered main auditorium with 4K projection",
      "Motorized theatrical lighting and multi-channel audio console",
      "Acoustic recording suite with Indian classical & Western instruments",
    ],
    metrics: [
      { value: "1,200+", label: "Auditorium Seats" },
      { value: "30+", label: "Instruments" },
      { value: "100%", label: "Acoustic Treated" },
    ],
    icon: "Music",
    imageUrl: "/images/facilities/auditorium.webp",
    geometry: "torusKnot",
    color: "#059669",
    accent: "#f59e0b",
    order: 4,
    isActive: true,
    isDeleted: false,
  },
  {
    _id: "fac5",
    title: "Smart Digital Classrooms & Safe Campus",
    category: "Smart Campus & Safety",
    tagline: "Interactive 4K Pedagogy & 350+ AI Surveillance Nodes",
    description: "Every classroom is acoustically isolated and air-conditioned with 4K collaborative touch displays, ergonomic furniture, 350+ AI CCTV security cameras, and a 100% AC GPS-monitored student bus fleet.",
    highlights: [
      "Interactive 4K digital flat panels with cloud lecture sync",
      "Postural ergonomic furniture and smart biometric attendance",
      "350+ AI CCTV security cameras & 100% GPS AC transport fleet",
    ],
    metrics: [
      { value: "100%", label: "Digitized Rooms" },
      { value: "4K", label: "Interactive Touch" },
      { value: "350+", label: "AI CCTV Nodes" },
    ],
    icon: "GraduationCap",
    imageUrl: "/images/facilities/smart_classroom.webp",
    geometry: "icosahedron",
    color: "#064e3b",
    accent: "#10b981",
    order: 5,
    isActive: true,
    isDeleted: false,
  },
  {
    _id: "fac6",
    title: "Digital Knowledge Repository & Library",
    category: "Scholastic Research",
    tagline: "35,000+ Curated Volumes & Research Archives",
    description: "A quiet academic sanctuary offering automated RFID checkout kiosks, digital e-readers, JSTOR journal subscriptions, comfortable reading pods, and collaborative project rooms.",
    highlights: [
      "Automated RFID borrowing & self-checkout smart kiosks",
      "Direct digital portal access to global JSTOR & scientific papers",
      "Ergonomic silent research carrels with high-speed fiber Wi-Fi",
    ],
    metrics: [
      { value: "35,000+", label: "Physical Books" },
      { value: "10,000+", label: "E-Journals" },
      { value: "200+", label: "Seating Pods" },
    ],
    icon: "BookOpen",
    imageUrl: "/images/facilities/library.webp",
    geometry: "octahedron",
    color: "#b45309",
    accent: "#fbbf24",
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

export const DEFAULT_VIDEOS = [
  {
    _id: "vid_campus_main",
    id: "vid_campus_main",
    title: "DPS Indirapuram Virtual Campus Tour & Infrastructure",
    category: "Campus Tour",
    videoUrl: "/videos/campus_hero.mp4",
    thumbnailUrl: "/images/dps/slider_1.webp",
    order: 1,
    isPublished: true,
    isDeleted: false,
  },
];

export const DEFAULT_LEADERSHIP = [
  {
    _id: "lead_shunglu",
    name: "Mr. V.K. Shunglu",
    role: "Chairman, DPS Society & Managing Committee",
    designation: "Chairman",
    bio: "Eminent civil servant and former Comptroller and Auditor General of India, providing visionary leadership to DPS Society institutions worldwide.",
    imageUrl: "/images/leadership/vk_shunglu.webp",
    order: 1,
    category: "Management",
    isActive: true,
  },
  {
    _id: "lead_bansal",
    name: "Ms. Santosh Bansal",
    role: "Pro-Vice Chairperson",
    designation: "Pro-Vice Chairperson",
    bio: "Pioneering educator and administrator committed to cultivating world-class educational opportunities and infrastructure for students.",
    imageUrl: "/images/leadership/santosh_bansal.webp",
    order: 2,
    category: "Management",
    isActive: true,
  },
  {
    _id: "lead_john",
    name: "Ms. Priya Elizabeth John",
    role: "Principal, DPS Indirapuram",
    designation: "Principal",
    bio: "National Award-winning educator driving innovation in CBSE pedagogy, holistic student well-being, and future-ready robotics curriculum.",
    imageUrl: "/images/leadership/priya_john.webp",
    order: 3,
    category: "Principal",
    isActive: true,
  },
];

export const DEFAULT_DEPARTMENTS = [
  {
    _id: "dept_science",
    name: "Science",
    subjects: "Physics, Chemistry, Biology, Biotechnology",
    icon: "FlaskConical",
    color: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
    order: 1,
    isActive: true,
  },
  {
    _id: "dept_math",
    name: "Mathematics",
    subjects: "Pure Math, Applied Math, Statistics",
    icon: "Calculator",
    color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
    order: 2,
    isActive: true,
  },
  {
    _id: "dept_lang",
    name: "Languages",
    subjects: "English, Hindi, Sanskrit, French, German",
    icon: "Globe",
    color: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
    order: 3,
    isActive: true,
  },
  {
    _id: "dept_arts",
    name: "Arts & Humanities",
    subjects: "History, Geography, Political Science, Economics, Psychology",
    icon: "Palette",
    color: "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400",
    order: 4,
    isActive: true,
  },
  {
    _id: "dept_cs",
    name: "Computer Science & AI",
    subjects: "Artificial Intelligence, Robotics, Python, Web Dev, Data Science",
    icon: "Cpu",
    color: "bg-violet-50 text-violet-700 dark:bg-violet-950/30 dark:text-violet-400",
    order: 5,
    isActive: true,
  },
  {
    _id: "dept_pe",
    name: "Physical Education",
    subjects: "Sports Science, Athletics, Yoga, Health Education",
    icon: "Activity",
    color: "bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400",
    order: 6,
    isActive: true,
  },
];

export const DEFAULT_ADMISSION_STEPS = [
  {
    _id: "step_1",
    stepNumber: 1,
    title: "Online Registration",
    description: "Fill out the online application form with student bio-data and parent details.",
    icon: "FileText",
    order: 1,
    isActive: true,
  },
  {
    _id: "step_2",
    stepNumber: 2,
    title: "Document Submission",
    description: "Upload necessary documents: birth certificate, previous report cards, and transfer certificate.",
    icon: "ClipboardList",
    order: 2,
    isActive: true,
  },
  {
    _id: "step_3",
    stepNumber: 3,
    title: "Registration Fee Payment",
    description: "Pay the registration processing fee securely via our instant payment gateway.",
    icon: "CreditCard",
    order: 3,
    isActive: true,
  },
  {
    _id: "step_4",
    stepNumber: 4,
    title: "Student Interaction & Assessment",
    description: "Participate in an interactive evaluation designed to understand the child's academic readiness.",
    icon: "BadgeCheck",
    order: 4,
    isActive: true,
  },
  {
    _id: "step_5",
    stepNumber: 5,
    title: "Admission Formalities & Onboarding",
    description: "Receive admission confirmation letter and complete enrollment formalities.",
    icon: "CheckCircle",
    order: 5,
    isActive: true,
  },
];

export const DEFAULT_FAQS = [
  {
    _id: "faq_1",
    question: "What is the age criteria for admission to Pre-School / Nursery?",
    answer: "The child should be 3+ years as of March 31st of the admission academic year.",
    category: "Admissions",
    order: 1,
    isActive: true,
  },
  {
    _id: "faq_2",
    question: "What documents are required for the admission process?",
    answer: "Birth certificate, passport-size photographs of student & parents, previous report card, transfer certificate (Class II upwards), and proof of residence.",
    category: "Admissions",
    order: 2,
    isActive: true,
  },
  {
    _id: "faq_3",
    question: "Is there an entrance examination for higher classes?",
    answer: "An age-appropriate competency assessment is conducted for Class I onwards to understand baseline readiness.",
    category: "Admissions",
    order: 3,
    isActive: true,
  },
  {
    _id: "faq_4",
    question: "What is the fee structure and scholarship policy?",
    answer: "Please contact our admissions office or refer to the fee breakdown table. Merit scholarships are offered for national Olympiad winners and sports champions.",
    category: "Admissions",
    order: 4,
    isActive: true,
  },
  {
    _id: "faq_5",
    question: "Does the school provide GPS-monitored AC bus transport?",
    answer: "Yes, we operate an extensive fleet of air-conditioned GPS-tracked buses covering Ghaziabad, Noida, and East Delhi.",
    category: "Transport",
    order: 5,
    isActive: true,
  },
  {
    _id: "faq_6",
    question: "What is the average student-teacher ratio?",
    answer: "We strictly maintain a 25:1 student-to-educator ratio to guarantee individual attention and care.",
    category: "General",
    order: 6,
    isActive: true,
  },
];

export const DEFAULT_TIMELINE = [
  { _id: "tl_1", year: "2003", title: "Foundation", description: "DPS Indirapuram established under the aegis of The DPS Society.", order: 1, isActive: true },
  { _id: "tl_2", year: "2008", title: "CBSE Affiliation", description: "Granted permanent CBSE affiliation with exemplary rating.", order: 2, isActive: true },
  { _id: "tl_3", year: "2012", title: "First Batch Success", description: "100% CBSE board results with multiple students securing >95%.", order: 3, isActive: true },
  { _id: "tl_4", year: "2015", title: "Sports Complex", description: "Inaugurated Olympic-size aquatic complex and national sports grounds.", order: 4, isActive: true },
  { _id: "tl_5", year: "2021", title: "Digital Transformation", description: "Complete smart classroom and digital infrastructure upgrade.", order: 5, isActive: true },
  { _id: "tl_6", year: "2023", title: "20th Anniversary", description: "Celebrated two decades of holistic excellence and character building.", order: 6, isActive: true },
  { _id: "tl_7", year: "2024", title: "AI & Robotics Lab", description: "State-of-the-art innovation center launched with humanoid robotics kits.", order: 7, isActive: true },
  { _id: "tl_8", year: "2025", title: "Global Recognition", description: "Ranked among top CBSE schools in India with British Council ISA honors.", order: 8, isActive: true },
];

export const DEFAULT_CORE_VALUES = [
  { _id: "cv_1", title: "Excellence", description: "Striving for the highest standards in education and character development.", icon: "Target", order: 1, isActive: true },
  { _id: "cv_2", title: "Integrity", description: "Building honest, ethical individuals who lead with moral courage.", icon: "Heart", order: 2, isActive: true },
  { _id: "cv_3", title: "Inclusivity", description: "Celebrating diversity and creating a welcoming environment for all.", icon: "Users", order: 3, isActive: true },
  { _id: "cv_4", title: "Innovation", description: "Embracing new ideas and technologies to prepare students for the future.", icon: "BookOpen", order: 4, isActive: true },
  { _id: "cv_5", title: "Resilience", description: "Developing grit and perseverance to overcome challenges with confidence.", icon: "Award", order: 5, isActive: true },
];

export const DEFAULT_BOARD_RESULTS = [
  { _id: "br_1", year: "2022", passRate: 98, distinction: 45, order: 1, isActive: true },
  { _id: "br_2", year: "2023", passRate: 99, distinction: 52, order: 2, isActive: true },
  { _id: "br_3", year: "2024", passRate: 99.5, distinction: 58, order: 3, isActive: true },
  { _id: "br_4", year: "2025", passRate: 99.8, distinction: 65, order: 4, isActive: true },
  { _id: "br_5", year: "2026", passRate: 99.9, distinction: 72, order: 5, isActive: true },
];

export const DEFAULT_STREAM_DISTRIBUTIONS = [
  { _id: "sd_1", name: "Science", value: 40, color: "#047857", order: 1, isActive: true },
  { _id: "sd_2", name: "Commerce", value: 35, color: "#059669", order: 2, isActive: true },
  { _id: "sd_3", name: "Humanities", value: 25, color: "#10b981", order: 3, isActive: true },
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
  seedIfMissing([["cms", "listVideos"], { type: "query" }], DEFAULT_VIDEOS);

  // Inner pages baseline snapshots for 0ms navigation
  seedIfMissing([["cms", "listLeadership"], { type: "query" }], DEFAULT_LEADERSHIP);
  seedIfMissing([["cms", "listCoreValues"], { type: "query" }], DEFAULT_CORE_VALUES);
  seedIfMissing([["cms", "listTimeline"], { type: "query" }], DEFAULT_TIMELINE);
  seedIfMissing([["cms", "listDepartments"], { type: "query" }], DEFAULT_DEPARTMENTS);
  seedIfMissing([["cms", "listBoardResults"], { type: "query" }], DEFAULT_BOARD_RESULTS);
  seedIfMissing([["cms", "listStreamDistributions"], { type: "query" }], DEFAULT_STREAM_DISTRIBUTIONS);
  seedIfMissing([["cms", "listAdmissionSteps"], { type: "query" }], DEFAULT_ADMISSION_STEPS);
  seedIfMissing([["cms", "listFaqs"], { input: { category: "Admissions" }, type: "query" }], DEFAULT_FAQS);
}
