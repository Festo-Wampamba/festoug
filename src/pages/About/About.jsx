import { useEffect, useState } from "react";
import Service from "./Service";
import Testimonial from "./Testimonial";

const servicesData = [
  {
    title: "Software Development",
    icon: "/images/icon-dev.svg",
    description: "Leveraging Python, Java, C++, JavaScript and PHP to deliver high quality software solutions.",
  },
  {
    title: "Data Modeling",
    icon: "/images/icon-dm.svg",
    description: "Expertise in database programming and management using industry leading tools and practices.",
  },
  {
    title: "Web Designing",
    icon: "/images/icon-design.svg",
    description: "Creating responsive and user-friendly web interfaces with Javascript, Tailwind CSS, React and NextJS.",
  },
  {
    title: "Database Management",
    icon: "/images/icon-db.svg",
    description: "Skilled in managing and optimizing databases for performance and reliability.",
  },
];

const About = () => {
  const [testimonials, setTestimonials] = useState([]);
  useEffect(() => {
    fetch("testimonials.json")
      .then((response) => response.json())
      .then((data) => {
        setTestimonials(data);
      });
  }, []);

  const handleLogoClick = (event) => {
    event.preventDefault();
    event.target.focus(); // Apply focus to the clicked element
  };

  return (
    <div className="about active">
      <header>
        <h2 className="h2 h2-title">My summary</h2>
      </header>
      <section className="about-text">
        <p>
          I am a self-motivated and resourceful software developer with a proven
          ability to devise reliable solutions for complex software issues. With
          extensive experience in software development, Festo brings a deep
          understanding of technology along with a commitment to applying
          innovative software practices to enhance operational efficiency.
        </p>
        <p>
          My expertise encompasses a broad range of programming languages and
          development tools, enabling the delivery of exceptional results in
          diverse software projects. I have experience working with a variety of
          programming languages and frameworks, including JavaScript, React,
          Node.js, and Python.
        </p>
      </section>

      {/* Services */}
      <section className="service">
        <h2 className="h3 service-title">My services</h2>
        <ul className="service-list">
          {servicesData.map((service, index) => (
            <Service
              key={index}
              title={service.title}
              icon={service.icon}
              description={service.description}
            />
          ))}
        </ul>
      </section>

      {/* Testimonials */}
      <section className="testimonials">
        <h3 className="h3 testimonials-title">Testimonials</h3>
        <ul className="testimonials-list has-scrollbar">
          {testimonials.map((testimonial, index) => (
            <Testimonial
              key={index}
              name={testimonial.name}
              avatar={testimonial.avatar}
              testimonial={testimonial.testimonial}
            />
          ))}
        </ul>
      </section>

      {/* Clients */}
      <section className="clients">
        <h3 className="h3 clients-title">Clients</h3>
        <ul className="clients-list has-scrollbar">
          <li className="clients-item">
            <a href="#" onClick={handleLogoClick}>
              <img src="images/logo-1-color.png" alt="client logo" />
            </a>
          </li>
          <li className="clients-item">
            <a href="#" onClick={handleLogoClick}>
              <img src="images/logo-2-color.png" alt="client logo" />
            </a>
          </li>
          <li className="clients-item">
            <a href="#" onClick={handleLogoClick}>
              <img src="images/logo-3-color.png" alt="client logo" />
            </a>
          </li>
          <li className="clients-item">
            <a href="#" onClick={handleLogoClick}>
              <img src="images/logo-4-color.png" alt="client logo" />
            </a>
          </li>
          <li className="clients-item">
            <a href="#" onClick={handleLogoClick}>
              <img src="images/logo-5-color.png" alt="client logo" />
            </a>
          </li>
          <li className="clients-item">
            <a href="#" onClick={handleLogoClick}>
              <img src="images/logo-6-color.png" alt="client logo" />
            </a>
          </li>
        </ul>
      </section>
    </div>
  );
};

export default About;
