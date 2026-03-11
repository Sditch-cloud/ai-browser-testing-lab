import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Tabs } from '../components/Tabs';
import './Dashboard.css';

export const Dashboard = () => {
  const { user } = useAuth();

  const summaryCards = [
    { title: 'Total Users', value: '1,234', icon: '👥' },
    { title: 'Active Sessions', value: '456', icon: '🔄' },
    { title: 'API Calls Today', value: '12.5K', icon: '📊' },
    { title: 'Success Rate', value: '99.8%', icon: '✓' },
  ];

  const tabsData = [
    {
      label: 'Overview',
      content: (
        <div className="tab-content">
          <h3>System Overview</h3>
          <p>This is the overview tab showing general information.</p>
          <p data-testid="overview-content">Overview content is displayed here.</p>
        </div>
      ),
    },
    {
      label: 'Statistics',
      content: (
        <div className="tab-content">
          <h3>Statistics</h3>
          <p>This is the statistics tab with data insights.</p>
          <p data-testid="statistics-content">Statistics content is displayed here.</p>
        </div>
      ),
    },
    {
      label: 'Reports',
      content: (
        <div className="tab-content">
          <h3>Reports</h3>
          <p>This is the reports tab with detailed reports.</p>
          <p data-testid="reports-content">Reports content is displayed here.</p>
        </div>
      ),
    },
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p className="welcome-message" data-testid="welcome-message">
          Welcome back, <strong>{user?.name || user?.username}</strong>!
        </p>
      </div>

      <div className="summary-cards">
        {summaryCards.map((card, index) => (
          <div
            key={index}
            className="summary-card"
            data-testid={`summary-card-${index}`}
          >
            <div className="card-icon">{card.icon}</div>
            <h3>{card.title}</h3>
            <p className="card-value">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="dashboard-tabs">
        <Tabs tabs={tabsData} />
      </div>
    </div>
  );
};
