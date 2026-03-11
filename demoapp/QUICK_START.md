# Quick Start Guide

## Getting Started in 5 Minutes

### 1. Install Dependencies
```bash
cd demoapp
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

The application will start on `http://localhost:5173`

### 3. Login
Use these demo credentials:
- **Username:** `demo`
- **Password:** `123456`

### 4. Explore the Application

After login, you can navigate to:

- **Dashboard** - Overview with summary cards and tabs
- **Users** - User management with CRUD operations
- **Forms** - Various form elements for testing
- **Async Demo** - Simulated async operations

## Key Pages & Testing Scenarios

### Login Page (`/login`)
**Test Scenarios:**
- Valid login (demo/123456)
- Invalid credentials
- Remember me checkbox
- Error message display

**Test Element IDs:**
```
login-username        # Username input
login-password        # Password input
login-remember        # Remember me checkbox
login-submit          # Submit button
login-error           # Error message
```

### Dashboard (`/dashboard`)
**Test Scenarios:**
- Authenticated access
- Summary cards display
- Tab navigation
- Navigation links

**Test Element IDs:**
```
welcome-message       # Welcome text
summary-card-0        # First summary card
tab-overview          # Overview tab
tab-statistics        # Statistics tab
tab-reports           # Reports tab
```

### User Management (`/users`)
**Test Scenarios:**
- Search users
- Pagination
- Add new user (modal form)
- Edit user
- Delete with confirmation
- Toast notifications

**Test Element IDs:**
```
user-search           # Search input
btn-add-user         # Add user button
data-table           # Main table
btn-edit-1           # Edit button for user 1
btn-delete-1         # Delete button for user 1
table-row-0          # First table row
modal-overlay        # Modal background
form-name            # Name input in form
form-email           # Email input in form
form-role            # Role select in form
```

### Form Playground (`/forms`)
**Test Scenarios:**
- Text input
- Textarea
- Date picker
- Dropdown selection
- Radio button selection
- Checkbox interaction
- Toggle switch
- File upload
- Form submission
- Form reset

**Test Element IDs:**
```
form-text-input      # Text input field
form-textarea        # Textarea field
form-date-input      # Date picker
form-select          # Select dropdown
form-radio-1         # Radio button 1
form-radio-2         # Radio button 2
form-checkbox        # Checkbox field
form-toggle          # Toggle switch
toggle-status        # Toggle status text
form-file-input      # File upload
file-name            # Uploaded file name
form-submit          # Submit button
form-reset           # Reset button
```

### Async Demo (`/async`)
**Test Scenarios:**
- Load data (2-second delay)
- Simulate error
- Loading spinner
- Dynamic list rendering
- Clear data
- Toast notifications

**Test Element IDs:**
```
btn-load-data        # Load data button
btn-load-error       # Simulate error button
btn-clear-data       # Clear data button
loading-spinner      # Loading spinner
error-message        # Error message display
items-list           # Items list container
item-0               # First item in list
items-count          # Items count display
empty-state          # Empty state message
```

## Authentication

The application uses a simple authentication system:

**Protected Routes:**
- `/dashboard` - Requires login
- `/users` - Requires login
- `/forms` - Requires login
- `/async` - Requires login

**Public Routes:**
- `/login` - Login page
- `/` - Redirects to dashboard or login

## Mock Data

### Users (12 total)
- Alice Johnson (Admin)
- Bob Smith (User)
- Carol White (User)
- David Brown (Editor)
- Eve Davis (User)
- Frank Miller (User)
- Grace Lee (Admin)
- Henry Wilson (User)
- Iris Martinez (Editor)
- Jack Moore (User)
- Karen Taylor (User)
- Leo Anderson (User)

### Form Playground Options
- Select options: 4 options
- Radio buttons: 3 options
- Single checkbox for T&C agreement

### Async Demo
- 5 mock items loaded on data fetch
- 2-second simulated API delay

## Common Testing Tasks

### Test Login Flow
```javascript
// Playwright example
await page.goto('http://localhost:5173/login');
await page.fill('[data-testid="login-username"]', 'demo');
await page.fill('[data-testid="login-password"]', '123456');
await page.click('[data-testid="login-submit"]');
```

### Test User Search
```javascript
await page.goto('http://localhost:5173/users');
await page.fill('[data-testid="user-search"]', 'Alice');
// Check if results are filtered
```

### Test Form Submission
```javascript
await page.goto('http://localhost:5173/forms');
await page.fill('[data-testid="form-text-input"]', 'Test');
await page.fill('[data-testid="form-email"]', 'test@example.com');
await page.click('[data-testid="form-submit"]');
```

### Test Async Loading
```javascript
await page.goto('http://localhost:5173/async');
await page.click('[data-testid="btn-load-data"]');
await page.waitForSelector('[data-testid="items-list"]');
```

## Troubleshooting

### Port Already in Use
If port 5173 is already in use, Vite will use the next available port.
Check the terminal output for the actual URL.

### Dependencies Not Installing
```bash
rm -rf node_modules package-lock.json
npm install
```

### Application Not Starting
```bash
npm run dev
```

Check that you're in the `demoapp` directory.

### Can't Login
Make sure you're using the exact credentials:
- Username: `demo` (lowercase)
- Password: `123456`

## Building for Production

```bash
npm run build
npm run preview
```

This creates an optimized build in the `dist` folder.

## Next Steps

1. **Run automated tests** with Playwright against this application
2. **Demonstrate test automation** in a presentation
3. **Extend the application** with more test scenarios
4. **Integrate** with your testing framework or CI/CD pipeline

## Additional Resources

- See `README.md` for detailed documentation
- See `PROJECT_STRUCTURE.md` for file organization
- All interactive elements have stable `data-testid` attributes for testing

---

**Happy Testing! 🚀**
