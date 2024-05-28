import { GiRotaryPhone } from "react-icons/gi";
import { BiLogoGmail } from "react-icons/bi";
import { FaMapLocationDot, FaWhatsapp } from "react-icons/fa6";
import { PiCloudSunFill } from "react-icons/pi";
import { useState } from "react";

const Sidebar = () => {
  const [isSidebarActive, setIsSidebarActive] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarActive(!isSidebarActive);
  };

  return (
    <aside className={`sidebar ${isSidebarActive ? "active" : ""}`}>
      <div className="sidebar-info">
        <figure className="profile-box">
          <img src="/images/festo.svg" alt="Festo" width="80" />
        </figure>
        <div className="info-content">
          <h1 className="name">Festo Wampamba</h1>
          <p className="title">Software Engineer</p>
        </div>
        <button className="info_more-btn" onClick={toggleSidebar}>
          <span></span>
          <PiCloudSunFill />
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
              <a href="mailto:festotechug@gmail.com" className="contact-link">
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
