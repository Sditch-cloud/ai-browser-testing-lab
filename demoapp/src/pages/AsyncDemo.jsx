import React, { useState } from 'react';
import { Toast } from '../components/Toast';
import './AsyncDemo.css';

const MOCK_DATA = [
  { id: 1, title: 'Item 1', description: 'This is item 1' },
  { id: 2, title: 'Item 2', description: 'This is item 2' },
  { id: 3, title: 'Item 3', description: 'This is item 3' },
  { id: 4, title: 'Item 4', description: 'This is item 4' },
  { id: 5, title: 'Item 5', description: 'This is item 5' },
];

export const AsyncDemo = () => {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const handleLoadData = async () => {
    setLoading(true);
    setError(null);
    setItems([]);

    try {
      // Simulate API call with delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate successful data load
      setItems(MOCK_DATA);
      setToast({
        message: 'Data loaded successfully!',
        type: 'success'
      });
    } catch (err) {
      setError('Failed to load data');
      setToast({
        message: 'Failed to load data',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLoadError = async () => {
    setLoading(true);
    setError(null);
    setItems([]);

    try {
      // Simulate API call with delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simulate error
      throw new Error('Network error');
    } catch (err) {
      setError('Failed to load data: ' + err.message);
      setToast({
        message: 'Failed to load data',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setItems([]);
    setError(null);
    setToast({
      message: 'Data cleared',
      type: 'info'
    });
  };

  return (
    <div className="async-demo-container">
      <div className="async-header">
        <h1>Async Operations Demo</h1>
        <p>Simulate async data loading with spinners and notifications</p>
      </div>

      <div className="async-controls">
        <button
          className="btn-load"
          onClick={handleLoadData}
          disabled={loading}
          data-testid="btn-load-data"
        >
          {loading ? 'Loading...' : 'Load Data'}
        </button>

        <button
          className="btn-error"
          onClick={handleLoadError}
          disabled={loading}
          data-testid="btn-load-error"
        >
          {loading ? 'Loading...' : 'Simulate Error'}
        </button>

        <button
          className="btn-clear"
          onClick={handleClear}
          disabled={loading || items.length === 0}
          data-testid="btn-clear-data"
        >
          Clear Data
        </button>
      </div>

      {/* Loading Spinner */}
      {loading && (
        <div className="loading-container" data-testid="loading-spinner">
          <div className="spinner">
            <div className="spinner-ring"></div>
          </div>
          <p className="loading-text">Loading data...</p>
        </div>
      )}

      {/* Error Message */}
      {error && !loading && (
        <div className="error-container" data-testid="error-message">
          <div className="error-icon">⚠</div>
          <p>{error}</p>
        </div>
      )}

      {/* Items List */}
      {items.length > 0 && (
        <div className="items-container">
          <h2>Loaded Items</h2>
          <div className="items-list" data-testid="items-list">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="item"
                data-testid={`item-${index}`}
              >
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
          <div className="items-count" data-testid="items-count">
            Total: {items.length} items loaded
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && items.length === 0 && !error && (
        <div className="empty-state" data-testid="empty-state">
          <div className="empty-icon">📦</div>
          <p>Click "Load Data" to fetch items</p>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};
