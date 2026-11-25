"use client";

import { useState } from "react";
import { sendEmail } from "@/app/actions/contact";
import { ChevronDown, MapPin, Send } from "lucide-react";

const FIELD =
  "w-full rounded-xl border border-input bg-card/70 px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/80 outline-none transition-[border-color,box-shadow] duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setIsSubmitting(true);
    setStatusMessage(null);

    const result = await sendEmail(new FormData(form));

    if (result.error) {
      setStatusMessage({ type: "error", text: result.error });
    } else {
      setStatusMessage({ type: "success", text: "Your message has been sent successfully. Thank you for reaching out!" });
      form.reset();
    }

    setIsSubmitting(false);
  };

  return (
    <div>
      <header className="mb-8 max-w-2xl">
        <div className="relative pb-[15px]">
          <h1 className="text-foreground text-[32px] font-semibold tracking-tight">Contact</h1>
          <div className="absolute bottom-0 left-0 h-1 w-10 rounded-full bg-gold" />
        </div>
        <p className="mt-4 text-muted-foreground">
          Tell me what you need to build, improve, or get working.
        </p>
      </header>

      {/* 1 — The task: write and send */}
      <section aria-labelledby="contact-form-heading" className="max-w-3xl">
        <h2 id="contact-form-heading" className="sr-only">Send a message</h2>

        <form onSubmit={handleSubmit} className="grid gap-5">
          <fieldset className="grid gap-5 md:grid-cols-2">
            <legend className="sr-only">About you</legend>
            <div className="grid gap-1.5">
              <label htmlFor="contact-name" className="text-sm font-medium text-foreground">Full name</label>
              <input id="contact-name" type="text" name="fullname" autoComplete="name" required className={FIELD} />
            </div>
            <div className="grid gap-1.5">
              <label htmlFor="contact-email" className="text-sm font-medium text-foreground">Email address</label>
              <input id="contact-email" type="email" name="email" autoComplete="email" required className={FIELD} />
            </div>
          </fieldset>

          <div className="grid gap-1.5">
            <label htmlFor="contact-message" className="text-sm font-medium text-foreground">Your message</label>
            <textarea
              id="contact-message"
              name="message"
              required
              rows={6}
              placeholder="What are you working on, and where are you stuck?"
              className={`${FIELD} min-h-[9rem] resize-y`}
            />
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-5 gap-y-3">
            <button
              type="submit"
              disabled={isSubmitting}
              data-sending={isSubmitting}
              aria-label={isSubmitting ? "Sending message" : "Send message"}
              className="send-cta inline-flex min-h-12 items-center gap-3 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/92 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <span className="send-plane" aria-hidden>
                <Send className="size-4" />
              </span>
              {isSubmitting ? (
                <span>Sending…</span>
              ) : (
                <span className="send-label" aria-hidden>
                  <span>Send message</span>
                  <span>Let it fly</span>
                </span>
              )}
            </button>

            {statusMessage && (
              <p
                role={statusMessage.type === "error" ? "alert" : "status"}
                className={`text-sm font-medium ${statusMessage.type === "success" ? "text-secondary-foreground" : "text-destructive"}`}
              >
                {statusMessage.text}
              </p>
            )}
          </div>
        </form>
      </section>

      {/* 2 — Secondary: where I am. Folded away; the embed only loads when opened. */}
      <details className="disclosure mt-10 max-w-3xl rounded-2xl border border-border bg-eerie-black-1">
        <summary className="flex min-h-14 items-center gap-3 rounded-2xl px-4 py-3 sm:px-5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground" aria-hidden>
            <MapPin className="size-[18px]" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium text-foreground">Based in Bugolobi, Kampala</span>
            <span className="block text-xs text-muted-foreground">Show on map</span>
          </span>
          <ChevronDown className="disclosure-chevron size-5 shrink-0 text-muted-foreground" aria-hidden />
        </summary>
        <figure className="relative m-3 mt-0 h-[320px] overflow-hidden rounded-xl border border-border bg-muted sm:m-4 sm:mt-0">
          <p className="absolute inset-0 grid place-items-center text-sm text-muted-foreground" aria-hidden>Loading map…</p>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15959.035959227225!2d32.613387183410396!3d0.3124645449513956!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x177dbc01495c9873%3A0xa7d285a6dfaac8!2sBugoloobi%2C%20Kampala!5e0!3m2!1sen!2sug!4v1716838058055!5m2!1sen!2sug"
            loading="lazy"
            title="Map of Bugolobi, Kampala, Uganda"
            className="relative size-full border-0"
          />
        </figure>
      </details>
    </div>
  );
}
