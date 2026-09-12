import { Link } from "react-router";
import {
  MapPin,
  Phone,
  Mail,
  Facebook,
  Youtube,
  Linkedin,
  Instagram,
  ArrowUp,
} from "lucide-react";
import { ChevronRightIcon } from "@radix-ui/react-icons";
import { motion } from "framer-motion";
import { trpc } from "@/providers/trpc";
import { FlickeringGrid, useMediaQuery } from "@/components/ui/flickering-footer";

export default function Footer() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { data: dbQuickMenus } = trpc.cms.listMenus.useQuery({ location: "footer_quick" });
  const { data: dbResourceMenus } = trpc.cms.listMenus.useQuery({ location: "footer_resources" });
  const { data: siteSettings } = trpc.cms.getSiteSettings.useQuery();

  const getSetting = (key: string, fallback: string) => {
    const item = siteSettings?.find((s: any) => s.key === key);
    return item?.value?.trim() || fallback;
  };

  const phone = getSetting("contact_phone", "+91-0120-4660000, 4670000");
  const email = getSetting("contact_email", "info@dpsindirapuram.com");
  const address = getSetting("contact_address", "526/1, Ahinsa Khand-II, Indirapuram, Ghaziabad, U.P. - 201014");
  const fbUrl = getSetting("social_facebook", "https://www.facebook.com/DPSIndirapuramGhaziabad");
  const ytUrl = getSetting("social_youtube", "https://www.youtube.com/channel/UC-jQAVRh4pBXEktpml3yeIQ/videos");
  const instaUrl = getSetting("social_instagram", "https://www.instagram.com/dps_indirapuram/");
  const tagline = getSetting(
    "footer_tagline",
    "Delhi Public School Indirapuram, established in 2003, is a premier institution under the DPS Society, committed to holistic education and excellence."
  );
  const copyright = getSetting(
    "footer_copyright",
    `Copyrights ${new Date().getFullYear()} DPS Indirapuram. All Rights Reserved.`
  );

  const quickLinks = dbQuickMenus
    ? dbQuickMenus.filter((m: any) => m.isActive && !m.isDeleted).map((m: any) => ({ label: m.title, href: m.url }))
    : [];

  const resources = dbResourceMenus
    ? dbResourceMenus.filter((m: any) => m.isActive && !m.isDeleted).map((m: any) => ({
        label: m.title,
        href: m.url,
        external: m.url.startsWith("http"),
      }))
    : [];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const logoUrl = getSetting("logo_url", "/images/dps/logo.webp");
  const logoHeight = parseInt(getSetting("logo_height", "52"), 10) || 52;
  const logoShape = getSetting("logo_shape", "default");

  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center">
              <img
                src={logoUrl}
                alt="DPS Indirapuram Logo"
                style={{ height: `${Math.min(Math.max(logoHeight, 32), 64)}px` }}
                className={`w-auto object-contain ${
                  logoShape === "circle"
                    ? "rounded-full"
                    : logoShape === "rounded"
                    ? "rounded-xl"
                    : logoShape === "rectangle"
                    ? "rounded-none"
                    : ""
                }`}
              />
            </div>
            <p className="text-sm leading-relaxed">
              {tagline}
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href={fbUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-slate-800 hover:bg-[#1877F2] transition-colors"
                title="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={ytUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-slate-800 hover:bg-[#FF0000] transition-colors"
                title="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href="https://www.linkedin.com/company/dpsindirapuram/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-slate-800 hover:bg-[#0A66C2] transition-colors"
                title="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href={instaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-slate-800 hover:bg-[#dc2743] transition-colors"
                title="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {quickLinks.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                Quick Links
              </h4>
              <ul className="space-y-2.5">
                {quickLinks.map((link) => (
                  <li
                    key={link.label}
                    className="group inline-flex w-full cursor-pointer items-center justify-start gap-1.5"
                  >
                    <Link
                      to={link.href}
                      className="text-sm text-slate-300 group-hover:text-emerald-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                    <div className="flex size-4 items-center justify-center border border-slate-700 bg-slate-800/80 rounded translate-x-0 transform opacity-0 transition-all duration-300 ease-out group-hover:translate-x-1 group-hover:opacity-100 text-emerald-400">
                      <ChevronRightIcon className="h-3.5 w-3.5" />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {resources.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                Resources
              </h4>
              <ul className="space-y-2.5">
                {resources.map((link) => (
                  <li
                    key={link.label}
                    className="group inline-flex w-full cursor-pointer items-center justify-start gap-1.5"
                  >
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-amber-400 group-hover:text-amber-300 transition-colors flex items-center gap-1"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        to={link.href}
                        className="text-sm text-slate-300 group-hover:text-emerald-400 transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                    <div className="flex size-4 items-center justify-center border border-slate-700 bg-slate-800/80 rounded translate-x-0 transform opacity-0 transition-all duration-300 ease-out group-hover:translate-x-1 group-hover:opacity-100 text-emerald-400">
                      <ChevronRightIcon className="h-3.5 w-3.5" />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Contact Us
            </h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-sm">
                  {address}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-emerald-400 shrink-0" />
                <p className="text-sm">{phone}</p>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-emerald-400 shrink-0" />
                <p className="text-sm">{email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animated Flickering Grid Canvas Banner */}
      <div className="w-full h-40 md:h-56 relative mt-4 overflow-hidden border-t border-slate-800/80">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/90 z-10 pointer-events-none" />
        <div className="absolute inset-0 mx-2 sm:mx-6">
          <FlickeringGrid
            text="DELHI PUBLIC SCHOOL INDIRAPURAM"
            fontSize={isMobile ? 40 : 68}
            squareSize={2}
            gridGap={isMobile ? 2 : 3}
            color="#10B981"
            maxOpacity={0.28}
            flickerChance={0.12}
            className="h-full w-full"
          />
        </div>
      </div>

      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            {copyright}
          </p>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={scrollToTop}
            className="p-2 rounded-full bg-emerald-700 hover:bg-emerald-600 text-white transition-colors"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </footer>
  );
}