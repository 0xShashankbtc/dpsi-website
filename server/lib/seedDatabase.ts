import bcrypt from "bcryptjs";
import { getMainModels, getGalleryModels, getTcModels } from "../models/cmsSchemas";
import { getAdminUserModel } from "../models/adminUserSchema";
import { getTenantModel } from "../models/tenantSchema";

export async function seedDatabase(
  tenantId: string = "dpsi",
  options?: { schoolName?: string; schoolCode?: string; primaryColor?: string }
) {
  try {
    // 0. SEED DEFAULT TENANT IN dpsi_admin
    const Tenant = await getTenantModel();
    await Tenant.findOneAndUpdate(
      { tenantId: "dpsi" },
      {
        $setOnInsert: {
          tenantId: "dpsi",
          schoolName: "Delhi Public School Indirapuram",
          schoolCode: "DPSI-60297",
          domain: "dpsindirapuram.com",
          primaryColor: "#047857",
          secondaryColor: "#065f46",
          contactEmail: "info@dpsindirapuram.com",
          contactPhone: "+91-0120-4660000, 4670000",
          address: "526/1, Ahinsa Khand-II, Indirapuram, Ghaziabad, U.P. - 201014",
          status: "active",
          features: {
            aiChatbot: true,
            tcPortal: true,
            gallery: true,
            munRegistration: true,
          },
        },
      },
      { upsert: true }
    );

    const {
      SiteSettings,
      Achievement,
      Testimonial,
      Leadership,
      Facility,
      Department,
      AdmissionStep,
      Faq,
      QuickStat,
      TimelineItem,
      CoreValue,
      Slider,
      Page,
      Menu,
      Marquee,
      Popup,
      Activity,
      Attachment,
      FeatureCard,
    } = await getMainModels(tenantId);
    const { GalleryImage, VideoGallery } = await getGalleryModels(tenantId);
    const { TransferCertificate } = await getTcModels(tenantId);


    // 1. SITE SETTINGS
    const defaultSettings = [
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
      { key: "footer_tagline", value: "Delhi Public School Indirapuram, established in 2003, is a premier institution under the DPS Society, committed to holistic education and excellence.", label: "Footer Tagline", group: "general" },
      { key: "chat_welcome_message", value: "Hello! I am DPSI AI. I can assist you with Admissions, Exam Schedules, Vacations, Academic Streams, and Campus Facilities.", label: "AI Chat Welcome Message", group: "ai" },
      { key: "calendar_pdf_url", value: "https://www.dpsindirapuram.com/calendar/annual-academic-calendar.pdf", label: "Academic Calendar PDF URL", group: "ai" },
    ];


    for (const s of defaultSettings) {
      await SiteSettings.findOneAndUpdate(
        { key: s.key },
        { $setOnInsert: s },
        { upsert: true, new: true }
      );
    }

    // 2. ACHIEVEMENTS / TOPPERS
    const achievementCount = await Achievement.countDocuments({ isDeleted: false });
    if (achievementCount === 0) {
      await Achievement.insertMany([
        {
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
        {
          studentName: "Arnav Jha",
          className: "Class X",
          score: "99.2%",
          exam: "CBSE Board Examination",
          stream: "All India Rank #2",
          rank: "#2 Rank (Class X)",
          year: "2025-26",
          imageUrl: "/images/dps/topper_arnav.webp",
          featured: true,
          order: 4,
        },
        {
          studentName: "Jia Manchanda",
          className: "Class XII",
          score: "98.2%",
          exam: "CBSE Board Examination",
          stream: "Commerce Stream Topper",
          rank: "School Rank 1",
          year: "2025-26",
          imageUrl: "/images/dps/topper_jia.webp",
          featured: true,
          order: 5,
        },
        {
          studentName: "Snigdha Shukla",
          className: "Class XII",
          score: "97.6%",
          exam: "CBSE Board Examination",
          stream: "Humanities Stream Topper",
          rank: "School Rank 1",
          year: "2025-26",
          imageUrl: "/images/dps/topper_snigdha.webp",
          featured: true,
          order: 6,
        },
        {
          studentName: "Pawni Srivastava",
          className: "Class XII",
          score: "97.2%",
          exam: "CBSE Board Examination",
          stream: "Science Stream Topper",
          rank: "School Rank 1",
          year: "2025-26",
          imageUrl: "/images/dps/topper_pawni.webp",
          featured: true,
          order: 7,
        },
      ]);
    }

    // 3. TESTIMONIALS
    const testimonialCount = await Testimonial.countDocuments({ isDeleted: false });
    if (testimonialCount === 0) {
      await Testimonial.insertMany([
        {
          name: "Dr. Rajesh Sharma",
          role: "Parent of Class XII Student",
          content: "The holistic environment and focus on futuristic technology like AI & Robotics at DPS Indirapuram helped my child excel academically while developing strong leadership skills.",
          avatarUrl: "/images/leadership/priya_john.webp",
          rating: 5,
          featured: true,
          order: 1,
        },
        {
          name: "Meenakshi Verma",
          role: "Parent of Class X Student",
          content: "The dedicated faculty, Olympic-level sports facilities, and personal attention given to each student makes DPS Indirapuram truly the top school in the NCR.",
          avatarUrl: "/images/leadership/santosh_bansal.webp",
          rating: 5,
          featured: true,
          order: 2,
        },
        {
          name: "Col. Sanjeev Tyagi",
          role: "Parent of Class VIII Student",
          content: "Discipline, character building, and academic brilliance are ingrained in every DPS Indirapuram student. We are proud parents!",
          avatarUrl: "/images/leadership/vk_shunglu.webp",
          rating: 5,
          featured: true,
          order: 3,
        },
      ]);
    }

    // 4. LEADERSHIP
    const leadershipCount = await Leadership.countDocuments({ isDeleted: false });
    if (leadershipCount === 0) {
      await Leadership.insertMany([
        {
          name: "Mr. V.K. Shunglu",
          role: "Chairman, DPS Society & Managing Committee",
          designation: "Chairman",
          bio: "Eminent civil servant and former Comptroller and Auditor General of India, providing visionary leadership to DPS Society institutions across the world.",
          imageUrl: "/images/leadership/vk_shunglu.webp",
          order: 1,
          category: "Management",
        },
        {
          name: "Ms. Santosh Bansal",
          role: "Pro-Vice Chairperson",
          designation: "Pro-Vice Chairperson",
          bio: "Pioneering educator and administrator committed to cultivating world-class educational opportunities and infrastructure for students.",
          imageUrl: "/images/leadership/santosh_bansal.webp",
          order: 2,
          category: "Management",
        },
        {
          name: "Ms. Priya Elizabeth John",
          role: "Principal, DPS Indirapuram",
          designation: "Principal",
          bio: "National Award-winning educator driving innovation in CBSE pedagogy, holistic student well-being, and future-ready robotics curriculum.",
          imageUrl: "/images/leadership/priya_john.webp",
          order: 3,
          category: "Principal",
        },
      ]);
    }

    // 5. FACILITIES
    const facilityCount = await Facility.countDocuments({ isDeleted: false });
    if (facilityCount === 0) {
      await Facility.insertMany([
        {
          title: "Futuristic AI & Robotics Lab",
          category: "Innovation",
          description: "Next-gen AI/ML research center equipped with humanoid robots, Arduino/Raspberry Pi workstations, 3D printers, and expert mentors.",
          icon: "Microscope",
          imageUrl: "/images/facilities/ai_robotics_lab.webp",
          order: 1,
        },
        {
          title: "Advanced Science Laboratories",
          category: "Academics",
          description: "State-of-the-art Physics, Chemistry, and Biology laboratories equipped with modern precision apparatus and safety systems.",
          icon: "FlaskConical",
          imageUrl: "/images/facilities/science_lab.webp",
          order: 2,
        },
        {
          title: "Next-Gen Smart Classrooms",
          category: "Infrastructure",
          description: "Equipped with interactive digital touchboards, ergonomic learning pods, and high-speed gigabit connectivity.",
          icon: "Wifi",
          imageUrl: "/images/facilities/smart_classroom.webp",
          order: 3,
        },
        {
          title: "Sports & Aquatic Complex",
          category: "Sports",
          description: "Olympic-size swimming pool, basketball courts, cricket ground, athletics track, and indoor badminton courts.",
          icon: "Dumbbell",
          imageUrl: "/images/facilities/swimming_pool.webp",
          order: 4,
        },
        {
          title: "Digital Knowledge Library",
          category: "Academics",
          description: "A vast repository of 50,000+ books, digital archives, e-journals, and quiet reading spaces for focused study.",
          icon: "BookOpen",
          imageUrl: "/images/facilities/library.webp",
          order: 5,
        },
        {
          title: "Performing Arts & Music Studio",
          category: "Arts",
          description: "Professional music rooms, dance studios, and an auditorium with stage lighting and acoustics.",
          icon: "Music",
          imageUrl: "/images/facilities/music_dance.webp",
          order: 6,
        },
        {
          title: "Art & Craft Studio",
          category: "Arts",
          description: "Spacious art studios for painting, sculpture, pottery, and craft with professional-grade materials.",
          icon: "Palette",
          imageUrl: "/images/facilities/art_craft_studio.webp",
          order: 7,
        },
        {
          title: "GPS AC Transportation",
          category: "Transport",
          description: "Fleet of 50+ GPS-enabled AC buses covering all major areas with trained drivers and attendants.",
          icon: "Bus",
          imageUrl: "/images/facilities/transport_bus.webp",
          order: 8,
        },
        {
          title: "Campus Safety & Security",
          category: "Safety",
          description: "24/7 CCTV surveillance, trained security personnel, fire safety systems, and emergency response protocols.",
          icon: "Shield",
          imageUrl: "/images/facilities/campus_security.webp",
          order: 9,
        },
        {
          title: "Health & Medical Center",
          category: "Health",
          description: "On-campus medical facility with qualified nurses, annual health checkups, and counseling services.",
          icon: "HeartPulse",
          imageUrl: "/images/facilities/medical_infirmary.webp",
          order: 10,
        },
      ]);
    }

    // 6. ACADEMIC DEPARTMENTS
    const departmentCount = await Department.countDocuments({ isDeleted: false });
    if (departmentCount === 0) {
      await Department.insertMany([
        {
          name: "Science",
          subjects: "Physics, Chemistry, Biology, Biotechnology",
          icon: "FlaskConical",
          color: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
          order: 1,
        },
        {
          name: "Mathematics",
          subjects: "Pure Math, Applied Math, Statistics",
          icon: "Calculator",
          color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
          order: 2,
        },
        {
          name: "Languages",
          subjects: "English, Hindi, Sanskrit, French, German",
          icon: "Globe",
          color: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
          order: 3,
        },
        {
          name: "Arts & Humanities",
          subjects: "History, Geography, Political Science, Economics, Psychology",
          icon: "Palette",
          color: "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400",
          order: 4,
        },
        {
          name: "Computer Science & AI",
          subjects: "Artificial Intelligence, Robotics, Python, Web Dev, Data Science",
          icon: "Cpu",
          color: "bg-violet-50 text-violet-700 dark:bg-violet-950/30 dark:text-violet-400",
          order: 5,
        },
        {
          name: "Physical Education",
          subjects: "Sports Science, Athletics, Yoga, Health Education",
          icon: "Activity",
          color: "bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400",
          order: 6,
        },
      ]);
    }

    // 7. ADMISSION STEPS
    const stepCount = await AdmissionStep.countDocuments({ isDeleted: false });
    if (stepCount === 0) {
      await AdmissionStep.insertMany([
        {
          stepNumber: 1,
          title: "Online Registration",
          description: "Fill out the online application form with student bio-data and parent details.",
          icon: "FileText",
          order: 1,
        },
        {
          stepNumber: 2,
          title: "Document Submission",
          description: "Upload necessary documents: birth certificate, previous report cards, and transfer certificate.",
          icon: "ClipboardList",
          order: 2,
        },
        {
          stepNumber: 3,
          title: "Registration Fee Payment",
          description: "Pay the registration processing fee securely via our instant payment gateway.",
          icon: "CreditCard",
          order: 3,
        },
        {
          stepNumber: 4,
          title: "Student Interaction & Assessment",
          description: "Participate in an interactive evaluation designed to understand the child's academic and emotional readiness.",
          icon: "BadgeCheck",
          order: 4,
        },
        {
          stepNumber: 5,
          title: "Admission Formalities & Onboarding",
          description: "Receive admission confirmation letter and complete the enrollment formalities.",
          icon: "CheckCircle",
          order: 5,
        },
      ]);
    }

    // 8. FAQS
    const faqCount = await Faq.countDocuments({ isDeleted: false });
    if (faqCount === 0) {
      await Faq.insertMany([
        {
          question: "What is the age criteria for admission to Pre-School / Nursery?",
          answer: "The child should be 3+ years as of March 31st of the admission academic year.",
          category: "Admissions",
          order: 1,
        },
        {
          question: "What documents are required for the admission process?",
          answer: "Birth certificate, passport-size photographs of student & parents, previous report card, transfer certificate (Class II upwards), and proof of residence.",
          category: "Admissions",
          order: 2,
        },
        {
          question: "Is there an entrance examination for higher classes?",
          answer: "An age-appropriate competency assessment is conducted for Class I onwards to understand baseline readiness.",
          category: "Admissions",
          order: 3,
        },
        {
          question: "What is the fee structure and scholarship policy?",
          answer: "Please contact our admissions office or refer to the fee breakdown table. Merit scholarships are offered for national Olympiad winners and sports champions.",
          category: "Admissions",
          order: 4,
        },
        {
          question: "Does the school provide GPS-monitored AC bus transport?",
          answer: "Yes, we operate an extensive fleet of air-conditioned GPS-tracked buses covering Ghaziabad, Noida, and East Delhi.",
          category: "Transport",
          order: 5,
        },
        {
          question: "What is the average student-teacher ratio?",
          answer: "We strictly maintain a 25:1 student-to-educator ratio to guarantee individual attention and care.",
          category: "General",
          order: 6,
        },
      ]);
    }

    // 9. QUICK STATS
    const statCount = await QuickStat.countDocuments({ isDeleted: false });
    if (statCount === 0) {
      await QuickStat.insertMany([
        { label: "Students Enrolled", value: "3,500+", icon: "GraduationCap", order: 1 },
        { label: "CBSE Board Average", value: "88.6%", icon: "Award", order: 2 },
        { label: "Expert Educators", value: "220+", icon: "Users", order: 3 },
        { label: "Campus Area", value: "10 Acres", icon: "Building", order: 4 },
      ]);
    }

    // 10. TIMELINE / MILESTONES
    const timelineCount = await TimelineItem.countDocuments({ isDeleted: false });
    if (timelineCount === 0) {
      await TimelineItem.insertMany([
        { year: "2003", title: "Foundation", description: "DPS Indirapuram established under the aegis of The DPS Society.", order: 1 },
        { year: "2008", title: "CBSE Affiliation", description: "Granted permanent CBSE affiliation with exemplary rating.", order: 2 },
        { year: "2012", title: "First Batch Success", description: "100% CBSE board results with multiple students securing >95%.", order: 3 },
        { year: "2015", title: "Sports Complex", description: "Inaugurated Olympic-size aquatic complex and national sports grounds.", order: 4 },
        { year: "2021", title: "Digital Transformation", description: "Complete smart classroom and digital infrastructure upgrade.", order: 5 },
        { year: "2023", title: "20th Anniversary", description: "Celebrated two decades of holistic excellence and character building.", order: 6 },
        { year: "2024", title: "AI & Robotics Lab", description: "State-of-the-art innovation center launched with humanoid robotics kits.", order: 7 },
        { year: "2025", title: "Global Recognition", description: "Ranked among top CBSE schools in India with British Council ISA honors.", order: 8 },
      ]);
    }

    // 11. CORE VALUES
    const valueCount = await CoreValue.countDocuments({ isDeleted: false });
    if (valueCount === 0) {
      await CoreValue.insertMany([
        {
          title: "Excellence",
          description: "Striving for the highest standards in education and character development.",
          icon: "Target",
          order: 1,
        },
        {
          title: "Integrity",
          description: "Building honest, ethical individuals who lead with moral courage.",
          icon: "Heart",
          order: 2,
        },
        {
          title: "Inclusivity",
          description: "Celebrating diversity and creating a welcoming environment for all.",
          icon: "Users",
          order: 3,
        },
        {
          title: "Innovation",
          description: "Embracing new ideas and technologies to prepare students for the future.",
          icon: "BookOpen",
          order: 4,
        },
        {
          title: "Resilience",
          description: "Developing grit and perseverance to overcome challenges with confidence.",
          icon: "Award",
          order: 5,
        },
      ]);
    }

    // 12. SLIDERS
    const sliderCount = await Slider.countDocuments({ isDeleted: false });
    if (sliderCount === 0) {
      await Slider.insertMany([
        {
          title: "Empowering Minds, Shaping Tomorrow",
          subtitle: "Ranked among the Top CBSE Schools in the National Capital Region with 20+ Years of Academic Legacy",
          imageUrl: "/images/dps/slider_1.webp",
          buttonText: "Explore Campus",
          buttonLink: "/about",
          order: 1,
        },
        {
          title: "Futuristic AI & Robotics Innovation",
          subtitle: "Equipping young minds with humanoid robotics, 3D prototyping, and cutting-edge STEM labs",
          imageUrl: "/images/dps/slider_2.webp",
          buttonText: "Discover Facilities",
          buttonLink: "/facilities",
          order: 2,
        },
        {
          title: "Admissions Open for Academic Session 2026-27",
          subtitle: "Give your child the foundation of holistic education, global exposure, and athletic excellence",
          imageUrl: "/images/dps/slider_3.webp",
          buttonText: "Apply Online",
          buttonLink: "/admissions",
          order: 3,
        },
      ]);
    }

    // 13. 3D FEATURE CARDS (Home2)
    const featureCardCount = await FeatureCard.countDocuments({ isDeleted: false });
    if (featureCardCount === 0) {
      await FeatureCard.insertMany([
        {
          title: "Humanoid Robotics",
          description: "AI Innovation Lab with autonomous bots and Raspberry Pi workstations",
          icon: "Bot",
          category: "AI Innovation Lab",
          order: 1,
          isActive: true,
        },
        {
          title: "MakerSpace Lab",
          description: "Flight Simulators, 3D Printers & Design Thinking Studio",
          icon: "Cpu",
          category: "Flight Simulators & D&T",
          order: 2,
          isActive: true,
        },
        {
          title: "Next-Gen Curriculum",
          description: "STEAM Pedagogy, Experiential Learning & Global Skill Modules",
          icon: "Rocket",
          category: "STEAM & Experiential Learning",
          order: 3,
          isActive: true,
        },
      ]);
    }

    // 14. PAGES (Manage Pages)
    const pageCount = await Page.countDocuments({ isDeleted: false });
    if (pageCount === 0) {
      await Page.insertMany([
        {
          title: "About DPS Indirapuram",
          slug: "about",
          category: "About",
          content: "Delhi Public School Indirapuram is a premier educational institution established in 2003 under the aegis of the DPS Society, New Delhi.",
          metaTitle: "About Us - DPS Indirapuram",
          metaDescription: "Learn about the rich legacy, leadership, and vision of DPS Indirapuram.",
          isPublished: true,
        },
        {
          title: "Academic Curriculum & Pedagogy",
          slug: "academics",
          category: "Academics",
          content: "Comprehensive CBSE curriculum integrated with STEAM, AI, and holistic development modules.",
          metaTitle: "Academics - DPS Indirapuram",
          metaDescription: "Explore our academic departments, curriculum, and pedagogy.",
          isPublished: true,
        },
        {
          title: "Admissions 2026-27 Guidelines",
          slug: "admissions",
          category: "Admissions",
          content: "Admissions open from Pre-Nursery to Class IX & Class XI for the academic session 2026-27.",
          metaTitle: "Admissions - DPS Indirapuram",
          metaDescription: "Apply online for admissions at DPS Indirapuram.",
          isPublished: true,
        },
        {
          title: "World-Class Campus Facilities",
          slug: "facilities",
          category: "Facilities",
          content: "10-acre campus with AI Robotics lab, Olympic swimming pool, smart classrooms, and shooting range.",
          metaTitle: "Campus Facilities - DPS Indirapuram",
          metaDescription: "Explore campus infrastructure and sports facilities.",
          isPublished: true,
        },
      ]);
    }

    // 15. NAVIGATION MENUS
    const menuCount = await Menu.countDocuments({ isDeleted: false });
    if (menuCount === 0) {
      await Menu.insertMany([
        { title: "Home", url: "/", location: "header", order: 1, isActive: true },
        { title: "About", url: "/about", location: "header", order: 2, isActive: true },
        { title: "Vision & Mission", url: "/about#vision", location: "header", parent: "About", order: 1, isActive: true },
        { title: "Leadership", url: "/about#leadership", location: "header", parent: "About", order: 2, isActive: true },
        { title: "Academics", url: "/academics", location: "header", order: 3, isActive: true },
        { title: "Curriculum", url: "/academics#curriculum", location: "header", parent: "Academics", order: 1, isActive: true },
        { title: "Departments", url: "/academics#departments", location: "header", parent: "Academics", order: 2, isActive: true },
        { title: "Admissions", url: "/admissions", location: "header", order: 4, isActive: true },
        { title: "Facilities", url: "/facilities", location: "header", order: 5, isActive: true },
        { title: "News & Events", url: "/news-events", location: "header", order: 6, isActive: true },
        { title: "Gallery", url: "/gallery", location: "header", order: 7, isActive: true },
        { title: "Contact", url: "/contact", location: "header", order: 8, isActive: true },

        // Footer Quick Links
        { title: "About Us", url: "/about", location: "footer_quick", order: 1, isActive: true },
        { title: "Academic Streams", url: "/academics", location: "footer_quick", order: 2, isActive: true },
        { title: "Admissions Criteria", url: "/admissions", location: "footer_quick", order: 3, isActive: true },
        { title: "Campus Facilities", url: "/facilities", location: "footer_quick", order: 4, isActive: true },

        // Footer Resources
        { title: "SchoolsOS Portal Login", url: "https://dpsindp.schoolforschools.ai/login", location: "footer_resources", order: 1, isActive: true },
        { title: "Transfer Certificate (TC)", url: "/tc", location: "footer_resources", order: 2, isActive: true },
        { title: "Annual Academic Calendar", url: "https://www.dpsindirapuram.com/calendar/annual-academic-calendar.pdf", location: "footer_resources", order: 3, isActive: true },
        { title: "Mandatory Public Disclosure", url: "/attachments", location: "footer_resources", order: 4, isActive: true },
      ]);
    }

    // 16. MARQUEE ANNOUNCEMENTS
    const marqueeCount = await Marquee.countDocuments({ isDeleted: false });
    if (marqueeCount === 0) {
      await Marquee.insertMany([
        {
          text: "ADMISSIONS OPEN FOR SESSION 2026–27 (PRE-NURSERY TO CLASS IX & XI)",
          linkUrl: "/admissions",
          speed: 50,
          textColor: "#ffffff",
          bgColor: "#047857",
          badgeText: "Admissions",
          isActive: true,
        },
        {
          text: "CBSE CLASS XII & X BOARD RESULTS DECLARED — TOP SCORE 99.4%",
          linkUrl: "/academics",
          speed: 50,
          textColor: "#fef3c7",
          bgColor: "#b45309",
          badgeText: "Exam Alert",
          isActive: true,
        },
        {
          text: "TIMES EDUCATION ICONS 2024 AWARD WINNER — #1 CBSE SCHOOL IN GHAZIABAD",
          linkUrl: "/about",
          speed: 50,
          textColor: "#dbeafe",
          bgColor: "#1e3a8a",
          badgeText: "Award",
          isActive: true,
        },
      ]);
    }

    // 17. POPUPS
    const popupCount = await Popup.countDocuments({ isDeleted: false });
    if (popupCount === 0) {
      await Popup.insertMany([
        {
          title: "Admissions Open 2026-27",
          content: "Online registration is now open for Pre-Nursery through Class IX and XI. Limited seats available.",
          imageUrl: "/images/dps/slider_3.webp",
          linkUrl: "/admissions",
          badgeText: "Admissions 2026-27",
          buttonText: "Apply Now",
          showOnLoad: true,
          isActive: true,
        },
      ]);
    }

    // 18. RECENT ACTIVITIES
    const activityCount = await Activity.countDocuments({ isDeleted: false });
    if (activityCount === 0) {
      await Activity.insertMany([
        {
          title: "Annual Science & Innovation Exhibition 2025",
          category: "Innovation",
          description: "Students demonstrated 100+ working models in Robotics, AI, Renewable Energy, and Smart Cities.",
          eventDate: new Date("2025-11-15"),
          imageUrl: "/images/facilities/ai_robotics_lab.webp",
          isPublished: true,
        },
        {
          title: "Inter-School Swimming Championship",
          category: "Sports",
          description: "DPS Indirapuram aquatic team secured 14 Gold and 8 Silver medals at the CBSE Inter-School Meet.",
          eventDate: new Date("2025-10-22"),
          imageUrl: "/images/facilities/swimming_pool.webp",
          isPublished: true,
        },
        {
          title: "Model United Nations (DPSI-MUN) 2025",
          category: "Conferences",
          description: "Over 500 delegates from across the nation debated pressing global geopolitical issues.",
          eventDate: new Date("2025-09-18"),
          imageUrl: "/images/facilities/smart_classroom.webp",
          isPublished: true,
        },
        {
          title: "Silver Jubilee Grand Annual Cultural Fest",
          category: "Culture",
          description: "A spectacular evening of theatrical musical performance, classical dance, and student art showcase.",
          eventDate: new Date("2025-12-20"),
          imageUrl: "/images/facilities/music_dance.webp",
          isPublished: true,
        },
      ]);
    }

    // 19. IMAGE GALLERY
    const imageCount = await GalleryImage.countDocuments({ isDeleted: false });
    if (imageCount === 0) {
      await GalleryImage.insertMany([
        { title: "Main Campus Building", category: "Campus", imageUrl: "/images/dps/slider_1.webp", isFeatured: true, order: 1 },
        { title: "Futuristic AI & Robotics Lab", category: "Facilities", imageUrl: "/images/facilities/ai_robotics_lab.webp", isFeatured: true, order: 2 },
        { title: "Olympic Swimming Pool", category: "Sports", imageUrl: "/images/facilities/swimming_pool.webp", isFeatured: true, order: 3 },
        { title: "Smart Interactive Classroom", category: "Academics", imageUrl: "/images/facilities/smart_classroom.webp", isFeatured: true, order: 4 },
        { title: "Digital Knowledge Library", category: "Facilities", imageUrl: "/images/facilities/library.webp", isFeatured: true, order: 5 },
        { title: "Performing Arts & Music Studio", category: "Arts", imageUrl: "/images/facilities/music_dance.webp", isFeatured: true, order: 6 },
        { title: "GPS Air-Conditioned Buses", category: "Transport", imageUrl: "/images/facilities/transport_bus.webp", isFeatured: true, order: 7 },
        { title: "Comprehensive Science Labs", category: "Academics", imageUrl: "/images/facilities/science_lab.webp", isFeatured: true, order: 8 },
        { title: "Art & Pottery Studio", category: "Arts", imageUrl: "/images/facilities/art_craft_studio.webp", isFeatured: true, order: 9 },
        { title: "Campus Health & Medical Bay", category: "Facilities", imageUrl: "/images/facilities/medical_infirmary.webp", isFeatured: true, order: 10 },
        { title: "Campus Security & Safety", category: "Facilities", imageUrl: "/images/facilities/campus_security.webp", isFeatured: true, order: 11 },
      ]);
    }

    // 20. VIDEO GALLERY
    const videoCount = await VideoGallery.countDocuments({ isDeleted: false });
    if (videoCount === 0) {
      await VideoGallery.insertMany([
        {
          title: "DPS Indirapuram Virtual Campus Tour",
          category: "Campus Tour",
          youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          thumbnailUrl: "/images/dps/slider_1.webp",
          order: 1,
        },
        {
          title: "AI & Humanoid Robotics Innovation Lab",
          category: "Innovation",
          youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          thumbnailUrl: "/images/facilities/ai_robotics_lab.webp",
          order: 2,
        },
        {
          title: "Annual Sports Day & Aquatic Championship Highlights",
          category: "Sports",
          youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          thumbnailUrl: "/images/facilities/swimming_pool.webp",
          order: 3,
        },
      ]);
    }

    // 21. ATTACHMENTS & CIRCULARS
    const attachmentCount = await Attachment.countDocuments({ isDeleted: false });
    if (attachmentCount === 0) {
      await Attachment.insertMany([
        {
          title: "Annual Academic Calendar 2026-27",
          category: "Calendar",
          fileUrl: "https://www.dpsindirapuram.com/calendar/annual-academic-calendar.pdf",
          fileName: "annual-academic-calendar-2026-27.pdf",
          fileType: "application/pdf",
          fileSize: 2400000,
        },
        {
          title: "Mandatory Public Disclosure (CBSE)",
          category: "CBSE Compliance",
          fileUrl: "https://www.dpsindirapuram.com/docs/mandatory-disclosure.pdf",
          fileName: "cbse-mandatory-public-disclosure.pdf",
          fileType: "application/pdf",
          fileSize: 1800000,
        },
        {
          title: "Fee Structure & Payment Schedule 2026-27",
          category: "Admissions",
          fileUrl: "https://www.dpsindirapuram.com/docs/fee-structure.pdf",
          fileName: "dpsi-fee-structure-2026-27.pdf",
          fileType: "application/pdf",
          fileSize: 950000,
        },
      ]);
    }

    // 22. TRANSFER CERTIFICATES (Sample verified records)
    const tcCount = await TransferCertificate.countDocuments({ isDeleted: false });
    if (tcCount === 0) {
      await TransferCertificate.insertMany([
        {
          tcNumber: "TC-2025-001",
          admissionNumber: "ADM-18492",
          studentName: "Aarav Sharma",
          fatherName: "Mr. Vikram Sharma",
          motherName: "Mrs. Pooja Sharma",
          classLeft: "Class X",
          dateOfBirth: new Date("2010-05-14"),
          dateOfIssue: new Date("2025-04-10"),
          reasonForLeaving: "Parent Transfer",
          status: "Verified",
        },
        {
          tcNumber: "TC-2025-002",
          admissionNumber: "ADM-19203",
          studentName: "Riya Verma",
          fatherName: "Mr. Alok Verma",
          motherName: "Mrs. Sneha Verma",
          classLeft: "Class XII",
          dateOfBirth: new Date("2008-09-22"),
          dateOfIssue: new Date("2025-05-18"),
          reasonForLeaving: "Course Completed",
          status: "Verified",
        },
      ]);
    }

    // 21. ADMIN USER
    const AdminUser = await getAdminUserModel();
    const adminUser = await AdminUser.findOne({ username: { $regex: /^admin$/i } });
    const defaultPassword = process.env.ADMIN_PASSWORD || "Admin@dps123";
    if (!adminUser) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(defaultPassword, salt);
      await AdminUser.create({
        username: "Admin",
        passwordHash,
        role: "superadmin",
      });
    }

    console.log("✅ MongoDB Auto-Seeding completed successfully with all models populated!");
  } catch (error) {
    console.warn("MongoDB Auto-Seeding warning:", error);
  }
}


