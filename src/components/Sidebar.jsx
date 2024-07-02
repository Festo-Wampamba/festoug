import { GiRotaryPhone } from "react-icons/gi";
import { BiLogoGmail } from "react-icons/bi";
import { GrDocumentPdf } from "react-icons/gr";
import { FaMapLocationDot, FaWhatsapp } from "react-icons/fa6";
import { LiaEyeSolid } from "react-icons/lia";
import { useState, useEffect } from "react";

const Sidebar = () => {
  const [isSidebarActive, setIsSidebarActive] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const userAgent = navigator.userAgent;
    setIsDesktop(!/Mobi|Android/i.test(userAgent));
  }, []);

  const toggleSidebar = () => {
    setIsSidebarActive(!isSidebarActive);
  };

  const emailLink = isDesktop
    ? "https://mail.google.com/mail/?view=cm&fs=1&to=festotechug@gmail.com"
    : "mailto:festotechug@gmail.com";

  return (
    <aside className={`sidebar ${isSidebarActive ? "active" : ""}`}>
      <div className="sidebar-info">
        <figure className="profile-box">
          <img src="/images/festo.svg" alt="Festo" width="80" />
        </figure>
        <div className="info-content">
          <h1 className="name">Muwanguzi Festo</h1>
          <p className="title">Software Engineer</p>
        </div>
        <button
          className={`info_more-btn ${isSidebarActive ? "blinking" : ""}`}
          onClick={toggleSidebar}
        >
          <span></span>
          <LiaEyeSolid />
        </button>
      </div>

      {/* Contact Info */}
      <div className="sidebar-info_more">
        <hr className="separator2" />
        <ul className="contacts-list">
          <li className="contact-item">
            <div className="icon-box gmail">
              <BiLogoGmail />
            </div>
            <div className="contact-info">
              <p className="contact-title">Email</p>
              <a href={emailLink} className="contact-link">
                festotechug@gmail.com
              </a>
            </div>
          </li>
          <li className="contact-item">
            <div className="icon-box phone">
              <GiRotaryPhone />
            </div>
            <div className="contact-info">
              <p className="contact-title">Phone</p>
              <a href="tel:+256754230525" className="contact-link">
                +256 754230525
              </a>
            </div>
          </li>
          <li className="contact-item">
            <div className="icon-box whatsapp">
              <FaWhatsapp />
            </div>
            <div className="contact-info">
              <p className="contact-title">WhatsApp</p>
              <a href="https://wa.me/256754230525" className="contact-link">
                Chat on WhatsApp
              </a>
            </div>
          </li>
          <li className="contact-item">
            <div className="icon-box pdf">
              <GrDocumentPdf />
            </div>
            <div className="contact-info">
              <p className="contact-title">My Resume</p>
              <a href="/festoug.pdf" className="contact-link" download>
                Download Resume
              </a>
            </div>
          </li>
          <li className="contact-item">
            <div className="icon-box location">
              <FaMapLocationDot />
            </div>
            <div className="contact-info">
              <p className="contact-title">Location</p>
              <address className="contact-link">
                Bugolobi, Kampala, Uganda
              </address>
            </div>
          </li>
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
