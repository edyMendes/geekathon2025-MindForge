import { useEffect, useState } from "react";
import { CalendarDays, Clock, Pill, Utensils, Activity, AlertCircle, CheckCircle } from "lucide-react";
import anime from "animejs";

export default function DiseaseTrackingCalendar({ disease, treatment, chickenData }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [dailyProgress, setDailyProgress] = useState({});
  
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const currentDayIndex = currentTime.getDay();

  // Generate weekly schedule based on disease and treatment
  const generateWeeklySchedule = () => {
    if (!disease || !treatment) return [];

    const weeks = [];
    const totalWeeks = Math.ceil(treatment.recoveryTimeline / 7);
    
    for (let week = 0; week < totalWeeks; week++) {
      const weekDays = [];
      
      for (let day = 0; day < 7; day++) {
        const dayNumber = week * 7 + day + 1;
        const isPastDay = dayNumber <= (selectedWeek * 7 + day + 1);
        const isCurrentDay = dayNumber === (selectedWeek * 7 + day + 1);
        
        // Determine treatment phase based on day
        let phase = "early";
        let intensity = "high";
        let medications = treatment.medications;
        let feedAdjustments = treatment.feedAdjustments;
        
        if (dayNumber > treatment.recoveryTimeline * 0.7) {
          phase = "recovery";
          intensity = "low";
          medications = treatment.medications.filter(med => med.name !== "Supportive care");
        } else if (dayNumber > treatment.recoveryTimeline * 0.4) {
          phase = "mid";
          intensity = "medium";
        }

        // Generate daily tasks
        const dailyTasks = generateDailyTasks(dayNumber, phase, intensity, medications, feedAdjustments);
        
        weekDays.push({
          dayNumber,
          dayName: daysOfWeek[day],
          phase,
          intensity,
          isPastDay,
          isCurrentDay,
          tasks: dailyTasks,
          progress: dailyProgress[dayNumber] || 0
        });
      }
      
      weeks.push(weekDays);
    }
    
    return weeks;
  };

  const generateDailyTasks = (dayNumber, phase, intensity, medications, feedAdjustments) => {
    const tasks = [];
    
    // Medication tasks
    medications.forEach(med => {
      if (med.frequency === "Twice daily") {
        tasks.push({
          id: `med-${med.name}-morning`,
          type: "medication",
          name: `${med.name} (Morning)`,
          time: "08:00",
          dosage: med.calculatedDosage,
          completed: false
        });
        tasks.push({
          id: `med-${med.name}-evening`,
          type: "medication",
          name: `${med.name} (Evening)`,
          time: "20:00",
          dosage: med.calculatedDosage,
          completed: false
        });
      } else if (med.frequency === "Once daily") {
        tasks.push({
          id: `med-${med.name}`,
          type: "medication",
          name: med.name,
          time: "10:00",
          dosage: med.calculatedDosage,
          completed: false
        });
      } else if (med.frequency === "Continuous") {
        tasks.push({
          id: `med-${med.name}`,
          type: "medication",
          name: `${med.name} (Water)`,
          time: "All day",
          dosage: med.dosage,
          completed: false
        });
      }
    });

    // Feed adjustment tasks
    if (phase === "early") {
      tasks.push({
        id: "feed-soft",
        type: "feed",
        name: "Soft Feed Preparation",
        time: "07:00",
        dosage: "Small, frequent meals",
        completed: false
      });
    }
    
    if (feedAdjustments.vitamins) {
      tasks.push({
        id: "vitamins",
        type: "feed",
        name: "Vitamin Supplement",
        time: "12:00",
        dosage: feedAdjustments.vitamins,
        completed: false
      });
    }

    // Monitoring tasks
    tasks.push({
      id: "monitor-symptoms",
      type: "monitor",
      name: "Symptom Check",
      time: "14:00",
      dosage: "Visual inspection",
      completed: false
    });

    if (intensity === "high") {
      tasks.push({
        id: "monitor-temp",
        type: "monitor",
        name: "Temperature Check",
        time: "16:00",
        dosage: "Body temperature",
        completed: false
      });
    }

    // Environment tasks
    if (disease.contagious) {
      tasks.push({
        id: "disinfect",
        type: "environment",
        name: "Area Disinfection",
        time: "18:00",
        dosage: "Daily cleaning",
        completed: false
      });
    }

    return tasks;
  };

  const toggleTaskCompletion = (dayNumber, taskId) => {
    setDailyProgress(prev => ({
      ...prev,
      [dayNumber]: {
        ...prev[dayNumber],
        [taskId]: !prev[dayNumber]?.[taskId]
      }
    }));
  };

  const getPhaseColor = (phase) => {
    switch (phase) {
      case "early": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "mid": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "recovery": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default: return "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200";
    }
  };

  const getIntensityColor = (intensity) => {
    switch (intensity) {
      case "high": return "border-red-500";
      case "medium": return "border-yellow-500";
      case "low": return "border-green-500";
      default: return "border-slate-300";
    }
  };

  const getTaskIcon = (type) => {
    switch (type) {
      case "medication": return <Pill className="w-4 h-4" />;
      case "feed": return <Utensils className="w-4 h-4" />;
      case "monitor": return <Activity className="w-4 h-4" />;
      case "environment": return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  useEffect(() => {
    // Update time every minute
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Animate calendar on load
    anime({
      targets: '#diseaseCalendar .calendar-day',
      opacity: [0, 1],
      scale: [0.8, 1],
      delay: anime.stagger(100),
      duration: 600,
      easing: 'easeOutExpo'
    });
  }, [selectedWeek]);

  if (!disease || !treatment) {
    return (
      <div className="card shadow-sm p-6" data-aos="fade-up">
        <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-6 flex items-center">
          <CalendarDays className="mr-2 text-red-500" />
          Disease Tracking Calendar
        </h2>
        <div className="text-center py-12 text-slate-400 dark:text-slate-500">
          Select a disease and calculate treatment to see the tracking calendar.
        </div>
      </div>
    );
  }

  const weeklySchedule = generateWeeklySchedule();
  const currentWeek = weeklySchedule[selectedWeek] || [];

  return (
    <div className="card shadow-sm p-6" data-aos="fade-up">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 flex items-center">
          <CalendarDays className="mr-2 text-red-500" />
          Disease Tracking Calendar
        </h2>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSelectedWeek(Math.max(0, selectedWeek - 1))}
            disabled={selectedWeek === 0}
            className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded disabled:opacity-50"
          >
            ← Previous
          </button>
          <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 rounded text-sm">
            Week {selectedWeek + 1} of {weeklySchedule.length}
          </span>
          <button
            onClick={() => setSelectedWeek(Math.min(weeklySchedule.length - 1, selectedWeek + 1))}
            disabled={selectedWeek === weeklySchedule.length - 1}
            className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded disabled:opacity-50"
          >
            Next →
          </button>
        </div>
      </div>

      <div id="diseaseCalendar" className="grid md:grid-cols-7 gap-3 mb-6">
        {currentWeek.map((day, index) => (
          <div
            key={day.dayNumber}
            className={`calendar-day relative border rounded-lg p-3 transition-all duration-300 ${
              day.isCurrentDay
                ? "bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25 scale-105"
                : day.isPastDay
                ? "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                : "bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 hover:border-red-400 dark:hover:border-red-500"
            } ${getIntensityColor(day.intensity)}`}
          >
            {day.isCurrentDay && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-yellow-400 rounded-full animate-ping-slow"></span>
            )}
            
            <div className="flex items-center justify-between mb-2">
              <span className={`font-semibold ${day.isCurrentDay ? "text-white" : "text-slate-900 dark:text-slate-100"}`}>
                {day.dayName}
              </span>
              <span className={`text-xs px-2 py-1 rounded ${getPhaseColor(day.phase)}`}>
                {day.phase}
              </span>
            </div>
            
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
              Day {day.dayNumber}
            </div>
            
            <div className="space-y-1">
              {day.tasks.slice(0, 3).map((task) => (
                <div
                  key={task.id}
                  className={`text-xs p-1 rounded flex items-center space-x-1 ${
                    day.isCurrentDay
                      ? "bg-red-700 text-red-50"
                      : "bg-slate-100 dark:bg-slate-600 text-slate-700 dark:text-slate-200"
                  }`}
                >
                  {getTaskIcon(task.type)}
                  <span className="truncate">{task.name}</span>
                </div>
              ))}
              {day.tasks.length > 3 && (
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  +{day.tasks.length - 3} more tasks
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Daily Task Details */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
          Today's Tasks ({currentWeek.find(day => day.isCurrentDay)?.dayName || "Select a day"})
        </h3>
        
        <div className="space-y-3">
          {currentWeek
            .find(day => day.isCurrentDay)
            ?.tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-center space-x-3">
                  {getTaskIcon(task.type)}
                  <div>
                    <div className="font-medium text-slate-800 dark:text-slate-200">
                      {task.name}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {task.time} • {task.dosage}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => toggleTaskCompletion(
                    currentWeek.find(day => day.isCurrentDay)?.dayNumber,
                    task.id
                  )}
                  className={`p-2 rounded-full transition-colors ${
                    dailyProgress[currentWeek.find(day => day.isCurrentDay)?.dayNumber]?.[task.id]
                      ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400"
                      : "bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-500 hover:bg-green-100 hover:text-green-600"
                  }`}
                >
                  <CheckCircle className="w-5 h-5" />
                </button>
              </div>
            ))}
        </div>
      </div>

      {/* Weekly Summary */}
      <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
        <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2 flex items-center">
          <Activity className="w-4 h-4 mr-2 text-emerald-500" />
          Week {selectedWeek + 1} Summary
        </h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-slate-600 dark:text-slate-400">Total Tasks:</p>
            <p className="font-medium text-slate-800 dark:text-slate-200">
              {currentWeek.reduce((total, day) => total + day.tasks.length, 0)}
            </p>
          </div>
          <div>
            <p className="text-slate-600 dark:text-slate-400">Medication Doses:</p>
            <p className="font-medium text-slate-800 dark:text-slate-200">
              {currentWeek.reduce((total, day) => 
                total + day.tasks.filter(task => task.type === "medication").length, 0
              )}
            </p>
          </div>
          <div>
            <p className="text-slate-600 dark:text-slate-400">Recovery Phase:</p>
            <p className="font-medium text-slate-800 dark:text-slate-200 capitalize">
              {currentWeek[0]?.phase || "N/A"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
