import { Suspense, lazy, useEffect } from "react";
import { useLocation } from "react-router";
import Navbar from "./Navbar";
import Footer from "./Footer";
import FloatingSocials from "./FloatingSocials";
import PopupModal from "./PopupModal";
import SmoothScroll from "./SmoothScroll";

const ScrollProgress = lazy(() => import("./ScrollProgress"));
const AIChatWidget = lazy(() => import("./AIChatWidget"));

interface LayoutProps {
  children: React.ReactNode;
}

function ScrollToHash() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const targetId = hash.replace("#", "");
      const scrollToElement = () => {
        const elem = document.getElementById(targetId);
        if (elem) {
          if (window.__lenis) {
            window.__lenis.scrollTo(elem, { offset: -90, duration: 1.2 });
          } else {
            const headerOffset = 90;
            const elementPosition = elem.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            window.scrollTo({
              top: Math.max(0, offsetPosition),
              behavior: "smooth",
            });
          }
        }
      };

      scrollToElement();
      const timer = setTimeout(scrollToElement, 150);
      return () => clearTimeout(timer);
    } else {
      if (window.__lenis) {
        window.__lenis.scrollTo(0, { immediate: true });
      } else {
        window.scrollTo(0, 0);
      }
    }
  }, [pathname, hash]);

  return null;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col relative">
      <SmoothScroll />
      <ScrollToHash />
      <Suspense fallback={null}>
        <ScrollProgress />
      </Suspense>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <FloatingSocials />
      <Suspense fallback={null}>
        <AIChatWidget />
      </Suspense>
      <PopupModal />
    </div>
  );
}