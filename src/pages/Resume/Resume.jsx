import React from "react";
import { FaBookReader, FaRegBookmark } from "react-icons/fa";
import TimelineItem from "./TimelineItem";
import SkillItem from "./SkillItem";

const Resume = () => {
  return (
    <section>
      <header>
        <h2 className="h2 article-title">Resume</h2>
      </header>

      
      <div className="timeline">
        <div className="title-wrapper">
          <div className="icon-box">
            <FaBookReader />
          </div>
          <h3 className="h3">Education</h3>
        </div>
        <ol className="timeline-list">
          <TimelineItem
            institution="Makerere University Business School - Nakawa, Uganda"
            program="Bachelor's Degree in Business Computing"
            period="2023 - Current"
            description="This program focuses on integrating business principles with modern computing techniques, preparing me for a dynamic career in business and technology. The curriculum includes courses in data analysis, information systems, and business management, providing a strong foundation for roles that require both technical and business acumen."
          />
          <TimelineItem
            institution="JAIN (Deemed-to-be University) - Bangalore India"
            program="Bachelor of Computer Applications"
            period="2023 - Current"
            description="This program offers in-depth knowledge of computer science and applications, emphasizing practical skills and industry-relevant technologies. The coursework covers programming, database management, software engineering, and cloud technology, equipping me with the skills needed to excel in the software development field."
          />
          <TimelineItem
            institution="ALX - Nairobi, Kenya"
            program="Certificate in Software Engineering"
            period="2023 - Current"
            description="This intensive program focuses on hands-on learning and real-world problem-solving, covering key areas such as coding, system design, and project management. The program is designed to rapidly build technical skills and prepare me for a successful career in software engineering."
          />
          <TimelineItem
            institution="Luzira Secondary School - Kampala, Uganda"
            program="Uganda Advanced Certificate of Education"
            period="2020 - 2022"
            description="Luzira Secondary School provided a supportive learning environment that helped me excel academically and develop critical thinking skills. The school's emphasis on both academics and extracurricular activities contributed significantly to my personal and academic growth."
          />
          <TimelineItem
            institution="Code High School - Seeta Mukono"
            program="Uganda Certificate of Education"
            period="2016 - 2019"
            description="Code High School offered a robust educational experience with a focus on academic excellence and character development. The school's dedicated teachers and well-rounded curriculum laid a strong foundation for my future studies and career aspirations."
          />
        </ol>
      </div>

      <div className="timeline">
        <div className="title-wrapper">
          <div className="icon-box">
            <FaRegBookmark />
          </div>
          <h3 className="h3">Work history</h3>
        </div>
        <ol className="timeline-list">
          <TimelineItem
            role="Software Developer"
            institution="Online"
            period="2022 — Present"
            description="
            Optimized application performance by regularly conducting code reviews and refactoring, leading to a 25% improvement in system efficiency across major projects.
            Increased development speed by 30% by automating Development and over 15 repetitive daily tasks using Python scripts and advanced automation tools, significantly reducing manual error.
            Modernized and updated legacy code bases to current development standards, enhancing system functionality and user response time by 50% across 20+ applications.
            Enhanced user experience by designing and implementing intuitive user interfaces, which improved customer satisfaction ratings by 35% according to user feedback surveys.
            Actively contributed to team meetings with innovative ideas, influencing the direction of project development; consistently delivered project updates that kept 5 ongoing projects 20% ahead of schedule.
            Saved time and resources by identifying and fixing bugs before product deployment."
          />
          <TimelineItem
            role="Programmer"
            institution="Araknerd Software Development Company, Uganda"
            period="2019 — 2023"
            description="
            Designed and implemented robust databases and table structures for 5 major web applications, enhancing data retrieval speeds and supporting daily transactions for over 10,000 users.
            Developed reusable and scalable code for distributed cloud environments, resulting in a 40% reduction in code redundancy and a 30% improvement in deployment times across multiple cloud platforms.
            Enhanced customer experience by providing timely technical support to end users, successfully resolving over 200+ technical issues per month with a 95% satisfaction rate, contributing to a 20% increase in customer retention."
          />
        </ol>
      </div>

      <div className="skill">
        <h3 className="h3 skills-title">My skills</h3>
        <ul className="skills-list content-card">
          <SkillItem title="Software Development" value={95} />
          <SkillItem title="Programming Languages: Python, JavaScript, PHP, C" value={90} />
          <SkillItem title="Source and Version Control: Git, GitHub" value={95} />
          <SkillItem title="Database Programming" value={90} />
          <SkillItem title="Team Collaboration" value={95} />
          <SkillItem title="Effective Communication" value={95} />
        </ul>
      </div>
    </section>
  );
};

export default Resume;
