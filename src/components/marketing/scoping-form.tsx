"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Send, ArrowRight, CheckCircle2 } from "lucide-react";

export function ScopingForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<string>("Premium Plan (~$2,499)");
  const [selectedTimeline, setSelectedTimeline] = useState<string>("As soon as possible (Urgent)");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const tier = searchParams.get("tier");
    if (tier === "lite") setSelectedPlan("Lite Plan (~$999)");
    else if (tier === "premium") setSelectedPlan("Premium Plan (~$2,499)");
    else if (tier === "pro") setSelectedPlan("Pro Plan (~$4,999)");
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
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-eerie-black-1 border border-jet rounded-3xl p-8 md:p-12 text-center shadow-[0_8px_30px_rgba(0,0,0,0.12)] animate-in fade-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-orange-yellow-crayola/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-orange-yellow-crayola" />
        </div>
        <h3 className="text-2xl md:text-3xl font-bold text-white-2 mb-4">Project Brief Received!</h3>
        <p className="text-light-gray-70 max-w-md mx-auto mb-8">
          Thank you for reaching out. I've received your project details and will be reviewing them shortly. I typically respond within 24 hours.
        </p>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="inline-flex items-center gap-2 bg-jet text-orange-yellow-crayola px-6 py-3 rounded-xl font-medium hover:bg-jet/80 transition-colors"
        >
          Return Home <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-eerie-black-1 border border-jet rounded-3xl p-6 md:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
      
      {/* Contact Information */}
      <div className="mb-10">
        <h3 className="text-xl font-semibold text-white-2 mb-6 pb-2 border-b border-jet flex items-center gap-3">
          <span className="text-orange-yellow-crayola text-sm font-bold bg-orange-yellow-crayola/10 w-8 h-8 rounded-full flex items-center justify-center">1</span>
          Contact Details
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-light-gray mb-2">Full Name *</label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="w-full bg-eerie-black-2 border border-jet text-white-2 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-yellow-crayola/50 focus:ring-1 focus:ring-orange-yellow-crayola/50 transition-all placeholder:text-light-gray-70"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-light-gray mb-2">Work Email *</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full bg-eerie-black-2 border border-jet text-white-2 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-yellow-crayola/50 focus:ring-1 focus:ring-orange-yellow-crayola/50 transition-all placeholder:text-light-gray-70"
              placeholder="john@company.com"
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="company" className="block text-sm font-medium text-light-gray mb-2">Company / Organization</label>
            <input
              id="company"
              name="company"
              type="text"
              className="w-full bg-eerie-black-2 border border-jet text-white-2 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-yellow-crayola/50 focus:ring-1 focus:ring-orange-yellow-crayola/50 transition-all placeholder:text-light-gray-70"
              placeholder="Acme Corp"
            />
          </div>
        </div>
      </div>

      {/* Project Scope */}
      <div className="mb-10">
        <h3 className="text-xl font-semibold text-white-2 mb-6 pb-2 border-b border-jet flex items-center gap-3">
          <span className="text-orange-yellow-crayola text-sm font-bold bg-orange-yellow-crayola/10 w-8 h-8 rounded-full flex items-center justify-center">2</span>
          Project Scope
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="plan" className="block text-sm font-medium text-light-gray mb-2">Interested Plan</label>
            <select
              id="plan"
              aria-label="Interested Plan"
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
              className="w-full bg-eerie-black-2 border border-jet text-white-2 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-yellow-crayola/50 focus:ring-1 focus:ring-orange-yellow-crayola/50 transition-all appearance-none cursor-pointer"
            >
              <option value="Lite Plan (~$999)">Lite Plan (~$999)</option>
              <option value="Premium Plan (~$2,499)">Premium Plan (~$2,499)</option>
              <option value="Pro Plan (~$4,999)">Pro Plan (~$4,999)</option>
              <option value="Custom Enterprise">Custom Enterprise Requirements</option>
            </select>
          </div>
          <div>
            <label htmlFor="timeline" className="block text-sm font-medium text-light-gray mb-2">Expected Timeline</label>
            <select
              id="timeline"
              aria-label="Expected Timeline"
              value={selectedTimeline}
              onChange={(e) => setSelectedTimeline(e.target.value)}
              className="w-full bg-eerie-black-2 border border-jet text-white-2 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-yellow-crayola/50 focus:ring-1 focus:ring-orange-yellow-crayola/50 transition-all appearance-none cursor-pointer"
            >
              <option value="As soon as possible (Urgent)">As soon as possible (Urgent)</option>
              <option value="1 to 3 months">1 to 3 months</option>
              <option value="3 to 6 months">3 to 6 months</option>
              <option value="Flexible timeline">Flexible timeline</option>
            </select>
          </div>
        </div>
      </div>

      {/* Project Details */}
      <div className="mb-10">
        <h3 className="text-xl font-semibold text-white-2 mb-6 pb-2 border-b border-jet flex items-center gap-3">
          <span className="text-orange-yellow-crayola text-sm font-bold bg-orange-yellow-crayola/10 w-8 h-8 rounded-full flex items-center justify-center">3</span>
          The Vision
        </h3>
        
        <div>
          <label htmlFor="vision" className="block text-sm font-medium text-light-gray mb-2">Please describe your project constraints and goals *</label>
          <textarea
            id="vision"
            name="vision"
            required
            rows={5}
            className="w-full bg-eerie-black-2 border border-jet text-white-2 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-yellow-crayola/50 focus:ring-1 focus:ring-orange-yellow-crayola/50 transition-all placeholder:text-light-gray-70 resize-y"
            placeholder="Tell me about what you are building, who your target audience is, and any specific technical requirements..."
          />
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-3 bg-orange-yellow-crayola text-smoky-black font-semibold py-4 rounded-xl hover:bg-orange-yellow-crayola/90 hover:shadow-[0_0_20px_rgba(255,181,63,0.3)] transition-all disabled:opacity-70 disabled:cursor-not-allowed text-lg"
      >
        {isSubmitting ? (
          <>Processing Details...</>
        ) : (
          <>
            Submit Project Brief <Send className="w-5 h-5" />
          </>
        )}
      </button>

      <p className="text-light-gray-70 text-xs text-center mt-6 flex items-center justify-center gap-2">
        <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        Your information is secure and will never be shared.
      </p>

    </form>
  );
}
