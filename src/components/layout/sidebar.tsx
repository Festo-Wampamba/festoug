"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Mail, Phone, MessageCircle, FileText, MapPin, Eye } from "lucide-react";

export function Sidebar() {
  const [isSidebarActive, setIsSidebarActive] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px)");
    setIsDesktop(mql.matches);
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
      className={`bg-eerie-black-2 rounded-[20px] p-[15px] sm:p-8 shadow-1 z-10 border border-jet transition-all duration-500 overflow-hidden relative ${
        isSidebarActive ? "max-h-[800px]" : "max-h-[112px] xl:max-h-none"
      } xl:w-[280px] shrink-0 xl:sticky xl:top-[60px] xl:h-[calc(100vh-120px)]`}
    >
      <div className="relative flex justify-start items-center gap-[15px] xl:flex-col xl:gap-4 xl:text-center">
        <figure className="bg-gradient-to-br from-[#3f3f40] to-[#303030] rounded-[60px] p-2 flex shrink-0 xl:w-[150px] xl:h-[150px] xl:mx-auto">
          <Image
            src="/images/festo.svg"
            alt="Festo"
            width={80}
            height={80}
            className="rounded-[60px] animate-in fade-in duration-1000 xl:w-full xl:h-full object-cover"
          />
        </figure>

        <div className="flex-1 xl:w-full">
          <h1 className="text-white-2 text-2xl font-medium tracking-tight mb-[10px] whitespace-nowrap overflow-hidden text-ellipsis xl:mb-4">
            Wampamba Festo
          </h1>
          <p className="text-white-1 bg-onyx text-[13px] font-light w-max px-3 py-1 rounded-lg xl:mx-auto">
            Software Engineer
          </p>
        </div>

        <button
          className={`absolute -top-[15px] -right-[15px] sm:-right-8 sm:-top-8 xl:hidden rounded-bl-[15px] rounded-tr-[20px] text-[13px] text-orange-yellow-crayola bg-gradient-to-br from-[#404040] to-[#303030] p-[10px] shadow-2 transition-colors z-10 hover:from-[#3f3f40] hover:to-[#303030]`}
          onClick={toggleSidebar}
          aria-label="Toggle Sidebar"
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

function ContactItem({ icon, title, href, value, download, target, rel, iconClass }: any) {
  return (
    <li className="flex items-center gap-4">
      <div
        className={`relative w-[40px] h-[40px] rounded-lg flex justify-center items-center text-orange-yellow-crayola shadow-1 z-10 shrink-0 bg-gradient-to-br from-[#404040] to-[rgba(64,64,64,0)] transition-transform duration-300 hover:scale-110 cursor-pointer active:scale-95 ${iconClass}`}
      >
        <div className="absolute inset-[1px] bg-eerie-black-1 rounded-lg -z-10" />
        {icon}
      </div>
      <div className="w-[calc(100%-56px)]">
        <p className="text-[#ffd700] text-[11px] uppercase mb-[2px]">{title}</p>
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
