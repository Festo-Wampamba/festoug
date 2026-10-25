"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRightIcon,
  CheckCircledIcon,
  LockClosedIcon,
  PaperPlaneIcon,
} from "@radix-ui/react-icons";

export function ScopingForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<string>("Premium Plan ($550)");
  const [selectedTimeline, setSelectedTimeline] = useState<string>("As soon as possible (Urgent)");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const tier = searchParams.get("tier");
    if (tier === "lite") setSelectedPlan("Lite Plan ($299)");
    else if (tier === "premium") setSelectedPlan("Premium Plan ($550)");
    else if (tier === "pro") setSelectedPlan("Pro Plan ($699)");
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const fd = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/project-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:     fd.get("name") as string,
          email:    fd.get("email") as string,
          company:  fd.get("company") as string || undefined,
          plan:     selectedPlan,
          timeline: selectedTimeline,
          vision:   fd.get("vision") as string,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Submission failed");
      }

      setIsSuccess(true);
    } catch (err) {
      setError((err instanceof Error ? err.message : String(err)) || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-card text-foreground border border-border rounded-3xl p-8 md:p-12 text-center shadow-lg animate-in fade-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircledIcon className="w-10 h-10 text-primary" />
        </div>
        <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Project Brief Received!</h3>
        <p className="text-muted-foreground text-base leading-relaxed max-w-md mx-auto mb-8">
          Thank you for reaching out. I&apos;ve received your project details and will be reviewing them shortly. I typically respond within 24 hours.
        </p>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="inline-flex min-h-[52px] items-center gap-2 bg-secondary text-secondary-foreground px-6 py-3 rounded-xl font-medium hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card active:scale-[0.98] transition-colors"
        >
          Return Home <ArrowRightIcon className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card text-foreground border-0 border-border rounded-2xl p-0 sm:border sm:p-7 2xl:p-9">
      
      {/* Contact Information */}
      <div className="mb-10">
        <h3 className="text-xl font-semibold text-foreground mb-6 pb-2 border-b border-border flex items-center gap-3">
          <span className="text-primary text-sm font-bold bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center">1</span>
          Contact Details
        </h3>
        
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,18rem),1fr))] gap-6">
          <div>
            <label htmlFor="name" className="block text-base font-medium text-foreground mb-2">Full Name *</label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="w-full min-h-[52px] bg-background border border-border text-foreground rounded-xl px-4 py-2.5 text-base focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors placeholder:text-muted-foreground"
              placeholder="Your name"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-base font-medium text-foreground mb-2">Work Email *</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full min-h-[52px] bg-background border border-border text-foreground rounded-xl px-4 py-2.5 text-base focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors placeholder:text-muted-foreground"
              placeholder="you@company.com"
            />
          </div>
          <div className="col-span-full">
            <label htmlFor="company" className="block text-base font-medium text-foreground mb-2">Company / Organization</label>
            <input
              id="company"
              name="company"
              type="text"
              className="w-full min-h-[52px] bg-background border border-border text-foreground rounded-xl px-4 py-2.5 text-base focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors placeholder:text-muted-foreground"
              placeholder="Company or organization"
            />
          </div>
        </div>
      </div>

      {/* Project Scope */}
      <div className="mb-10">
        <h3 className="text-xl font-semibold text-foreground mb-6 pb-2 border-b border-border flex items-center gap-3">
          <span className="text-primary text-sm font-bold bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center">2</span>
          Project Scope
        </h3>
        
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label htmlFor="plan" className="block text-base font-medium text-foreground mb-2">Interested Plan</label>
            <select
              id="plan"
              aria-label="Interested Plan"
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
              className="w-full min-h-[52px] bg-background border border-border text-foreground rounded-xl px-4 py-2.5 text-base focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors cursor-pointer"
            >
              <option value="Lite Plan ($299)">Lite — $299</option>
              <option value="Premium Plan ($550)">Premium — $550</option>
              <option value="Pro Plan ($699)">Pro — $699</option>
              <option value="Custom Enterprise">Custom project</option>
            </select>
          </div>
          <div>
            <label htmlFor="timeline" className="block text-base font-medium text-foreground mb-2">Expected Timeline</label>
            <select
              id="timeline"
              aria-label="Expected Timeline"
              value={selectedTimeline}
              onChange={(e) => setSelectedTimeline(e.target.value)}
              className="w-full min-h-[52px] bg-background border border-border text-foreground rounded-xl px-4 py-2.5 text-base focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors cursor-pointer"
            >
              <option value="As soon as possible (Urgent)">As soon as possible</option>
              <option value="1 to 3 months">1 to 3 months</option>
              <option value="3 to 6 months">3 to 6 months</option>
              <option value="Flexible timeline">Flexible timeline</option>
            </select>
          </div>
        </div>
      </div>

      {/* Project Details */}
      <div className="mb-10">
        <h3 className="text-xl font-semibold text-foreground mb-6 pb-2 border-b border-border flex items-center gap-3">
          <span className="text-primary text-sm font-bold bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center">3</span>
          The Vision
        </h3>
        
        <div>
          <label htmlFor="vision" className="block text-base font-medium text-foreground mb-2">Please describe your project constraints and goals *</label>
          <textarea
            id="vision"
            name="vision"
            required
            rows={5}
            className="w-full min-h-[160px] bg-background border border-border text-foreground rounded-xl px-4 py-3 text-base focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors placeholder:text-muted-foreground resize-y"
            placeholder="Tell us what you are building, who it is for, and any technical requirements..."
          />
        </div>
      </div>

      {error && (
        <div role="alert" className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-base">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full min-h-[52px] flex items-center justify-center gap-3 bg-primary text-primary-foreground font-semibold py-3 rounded-xl hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card active:scale-[0.99] transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-lg"
      >
        {isSubmitting ? (
          <>Processing Details...</>
        ) : (
          <>
            Submit Project Brief <PaperPlaneIcon className="w-5 h-5" />
          </>
        )}
      </button>

      <p className="text-muted-foreground text-base text-center mt-6 flex items-center justify-center gap-2">
        <LockClosedIcon className="w-4 h-4 text-primary" aria-hidden="true" />
        Your information is secure and will never be shared.
      </p>

    </form>
  );
}
