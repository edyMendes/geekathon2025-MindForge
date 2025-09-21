import { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import anime from "animejs";
import { ThemeProvider } from "./contexts/ThemeContext";
import Nav from "./components/Nav.jsx";
import UserHeader from "./components/UserHeader.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Diseases from "./pages/Diseases.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ApiNotConfigured from "./components/ApiNotConfigured.jsx";

function AppContent() {
  const [page, setPage] = useState("dashboard");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authPage, setAuthPage] = useState("login");
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar se a API está configurada
  const isApiConfigured = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';
    return apiUrl && apiUrl !== 'undefined' && apiUrl.trim() !== '';
  };

  // Check for existing authentication on app load
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('api_token');
      const userData = localStorage.getItem('user_data');
      
      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          
          // Validate token by making a simple API call
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001'}/users/${parsedUser.userId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (response.ok) {
            setUser(parsedUser);
            setIsAuthenticated(true);
          } else {
            // Token is invalid, clear stored data
            localStorage.removeItem('api_token');
            localStorage.removeItem('user_data');
            localStorage.removeItem('refresh_token');
          }
        } catch (error) {
          console.error('Error validating session:', error);
          // Clear invalid data
          localStorage.removeItem('api_token');
          localStorage.removeItem('user_data');
          localStorage.removeItem('refresh_token');
        }
      }
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  useEffect(() => {
    document.documentElement.classList.add("aos-ready");
    AOS.init({ once: true, duration: 700, easing: "ease-out-cubic" });
    anime({ targets: "header h1", opacity: [0, 1], translateY: [-8, 0] });
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    setPage("dashboard");
    // Save user data to localStorage for persistence
    localStorage.setItem('user_data', JSON.stringify(userData));
  };

  const handleRegister = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    setPage("dashboard");
    // Save user data to localStorage for persistence
    localStorage.setItem('user_data', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setPage("dashboard");
    // Clear user data from localStorage
    localStorage.removeItem('user_data');
    localStorage.removeItem('api_token');
    localStorage.removeItem('refresh_token');
  };

  const switchAuthPage = (page) => {
    setAuthPage(page);
  };

  // Mostrar aviso se API não estiver configurada
  if (!isApiConfigured()) {
    return <ApiNotConfigured />;
  }

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="gradient-bg min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse mb-4">
            <img 
              src="/logo.png" 
              alt="FeedPilot Logo" 
              className="w-16 h-16 mx-auto rounded-lg shadow-lg"
            />
          </div>
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show authentication pages if not logged in
  if (!isAuthenticated) {
    return (
      <div className="gradient-bg">
        {authPage === "login" ? (
          <Login onLogin={handleLogin} onSwitchToRegister={() => switchAuthPage("register")} />
        ) : (
          <Register onRegister={handleRegister} onSwitchToLogin={() => switchAuthPage("login")} />
        )}
      </div>
    );
  }

  return (
    <div className="gradient-bg">
      <div className="container mx-auto px-4 py-8">
        {/* Top Navigation Bar */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex-1"></div>
          <UserHeader 
            user={user} 
            onLogout={handleLogout} 
            onNavigate={setPage}
          />
        </div>

        {/* Main Header */}
        <header className="text-center mb-8">
          <div className="flex flex-col items-center justify-center mb-4">
            <img 
              src="/logo.png" 
              alt="FeedPilot Logo" 
              className="w-40 h-40 mb-4 rounded-lg shadow-lg"
            />
            <h1 className="text-4xl font-extrabold title-gradient">
              FeedPilot
            </h1>
          </div>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Optimize the feeding of your flock with personalized recommendations
          </p>
        </header>

        <Nav active={page} onChange={setPage} />

        {page === "dashboard" && <Dashboard />}
        {page === "diseases" && <Diseases />}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
