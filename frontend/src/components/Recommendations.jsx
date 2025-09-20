import { useEffect } from "react";
import anime from "animejs";

export default function Recommendations({ model }) {
  // model: { form, perChicken, totalKg, times }
  useEffect(() => {
    if (!model) return;
    anime({ targets: "[data-surge]", opacity: [0, 1], translateY: [8, 0], delay: anime.stagger(40) });
  }, [model]);

  if (!model) {
    return (
      <div className="card shadow-sm p-6 card-hover" data-aos="fade-left">
        <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-6">Recomendações</h2>
        <div className="text-center py-12 text-slate-400 dark:text-slate-500">
          Preencha o formulário para obter recomendações.
        </div>
      </div>
    );
  }

  const { form, perChicken, totalKg, times } = model;
  const perMeal = Math.round(perChicken / times.length);

  return (
    <div className="card shadow-sm p-6 card-hover" data-aos="fade-left">
      <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-6">Recomendações</h2>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="border border-slate-200 dark:border-slate-600 rounded-lg p-4 bg-white/80 dark:bg-slate-800/80" data-surge>
          <h3 className="font-semibold mb-2 text-slate-800 dark:text-slate-200">Horário de Alimentação</h3>
          <ul className="space-y-2">
            {times.map((t) => (
              <li key={t} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700 rounded">
                <span className="font-semibold text-slate-900 dark:text-slate-100">{t}</span>
                <span className="text-sm text-slate-600 dark:text-slate-400">{perMeal} g/galinha</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="border border-slate-200 dark:border-slate-600 rounded-lg p-4 bg-white/80 dark:bg-slate-800/80" data-surge>
          <h3 className="font-semibold mb-2 text-slate-800 dark:text-slate-200">Quantidades</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">Total por dia:</p>
          <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{totalKg.toFixed(1)} kg</p>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Por galinha:</p>
          <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{Math.round(perChicken)} g</p>
          <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
            <div className="bg-slate-50 dark:bg-slate-700 p-2 rounded">
              <p className="text-slate-600 dark:text-slate-400">Por refeição</p>
              <p className="font-semibold text-slate-900 dark:text-slate-100">{perMeal} g</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-700 p-2 rounded">
              <p className="text-slate-600 dark:text-slate-400">Refeições/dia</p>
              <p className="font-semibold text-slate-900 dark:text-slate-100">{times.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* calendário semanal (chips) */}
      <div className="mt-6 border border-slate-200 dark:border-slate-600 rounded-lg p-4 bg-white/80 dark:bg-slate-800/80" data-surge>
        <h3 className="font-semibold mb-2 text-slate-800 dark:text-slate-200">Calendário Semanal</h3>
        <div className="grid md:grid-cols-7 gap-3" id="weekCalendar">
          {["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"].map((d) => (
            <div key={d} className="border border-slate-200 dark:border-slate-600 rounded-lg p-3 bg-white dark:bg-slate-700">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-slate-900 dark:text-slate-100">{d}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">{times.length}x/dia</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {times.map((t) => (
                  <span key={d+t} className="chip">{t} • {perMeal} g/gal</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
