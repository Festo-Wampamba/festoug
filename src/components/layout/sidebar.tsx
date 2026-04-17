"use client";

import { useState, useEffect, type ReactNode } from "react";
import Image from "next/image";
import { Mail, Phone, MessageCircle, FileText, MapPin, Eye } from "lucide-react";

export function Sidebar() {
  const [isSidebarActive, setIsSidebarActive] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    // Collapse mobile sidebar when switching to desktop
    const handler = (e: MediaQueryListEvent) => {
      if (e.matches) setIsSidebarActive(false);
    };
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarActive(!isSidebarActive);
  };

  const emailLink = "mailto:festotechug@gmail.com";

  return (
    <aside
      className={`bg-eerie-black-2 rounded-[20px] p-[15px] sm:p-5 md:p-6 shadow-1 z-10 border border-jet transition-all duration-500 overflow-hidden relative lg:overflow-visible lg:h-auto lg:self-start ${
        isSidebarActive ? "max-h-[800px]" : "max-h-[112px] sm:max-h-[120px] md:max-h-[148px] lg:max-h-none"
      } lg:w-[300px] shrink-0 lg:sticky lg:top-[30px]`}
    >
      {/* Profile section — fixed height, never shrinks */}
      <div className="flex items-center gap-[15px] md:gap-5 lg:flex-col lg:gap-4 lg:text-center">
        <figure className="shrink-0 w-[70px] h-[70px] sm:w-[84px] sm:h-[84px] md:w-[110px] md:h-[110px] lg:w-[150px] lg:h-[150px] lg:mx-auto">
          <Image
            src="/images/festo-profile.png"
            alt="Festo"
            width={150}
            height={150}
            className="rounded-full animate-in fade-in duration-1000 w-full h-full object-cover"
          />
        </figure>

        <div className="flex-1 min-w-0 lg:w-full">
          <h1 className="text-white-2 text-xl sm:text-2xl md:text-3xl font-medium tracking-tight mb-[10px] lg:mb-4 break-words">
            Wampamba Festo
          </h1>
          <p className="text-white-1 bg-onyx text-[13px] md:text-[14px] font-light w-max px-3 py-1 rounded-lg lg:mx-auto">
            Software Engineer
          </p>
        </div>

        <button
          className="lg:hidden shrink-0 flex items-center justify-center min-w-[44px] min-h-[44px] rounded-xl text-orange-yellow-crayola bg-gradient-to-br from-jet to-onyx shadow-2 transition-all hover:from-jet/80 hover:to-onyx/80 hover:scale-105 active:scale-95"
          onClick={toggleSidebar}
          aria-label={isSidebarActive ? "Hide contact info" : "Show contact information"}
          aria-expanded={isSidebarActive ? "true" : "false"}
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>

      {/* Contact section — always fully visible on desktop, no internal scroll */}
      <div
        className={`transition-all duration-500 lg:opacity-100 lg:visible ${
          isSidebarActive ? "opacity-100 visible mt-4" : "opacity-0 invisible h-0 lg:h-auto lg:mt-6"
        }`}
      >
        <hr className="w-full h-[1px] bg-jet my-4 lg:my-6 border-none" />
        <ul className="grid grid-cols-1 gap-4">
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
          className="text-white-2 text-[15px] font-light transition-colors hover:text-orange-yellow-crayola truncate lg:whitespace-normal lg:overflow-visible block"
        >
          {value}
        </a>
      </div>
    </li>
  );
}
