import React from 'react';
import { Link } from 'react-router-dom';

const PageBanner = ({ title, items = [] }) => {
  const trail = items.length ? items : [{ label: 'Home', to: '/' }, { label: title }];
  return (
    <div className="page-banner">
      <div className="container">
        <h1>{title}</h1>
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            {trail.map((item, i) => (
              item.to && i < trail.length - 1 ? (
                <li className="breadcrumb-item" key={i}><Link to={item.to}>{item.label}</Link></li>
              ) : (
                <li className="breadcrumb-item active" key={i}>{item.label}</li>
              )
            ))}
          </ol>
        </nav>
      </div>
    </div>
  );
};

export default PageBanner;
