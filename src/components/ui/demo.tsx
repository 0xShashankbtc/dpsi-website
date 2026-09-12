import React, { useState } from "react";
import {
  Sidebar001,
  Sidebar001Header,
  Sidebar001Content,
  Sidebar001Section,
  Sidebar001Group,
  Sidebar001Item,
  Sidebar001Footer,
  useSidebar001Effects,
} from "./sidebar-001";
import {
  LayoutDashboard,
  FileText,
  Image,
  Video,
  GraduationCap,
  Users,
  Settings,
  Sparkles,
  Layers,
  HelpCircle,
} from "lucide-react";

function EffectsToggle() {
  const { enabled, toggle } = useSidebar001Effects();
  return (
    <button
      type="button"
      onClick={toggle}
      className="w-full flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg border border-border/60 hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
    >
      <span>Animated Effects</span>
      <span
        className={`size-2 rounded-full ${
          enabled ? "bg-accent-pro" : "bg-muted-foreground/30"
        }`}
      />
    </button>
  );
}

export function SidebarDemo() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="flex h-[600px] w-full max-w-sm rounded-xl border border-border shadow-sm overflow-hidden bg-background">
      <Sidebar001 defaultWidth={280} minWidth={220} maxWidth={360}>
        <Sidebar001Header>
          <div className="flex items-center gap-2 px-1">
            <div className="size-7 rounded-lg bg-accent-pro/10 flex items-center justify-center text-accent-pro font-bold text-sm">
              D
            </div>
            <div>
              <div className="text-sm font-semibold leading-none">DPSI Admin</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                v2.5 Management
              </div>
            </div>
          </div>
        </Sidebar001Header>

        <Sidebar001Content>
          <Sidebar001Section label="Overview">
            <Sidebar001Item
              href="#dashboard"
              label="Dashboard"
              icon={<LayoutDashboard className="size-4" />}
              isActive={activeTab === "dashboard"}
              onClick={(e) => {
                e.preventDefault();
                setActiveTab("dashboard");
              }}
            />
          </Sidebar001Section>

          <Sidebar001Section label="Modules">
            <Sidebar001Group
              label="Content & Media"
              icon={<FileText className="size-4" />}
              defaultOpen={true}
            >
              <Sidebar001Item
                href="#pages"
                label="Manage Pages"
                icon={<FileText className="size-4" />}
                isActive={activeTab === "pages"}
                count={8}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab("pages");
                }}
              />
              <Sidebar001Item
                href="#gallery"
                label="Photo Gallery"
                icon={<Image className="size-4" />}
                isActive={activeTab === "gallery"}
                count={16}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab("gallery");
                }}
              />
              <Sidebar001Item
                href="#videos"
                label="Video Gallery"
                icon={<Video className="size-4" />}
                isActive={activeTab === "videos"}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab("videos");
                }}
              />
            </Sidebar001Group>

            <Sidebar001Group
              label="Academics"
              icon={<GraduationCap className="size-4" />}
              defaultOpen={true}
            >
              <Sidebar001Item
                href="#toppers"
                label="Academic Toppers"
                icon={<GraduationCap className="size-4" />}
                isActive={activeTab === "toppers"}
                isNew
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab("toppers");
                }}
              />
              <Sidebar001Item
                href="#facilities"
                label="Campus Facilities"
                icon={<Layers className="size-4" />}
                isActive={activeTab === "facilities"}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab("facilities");
                }}
              />
              <Sidebar001Item
                href="#leadership"
                label="School Leadership"
                icon={<Users className="size-4" />}
                isActive={activeTab === "leadership"}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab("leadership");
                }}
              />
            </Sidebar001Group>

            <Sidebar001Group
              label="Settings & System"
              icon={<Settings className="size-4" />}
            >
              <Sidebar001Item
                href="#settings"
                label="Site Settings"
                icon={<Settings className="size-4" />}
                isActive={activeTab === "settings"}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab("settings");
                }}
              />
              <Sidebar001Item
                href="#ai"
                label="AI Assistant"
                icon={<Sparkles className="size-4" />}
                isActive={activeTab === "ai"}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab("ai");
                }}
              />
              <Sidebar001Item
                href="#faqs"
                label="Help & FAQs"
                icon={<HelpCircle className="size-4" />}
                isActive={activeTab === "faqs"}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab("faqs");
                }}
              />
            </Sidebar001Group>
          </Sidebar001Section>
        </Sidebar001Content>

        <Sidebar001Footer>
          <EffectsToggle />
        </Sidebar001Footer>
      </Sidebar001>

      <div className="flex-1 p-6 bg-muted/20 flex flex-col items-center justify-center text-center">
        <p className="text-sm font-medium text-foreground">Active Tab</p>
        <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">
          {activeTab}
        </p>
      </div>
    </div>
  );
}

export default SidebarDemo;
