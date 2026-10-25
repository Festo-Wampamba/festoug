"use client";

import { useState, useEffect } from "react";
import { sendEmail } from "@/app/actions/contact";
import { Send, MapPin } from "lucide-react";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Fallback: iframe load can fire before hydration attaches onLoad,
  // which would leave the placeholder covering a loaded map forever
  useEffect(() => {
    const timer = setTimeout(() => setIsMapLoaded(true), 4000);
    return () => clearTimeout(timer);
  }, []);
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
        <div className="absolute bottom-0 left-0 w-[40px] h-[5px] bg-primary rounded-[3px]" />
      </header>

      {/* Google Map */}
      <section className="mb-10">
        <figure className="relative h-[400px] rounded-[16px] overflow-hidden border border-jet bg-eerie-black-1">
          {/* Themed placeholder shown until the embed finishes loading */}
          <div
            aria-hidden="true"
            className={`absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-eerie-black-1 transition-opacity duration-500 ${
              isMapLoaded ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-onyx border border-jet motion-safe:animate-pulse">
              <MapPin className="w-5 h-5 text-orange-yellow-crayola" />
            </div>
            <p className="text-light-gray text-sm font-medium">Bugolobi, Kampala, Uganda</p>
            <p className="text-light-gray-70 text-xs">Loading map…</p>
          </div>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15959.035959227225!2d32.613387183410396!3d0.3124645449513956!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x177dbc01495c9873%3A0xa7d285a6dfaac8!2sBugoloobi%2C%20Kampala!5e0!3m2!1sen!2sug!4v1716838058055!5m2!1sen!2sug"
            width="100%"
            height="400"
            loading="lazy"
            title="Map of Bugolobi, Kampala, Uganda"
            onLoad={() => setIsMapLoaded(true)}
            className={`border-0 filter contrast-[1.2] transition-opacity duration-500 hover:filter-none ${
              isMapLoaded ? "opacity-80" : "opacity-0"
            }`}
          ></iframe>
        </figure>
      </section>

      {/* Contact Form */}
      <section>
        <h3 className="text-white-2 text-2xl font-semibold capitalize mb-6">Talk to Me</h3>

        {statusMessage && (
          <div role={statusMessage.type === "error" ? "alert" : "status"} className={`p-4 mb-6 rounded-lg text-sm font-medium ${
            statusMessage.type === "success"
              ? "bg-secondary text-secondary-foreground border border-border"
              : "bg-destructive/10 text-destructive border border-destructive/25"
          }`}>
            {statusMessage.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="grid gap-2"><label htmlFor="contact-name" className="text-sm font-medium text-foreground">Full name</label><input
              id="contact-name"
              type="text"
              name="fullname"
              placeholder="Full name"
              aria-label="Full name"
              autoComplete="name"
              required
              className="bg-transparent border border-jet text-white-2 placeholder:text-light-gray-70 text-base font-light px-5 py-4 rounded-[14px] outline-none focus:border-light-gray focus:ring-1 focus:ring-light-gray/40 focus-visible:outline-none selection:bg-light-gray/30 selection:text-white-2 transition-colors"
            /></div>
            <div className="grid gap-2"><label htmlFor="contact-email" className="text-sm font-medium text-foreground">Email address</label><input
              id="contact-email"
              type="email"
              name="email"
              placeholder="Email address"
              aria-label="Email address"
              autoComplete="email"
              required
              className="bg-transparent border border-jet text-white-2 placeholder:text-light-gray-70 text-base font-light px-5 py-4 rounded-[14px] outline-none focus:border-light-gray focus:ring-1 focus:ring-light-gray/40 focus-visible:outline-none selection:bg-light-gray/30 selection:text-white-2 transition-colors"
            /></div>
          </div>

          <div className="grid gap-2"><label htmlFor="contact-message" className="text-sm font-medium text-foreground">Your message</label><textarea
            id="contact-message"
            name="message"
            placeholder="Your Message"
            aria-label="Your message"
            required
            rows={5}
            className="bg-transparent border border-jet text-white-2 placeholder:text-light-gray-70 text-base font-light px-5 py-4 rounded-[14px] outline-none focus:border-light-gray focus:ring-1 focus:ring-light-gray/40 focus-visible:outline-none selection:bg-light-gray/30 selection:text-white-2 transition-colors resize-y min-h-[120px]"
          ></textarea></div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex min-h-12 self-start items-center gap-3 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {isSubmitting ? "Sending..." : "Send Message"}
          </button>
        </form>
      </section>
    </div>
  );
}
