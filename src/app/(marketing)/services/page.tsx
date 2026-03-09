import { Metadata } from 'next';
import { MonitorSmartphone, Search, Palette, Code2, Rocket, Share2 } from 'lucide-react';
import { ServiceCard } from '@/components/marketing/service-card-new';
import { PricingCard, PricingPlanProps } from '@/components/marketing/pricing-card';

export const metadata: Metadata = {
  title: 'Professional Services | FestoUG',
  description: 'Premium software development, UI/UX design, and digital marketing services by Festo Muwanguzi.',
};

export default function ServicesPage() {
  const services = [
    {
      title: 'Web Development',
      icon: <Code2 className="w-6 h-6" />,
      description: 'I offer reliable web development services to generate the most remarkable results which your business needs.',
      features: [
        'Performance & Load Time',
        'Reusable Components',
        'Responsiveness',
        'Quality assurance and testing',
        'Ongoing maintenance and updates'
      ]
    },
    {
      title: 'Digital Marketing (SEO)',
      icon: <Search className="w-6 h-6" />,
      description: 'My digital marketing services will take your business to the next level, driving traffic and improving brand awareness.',
      features: [
        'Marketing Strategy',
        'Research On Customer',
        'Monetize Products',
        'Technical SEO Optimization',
        'Analytics & Reporting'
      ]
    },
    {
      title: 'UI/UX Product Design',
      icon: <Palette className="w-6 h-6" />,
      description: 'I design digital products that are beautiful, intuitive, and highly functional for the best user experience.',
      features: [
        'User Research & Personas',
        'Wireframing & Prototyping',
        'High-Fidelity UI Design',
        'Design Systems',
        'Usability Testing'
      ]
    },
    {
      title: 'Mobile Development',
      icon: <MonitorSmartphone className="w-6 h-6" />,
      description: 'Expertise in iOS, Android, and cross-platform development using React Native and Flutter.',
      features: [
        'Native iOS & Android',
        'Cross-Platform Apps',
        'App Store Optimization',
        'Push Notifications',
        'Offline Capabilities'
      ]
    },
    {
      title: 'E-commerce Solutions',
      icon: <Rocket className="w-6 h-6" />,
      description: 'Custom e-commerce platforms built for scale, performance, and maximum conversion rates.',
      features: [
        'Custom Storefronts',
        'Payment Gateway Integration',
        'Inventory Management',
        'Checkout Optimization',
        'Order Fulfillment Flow'
      ]
    },
    {
      title: 'Social Media Management',
      icon: <Share2 className="w-6 h-6" />,
      description: 'Strategic social media planning and content creation to build your audience and authority online.',
      features: [
        'Content Strategy',
        'Community Management',
        'Paid Social Campaigns',
        'Brand Voice Guide',
        'Growth Analytics'
      ]
    }
  ];

  const pricingPlans: PricingPlanProps[] = [
    {
      name: 'Lite Plan',
      target: 'Perfect Choice for individual',
      price: 999.00,
      interval: 'Project',
      features: [
        { name: 'Custom Landing Page', included: true },
        { name: 'Mobile Responsive', included: true },
        { name: 'Basic SEO Setup', included: true },
        { name: 'Content Management System', included: false },
        { name: 'E-commerce Functionality', included: false },
        { name: 'Custom User Authentication', included: false },
      ]
    },
    {
      name: 'Premium Plan',
      target: 'Perfect for small businesses',
      price: 2499.00,
      interval: 'Project',
      isPopular: true,
      features: [
        { name: 'Custom 5-Page Website', included: true },
        { name: 'Mobile Responsive', included: true },
        { name: 'Advanced SEO Setup', included: true },
        { name: 'Content Management System', included: true },
        { name: 'Basic E-commerce (10 items)', included: true },
        { name: 'Custom User Authentication', included: false },
      ]
    },
    {
      name: 'Pro Plan',
      target: 'Perfect for established brands',
      price: 4999.00,
      interval: 'Project',
      features: [
        { name: 'Custom Web Application', included: true },
        { name: 'Mobile Responsive', included: true },
        { name: 'Advanced SEO Setup', included: true },
        { name: 'Content Management System', included: true },
        { name: 'Full E-commerce Functionality', included: true },
        { name: 'Custom User Authentication', included: true },
      ]
    }
  ];

  return (
    <div className="animate-in fade-in duration-500">
      
      {/* Page Header */}
      <header className="mb-10 md:mb-16 xl:max-w-[55%]">
        <h2 className="text-white-2 text-3xl md:text-5xl font-semibold mb-6 pb-5 capitalize relative before:content-[''] before:absolute before:bottom-0 before:left-0 before:w-12 before:h-1 before:bg-orange-yellow-crayola before:rounded-sm">
          Services <span className="text-light-gray-70 font-light">& Pricing</span>
        </h2>
        
        <p className="text-light-gray text-base md:text-lg max-w-2xl leading-relaxed">
          Elevating businesses through high-end web development, digital marketing, and bespoke software architecture. I deliver solutions that generate the most remarkable results your business needs.
        </p>
      </header>

      {/* Services Grid */}
      <section className="mb-24">
        <h3 className="text-2xl font-semibold text-white-2 mb-8 flex items-center gap-3">
          <span className="text-orange-yellow-crayola">01.</span> Core Services
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, idx) => (
            <ServiceCard 
              key={idx}
              title={service.title}
              icon={service.icon}
              description={service.description}
              features={service.features}
            />
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section>
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 text-orange-yellow-crayola font-medium mb-3 tracking-widest text-sm">
            <span>&gt;&gt;&gt;</span> PRICING PLAN
          </div>
          <h3 className="text-3xl md:text-5xl font-bold text-white-2 mb-4">Pricing My Work</h3>
          <p className="text-light-gray max-w-xl mx-auto">
            Transparent, straightforward pricing for high-quality engineering and design. Choose the package that fits your business needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pricingPlans.map((plan, idx) => (
            <div key={idx} className={plan.isPopular ? "md:-mt-4 md:mb-4 relative z-10" : ""}>
              <PricingCard plan={plan} />
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
