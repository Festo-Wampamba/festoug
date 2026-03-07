import { useState, useEffect } from 'react';
import { FaRegEye } from 'react-icons/fa';


const Portfolio = () => {
  // State to store project data and filtered projects
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // State to handle modal visibility and selected project
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  // Load project data from projects.json
  useEffect(() => {
    fetch('/projects.json')
      .then(response => response.json())
      .then(data => {
        setProjects(data);
        setFilteredProjects(data);
      })
      .catch(error => console.error('Error loading project data:', error));
  }, []);

  // Function to handle category filter selection
  const handleFilterClick = (category) => {
    setSelectedCategory(category);
    if (category === 'All') {
      setFilteredProjects(projects);
    } else {
      const filtered = projects.filter(project => project.category === category);
      setFilteredProjects(filtered);
    }
  };

  // Function to handle image click and open modal
  const handleImageClick = (project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  // Function to close the modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
  };

  return (
    <section className="portfolio" data-page="portfolio">
      <header>
        <h2 className="h2 article-title">Portfolio</h2>
      </header>

      {/* Filter buttons */}
      <ul className="filter-list">
        {['All', 'Software development', 'Web development', 'Applications'].map(category => (
          <li className="filter-item" key={category}>
            <button
              className={category === selectedCategory ? 'active' : ''}
              onClick={() => handleFilterClick(category)}
              data-filter-btn
            >
              {category}
            </button>
          </li>
        ))}
      </ul>

      {/* Portfolio items */}
      <section className="projects">
        <ul className="project-list">
          {filteredProjects.map(project => (
            <li
              className="project-item active"
              data-filter-item
              data-category={project.category}
              key={project.id}
            >
              <div className="project-content">
                <figure className="project-img" onClick={() => handleImageClick(project)}>
                  <div className="project-item-icon-box">
                    <FaRegEye />
                  </div>
                  <img src={project.image} alt={project.title} loading="lazy" />
                </figure>
                <a href={`#${project.title}`} className="project-title-link">
                  <h3 className="project-title">{project.title}</h3>
                </a>
                <p className="project-category">{project.category}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Modal for image expansion */}
      {isModalOpen && selectedProject && (
        <div className="modal" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <span className="close" onClick={closeModal}>&times;</span>
            <img src={selectedProject.image} alt={selectedProject.title} className="modal-image"/>
            <h3 className="modal-title">{selectedProject.title}</h3>
            <p className="modal-category">{selectedProject.category}</p>
          </div>
        </div>
      )}
    </section>
  );
};

export default Portfolio;
