import { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import anime from "animejs";
import { ThemeProvider } from "./contexts/ThemeContext";
import Nav from "./components/Nav.jsx";
import UserHeader from "./components/UserHeader.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Configuracoes from "./pages/Configuracoes.jsx";
import Relatorios from "./pages/Relatorios.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ApiNotConfigured from "./components/ApiNotConfigured.jsx";

function AppContent() {
  const [page, setPage] = useState("dashboard");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authPage, setAuthPage] = useState("login");
  const [user, setUser] = useState(null);

  // Verificar se a API está configurada
  const isApiConfigured = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    return apiUrl && apiUrl !== 'undefined' && apiUrl.trim() !== '';
  };

  useEffect(() => {
    document.documentElement.classList.add("aos-ready");
    AOS.init({ once: true, duration: 700, easing: "ease-out-cubic" });
    anime({ targets: "header h1", opacity: [0, 1], translateY: [-8, 0] });
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    setPage("dashboard");
  };

  const handleRegister = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    setPage("dashboard");
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setPage("dashboard");
  };

  const switchAuthPage = (page) => {
    setAuthPage(page);
  };

  // Mostrar aviso se API não estiver configurada
  if (!isApiConfigured()) {
    return <ApiNotConfigured />;
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
          <h1 className="text-4xl font-extrabold mb-2 title-gradient">
            Gestor de Ração para Galinhas
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Otimize a alimentação do seu plantel com recomendações personalizadas
          </p>
        </header>

        <Nav active={page} onChange={setPage} />

        {page === "dashboard" && <Dashboard />}
        {page === "config" && <Configuracoes />}
        {page === "reports" && <Relatorios />}
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
