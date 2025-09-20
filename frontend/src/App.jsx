import { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import anime from "animejs";
import Nav from "./components/Nav.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Configuracoes from "./pages/Configuracoes.jsx";
import Relatorios from "./pages/Relatorios.jsx";

export default function App() {
  const [page, setPage] = useState("dashboard");

  useEffect(() => {
    document.documentElement.classList.add("aos-ready");
    AOS.init({ once: true, duration: 700, easing: "ease-out-cubic" });
    anime({ targets: "header h1", opacity: [0, 1], translateY: [-8, 0] });
  }, []);

  return (
    <div className="gradient-bg">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-extrabold mb-2 title-gradient">
            Gestor de Ração para Galinhas
          </h1>
          <p className="text-lg text-slate-600">
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
