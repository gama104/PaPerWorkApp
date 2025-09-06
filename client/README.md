# Therapy Scheduling App Frontend

A modern, responsive React application for managing therapy sessions, patients, and reports with built-in dark/light mode support.

## 🚀 Features

### Core Functionality

- **Session Management**: Create and schedule therapy sessions with comprehensive form validation
- **Patient Management**: Full CRUD operations for patient records with search functionality
- **Dashboard**: Overview of upcoming sessions, statistics, and recent activity
- **Reports & Analytics**: Visual insights into therapy practice performance

### UI/UX Features

- **Dark/Light Mode**: Seamless theme switching with system preference detection
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Modern Components**: Custom-built components with consistent styling
- **Interactive Calendar**: Month view calendar with disabled Sundays and date selection
- **Signature Capture**: Digital signature pad for patient consent

## 🛠️ Tech Stack

- **Framework**: React 18 with TypeScript
- **Styling**: TailwindCSS with darkMode: "class"
- **Routing**: React Router DOM
- **Forms**: React Hook Form with validation
- **Signature**: React Signature Canvas
- **State Management**: React Context API
- **Build Tool**: Vite

## 📁 Project Structure

```
client/
├── src/
│   ├── components/
│   │   ├── Calendar.tsx          # Monthly calendar with date selection
│   │   ├── TimePicker.tsx        # Time selection with 15-min intervals
│   │   ├── PlaceSelector.tsx     # Location selector with school options
│   │   ├── SignaturePad.tsx      # Digital signature capture
│   │   ├── SessionForm.tsx       # Complete session creation form
│   │   ├── ThemeToggle.tsx       # Dark/light mode toggle
│   │   └── Navigation.tsx        # Main navigation with mobile support
│   ├── pages/
│   │   ├── Dashboard.tsx         # Main dashboard with statistics
│   │   ├── Patients.tsx          # Patient management interface
│   │   └── Reports.tsx           # Analytics and reporting
│   ├── context/
│   │   └── ThemeContext.tsx      # Theme management context
│   ├── services/
│   │   └── api.ts                # Mock API service layer
│   ├── App.tsx                   # Main application component
│   └── main.tsx                  # Application entry point
├── tailwind.config.js            # TailwindCSS configuration
├── postcss.config.js             # PostCSS configuration
└── package.json                  # Dependencies and scripts
```

## 🚀 Getting Started

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Start Development Server**

   ```bash
   npm run dev
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

## 🎨 Components Overview

### Calendar Component

- Month view navigation
- Sundays disabled, Saturdays allowed
- Date selection with visual feedback
- Dark/light mode support

### TimePicker Component

- Pre-defined 15-minute intervals (7:00-19:00)
- Custom time input option
- 12-hour format display
- Accessible dropdown interface

### PlaceSelector Component

- Three location options: Centro, Virtual, Escuela
- Nested school selection for "Escuela" option
- Dynamic form behavior
- Visual hierarchy with indentation

### SignaturePad Component

- Canvas-based signature capture
- Clear and save functionality
- Touch and mouse support
- Signature validation

### SessionForm Component

- Comprehensive form with validation
- Integrates all sub-components
- Required field validation
- Form submission handling

## 🌗 Theme System

The application implements a complete dark/light mode system:

- **Theme Detection**: Automatic system preference detection
- **Local Storage**: Theme preference persistence
- **Toggle Component**: Accessible theme switching
- **Consistent Styling**: All components support both themes
- **Smooth Transitions**: Animated theme transitions

## 📱 Responsive Design

- **Mobile-First**: Optimized for mobile devices
- **Adaptive Layouts**: Responsive grid systems
- **Touch-Friendly**: Large touch targets
- **Mobile Navigation**: Collapsible menu for small screens

## 🔗 Navigation

- **Dashboard**: Overview and quick actions
- **Patients**: Patient management and records
- **Reports**: Analytics and insights
- **New Session**: Direct access to session creation

## 📊 Mock Data

The application includes comprehensive mock data for:

- Sample therapy sessions
- Patient records
- Analytics data
- Form options and selections

## 🎯 Key Design Decisions

1. **Component Architecture**: Modular, reusable components
2. **Type Safety**: Full TypeScript integration
3. **Accessibility**: ARIA labels and keyboard navigation
4. **Performance**: Optimized rendering and state management
5. **User Experience**: Intuitive interface with clear feedback

## 🔮 Future Enhancements

- Integration with backend APIs
- Real-time notifications
- Calendar synchronization
- Advanced reporting features
- Multi-language support
- User authentication
- Role-based permissions

## 🤝 Development Notes

- All components are fully typed with TypeScript
- TailwindCSS classes follow consistent naming conventions
- Form validation uses react-hook-form best practices
- Theme implementation follows accessibility guidelines
- Mobile-responsive design tested across devices

The application is ready for backend integration and can be easily extended with additional features as requirements evolve.
