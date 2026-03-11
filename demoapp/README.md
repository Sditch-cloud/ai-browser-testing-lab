# AI Browser Testing Demo App

A React-based demo application designed for testing and demonstrating AI-driven browser testing using Playwright and GitHub Copilot.

## Overview

This application provides a comprehensive set of interactive UI elements and pages suitable for demonstrating automated browser testing in a presentation environment.

## Project Structure

```
demoapp/
├── src/
│   ├── components/          # Reusable React components
│   │   ├── Navbar.jsx      # Navigation bar
│   │   ├── Navbar.css
│   │   ├── Modal.jsx       # Modal dialog component
│   │   ├── Modal.css
│   │   ├── Tabs.jsx        # Tab component
│   │   ├── Tabs.css
│   │   ├── DataTable.jsx   # Data table with pagination
│   │   ├── DataTable.css
│   │   ├── Toast.jsx       # Toast notifications
│   │   └── Toast.css
│   ├── pages/              # Page components
│   │   ├── Login.jsx       # Login page
│   │   ├── Login.css
│   │   ├── Dashboard.jsx   # Dashboard page
│   │   ├── Dashboard.css
│   │   ├── UserManagement.jsx  # User management page
│   │   ├── UserManagement.css
│   │   ├── FormPlayground.jsx  # Form elements demo
│   │   ├── FormPlayground.css
│   │   ├── AsyncDemo.jsx   # Async operations demo
│   │   └── AsyncDemo.css
│   ├── context/            # React context
│   │   └── AuthContext.jsx # Authentication context
│   ├── styles/             # Global styles
│   │   └── global.css      # Global CSS
│   ├── App.jsx             # Main App component
│   └── main.jsx            # React entry point
├── index.html              # HTML template
├── package.json            # Dependencies
├── vite.config.js          # Vite configuration
└── README.md               # This file
```

## Features

### 1. **Login Page** (`/login`)
- Username input field
- Password input field
- Remember me checkbox
- Submit button
- Error message display
- Demo credentials: username "demo", password "123456"

### 2. **Dashboard** (`/dashboard`)
- Welcome message
- Navigation links to other pages
- Summary cards with statistics
- Tab component with multiple tabs
- Protected route (requires login)

### 3. **User Management** (`/users`)
- Search functionality
- Data table with pagination
- Add user modal
- Edit user functionality
- Delete user with confirmation modal
- Toast notifications for actions
- Mock user data

### 4. **Form Playground** (`/forms`)
- Text input
- Textarea
- Date picker
- Dropdown select
- Radio buttons
- Checkboxes
- Toggle switch
- File upload
- Form submit/reset buttons
- Success notification

### 5. **Async Demo** (`/async`)
- Data loading with spinner
- Error simulation
- Dynamic list generation
- Loading states
- Success/error notifications
- Clear data functionality

## Test Identifiers

All interactive elements include stable `data-testid` attributes for Playwright automation:

### Login Page
- `login-username` - Username input
- `login-password` - Password input
- `login-remember` - Remember me checkbox
- `login-submit` - Submit button
- `login-error` - Error message

### Dashboard
- `nav-dashboard` - Dashboard link
- `nav-users` - Users link
- `nav-forms` - Forms link
- `nav-async` - Async demo link
- `navbar-logout` - Logout button
- `welcome-message` - Welcome message
- `summary-card-{index}` - Summary cards
- `tab-{label}` - Tab buttons

### User Management
- `user-search` - Search input
- `btn-add-user` - Add user button
- `data-table` - Main table
- `table-row-{index}` - Table rows
- `table-cell-{key}-{index}` - Table cells
- `btn-edit-{id}` - Edit buttons
- `btn-delete-{id}` - Delete buttons
- `modal-overlay` - Modal backdrop
- `modal-close` - Modal close button
- `form-name` - User name input
- `form-email` - User email input
- `form-role` - User role select
- `delete-confirm-message` - Delete confirmation text

### Form Playground
- `form-text-input` - Text input
- `form-textarea` - Textarea
- `form-date-input` - Date picker
- `form-select` - Select dropdown
- `form-radio-group` - Radio button group
- `form-radio-1`, `form-radio-2`, `form-radio-3` - Individual radio buttons
- `form-checkbox` - Checkbox
- `form-toggle` - Toggle switch
- `toggle-status` - Toggle status text
- `form-file-input` - File upload input
- `file-name` - Uploaded file name display
- `form-submit` - Submit button
- `form-reset` - Reset button

### Async Demo
- `btn-load-data` - Load data button
- `btn-load-error` - Simulate error button
- `btn-clear-data` - Clear data button
- `loading-spinner` - Loading spinner
- `error-message` - Error message display
- `items-list` - Items list container
- `item-{index}` - Individual items
- `items-count` - Items count display
- `empty-state` - Empty state message

## Installation & Running

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Setup

1. **Install dependencies:**
```bash
cd demoapp
npm install
```

2. **Start development server:**
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

3. **Build for production:**
```bash
npm run build
```

4. **Preview production build:**
```bash
npm run preview
```

## Authentication

The demo application uses a simple hardcoded authentication system:

- **Username:** `demo`
- **Password:** `123456`

All routes except `/login` are protected and require authentication.

## Mock Data

The application uses client-side React state for data storage. No backend server is required.

### User Data
- 12 mock users are provided in the User Management page
- Users can be added, edited, and deleted
- Changes are stored in React state only (not persisted)

### Form Data
- All form data is stored in component state
- Form submissions show a success notification
- No data is sent to any server

## Component Usage

### Reusable Components

#### Modal
```jsx
<Modal
  isOpen={isOpen}
  title="Modal Title"
  onClose={handleClose}
  footer={<button>Close</button>}
>
  Content goes here
</Modal>
```

#### Tabs
```jsx
<Tabs tabs={[
  { label: 'Tab 1', content: <div>Content 1</div> },
  { label: 'Tab 2', content: <div>Content 2</div> }
]} />
```

#### DataTable
```jsx
<DataTable
  columns={[{ key: 'name', label: 'Name' }]}
  data={data}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

#### Toast
```jsx
<Toast
  message="Success!"
  type="success"
  duration={3000}
  onClose={handleClose}
/>
```

## Styling

- **CSS Framework:** Vanilla CSS
- **Color Scheme:** Blue (#0066cc) as primary color
- **Responsive:** Mobile-friendly design
- **Animations:** Smooth transitions and spinners

## Browser Compatibility

- Chrome/Chromium
- Firefox
- Safari
- Edge

## Testing with Playwright

This application is optimized for Playwright testing. Example test:

```javascript
// Playwright example
import { test, expect } from '@playwright/test';

test('login with demo credentials', async ({ page }) => {
  await page.goto('http://localhost:5173/login');
  await page.fill('[data-testid="login-username"]', 'demo');
  await page.fill('[data-testid="login-password"]', '123456');
  await page.click('[data-testid="login-submit"]');
  await expect(page).toHaveURL('**/dashboard');
});
```

## Performance Considerations

- Simple, lightweight components
- No heavy external dependencies
- Optimized for demonstration purposes
- Suitable for presentation demos

## Notes for Presenters

- This is a **demo application** designed for testing automation presentations
- All data is stored in React state (not persisted across refreshes)
- Use the demo credentials "demo/123456" for login
- The async demo includes a 2-second simulated API call
- All elements have stable `data-testid` attributes for reliable automation

## License

This project is part of the AI Browser Testing Lab project.

## Future Enhancements

- Backend API integration
- Database persistence
- More complex forms
- Additional test scenarios
- Performance optimization
- Accessibility improvements
