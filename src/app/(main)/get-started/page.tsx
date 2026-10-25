import { Metadata } from 'next';
import { Suspense } from 'react';
import { ScopingForm } from '@/components/marketing/scoping-form';
import { CheckCircledIcon, ClockIcon, TargetIcon } from '@radix-ui/react-icons';

export const metadata: Metadata = {
  title: 'Project Scoping | FestoUG',
  description: 'Submit your project details for scoping and premium service engagement.',
};

export default function GetStartedPage() {
  return (
    <div className="animate-in fade-in duration-500">
      
      {/* Page Header */}
      <header className="mb-10 md:mb-16 max-w-[65ch]">
        <h2 className="text-foreground text-3xl md:text-5xl font-semibold mb-6 pb-5 capitalize relative before:content-[''] before:absolute before:bottom-0 before:left-0 before:w-12 before:h-1 before:bg-primary before:rounded-sm">
          Let&apos;s Build <span className="text-muted-foreground font-light">Something Great</span>
        </h2>
        
        <p className="text-muted-foreground text-base max-w-2xl leading-relaxed">
          Please provide some details about your upcoming project or engineering needs. 
          This helps me understand your vision and prepare an accurate proposal and timeline.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-10">
        {/* Form Column */}
        <div className="w-full">
          <Suspense fallback={<div className="text-muted-foreground py-8 text-base">Loading form...</div>}>
            <ScopingForm />
          </Suspense>
        </div>

        {/* Sidebar Info Column */}
        <div className="w-full">
          <aside className="bg-card text-card-foreground border border-border rounded-3xl p-6 md:p-8">
            <h3 className="text-xl font-semibold text-foreground mb-6 pb-4 border-b border-border">
              What Happens Next?
            </h3>
            
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex justify-center items-center shrink-0">
                  <ClockIcon className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <h4 className="text-foreground font-medium mb-1">24-Hour Review</h4>
                  <p className="text-muted-foreground text-base leading-relaxed">I will review your requirements and get back to you within one business day.</p>
                </div>
              </li>
              
              <li className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex justify-center items-center shrink-0">
                  <TargetIcon className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <h4 className="text-foreground font-medium mb-1">Project Alignment</h4>
                  <p className="text-muted-foreground text-base leading-relaxed">We&apos;ll jump on a quick discovery call to ensure our goals and technical approaches align perfectly.</p>
                </div>
              </li>
              
              <li className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex justify-center items-center shrink-0">
                  <CheckCircledIcon className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <h4 className="text-foreground font-medium mb-1">Proposal & Deposit</h4>
                  <p className="text-muted-foreground text-base leading-relaxed">You&apos;ll receive a detailed proposal. Upon paying the secure deposit, development begins immediately.</p>
                </div>
              </li>
            </ul>
            
            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-muted-foreground text-base leading-relaxed italic">
                &quot;Festo delivers more than just code; he provides reliable architecture that scales.&quot;
              </p>
            </div>
          </aside>
        </div>
      </div>

    </div>
  );
}
