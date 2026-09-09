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
  const customBg = getSetting("cta_bg_color", "");

  return (
    <section
      className="relative py-20 text-white overflow-hidden border-t border-slate-800"
      style={{
        backgroundColor: customBg || "#0f172a", // Sleek minimalist dark slate or dynamic CMS color (No hardcoded blue)
      }}
    >
      {/* Subtle minimalist texture */}
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left CTA text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-semibold tracking-wider uppercase mb-5 border border-white/15">
              {badge}
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 tracking-tight leading-tight text-white">
              {title}
            </h2>

            <p className="text-slate-300 mb-8 text-base sm:text-lg leading-relaxed font-normal">
              {subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-3.5">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <Button
                  size="lg"
                  className="bg-white hover:bg-slate-100 text-slate-900 font-bold px-7 py-3 rounded-xl shadow-lg shadow-black/20 cursor-pointer flex items-center gap-2 text-sm transition-all"
                  asChild
                >
                  <Link to={buttonLink}>
                    {buttonText} <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <Button
                  size="lg"
                  variant="outline"
                  className="border border-white/25 bg-white/5 hover:bg-white/15 text-white px-7 py-3 rounded-xl font-semibold text-sm cursor-pointer backdrop-blur-sm transition-all"
                  asChild
                >
                  <Link to="/contact">Contact Office</Link>
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Right Contact Cards */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-3"
          >
            <motion.a
              href={`tel:${phone.split(",")[0].replace(/[^0-9+]/g, "")}`}
              whileHover={{ x: 4 }}
              className="flex items-center gap-4 p-4.5 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 shadow-sm cursor-pointer transition-all block"
            >
              <div className="w-11 h-11 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400">Direct Admission Desk</p>
                <p className="font-bold text-base text-white">{phone}</p>
              </div>
            </motion.a>

            <motion.a
              href={`mailto:${email}`}
              whileHover={{ x: 4 }}
              className="flex items-center gap-4 p-4.5 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 shadow-sm cursor-pointer transition-all block"
            >
              <div className="w-11 h-11 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400">Email Admissions Desk</p>
                <p className="font-bold text-base text-white">{email}</p>
              </div>
            </motion.a>

            <motion.div
              whileHover={{ x: 4 }}
              className="flex items-center gap-4 p-4.5 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 shadow-sm transition-all"
            >
              <div className="w-11 h-11 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400">Campus Location</p>
                <p className="font-bold text-base text-white">{address}</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
