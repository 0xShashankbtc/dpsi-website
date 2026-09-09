import { motion } from "framer-motion";
import { Link } from "react-router";
import { ArrowRight, Phone, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/providers/trpc";

export default function CTASection() {
  const { data: settings } = trpc.cms.getSiteSettings.useQuery();

  const getSetting = (key: string, fallback: string) => {
    const item = settings?.find((s: any) => s.key === key);
    return item?.value?.trim() || fallback;
  };

  const badge = getSetting("cta_badge", "Admissions Open 2026-27");
  const title = getSetting("cta_title", "Begin Your Journey With DPS Indirapuram");
  const subtitle = getSetting(
    "cta_subtitle",
    "Admissions are now open for the session 2026-27 (Pre-Nursery to Class IX & XI). Limited seats available. Enquire today and secure your child's future at Delhi NCR's top CBSE institution."
  );
  const buttonText = getSetting("cta_button_text", "Apply Online");
  const buttonLink = getSetting("cta_button_link", "/admissions");
  const phone = getSetting("contact_phone", "+91-0120-4660000, 4670000");
  const email = getSetting("contact_email", "info@dpsindirapuram.com");
  const address = getSetting("contact_address", "526/1, Ahinsa Khand-II, Indirapuram, Ghaziabad, U.P. - 201014");

  return (
    <section className="relative py-20 bg-blue-700 text-white overflow-hidden">
      {/* Subtle dot-grid background texture */}
      <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
      {/* Right orange accent glow */}
      <div className="absolute -top-24 right-0 w-80 h-80 bg-orange-500/20 blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* LEFT — CTA text */}
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center px-3 py-1 rounded-lg bg-white/15 text-white text-xs font-bold uppercase tracking-wider mb-5 border border-white/25">
              {badge}
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-5 tracking-tight leading-tight">
              {title}
            </h2>
            <p className="text-blue-100 mb-9 text-base sm:text-lg leading-relaxed font-medium">
              {subtitle}
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
                <Button
                  size="lg"
                  className="bg-orange-500 hover:bg-orange-600 text-white font-black px-8 py-3.5 rounded-xl shadow-xl shadow-orange-900/30 cursor-pointer flex items-center gap-2 text-sm transition-colors"
                  asChild
                >
                  <Link to={buttonLink}>
                    {buttonText} <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
                <Button
                  size="lg"
                  className="border-2 border-white/60 bg-white/10 hover:bg-white/20 text-white px-8 py-3.5 rounded-xl font-bold text-sm cursor-pointer"
                  asChild
                >
                  <Link to="/contact">Contact Office</Link>
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* RIGHT — Contact info cards */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.65, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-3"
          >
            {/* Phone */}
            <motion.a
              href={`tel:${phone.split(",")[0].replace(/[^0-9+]/g, "")}`}
              whileHover={{ x: 4, backgroundColor: "rgba(255,255,255,0.18)" }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="flex items-center gap-4 p-5 bg-white/10 rounded-2xl border border-white/15 shadow-sm cursor-pointer transition-colors block"
            >
              <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold text-blue-200">Direct Admission Desk</p>
                <p className="font-extrabold text-base text-white">{phone}</p>
              </div>
            </motion.a>

            {/* Email */}
            <motion.a
              href={`mailto:${email}`}
              whileHover={{ x: 4, backgroundColor: "rgba(255,255,255,0.18)" }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="flex items-center gap-4 p-5 bg-white/10 rounded-2xl border border-white/15 shadow-sm cursor-pointer transition-colors block"
            >
              <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold text-blue-200">Email Admissions Desk</p>
                <p className="font-extrabold text-base text-white">{email}</p>
              </div>
            </motion.a>

            {/* Address */}
            <motion.div
              whileHover={{ x: 4, backgroundColor: "rgba(255,255,255,0.18)" }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="flex items-center gap-4 p-5 bg-white/10 rounded-2xl border border-white/15 shadow-sm transition-colors"
            >
              <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold text-blue-200">Campus Location</p>
                <p className="font-extrabold text-base text-white">{address}</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
