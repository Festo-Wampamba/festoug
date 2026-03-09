"use client";

import { useState } from "react";
import { sendEmail } from "@/app/actions/contact";
import { Send } from "lucide-react";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    const formData = new FormData(e.currentTarget);
    const result = await sendEmail(formData);

    if (result.error) {
      setStatusMessage({ type: "error", text: result.error });
    } else {
      setStatusMessage({ type: "success", text: "Your message has been sent successfully. Thank you for reaching out!" });
      (e.target as HTMLFormElement).reset();
    }

    setIsSubmitting(false);
  };

  return (
    <div className="animate-in fade-in duration-500">
      <header className="mb-8 relative pb-[15px]">
        <h2 className="text-white-2 text-[32px] font-semibold capitalize tracking-tight">
          Contact
        </h2>
        <div className="absolute bottom-0 left-0 w-[40px] h-[5px] bg-gradient-to-r from-orange-yellow-crayola to-orange-400 rounded-[3px]" />
      </header>

      {/* Google Map */}
      <section className="mb-10">
        <figure className="rounded-[16px] overflow-hidden border border-jet shadow-1">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15959.035959227225!2d32.613387183410396!3d0.3124645449513956!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x177dbc01495c9873%3A0xa7d285a6dfaac8!2sBugoloobi%2C%20Kampala!5e0!3m2!1sen!2sug!4v1716838058055!5m2!1sen!2sug"
            width="100%"
            height="400"
            style={{ border: 0, filter: "grayscale(1) contrast(1.2) opacity(0.8)" }}
            allowFullScreen={false}
            loading="lazy"
            title="Google Map"
            className="transition-all duration-300 hover:filter-none"
          ></iframe>
        </figure>
      </section>

      {/* Contact Form */}
      <section>
        <h3 className="text-white-2 text-2xl font-semibold capitalize mb-6">Talk to Me</h3>

        {statusMessage && (
          <div className={`p-4 mb-6 rounded-lg text-sm font-medium ${
            statusMessage.type === "success" 
              ? "bg-green-500/10 text-green-500 border border-green-500/20" 
              : "bg-red-500/10 text-red-500 border border-red-500/20"
          }`}>
            {statusMessage.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input
              type="text"
              name="fullname"
              placeholder="Full name"
              required
              className="bg-transparent border border-jet text-white-2 text-[15px] font-light px-5 py-4 rounded-[14px] outline-none focus:border-orange-yellow-crayola transition-colors"
            />
            <input
              type="email"
              name="email"
              placeholder="Email address"
              required
              className="bg-transparent border border-jet text-white-2 text-[15px] font-light px-5 py-4 rounded-[14px] outline-none focus:border-orange-yellow-crayola transition-colors"
            />
          </div>

          <textarea
            name="message"
            placeholder="Your Message"
            required
            rows={5}
            className="bg-transparent border border-jet text-white-2 text-[15px] font-light px-5 py-4 rounded-[14px] outline-none focus:border-orange-yellow-crayola transition-colors resize-y min-h-[120px]"
          ></textarea>

          <button
            type="submit"
            disabled={isSubmitting}
            className="group relative self-end bg-gradient-to-br from-[#404040] to-[rgba(64,64,64,0)] border border-jet text-orange-yellow-crayola text-[15px] font-medium px-6 py-4 rounded-[14px] shadow-1 transition-all duration-300 hover:text-white-2 hover:bg-jet flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="absolute inset-[1px] bg-eerie-black-1 rounded-[14px] -z-10 group-hover:bg-jet transition-colors" />
            <Send className="w-4 h-4" />
            {isSubmitting ? "Sending..." : "Send Message"}
          </button>
        </form>
      </section>
    </div>
  );
}
