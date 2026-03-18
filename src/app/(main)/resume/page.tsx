import { TimelineItem } from "@/components/marketing/timeline-item";
import { SkillBar } from "@/components/marketing/skill-bar";
import { BookOpen, Bookmark } from "lucide-react";

export const metadata = {
  title: "Resume",
  description: "Education, experience, and technical skills of Festo Wampamba — Full-Stack Software Engineer.",
};

export default function ResumePage() {
  return (
    <div className="animate-in fade-in duration-500">
      <header className="mb-8 relative pb-[15px]">
        <h2 className="text-white-2 text-[32px] font-semibold capitalize tracking-tight">
          Resume
        </h2>
        <div className="absolute bottom-0 left-0 w-[40px] h-[5px] bg-gradient-to-r from-orange-yellow-crayola to-orange-400 rounded-[3px]" />
      </header>

      {/* Education Timeline */}
      <div className="mb-8">
        <div className="flex items-center gap-[15px] mb-[25px]">
          <div className="relative w-[40px] h-[40px] rounded-lg flex justify-center items-center text-orange-yellow-crayola shadow-1 z-10 bg-gradient-to-br from-jet to-jet/0">
            <div className="absolute inset-[1px] bg-eerie-black-1 rounded-lg -z-10" />
            <BookOpen className="w-[18px] h-[18px]" />
          </div>
          <h3 className="text-white-2 text-2xl font-semibold capitalize">Education</h3>
        </div>

        <ol className="ml-0 sm:ml-[15px] xl:ml-[45px] border-l-0 sm:border-l sm:border-jet pl-0 sm:pl-[25px] xl:pl-[30px]">
          <TimelineItem
            institution="Makerere University Business School - Nakawa, Uganda"
            program="Bachelor's Degree in Business Computing"
            period="2023 - Current"
            description="This program focuses on integrating business principles with modern computing techniques, preparing me for a dynamic career in business and technology.\nThe curriculum includes courses in data analysis, information systems, and business management, providing a strong foundation for roles that require both technical and business acumen."
          />
          <TimelineItem
            institution="JAIN (Deemed-to-be University) - Bangalore India"
            program="Bachelor of Computer Applications"
            period="2023 - Current"
            description="This program offers in-depth knowledge of computer science and applications, emphasizing practical skills and industry-relevant technologies.\nThe coursework covers programming, database management, software engineering, and cloud technology, equipping me with the skills needed to excel in the software development field."
          />
          <TimelineItem
            institution="ALX - Nairobi, Kenya"
            program="Certificate in Software Engineering"
            period="2023 - 2024"
            description="This intensive program focused on hands-on learning and real-world problem-solving, covering key areas such as coding, system design, and project management.\nThe program was designed to rapidly build technical skills and prepare me for a successful career in software engineering."
          />
        </ol>
      </div>

      {/* Work Timeline */}
      <div className="mb-8">
        <div className="flex items-center gap-[15px] mb-[25px]">
          <div className="relative w-[40px] h-[40px] rounded-lg flex justify-center items-center text-orange-yellow-crayola shadow-1 z-10 bg-gradient-to-br from-jet to-jet/0">
            <div className="absolute inset-[1px] bg-eerie-black-1 rounded-lg -z-10" />
            <Bookmark className="w-[18px] h-[18px]" />
          </div>
          <h3 className="text-white-2 text-2xl font-semibold capitalize">Work history</h3>
        </div>

        <ol className="ml-0 sm:ml-[15px] xl:ml-[45px] border-l-0 sm:border-l sm:border-jet pl-0 sm:pl-[25px] xl:pl-[30px]">
          <TimelineItem
            role="Software Developer"
            institution="Online"
            period="2022 — Present"
            description="Optimized application performance by regularly conducting code reviews and refactoring, leading to a 25% improvement in system efficiency across major projects like NextEvent UG.\nEnhanced user experience by designing and implementing intuitive user interfaces, which improved customer satisfaction ratings by 35% according to user feedback surveys.\nBoosted customer satisfaction rates through timely resolution of reported technical issues during the support phase of projects."
          />
          <TimelineItem
            role="Programmer"
            institution="Araknerd Software Development Company, Uganda"
            period="2019 — 2023"
            description="Designed and implemented robust databases and table structures for 5 major web applications, enhancing data retrieval speeds and supporting daily transactions for over 10,000 users.\nEnhanced customer experience by providing timely technical support to end users, successfully resolving over 200+ technical issues per month with a 95% satisfaction rate, contributing to a 20% increase in customer retention."
          />
        </ol>
      </div>

      {/* Skills */}
      <div className="mb-4">
        <h3 className="text-white-2 text-2xl font-semibold capitalize mb-[20px]">
          My skills
        </h3>
        
        <div className="relative bg-gradient-to-br from-[hsl(240,1%,25%)] to-[hsl(0,0%,19%)] p-[30px] pt-[45px] rounded-[14px] shadow-2 z-10">
          <div className="absolute inset-[1px] bg-gradient-to-br from-[hsla(240,1%,18%,0.25)] to-[hsla(240,2%,11%,0)] bg-eerie-black-1 rounded-[14px] -z-10" />
          
          <ul className="grid grid-cols-1 gap-[10px]">
            <SkillBar title="Software Development" value={95} />
            <SkillBar title="Programming Languages: Python, JavaScript, PHP, C" value={85} />
            <SkillBar title="Source and Version Control: Git, GitHub" value={90} />
            <SkillBar title="Database Programming" value={85} />
            <SkillBar title="Team Collaboration" value={80} />
            <SkillBar title="Effective Communication" value={95} />
          </ul>
        </div>
      </div>
    </div>
  );
}
