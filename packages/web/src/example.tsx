import React, {useState, useEffect} from "react";
import {
  Heart,
  Flame,
  Droplets,
  Zap,
  Plus,
  User,
  Settings,
  Trophy,
  ChevronRight,
  Smile,
  Sun,
  X,
  Search,
  Check,
  Scale,
  Target,
  Bell,
  Lock,
  ChevronLeft,
  Calendar,
  Clock,
  Edit2,
  Sparkles,
  ChevronDown,
} from "lucide-react";

const CRITTER_TYPES = {
  EMBER: {
    name: "Ember",
    color: "bg-orange-400",
    borderColor: "border-orange-600",
    eyeColor: "bg-orange-900",
    description: "A fiery friend who loves high energy days.",
    accent: "text-orange-600",
  },
  BUBBLE: {
    name: "Bubble",
    color: "bg-blue-400",
    borderColor: "border-blue-600",
    eyeColor: "bg-blue-900",
    description: "Stays cool and hydrated under pressure.",
    accent: "text-blue-600",
  },
  LEAFY: {
    name: "Leafy",
    color: "bg-green-400",
    borderColor: "border-green-600",
    eyeColor: "bg-green-900",
    description: "Grows strongest with balanced micronutrients.",
    accent: "text-green-600",
  },
};

const App = () => {
  // Navigation & UI State
  const [view, setView] = useState("onboarding");
  const [showLogModal, setShowLogModal] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);

  // User Profile State (for recommendations)
  const [profile, setProfile] = useState({
    weight: 70,
    height: 175,
    age: 25,
    gender: "male",
    activity: "1.2",
  });
  const [goalType, setGoalType] = useState("Maintain");

  // Data State
  const [goals, setGoals] = useState({
    calories: 2200,
    protein: 150,
    carbs: 250,
    fats: 70,
  });
  const [consumed, setConsumed] = useState({
    calories: 1450,
    protein: 90,
    carbs: 180,
    fats: 45,
  });
  const [history, setHistory] = useState([
    {
      id: 1,
      name: "Greek Yogurt & Berries",
      cals: 320,
      p: 20,
      c: 35,
      f: 8,
      time: "8:30 AM",
    },
    {
      id: 2,
      name: "Grilled Chicken Salad",
      cals: 540,
      p: 45,
      c: 15,
      f: 28,
      time: "1:15 PM",
    },
  ]);
  const [selectedCritter, setSelectedCritter] = useState(CRITTER_TYPES.EMBER);
  const [critterName, setCritterName] = useState("Sparky");
  const [mood, setMood] = useState("happy");

  useEffect(() => {
    const calRatio = consumed.calories / goals.calories;
    if (calRatio > 1.1) setMood("overwhelmed");
    else if (calRatio > 0.8) setMood("happy");
    else if (calRatio > 0.4) setMood("neutral");
    else setMood("hungry");
  }, [consumed, goals]);

  // --- CALCULATION LOGIC ---
  const calculateRecommended = () => {
    // Basic Mifflin-St Jeor Equation
    let bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age;
    bmr = profile.gender === "male" ? bmr + 5 : bmr - 161;

    let tdee = bmr * parseFloat(profile.activity);

    let targetCals = Math.round(tdee);
    if (goalType === "Lose Weight") targetCals -= 500;
    if (goalType === "Gain Muscle") targetCals += 300;

    // Simple macro split: 30% P, 40% C, 30% F
    const p = Math.round((targetCals * 0.3) / 4);
    const c = Math.round((targetCals * 0.4) / 4);
    const f = Math.round((targetCals * 0.3) / 9);

    setGoals({calories: targetCals, protein: p, carbs: c, fats: f});
  };

  // --- HELPER COMPONENTS ---

  const CritterGraphic = ({type, mood, size = "large"}) => {
    const isLarge = size === "large";
    const containerClasses = isLarge ? "w-64 h-64" : "w-16 h-16";
    return (
      <div
        className={`relative ${containerClasses} flex items-center justify-center transition-all duration-500`}>
        <div className="absolute bottom-4 w-3/4 h-4 bg-slate-200 rounded-[100%] blur-sm"></div>
        <div
          className={`relative ${type.color} ${isLarge ? "w-48 h-48" : "w-12 h-12"} rounded-[40%] border-4 ${type.borderColor} animate-bounce flex flex-col items-center justify-center`}
          style={{animationDuration: "3s"}}>
          <div
            className={`flex ${isLarge ? "space-x-8 mb-2" : "space-x-2 mb-1"}`}>
            <div
              className={`${type.eyeColor} ${isLarge ? "w-4 h-6" : "w-1 h-1.5"} rounded-full`}></div>
            <div
              className={`${type.eyeColor} ${isLarge ? "w-4 h-6" : "w-1 h-1.5"} rounded-full`}></div>
          </div>
          <div className={isLarge ? "mt-2" : "mt-1"}>
            {mood === "happy" && (
              <div
                className={`w-10 h-5 border-b-4 ${type.eyeColor} rounded-full`}></div>
            )}
            {mood !== "happy" && (
              <div className={`w-6 h-1 ${type.eyeColor} rounded-full`}></div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const PageHeader = ({title, onBack}) => (
    <div className="flex items-center gap-4 mb-8">
      <button
        onClick={onBack}
        className="p-2 bg-white rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
        <ChevronLeft size={20} />
      </button>
      <h2 className="text-2xl font-black text-slate-800">{title}</h2>
    </div>
  );

  // --- VIEWS ---

  const OnboardingView = () => (
    <div className="max-w-md mx-auto min-h-[85vh] flex flex-col p-6 space-y-8 animate-in fade-in slide-in-from-bottom-8">
      {/* Step Indicator with Back Button */}
      <div className="flex items-center justify-between">
        {onboardingStep > 1 ? (
          <button
            onClick={() => setOnboardingStep((prev) => prev - 1)}
            className="flex items-center gap-1 text-slate-400 font-bold hover:text-indigo-600 transition-colors">
            <ChevronLeft size={18} /> Back
          </button>
        ) : (
          <div className="w-10" />
        )}

        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all ${onboardingStep >= i ? "w-8 bg-indigo-600" : "w-2 bg-slate-200"}`}
            />
          ))}
        </div>
        <div className="w-10" />
      </div>

      {onboardingStep === 1 && (
        <div className="space-y-6 text-center pt-8">
          <div className="w-24 h-24 bg-indigo-100 rounded-3xl mx-auto flex items-center justify-center text-indigo-600">
            <Target size={48} />
          </div>
          <h2 className="text-3xl font-black text-slate-800">
            What is your goal?
          </h2>
          <div className="space-y-3">
            {["Lose Weight", "Maintain", "Gain Muscle"].map((g) => (
              <button
                key={g}
                onClick={() => {
                  setGoalType(g);
                  setOnboardingStep(2);
                }}
                className={`w-full p-5 rounded-2xl font-bold transition-all border-2 ${goalType === g ? "bg-indigo-50 border-indigo-500 text-indigo-700" : "bg-white border-slate-100 text-slate-700 hover:border-indigo-200"}`}>
                {g}
              </button>
            ))}
          </div>
        </div>
      )}

      {onboardingStep === 2 && (
        <div className="space-y-6 pt-4">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black text-slate-800">About You</h2>
            <p className="text-slate-500 font-medium">
              To calculate your needs
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 space-y-5 shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  value={profile.weight}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      weight: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full text-xl font-bold bg-slate-50 p-4 rounded-xl outline-none focus:ring-2 ring-indigo-500/20"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">
                  Height (cm)
                </label>
                <input
                  type="number"
                  value={profile.height}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      height: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full text-xl font-bold bg-slate-50 p-4 rounded-xl outline-none focus:ring-2 ring-indigo-500/20"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">
                  Age
                </label>
                <input
                  type="number"
                  value={profile.age}
                  onChange={(e) =>
                    setProfile({...profile, age: parseInt(e.target.value) || 0})
                  }
                  className="w-full text-xl font-bold bg-slate-50 p-4 rounded-xl outline-none focus:ring-2 ring-indigo-500/20"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">
                  Gender
                </label>
                <select
                  value={profile.gender}
                  onChange={(e) =>
                    setProfile({...profile, gender: e.target.value})
                  }
                  className="w-full text-xl font-bold bg-slate-50 p-4 rounded-xl outline-none appearance-none cursor-pointer">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>
          </div>

          <button
            onClick={() => setOnboardingStep(3)}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100">
            Next
          </button>
        </div>
      )}

      {onboardingStep === 3 && (
        <div className="space-y-6 pt-4">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black text-slate-800">Set Targets</h2>
            <p className="text-slate-500 font-medium">
              Fine-tune your daily plan
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 space-y-6 shadow-sm">
            <button
              onClick={calculateRecommended}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-50 text-indigo-600 rounded-xl font-black text-sm hover:bg-indigo-100 transition-all group">
              <Sparkles
                size={16}
                className="group-hover:rotate-12 transition-transform"
              />
              Use Recommended Targets
            </button>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-slate-400">
                Daily Calories
              </label>
              <input
                type="number"
                value={goals.calories}
                onChange={(e) =>
                  setGoals({...goals, calories: parseInt(e.target.value) || 0})
                }
                className="w-full text-3xl font-black text-indigo-600 border-b-2 border-slate-100 focus:border-indigo-500 outline-none pb-2 transition-colors"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              {["protein", "carbs", "fats"].map((m) => (
                <div key={m} className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400">
                    {m}
                  </label>
                  <input
                    type="number"
                    value={goals[m]}
                    onChange={(e) =>
                      setGoals({...goals, [m]: parseInt(e.target.value) || 0})
                    }
                    className="w-full font-bold border-b border-slate-100 outline-none p-1 focus:border-indigo-500 transition-colors"
                  />
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setOnboardingStep(4)}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100">
            Looks Good
          </button>
        </div>
      )}

      {onboardingStep === 4 && (
        <div className="space-y-6 text-center pt-8">
          <h2 className="text-3xl font-black text-slate-800">
            Ready to adopt?
          </h2>
          <p className="text-slate-500 font-medium">
            Meet your health companion.
          </p>
          <div className="bg-indigo-600 rounded-[3rem] p-10 flex justify-center shadow-2xl shadow-indigo-200">
            <CritterGraphic type={selectedCritter} mood="happy" />
          </div>
          <button
            onClick={() => setView("create")}
            className="w-full bg-indigo-600 text-white py-5 rounded-[2rem] font-black text-lg">
            Choose Your Friend
          </button>
        </div>
      )}
    </div>
  );

  const EditGoalsView = () => (
    <div className="max-w-xl mx-auto space-y-8 animate-in fade-in">
      <PageHeader title="Health Goals" onBack={() => setView("dashboard")} />
      <div className="bg-white p-8 rounded-[3rem] border border-slate-100 space-y-8 shadow-sm">
        <div className="flex flex-col md:flex-row gap-6 p-6 bg-slate-50 rounded-[2rem]">
          <div className="flex-1 space-y-4">
            <h4 className="font-black text-slate-800">Current Stats</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase">
                  Weight
                </p>
                <p className="font-bold">{profile.weight}kg</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase">
                  Height
                </p>
                <p className="font-bold">{profile.height}cm</p>
              </div>
            </div>
          </div>
          <button
            onClick={calculateRecommended}
            className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-4 rounded-2xl font-black text-sm shadow-lg shadow-indigo-100 hover:scale-[1.02] transition-all">
            <Sparkles size={16} /> Get Recommended
          </button>
        </div>

        <div className="space-y-4">
          <label className="text-xs font-black uppercase text-slate-400 tracking-wider">
            Target Calories
          </label>
          <div className="flex items-center justify-between gap-6">
            <input
              type="range"
              min="1200"
              max="4000"
              step="50"
              value={goals.calories}
              onChange={(e) =>
                setGoals({...goals, calories: parseInt(e.target.value)})
              }
              className="flex-1 accent-indigo-600 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-3xl font-black text-indigo-600 min-w-[100px] text-right">
              {goals.calories}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-50">
          {[
            {key: "protein", label: "Protein (g)", color: "bg-rose-500"},
            {key: "carbs", label: "Carbs (g)", color: "bg-amber-500"},
            {key: "fats", label: "Fats (g)", color: "bg-emerald-500"},
          ].map((macro) => (
            <div key={macro.key} className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                {macro.label}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={goals[macro.key]}
                  onChange={(e) =>
                    setGoals({
                      ...goals,
                      [macro.key]: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full bg-slate-50 p-4 rounded-2xl font-black focus:ring-2 ring-indigo-500/20 outline-none"
                />
                <div
                  className={`absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${macro.color}`}></div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => setView("dashboard")}
          className="w-full bg-indigo-600 text-white py-5 rounded-[2rem] font-black shadow-xl shadow-indigo-100 flex items-center justify-center gap-2">
          <Check size={20} strokeWidth={3} /> Save & Apply
        </button>
      </div>
    </div>
  );

  // --- REST OF THE COMPONENTS (Same logic as previous version) ---

  const HistoryView = () => (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-black text-slate-800">Meal History</h2>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-100 text-sm font-bold text-slate-600">
          <Calendar size={16} /> Today
        </div>
      </div>
      <div className="space-y-4">
        {history.map((item) => (
          <div
            key={item.id}
            className="bg-white p-5 rounded-[2rem] border border-slate-100 flex items-center justify-between group hover:border-indigo-100 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                <Clock size={20} />
              </div>
              <div>
                <p className="font-bold text-slate-800">{item.name}</p>
                <p className="text-xs text-slate-400 font-medium">
                  {item.time} • P: {item.p}g • C: {item.c}g
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-black text-slate-800">{item.cals}</p>
              <p className="text-[10px] uppercase font-black text-slate-400 tracking-tighter">
                Kcal
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const SettingsView = () => (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in">
      <PageHeader title="Settings" onBack={() => setView("dashboard")} />
      <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
        <div className="p-8 border-b border-slate-50 flex items-center gap-6">
          <div className="w-20 h-20 bg-slate-100 rounded-3xl overflow-hidden border-4 border-white shadow-sm">
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
              alt="Profile"
            />
          </div>
          <div className="flex-1">
            <h3 className="font-black text-2xl text-slate-800">Felix Miller</h3>
            <p className="text-slate-400 font-medium italic">Expert Keeper</p>
          </div>
        </div>
        <div className="p-4 space-y-1">
          <button
            onClick={() => setView("edit-goals")}
            className="w-full p-5 flex items-center justify-between hover:bg-slate-50 rounded-[1.5rem] transition-all text-left group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                <Target size={22} />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">
                  Target & Goals
                </p>
                <p className="text-slate-400 text-xs font-medium">
                  Update calories, weight, height
                </p>
              </div>
            </div>
            <ChevronRight
              size={18}
              className="text-slate-300 group-hover:text-indigo-600 transition-colors"
            />
          </button>
          <button className="w-full p-5 flex items-center justify-between hover:bg-slate-50 rounded-[1.5rem] transition-all text-left group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                <Bell size={22} />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">Reminders</p>
                <p className="text-slate-400 text-xs font-medium">
                  Morning & evening check-ins
                </p>
              </div>
            </div>
            <ChevronRight
              size={18}
              className="text-slate-300 group-hover:text-amber-600 transition-colors"
            />
          </button>
        </div>
      </div>
      <button className="w-full p-5 text-rose-600 font-black bg-rose-50 rounded-[2rem] hover:bg-rose-100 transition-colors">
        Log Out
      </button>
    </div>
  );

  const LogFoodModal = () => (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={() => setShowLogModal(false)}></div>
      <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xl font-black text-slate-800">Log Food</h3>
          <button
            onClick={() => setShowLogModal(false)}
            className="p-2 hover:bg-slate-100 rounded-full">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search for a food..."
              className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 ring-indigo-500/20 font-medium"
            />
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
              Frequent
            </p>
            {[
              {name: "Avocado Toast", cals: 280, p: 8, c: 24, f: 18},
              {name: "Black Coffee", cals: 5, p: 0, c: 0, f: 0},
              {name: "Protein Shake", cals: 150, p: 30, c: 5, f: 2},
            ].map((item, i) => (
              <button
                key={i}
                onClick={() => {
                  setConsumed((prev) => ({
                    calories: prev.calories + item.cals,
                    protein: prev.protein + item.p,
                    carbs: prev.carbs + item.c,
                    fats: prev.fats + item.f,
                  }));
                  setHistory([
                    {...item, id: Date.now(), time: "Now"},
                    ...history,
                  ]);
                  setShowLogModal(false);
                }}
                className="w-full flex items-center justify-between p-4 hover:bg-indigo-50 rounded-2xl transition-all group">
                <div className="text-left">
                  <p className="font-bold text-slate-800 text-sm">
                    {item.name}
                  </p>
                  <p className="text-xs text-slate-400 font-medium">
                    {item.cals} kcal • P: {item.p}g
                  </p>
                </div>
                <Plus
                  size={18}
                  className="text-slate-300 group-hover:text-indigo-600"
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-24">
      {showLogModal && <LogFoodModal />}

      {view !== "onboarding" && (
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-100">
          <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
            <div
              onClick={() => setView("dashboard")}
              className="flex items-center gap-2 cursor-pointer group">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-all">
                <Smile size={24} />
              </div>
              <span className="text-xl font-black tracking-tighter text-indigo-900 uppercase">
                Calorie Critters
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-indigo-100 border-2 border-white overflow-hidden shadow-sm">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Felix`}
                  alt="User"
                />
              </div>
            </div>
          </div>
        </nav>
      )}

      <main className="max-w-5xl mx-auto px-6 py-8">
        {view === "onboarding" && <OnboardingView />}
        {view === "settings" && <SettingsView />}
        {view === "history" && <HistoryView />}
        {view === "edit-goals" && <EditGoalsView />}

        {view === "dashboard" && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <section className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1 space-y-6 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">
                    <Heart size={14} className="fill-current text-rose-300" />
                    Critter Status • {selectedCritter.name}
                  </div>
                  <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tight">
                    {critterName} is{" "}
                    {mood === "overwhelmed"
                      ? "stuffed!"
                      : mood === "hungry"
                        ? "hungry..."
                        : "feeling amazing!"}
                  </h1>
                  <div className="flex flex-wrap gap-3 justify-center md:justify-start pt-2">
                    <button
                      onClick={() => setShowLogModal(true)}
                      className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-black shadow-lg hover:scale-[1.02] transition-all flex items-center gap-2">
                      <Plus size={20} strokeWidth={3} /> Log Food
                    </button>
                    <button
                      onClick={() => setView("history")}
                      className="bg-white/10 backdrop-blur-md text-white px-6 py-4 rounded-2xl font-black hover:bg-white/20 transition-colors">
                      View Logs
                    </button>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <CritterGraphic
                    type={selectedCritter}
                    mood={mood}
                    size="large"
                  />
                </div>
              </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white p-8 md:p-10 rounded-[3rem] border border-slate-100 flex flex-col md:flex-row items-center gap-10 shadow-sm">
                <div className="relative w-44 h-44 flex-shrink-0">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="88"
                      cy="88"
                      r="80"
                      stroke="currentColor"
                      strokeWidth="14"
                      fill="transparent"
                      className="text-slate-50"
                    />
                    <circle
                      cx="88"
                      cy="88"
                      r="80"
                      stroke="currentColor"
                      strokeWidth="14"
                      fill="transparent"
                      strokeDasharray={502.6}
                      strokeDashoffset={
                        502.6 -
                        502.6 * Math.min(consumed.calories / goals.calories, 1)
                      }
                      className={`${consumed.calories > goals.calories ? "text-rose-500" : "text-indigo-600"} transition-all duration-1000`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span
                      className={`text-4xl font-black ${consumed.calories > goals.calories ? "text-rose-600" : "text-slate-800"}`}>
                      {Math.max(goals.calories - consumed.calories, 0)}
                    </span>
                    <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">
                      Kcal Left
                    </span>
                  </div>
                </div>
                <div className="flex-1 w-full space-y-8">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      Total Consumed
                    </p>
                    <p className="text-4xl font-black text-slate-800 leading-none">
                      {consumed.calories}{" "}
                      <span className="text-xl font-bold text-slate-300">
                        / {goals.calories}
                      </span>
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-6">
                    {[
                      {
                        label: "P",
                        val: consumed.protein,
                        target: goals.protein,
                        color: "bg-rose-500",
                      },
                      {
                        label: "C",
                        val: consumed.carbs,
                        target: goals.carbs,
                        color: "bg-amber-500",
                      },
                      {
                        label: "F",
                        val: consumed.fats,
                        target: goals.fats,
                        color: "bg-emerald-500",
                      },
                    ].map((m) => (
                      <div key={m.label} className="space-y-2">
                        <div className="flex justify-between items-end">
                          <span className="text-[10px] font-black text-slate-400">
                            {m.label}
                          </span>
                          <span className="text-xs font-bold text-slate-800">
                            {m.val}g
                          </span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${m.color}`}
                            style={{
                              width: `${Math.min((m.val / m.target) * 100, 100)}%`,
                            }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[3rem] p-8 border border-slate-100 flex flex-col justify-between shadow-sm">
                <div className="flex justify-between items-start">
                  <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-600">
                    <Trophy size={28} />
                  </div>
                  <div className="text-right">
                    <span className="block text-2xl font-black text-slate-800">
                      14
                    </span>
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                      Streak
                    </span>
                  </div>
                </div>
                <div className="pt-8">
                  <p className="text-xl font-black text-slate-800">
                    Growth Bonus!
                  </p>
                  <p className="text-slate-400 text-sm font-medium mt-1 leading-relaxed">
                    You've logged 14 days straight. {critterName} is growing
                    faster than ever!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === "create" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 text-center py-8">
            <CritterGraphic type={selectedCritter} mood="happy" size="large" />
            <div className="max-w-sm mx-auto space-y-8">
              <div className="space-y-2">
                <h2 className="text-4xl font-black text-slate-800">
                  Name Your Friend
                </h2>
                <p className="text-slate-500 font-medium">
                  This will be your partner on your journey.
                </p>
              </div>
              <input
                type="text"
                value={critterName}
                onChange={(e) => setCritterName(e.target.value)}
                className="w-full p-6 rounded-[2rem] bg-white border-2 border-slate-100 text-center text-2xl font-black focus:border-indigo-500 outline-none transition-all"
              />
              <div className="grid grid-cols-3 gap-4">
                {Object.values(CRITTER_TYPES).map((t) => (
                  <button
                    key={t.name}
                    onClick={() => setSelectedCritter(t)}
                    className={`p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${selectedCritter.name === t.name ? "border-indigo-600 bg-indigo-50" : "border-slate-50 bg-white"}`}>
                    <div className={`w-8 h-8 rounded-full ${t.color}`} />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {t.name}
                    </span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setView("dashboard")}
                className="w-full bg-indigo-600 text-white py-5 rounded-[2rem] font-black text-lg shadow-xl shadow-indigo-100">
                Let's Go!
              </button>
            </div>
          </div>
        )}
      </main>

      {view !== "onboarding" && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-xl border border-slate-100 rounded-[2.5rem] px-8 py-3 flex items-center gap-8 shadow-2xl z-50">
          <button
            onClick={() => setView("dashboard")}
            className={`p-2 transition-colors ${view === "dashboard" ? "text-indigo-600" : "text-slate-400"}`}>
            <Sun size={24} strokeWidth={3} />
          </button>
          <button
            onClick={() => setView("history")}
            className={`p-2 transition-colors ${view === "history" ? "text-indigo-600" : "text-slate-400"}`}>
            <Clock size={24} strokeWidth={3} />
          </button>
          <button
            onClick={() => setShowLogModal(true)}
            className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl -mt-10 border-4 border-white hover:scale-110 transition-transform">
            <Plus size={32} strokeWidth={3} />
          </button>
          <button
            onClick={() => setView("edit-goals")}
            className={`p-2 transition-colors ${view === "edit-goals" ? "text-indigo-600" : "text-slate-400"}`}>
            <Target size={24} strokeWidth={3} />
          </button>
          <button
            onClick={() => setView("settings")}
            className={`p-2 transition-colors ${view === "settings" ? "text-indigo-600" : "text-slate-400"}`}>
            <Settings size={24} strokeWidth={3} />
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
