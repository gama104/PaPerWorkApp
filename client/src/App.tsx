import { AuthProvider } from "./features/auth/context/AuthContext";
import { ThemeProvider } from "./shared/contexts/ThemeContext";
import { NotificationProvider } from "./shared/components/ui/NotificationSystem";
import AppContent from "./components/AppContent";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
