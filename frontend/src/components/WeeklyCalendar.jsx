import { useEffect, useState } from "react";
import { Calendar, Clock, Info } from "lucide-react";
import MealDetailsModal from "./MealDetailsModal.jsx";

export default function WeeklyCalendar({ model }) {
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [showMealModal, setShowMealModal] = useState(false);

  // Obter o dia atual da semana (0 = Domingo, 1 = Segunda, etc.)
  const getCurrentDayOfWeek = () => {
    return new Date().getDay();
  };

  // Obter o nome do dia atual
  const getCurrentDayName = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[getCurrentDayOfWeek()];
  };

  const handleMealClick = (time, dayOfWeek) => {
    if (!model) return;
    
    const perMeal = Math.round(model.perChicken / model.times.length);
    const totalAmount = perMeal * model.form.quantity;
    
    setSelectedMeal({
      time,
      dayOfWeek,
      amountPerChicken: perMeal,
      totalAmount
    });
    setShowMealModal(true);
  };

  // Obter a hora atual formatada
  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('pt-PT', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  // Obter dados do modelo se disponível
  const { times = [], perChicken = 0 } = model || {};
  const perMeal = times.length > 0 ? Math.round(perChicken / times.length) : 0;
  const currentDayIndex = getCurrentDayOfWeek();
  const currentDayName = getCurrentDayName();

  // Dias da semana
  const weekDays = [
    { name: "Sun", fullName: "Sunday", index: 0 },
    { name: "Mon", fullName: "Monday", index: 1 },
    { name: "Tue", fullName: "Tuesday", index: 2 },
    { name: "Wed", fullName: "Wednesday", index: 3 },
    { name: "Thu", fullName: "Thursday", index: 4 },
    { name: "Fri", fullName: "Friday", index: 5 },
    { name: "Sat", fullName: "Saturday", index: 6 }
  ];

  // Atualizar hora a cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      // Força re-render para atualizar a hora
      window.dispatchEvent(new Event('timeUpdate'));
    }, 60000); // 60 segundos

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="card shadow-sm p-6" data-aos="fade-up">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 flex items-center">
          <Calendar className="w-6 h-6 mr-2 text-emerald-600" />
          Weekly Feeding Calendar
        </h2>
        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
          <Clock className="w-4 h-4 mr-2" />
          <span id="current-time">{getCurrentTime()}</span>
        </div>
      </div>

      {!model ? (
        <div className="text-center py-12 text-slate-400 dark:text-slate-500">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
          <p>Fill the form to see feeding schedule</p>
        </div>
      ) : (
        <>
          {/* Status do dia atual */}
          <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-emerald-800 dark:text-emerald-200">
                  Today is {currentDayName}
                </h3>
                <p className="text-sm text-emerald-700 dark:text-emerald-300">
                  {times.length} feeding times • {perMeal}g per chicken per meal
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {times.length}
                </div>
                <div className="text-xs text-emerald-600 dark:text-emerald-400">
                  meals today
                </div>
              </div>
            </div>
          </div>

          {/* Calendário semanal */}
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {weekDays.map((day) => {
              const isCurrentDay = day.index === currentDayIndex;
              
              return (
                <div
                  key={day.name}
                  className={`relative rounded-lg p-4 transition-all duration-300 ${
                    isCurrentDay
                      ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25 transform scale-105'
                      : 'border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-md'
                  }`}
                >
                  {/* Indicador de dia atual */}
                  {isCurrentDay && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-yellow-600 rounded-full animate-pulse"></div>
                    </div>
                  )}
                  
                  <div className="text-center">
                    <div className={`font-semibold mb-2 ${
                      isCurrentDay 
                        ? 'text-white' 
                        : 'text-slate-900 dark:text-slate-100'
                    }`}>
                      {day.name}
                    </div>
                    
                    <div className={`text-xs mb-3 ${
                      isCurrentDay 
                        ? 'text-emerald-100' 
                        : 'text-slate-500 dark:text-slate-400'
                    }`}>
                      {times.length}x/day
                    </div>
                    
                    {/* Horários de alimentação */}
                    <div className="space-y-1">
                      {times.map((time, index) => (
                        <button
                          key={`${day.name}-${time}-${index}`}
                          onClick={() => handleMealClick(time, day.name)}
                          className={`w-full text-left text-xs px-2 py-1 rounded transition-all duration-200 hover:scale-105 hover:shadow-md ${
                            isCurrentDay
                              ? 'bg-white/20 text-white hover:bg-white/30'
                              : 'bg-slate-100 dark:bg-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-500'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{time}</div>
                              <div className="text-xs opacity-75">
                                {perMeal}g/chicken
                              </div>
                            </div>
                            <Info className="w-3 h-3 opacity-60" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Resumo da semana */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {times.length * 7}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Total meals this week
              </div>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {perMeal * times.length * 7}g
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Total feed per chicken/week
              </div>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {times.length > 0 ? Math.round((times.length * 7) / 7) : 0}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Average meals per day
              </div>
            </div>
          </div>
        </>
      )}

      {/* Meal Details Modal */}
      <MealDetailsModal
        isOpen={showMealModal}
        onClose={() => setShowMealModal(false)}
        mealData={selectedMeal}
        model={model}
      />
    </div>
  );
}
