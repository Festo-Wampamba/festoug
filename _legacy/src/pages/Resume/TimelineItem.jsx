import React from 'react';

const TimelineItem = ({ institution, period, program, role, details, description }) => {
  return (
    <li className="timeline-item">
      <h3 className="h3 timeline-item-title">{program}</h3>
      <h3 className="h3 timeline-item-title">{role}</h3>
      <h4 className="h4 timeline-item-title">{institution}</h4>
      <span>{period}</span>
      <ul className="timeline-description">
        {description.split('\n').map((desc, index) => (
          <li key={index}>{desc.trim()}</li>
        ))}
      </ul>
    </li>
  );
};

export default TimelineItem;
