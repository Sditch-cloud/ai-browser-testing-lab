import React, { useState } from 'react';
import './Tabs.css';

export const Tabs = ({ tabs, defaultTab = 0 }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <div className="tabs">
      <div className="tabs-header" role="tablist">
        {tabs.map((tab, index) => (
          <button
            key={index}
            role="tab"
            aria-selected={activeTab === index}
            onClick={() => setActiveTab(index)}
            className={`tab-button ${activeTab === index ? 'active' : ''}`}
            data-testid={`tab-${tab.label.toLowerCase()}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="tabs-content" role="tabpanel">
        {tabs[activeTab] && tabs[activeTab].content}
      </div>
    </div>
  );
};
