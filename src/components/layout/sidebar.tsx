"use client";

import { useState, useEffect, type ReactNode } from "react";
import Image from "next/image";
import { Mail, Phone, MessageCircle, FileText, MapPin, Eye } from "lucide-react";

export function Sidebar() {
  const [isSidebarActive, setIsSidebarActive] = useState(false);
  // Lazy initializer avoids synchronous setState-in-effect; only the change handler fires setState
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches
  );

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px)");
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarActive(!isSidebarActive);
  };

  const emailLink = isDesktop
    ? "https://mail.google.com/mail/?view=cm&fs=1&to=festotechug@gmail.com"
    : "mailto:festotechug@gmail.com";

  return (
    <aside
      className={`bg-eerie-black-2 rounded-[20px] p-[15px] sm:p-5 md:p-6 shadow-1 z-10 border border-jet transition-all duration-500 overflow-hidden relative ${
        isSidebarActive ? "max-h-[800px]" : "max-h-[112px] sm:max-h-[120px] md:max-h-[148px] xl:max-h-none"
      } xl:w-[280px] shrink-0 xl:sticky xl:top-[60px] xl:h-[calc(100vh-120px)]`}
    >
      <div className="flex items-center gap-[15px] md:gap-5 xl:flex-col xl:gap-4 xl:text-center">
        <figure className="shrink-0 w-[70px] h-[70px] sm:w-[84px] sm:h-[84px] md:w-[110px] md:h-[110px] xl:w-[150px] xl:h-[150px] xl:mx-auto">
          <Image
            src="/images/festo-profile.png"
            alt="Festo"
            width={150}
            height={150}
            className="rounded-full animate-in fade-in duration-1000 w-full h-full object-cover"
          />
        </figure>

        <div className="flex-1 min-w-0 xl:w-full">
          <h1 className="text-white-2 text-2xl md:text-3xl font-medium tracking-tight mb-[10px] xl:mb-4 whitespace-nowrap overflow-hidden text-ellipsis">
            Wampamba Festo
          </h1>
          <p className="text-white-1 bg-onyx text-[13px] md:text-[14px] font-light w-max px-3 py-1 rounded-lg xl:mx-auto">
            Software Engineer
          </p>
        </div>

        <button
          className="xl:hidden shrink-0 flex items-center justify-center min-w-[44px] min-h-[44px] rounded-xl text-orange-yellow-crayola bg-gradient-to-br from-jet to-onyx shadow-2 transition-all hover:from-jet/80 hover:to-onyx/80 hover:scale-105 active:scale-95"
          onClick={toggleSidebar}
          aria-label={isSidebarActive ? "Hide contact info" : "Show contact information"}
          aria-expanded={isSidebarActive ? "true" : "false"}
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>

      <div
        className={`transition-all duration-500 xl:opacity-100 xl:visible xl:overflow-y-auto custom-scrollbar xl:h-[calc(100%-180px)] ${
          isSidebarActive ? "opacity-100 visible mt-4" : "opacity-0 invisible h-0 xl:h-auto xl:mt-8"
        }`}
      >
        <hr className="w-full h-[1px] bg-jet my-4 xl:my-8 border-none" />
        <ul className="grid grid-cols-1 gap-4 xl:gap-8">
          <ContactItem
            icon={<Mail className="w-4 h-4" />}
            title="Email"
            href={emailLink}
            value="festotechug@gmail.com"
            iconClass="hover:text-[#D14836]"
          />
          <ContactItem
            icon={<Phone className="w-4 h-4" />}
            title="Phone"
            href="tel:+256754230525"
            value="+256 754230525"
            iconClass="hover:text-[#d8ca00]"
          />
          <ContactItem
            icon={<MessageCircle className="w-4 h-4" />}
            title="WhatsApp"
            href="https://wa.me/256754230525"
            value="Chat on WhatsApp"
            iconClass="hover:text-[#25D366]"
          />
          <ContactItem
            icon={<FileText className="w-4 h-4" />}
            title="My Resume"
            href="/festoug.pdf"
            value="Download Resume"
            download
            iconClass="hover:text-[#FF0000]"
          />
          <ContactItem
            icon={<MapPin className="w-4 h-4" />}
            title="Location"
            href="https://www.google.com/maps/place/Bugoloobi,+Kampala/@0.3124645,32.6133872,15z"
            value="Bugolobi, Kampala, Uganda"
            target="_blank"
            rel="noopener noreferrer"
            iconClass="hover:text-[#cc6301]"
          />
        </ul>
      </div>
    </aside>
  );
}

interface ContactItemProps {
  icon: ReactNode;
  title: string;
  href: string;
  value: string;
  iconClass?: string;
  download?: boolean;
  target?: string;
  rel?: string;
}

function ContactItem({ icon, title, href, value, download, target, rel, iconClass }: ContactItemProps) {
  return (
    <li className="flex items-center gap-4">
      <div
        className={`relative w-[40px] h-[40px] rounded-lg flex justify-center items-center text-orange-yellow-crayola shadow-1 z-10 shrink-0 bg-gradient-to-br from-jet to-jet/0 transition-transform duration-300 hover:scale-110 cursor-pointer active:scale-95 ${iconClass}`}
      >
        <div className="absolute inset-[1px] bg-eerie-black-1 rounded-lg -z-10" />
        {icon}
      </div>
      <div className="w-[calc(100%-56px)]">
        <p className="text-orange-yellow-crayola dark:text-[#ffd700] text-[11px] uppercase mb-[2px]">{title}</p>
        <a
          href={href}
          download={download}
          target={target}
          rel={rel}
          className="text-white-2 text-[15px] font-light transition-colors hover:text-orange-yellow-crayola truncate block"
        >
          {value}
        </a>
      </div>
    </li>
  );
}
