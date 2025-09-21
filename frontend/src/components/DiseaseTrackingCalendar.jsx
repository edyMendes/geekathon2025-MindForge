import { useEffect, useState } from "react";
import { CalendarDays, Clock, Pill, Utensils, Activity, AlertCircle, CheckCircle } from "lucide-react";
import anime from "animejs";

export default function DiseaseTrackingCalendar({ disease, treatment, chickenData }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dailyProgress, setDailyProgress] = useState({});
  const [expandedDay, setExpandedDay] = useState(null);
  
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const currentDayIndex = currentTime.getDay();

  // Helper functions for date management
  const getWeekStartingFromDate = (startDate) => {
    const week = [];
    const today = new Date(startDate);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      week.push({
        date: date,
        dayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
        dayShort: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dateString: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        isToday: i === 0,
        dayIndex: i
      });
    }
    return week;
  };

  // Generate 7-week schedule based on disease and treatment
  const generateSevenWeekSchedule = () => {
    if (!disease || !treatment) return [];

    const weeks = [];
    const totalWeeks = Math.min(7, Math.ceil(treatment.recoveryTimeline / 7));
    
    for (let week = 0; week < totalWeeks; week++) {
      const weekStartDate = new Date(selectedDate);
      weekStartDate.setDate(selectedDate.getDate() + (week * 7));
      const weekDays = getWeekStartingFromDate(weekStartDate);
      
      const weekWithTreatment = weekDays.map((weekDay, dayIndex) => {
        const dayNumber = week * 7 + dayIndex + 1;
        const isPastDay = dayNumber <= Math.floor((new Date() - new Date(selectedDate)) / (1000 * 60 * 60 * 24)) + 1;
        const isCurrentDay = dayNumber === Math.floor((new Date() - new Date(selectedDate)) / (1000 * 60 * 60 * 24)) + 1;
        
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
        
        return {
          ...weekDay,
          dayNumber,
          phase,
          intensity,
          isPastDay,
          isCurrentDay,
          tasks: dailyTasks,
          progress: dailyProgress[dayNumber] || 0
        };
      });
      
      weeks.push({
        weekNumber: week + 1,
        weekDays: weekWithTreatment,
        startDate: weekStartDate,
        endDate: new Date(weekStartDate.getTime() + 6 * 24 * 60 * 60 * 1000)
      });
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
      delay: anime.stagger(50),
      duration: 600,
      easing: 'easeOutExpo'
    });
  }, [selectedDate]);

  useEffect(() => {
    // Animate expanded day details
    if (expandedDay) {
      anime({
        targets: '.expanded-day-content',
        opacity: [0, 1],
        translateY: [-20, 0],
        duration: 400,
        easing: 'easeOutExpo'
      });
    }
  }, [expandedDay]);

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

  const sevenWeekSchedule = generateSevenWeekSchedule();

  return (
    <div className="card shadow-sm p-6" data-aos="fade-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center">
          <CalendarDays className="w-6 h-6 mr-2 text-red-500" />
          <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200">
            Disease Tracking Calendar
          </h2>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-slate-500" />
            <input
              type="date"
              value={selectedDate.toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            <span className="font-medium">Treatment Duration: {treatment?.recoveryTimeline || 0} days</span>
          </div>
        </div>
      </div>

      {/* 7-Week Overview */}
      <div className="mb-6 space-y-6">
        {sevenWeekSchedule.map((week, weekIndex) => (
          <div key={weekIndex} className="space-y-4">
            {/* Week Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                Week {week.weekNumber}
              </h3>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {week.startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {week.endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            </div>
            
            {/* Week Overview */}
            <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="grid grid-cols-7 gap-2">
                {week.weekDays.map((day, dayIndex) => (
                  <div
                    key={dayIndex}
                    className={`text-center p-2 rounded-lg border-2 transition-all ${
                      day.isCurrentDay
                        ? 'bg-red-100 dark:bg-red-900/30 border-red-500 text-red-800 dark:text-red-200'
                        : day.isPastDay
                        ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="text-xs font-medium">{day.dayShort}</div>
                    <div className="text-sm font-semibold">{day.date.getDate()}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Day {day.dayNumber}</div>
                    {day.isCurrentDay && (
                      <div className="text-xs text-red-600 dark:text-red-400 font-medium">Today</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Details */}
            <div className="space-y-3">
              {week.weekDays.map((day, dayIndex) => (
                <div key={dayIndex} className={`border rounded-lg overflow-hidden transition-all ${
                  day.isCurrentDay 
                    ? 'border-red-300 dark:border-red-600 shadow-lg' 
                    : 'border-slate-200 dark:border-slate-700'
                }`}>
                  <button
                    onClick={() => setExpandedDay(expandedDay === day.dayNumber ? null : day.dayNumber)}
                    className={`w-full p-4 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center justify-between ${
                      day.isCurrentDay 
                        ? 'bg-red-50 dark:bg-red-900/20' 
                        : 'bg-slate-50 dark:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center">
                      <CalendarDays className={`w-5 h-5 mr-3 ${day.isCurrentDay ? 'text-red-600' : 'text-slate-500'}`} />
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-slate-800 dark:text-slate-200">{day.dayName}</h3>
                          <span className="text-sm text-slate-500 dark:text-slate-400">({day.dateString})</span>
                          <span className={`text-xs px-2 py-1 rounded ${getPhaseColor(day.phase)}`}>
                            {day.phase}
                          </span>
                          {day.isCurrentDay && (
                            <span className="px-2 py-1 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-full">
                              Today
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Day {day.dayNumber} • {day.tasks.length} tasks • {day.intensity} intensity
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getIntensityColor(day.intensity).replace('border-', 'bg-')}`}></div>
                      {expandedDay === day.dayNumber ? (
                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </div>
                  </button>

                  {expandedDay === day.dayNumber && (
                    <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
                      <div className="space-y-4">
                        {/* Daily Tasks by Category */}
                        {['medication', 'feed', 'monitor', 'environment'].map(category => {
                          const categoryTasks = day.tasks.filter(task => task.type === category);
                          if (categoryTasks.length === 0) return null;
                          
                          return (
                            <div key={category} className="space-y-2">
                              <h5 className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                                {category.charAt(0).toUpperCase() + category.slice(1)} Tasks
                              </h5>
                              {categoryTasks.map(task => (
                                <div
                                  key={task.id}
                                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600"
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
                                    onClick={() => toggleTaskCompletion(day.dayNumber, task.id)}
                                    className={`p-2 rounded-full transition-colors ${
                                      dailyProgress[day.dayNumber]?.[task.id]
                                        ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400"
                                        : "bg-slate-100 text-slate-400 dark:bg-slate-600 dark:text-slate-500 hover:bg-green-100 hover:text-green-600"
                                    }`}
                                  >
                                    <CheckCircle className="w-5 h-5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Treatment Summary */}
      <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
        <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2 flex items-center">
          <Activity className="w-4 h-4 mr-2 text-red-500" />
          Treatment Summary
        </h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-slate-600 dark:text-slate-400">Total Treatment Days:</p>
            <p className="font-medium text-slate-800 dark:text-slate-200">
              {treatment?.recoveryTimeline || 0} days
            </p>
          </div>
          <div>
            <p className="text-slate-600 dark:text-slate-400">Weeks Covered:</p>
            <p className="font-medium text-slate-800 dark:text-slate-200">
              {sevenWeekSchedule.length} weeks
            </p>
          </div>
          <div>
            <p className="text-slate-600 dark:text-slate-400">Disease:</p>
            <p className="font-medium text-slate-800 dark:text-slate-200 capitalize">
              {disease?.name || "N/A"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
