import { Metadata } from 'next';
import { Suspense } from 'react';
import { ScopingForm } from '@/components/marketing/scoping-form';
import { Target, Clock, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Project Scoping | FestoUG',
  description: 'Submit your project details for scoping and premium service engagement.',
};

export default function GetStartedPage() {
  return (
    <div className="animate-in fade-in duration-500">
      
      {/* Page Header */}
      <header className="mb-10 md:mb-16 xl:max-w-[55%]">
        <h2 className="text-white-2 text-3xl md:text-5xl font-semibold mb-6 pb-5 capitalize relative before:content-[''] before:absolute before:bottom-0 before:left-0 before:w-12 before:h-1 before:bg-orange-yellow-crayola before:rounded-sm">
          Let's Build <span className="text-light-gray-70 font-light">Something Great</span>
        </h2>
        
        <p className="text-light-gray text-base md:text-lg max-w-2xl leading-relaxed">
          Please provide some details about your upcoming project or engineering needs. 
          This helps me understand your vision and prepare an accurate proposal and timeline.
        </p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 xl:gap-12">
        {/* Form Column */}
        <div className="xl:col-span-8 order-2 xl:order-1">
          <Suspense fallback={<div className="text-light-gray-70 py-8">Loading form...</div>}>
            <ScopingForm />
          </Suspense>
        </div>

        {/* Sidebar Info Column */}
        <div className="xl:col-span-4 order-1 xl:order-2 flex flex-col gap-6">
          <aside className="bg-eerie-black-1 border border-jet rounded-3xl p-6 md:p-8 sticky top-8">
            <h3 className="text-xl font-semibold text-white-2 mb-6 pb-4 border-b border-jet">
              What Happens Next?
            </h3>
            
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-orange-yellow-crayola/10 text-orange-yellow-crayola flex justify-center items-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-white-2 font-medium mb-1">24-Hour Review</h4>
                  <p className="text-light-gray-70 text-sm">I will review your requirements and get back to you within one business day.</p>
                </div>
              </li>
              
              <li className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-orange-yellow-crayola/10 text-orange-yellow-crayola flex justify-center items-center shrink-0">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-white-2 font-medium mb-1">Project Alignment</h4>
                  <p className="text-light-gray-70 text-sm">We'll jump on a quick discovery call to ensure our goals and technical approaches align perfectly.</p>
                </div>
              </li>
              
              <li className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-orange-yellow-crayola/10 text-orange-yellow-crayola flex justify-center items-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-white-2 font-medium mb-1">Proposal & Deposit</h4>
                  <p className="text-light-gray-70 text-sm">You'll receive a detailed proposal. Upon paying the secure deposit, development begins immediately.</p>
                </div>
              </li>
            </ul>
            
            <div className="mt-8 pt-6 border-t border-jet">
              <p className="text-light-gray text-sm italic">
                "Festo delivers more than just code; he provides reliable architecture that scales."
              </p>
            </div>
          </aside>
        </div>
      </div>

    </div>
  );
}
