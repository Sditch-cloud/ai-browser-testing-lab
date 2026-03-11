import React, { useState } from 'react';
import { Toast } from '../components/Toast';
import './FormPlayground.css';

export const FormPlayground = () => {
  const [formData, setFormData] = useState({
    textInput: '',
    textarea: '',
    select: 'option1',
    radio: 'radio1',
    checkbox: false,
    toggleSwitch: false,
    dateInput: '',
    fileInput: null,
  });
  const [toast, setToast] = useState(null);
  const [fileName, setFileName] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleToggle = () => {
    setFormData(prev => ({
      ...prev,
      toggleSwitch: !prev.toggleSwitch
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      setFormData(prev => ({
        ...prev,
        fileInput: file
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setToast({
      message: 'Form submitted successfully!',
      type: 'success'
    });
    // Log form data for inspection
    console.log('Form Data:', formData);
  };

  const handleReset = () => {
    setFormData({
      textInput: '',
      textarea: '',
      select: 'option1',
      radio: 'radio1',
      checkbox: false,
      toggleSwitch: false,
      dateInput: '',
      fileInput: null,
    });
    setFileName('');
  };

  return (
    <div className="form-playground-container">
      <div className="form-header">
        <h1>Form Playground</h1>
        <p>Test various form elements and interactions</p>
      </div>

      <div className="form-wrapper">
        <form onSubmit={handleSubmit} className="playground-form">
          {/* Text Input */}
          <div className="form-section">
            <h2>Text Inputs</h2>

            <div className="form-group">
              <label htmlFor="textInput">Text Input</label>
              <input
                id="textInput"
                type="text"
                name="textInput"
                placeholder="Enter some text..."
                value={formData.textInput}
                onChange={handleInputChange}
                data-testid="form-text-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="textarea">Textarea</label>
              <textarea
                id="textarea"
                name="textarea"
                placeholder="Enter multiple lines of text..."
                rows="4"
                value={formData.textarea}
                onChange={handleInputChange}
                data-testid="form-textarea"
              />
            </div>

            <div className="form-group">
              <label htmlFor="dateInput">Date Picker</label>
              <input
                id="dateInput"
                type="date"
                name="dateInput"
                value={formData.dateInput}
                onChange={handleInputChange}
                data-testid="form-date-input"
              />
            </div>
          </div>

          {/* Select & Dropdowns */}
          <div className="form-section">
            <h2>Dropdowns</h2>

            <div className="form-group">
              <label htmlFor="select">Select Option</label>
              <select
                id="select"
                name="select"
                value={formData.select}
                onChange={handleInputChange}
                data-testid="form-select"
              >
                <option value="option1">Option 1</option>
                <option value="option2">Option 2</option>
                <option value="option3">Option 3</option>
                <option value="option4">Option 4</option>
              </select>
            </div>
          </div>

          {/* Radio Buttons */}
          <div className="form-section">
            <h2>Radio Buttons</h2>
            <div className="radio-group" data-testid="form-radio-group">
              <div className="radio-item">
                <input
                  id="radio1"
                  type="radio"
                  name="radio"
                  value="radio1"
                  checked={formData.radio === 'radio1'}
                  onChange={handleInputChange}
                  data-testid="form-radio-1"
                />
                <label htmlFor="radio1">Radio Option 1</label>
              </div>

              <div className="radio-item">
                <input
                  id="radio2"
                  type="radio"
                  name="radio"
                  value="radio2"
                  checked={formData.radio === 'radio2'}
                  onChange={handleInputChange}
                  data-testid="form-radio-2"
                />
                <label htmlFor="radio2">Radio Option 2</label>
              </div>

              <div className="radio-item">
                <input
                  id="radio3"
                  type="radio"
                  name="radio"
                  value="radio3"
                  checked={formData.radio === 'radio3'}
                  onChange={handleInputChange}
                  data-testid="form-radio-3"
                />
                <label htmlFor="radio3">Radio Option 3</label>
              </div>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="form-section">
            <h2>Checkboxes</h2>

            <div className="checkbox-group" data-testid="form-checkbox-group">
              <div className="checkbox-item">
                <input
                  id="checkbox"
                  type="checkbox"
                  name="checkbox"
                  checked={formData.checkbox}
                  onChange={handleInputChange}
                  data-testid="form-checkbox"
                />
                <label htmlFor="checkbox">I agree to the terms and conditions</label>
              </div>
            </div>
          </div>

          {/* Toggle Switch */}
          <div className="form-section">
            <h2>Toggle Switch</h2>

            <div className="form-group">
              <label htmlFor="toggleSwitch">Enable Feature</label>
              <div className="toggle-container">
                <input
                  id="toggleSwitch"
                  type="checkbox"
                  checked={formData.toggleSwitch}
                  onChange={handleToggle}
                  data-testid="form-toggle"
                  className="toggle-input"
                />
                <label htmlFor="toggleSwitch" className="toggle-label" data-testid="toggle-label">
                  <span className="toggle-slider" />
                </label>
                <span className="toggle-text" data-testid="toggle-status">
                  {formData.toggleSwitch ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div className="form-section">
            <h2>File Upload</h2>

            <div className="form-group">
              <label htmlFor="fileInput">Upload File</label>
              <div className="file-input-wrapper">
                <input
                  id="fileInput"
                  type="file"
                  name="fileInput"
                  onChange={handleFileChange}
                  data-testid="form-file-input"
                />
                {fileName && (
                  <div className="file-name" data-testid="file-name">
                    File: {fileName}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-section">
            <div className="form-actions">
              <button type="submit" className="btn-submit" data-testid="form-submit">
                Submit Form
              </button>
              <button
                type="button"
                className="btn-reset"
                onClick={handleReset}
                data-testid="form-reset"
              >
                Reset Form
              </button>
            </div>
          </div>
        </form>
      </div>

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
