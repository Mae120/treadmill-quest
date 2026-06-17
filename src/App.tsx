import { useState, useEffect } from "react";

const STORAGE_KEY = "treadmill-quest-data";

const defaultData = {
  goal: null,
  sessions: [],
  journeyId: "jeddah-makkah",
  onboardingDone: false,
};

async function loadData() {
  try {
    const r = await (window as any).storage?.get(STORAGE_KEY);
    return r ? JSON.parse(r.value) : defaultData;
  } catch {
    return defaultData;
  }
}

async function saveData(data: any) {
  try {
    await (window as any).storage?.set(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

const JOURNEYS = [
  {
    id: "jeddah-makkah",
    name: "Jeddah → Makkah",
    emoji: "🕌",
    totalKm: 85,
    milestones: [
      { km: 20, label: "Al-Shumaisi Gate" },
      { km: 45, label: "Halfway there" },
      { km: 70, label: "Makkah outskirts" },
      { km: 85, label: "Al-Masjid Al-Haram 🕋" },
    ],
    color: "#D4A017",
    bg: "from-amber-950 to-stone-900",
  },
  {
    id: "dubai-journey",
    name: "Explore Dubai",
    emoji: "🏙️",
    totalKm: 120,
    milestones: [
      { km: 15, label: "Deira Gold Souk" },
      { km: 40, label: "Dubai Creek" },
      { km: 80, label: "Downtown Dubai" },
      { km: 100, label: "Burj Khalifa" },
      { km: 120, label: "Palm Jumeirah 🌴" },
    ],
    color: "#00D4FF",
    bg: "from-sky-950 to-slate-900",
  },
  {
    id: "iceland",
    name: "Across Iceland",
    emoji: "🌋",
    totalKm: 300,
    milestones: [
      { km: 50, label: "Reykjavik outskirts" },
      { km: 120, label: "Golden Circle" },
      { km: 200, label: "Highland Plateau" },
      { km: 260, label: "Lava Fields" },
      { km: 300, label: "East Fjords 🏔️" },
    ],
    color: "#7EC8E3",
    bg: "from-teal-950 to-slate-900",
  },
];

const today = () => new Date().toISOString().split("T")[0];

function getStreak(sessions: any[]) {
  if (!sessions.length) return { current: 0, longest: 0 };
  const dates = new Set(sessions.map((s: any) => s.date));
  let current = 0;
  let d = new Date();
  while (true) {
    const key = d.toISOString().split("T")[0];
    if (!dates.has(key)) break;
    current++;
    d.setDate(d.getDate() - 1);
  }
  const sorted = [...dates].sort() as any[];
  let longest = 0, run = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]) as any;
    const curr = new Date(sorted[i]) as any;
    const diff = (curr - prev) / 86400000;
    if (diff === 1) { run++; longest = Math.max(longest, run); }
    else run = 1;
  }
  longest = Math.max(longest, current);
  return { current, longest };
}

function getMonthlyConsistency(sessions: any[]) {
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysSoFar = now.getDate();
  const thisMonth = sessions.filter((s: any) => {
    const d = new Date(s.date);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });
  const uniqueDays = new Set(thisMonth.map((s: any) => s.date)).size;
  return Math.round((uniqueDays / daysSoFar) * 100);
}

function getTotalKm(sessions: any[]) {
  return sessions.reduce((a: any, s: any) => a + (s.km || 2.4), 0);
}

function kmPerSession(duration: number) {
  return parseFloat(((4.83 * duration) / 60).toFixed(2));
}

function calPerSession(duration: number) {
  return Math.round((200 * duration) / 30);
}

function OnboardingScreen({ onDone }: { onDone: any }) {
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<string | null>(null);
  const [journey, setJourney] = useState<string | null>(null);

  const goals = [
    { id: "consistency", icon: "🔥", label: "Build Consistency", sub: "Don't break the chain" },
    { id: "weight", icon: "⚖️", label: "Lose Weight", sub: "Steady progress over time" },
    { id: "fitness", icon: "💪", label: "Improve Fitness", sub: "Get stronger every week" },
    { id: "endurance", icon: "🏃", label: "Train Endurance", sub: "Go longer, go further" },
  ];

  return (
    <div style={{
      minHeight: "100vh", background: "linear-gradient(135deg, #0a0a0f 0%, #0f1a12 100%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "24px", fontFamily: "'Space Grotesk', 'Inter', sans-serif"
    } as any}>
      {step === 0 && (
        <div style={{ textAlign: "center", maxWidth: 480 } as any}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🏃</div>
          <h1 style={{ color: "#e8f5e9", fontSize: 36, fontWeight: 800, letterSpacing: "-1px", margin: "0 0 8px" }}>
            Treadmill Quest
          </h1>
          <p style={{ color: "#4ade80", fontSize: 14, fontWeight: 600, letterSpacing: "4px", textTransform: "uppercase", marginBottom: 12 } as any}>
            12 • 3 • 30 Challenge
          </p>
          <p style={{ color: "#6b7280", fontSize: 16, marginBottom: 40, lineHeight: 1.6 } as any}>
            12% incline. 3 mph. 30 minutes.<br />Every day counts.
          </p>
          <button onClick={() => setStep(1)} style={{
            background: "#4ade80", color: "#0a0a0f", border: "none", borderRadius: 12,
            padding: "16px 40px", fontSize: 16, fontWeight: 700, cursor: "pointer", letterSpacing: "0.5px"
          } as any}>
            Start Your Quest →
          </button>
        </div>
      )}
      {step === 1 && (
        <div style={{ maxWidth: 480, width: "100%" } as any}>
          <p style={{ color: "#4ade80", fontSize: 12, fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase", marginBottom: 8 } as any}>
            Step 1 of 2
          </p>
          <h2 style={{ color: "#e8f5e9", fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
            What's your main goal?
          </h2>
          <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 28 }}>Your journey adapts around it.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 } as any}>
            {goals.map((g) => (
              <button key={g.id} onClick={() => setGoal(g.id)} style={{
                background: goal === g.id ? "rgba(74,222,128,0.15)" : "rgba(255,255,255,0.04)",
                border: "2px solid " + (goal === g.id ? "#4ade80" : "rgba(255,255,255,0.08)"),
                borderRadius: 12, padding: "16px 20px", cursor: "pointer", textAlign: "left",
                display: "flex", alignItems: "center", gap: 16, transition: "all 0.15s"
              } as any}>
                <span style={{ fontSize: 28 }}>{g.icon}</span>
                <div>
                  <div style={{ color: "#e8f5e9", fontWeight: 700, fontSize: 16 }}>{g.label}</div>
                  <div style={{ color: "#6b7280", fontSize: 13, marginTop: 2 }}>{g.sub}</div>
                </div>
                {goal === g.id && <span style={{ marginLeft: "auto", color: "#4ade80", fontSize: 20 }}>✓</span>}
              </button>
            ))}
          </div>
          <button onClick={() => goal && setStep(2)} style={{
            background: goal ? "#4ade80" : "#1f2937", color: goal ? "#0a0a0f" : "#4b5563",
            border: "none", borderRadius: 12, padding: "16px 40px", fontSize: 16,
            fontWeight: 700, cursor: goal ? "pointer" : "default", width: "100%"
          } as any}>
            Continue →
          </button>
        </div>
      )}
      {step === 2 && (
        <div style={{ maxWidth: 480, width: "100%" } as any}>
          <p style={{ color: "#4ade80", fontSize: 12, fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase", marginBottom: 8 } as any}>
            Step 2 of 2
          </p>
          <h2 style={{ color: "#e8f5e9", fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
            Pick your virtual journey
          </h2>
          <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 28 }}>Every km you walk moves you forward on the map.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 } as any}>
            {JOURNEYS.map((j) => (
              <button key={j.id} onClick={() => setJourney(j.id)} style={{
                background: journey === j.id ? "rgba(74,222,128,0.15)" : "rgba(255,255,255,0.04)",
                border: "2px solid " + (journey === j.id ? "#4ade80" : "rgba(255,255,255,0.08)"),
                borderRadius: 12, padding: "16px 20px", cursor: "pointer", textAlign: "left",
                display: "flex", alignItems: "center", gap: 16, transition: "all 0.15s"
              } as any}>
                <span style={{ fontSize: 28 }}>{j.emoji}</span>
                <div>
                  <div style={{ color: "#e8f5e9", fontWeight: 700, fontSize: 16 }}>{j.name}</div>
                  <div style={{ color: "#6b7280", fontSize: 13, marginTop: 2 }}>{j.totalKm} km total distance</div>
                </div>
                {journey === j.id && <span style={{ marginLeft: "auto", color: "#4ade80", fontSize: 20 }}>✓</span>}
              </button>
            ))}
          </div>
          <button onClick={() => journey && onDone({ goal, journeyId: journey })} style={{
            background: journey ? "#4ade80" : "#1f2937", color: journey ? "#0a0a0f" : "#4b5563",
            border: "none", borderRadius: 12, padding: "16px 40px", fontSize: 16,
            fontWeight: 700, cursor: journey ? "pointer" : "default", width: "100%"
          } as any}>
            Begin Quest →
          </button>
        </div>
      )}
    </div>
  );
}

function JourneyMap({ journey, totalKm }: { journey: any, totalKm: number }) {
  const pct = Math.min((totalKm / journey.totalKm) * 100, 100);
  const nextMilestone = journey.milestones.find((m: any) => m.km > totalKm);
  const kmToNext = nextMilestone ? nextMilestone.km - totalKm : 0;

  return (
    <div style={{
      background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 16, padding: "20px"
    } as any}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 } as any}>
        <div>
          <p style={{ color: "#6b7280", fontSize: 11, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", margin: 0 } as any}>
            Virtual Journey
          </p>
          <h3 style={{ color: "#e8f5e9", fontSize: 20, fontWeight: 800, margin: "4px 0 0" }}>
            {journey.emoji} {journey.name}
          </h3>
        </div>
        <div style={{ textAlign: "right" } as any}>
          <span style={{ color: journey.color, fontSize: 26, fontWeight: 800 }}>{totalKm.toFixed(1)}</span>
          <span style={{ color: "#4b5563", fontSize: 12 }}>/{journey.totalKm} km</span>
        </div>
      </div>
      <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 100, height: 10, marginBottom: 12, overflow: "hidden" } as any}>
        <div style={{
          width: pct + "%", height: "100%", borderRadius: 100,
          background: "linear-gradient(90deg, " + journey.color + "99, " + journey.color + ")",
          transition: "width 0.5s ease", position: "relative"
        } as any}>
          <div style={{
            position: "absolute", right: -1, top: -3, width: 16, height: 16,
            background: journey.color, borderRadius: "50%",
            boxShadow: "0 0 8px " + journey.color
          } as any} />
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 } as any}>
        {journey.milestones.map((m: any) => (
          <div key={m.km} style={{
            flex: "0 0 auto", background: totalKm >= m.km ? "rgba(74,222,128,0.12)" : "rgba(255,255,255,0.04)",
            border: "1px solid " + (totalKm >= m.km ? "rgba(74,222,128,0.3)" : "rgba(255,255,255,0.06)"),
            borderRadius: 8, padding: "6px 10px", textAlign: "center"
          } as any}>
            <div style={{ fontSize: 10, color: totalKm >= m.km ? "#4ade80" : "#4b5563", fontWeight: 700 } as any}>
              {m.km} km
            </div>
            <div style={{ fontSize: 10, color: totalKm >= m.km ? "#e8f5e9" : "#374151", marginTop: 2 } as any}>
              {m.label}
            </div>
          </div>
        ))}
      </div>
      {nextMilestone && (
        <p style={{ color: "#6b7280", fontSize: 12, marginTop: 12, marginBottom: 0 } as any}>
          <span style={{ color: journey.color, fontWeight: 700 }}>{kmToNext.toFixed(1)} km</span> to {nextMilestone.label}
          <span style={{ color: "#374151" }}> · ~{Math.ceil(kmToNext / 2.4)} sessions away</span>
        </p>
      )}
      {!nextMilestone && (
        <p style={{ color: "#4ade80", fontSize: 13, fontWeight: 700, marginTop: 12, marginBottom: 0 } as any}>
          🎉 Journey complete! You walked {journey.name}.
        </p>
      )}
    </div>
  );
}

function StreakRow({ streak, consistency }: { streak: any, consistency: number }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 } as any}>
      {[
        { label: "Current Streak", value: streak.current, unit: "days", icon: "🔥", accent: "#f97316" },
        { label: "Longest Streak", value: streak.longest, unit: "days", icon: "🏆", accent: "#eab308" },
        { label: "This Month", value: consistency, unit: "%", icon: "📅", accent: "#4ade80" },
      ].map((s) => (
        <div key={s.label} style={{
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 14, padding: "16px 12px", textAlign: "center"
        } as any}>
          <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
          <div style={{ color: s.accent, fontSize: 28, fontWeight: 800, lineHeight: 1 } as any}>
            {s.value}<span style={{ fontSize: 14 }}>{s.unit}</span>
          </div>
          <div style={{ color: "#4b5563", fontSize: 10, fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", marginTop: 4 } as any}>
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}

function CalendarMonth({ sessions }: { sessions: any[] }) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const sessionDates = new Set(sessions.filter((s: any) => {
    const d = new Date(s.date);
    return d.getFullYear() === year && d.getMonth() === month;
  }).map((s: any) => s.date));

  const todayStr = today();
  const cells: any[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = year + "-" + String(month + 1).padStart(2, "0") + "-" + String(d).padStart(2, "0");
    cells.push({ d, dateStr, done: sessionDates.has(dateStr), isToday: dateStr === todayStr });
  }

  const monthName = now.toLocaleString("default", { month: "long" });

  return (
    <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 20 } as any}>
      <p style={{ color: "#e8f5e9", fontWeight: 700, fontSize: 15, marginBottom: 12 }}>
        {monthName} {year}
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 8 } as any}>
        {["S","M","T","W","T","F","S"].map((d, i) => (
          <div key={i} style={{ textAlign: "center", color: "#4b5563", fontSize: 10, fontWeight: 700, padding: "2px 0" } as any}>{d}</div>
        ))}
        {cells.map((c, i) => (
          <div key={i} style={{
            aspectRatio: "1", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: c?.isToday ? 800 : 500,
            background: c?.done ? "rgba(74,222,128,0.2)" : c?.isToday ? "rgba(255,255,255,0.06)" : "transparent",
            border: c?.isToday ? "1px solid rgba(255,255,255,0.2)" : "1px solid transparent",
            color: c?.done ? "#4ade80" : c?.isToday ? "#e8f5e9" : "#374151"
          } as any}>
            {c ? (c.done ? "✓" : c.d) : ""}
          </div>
        ))}
      </div>
    </div>
  );
}

function LogSessionModal({ onLog, onClose }: { onLog: any, onClose: any }) {
  const [duration, setDuration] = useState(30);
  const presets = [10, 20, 30, 45, 60];
  const km = kmPerSession(duration);
  const cal = calPerSession(duration);

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 24
    } as any}>
      <div style={{
        background: "#111318", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20,
        padding: 28, width: "100%", maxWidth: 380
      } as any}>
        <h3 style={{ color: "#e8f5e9", fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Log a Session</h3>
        <p style={{ color: "#6b7280", fontSize: 13, marginBottom: 24 }}>12% incline • 3 mph</p>
        <p style={{ color: "#9ca3af", fontSize: 12, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 12 } as any}>
          Duration
        </p>
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" } as any}>
          {presets.map((p) => (
            <button key={p} onClick={() => setDuration(p)} style={{
              background: duration === p ? "#4ade80" : "rgba(255,255,255,0.06)",
              color: duration === p ? "#0a0a0f" : "#9ca3af",
              border: "none", borderRadius: 10, padding: "8px 14px", fontSize: 14,
              fontWeight: 700, cursor: "pointer"
            } as any}>
              {p}m
            </button>
          ))}
        </div>
        <div style={{
          background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.15)",
          borderRadius: 12, padding: 16, marginBottom: 24,
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16
        } as any}>
          <div>
            <div style={{ color: "#4ade80", fontSize: 24, fontWeight: 800 }}>{km}</div>
            <div style={{ color: "#4b5563", fontSize: 11, fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase" } as any}>km earned</div>
          </div>
          <div>
            <div style={{ color: "#f97316", fontSize: 24, fontWeight: 800 }}>{cal}</div>
            <div style={{ color: "#4b5563", fontSize: 11, fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase" } as any}>calories</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12 } as any}>
          <button onClick={onClose} style={{
            flex: 1, background: "rgba(255,255,255,0.06)", color: "#9ca3af",
            border: "none", borderRadius: 12, padding: 14, fontSize: 15, fontWeight: 600, cursor: "pointer"
          } as any}>
            Cancel
          </button>
          <button onClick={() => onLog(duration)} style={{
            flex: 2, background: "#4ade80", color: "#0a0a0f",
            border: "none", borderRadius: 12, padding: 14, fontSize: 15, fontWeight: 800, cursor: "pointer"
          } as any}>
            ✓ Log It
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TreadmillQuest() {
  const [data, setData] = useState<any>(null);
  const [tab, setTab] = useState("home");
  const [showLog, setShowLog] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    loadData().then((d) => setData(d));
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleOnboard = ({ goal, journeyId }: { goal: string, journeyId: string }) => {
    const updated = { ...defaultData, goal, journeyId, onboardingDone: true };
    setData(updated);
    saveData(updated);
  };

  const handleLog = (duration: number) => {
    const todayStr = today();
    const alreadyToday = data.sessions.some((s: any) => s.date === todayStr);
    if (alreadyToday) {
      showToast("Already logged today! 🎉");
      setShowLog(false);
      return;
    }
    const session = { date: todayStr, duration, km: kmPerSession(duration), calories: calPerSession(duration) };
    const updated = { ...data, sessions: [...data.sessions, session] };
    setData(updated);
    saveData(updated);
    setShowLog(false);
    showToast("+" + session.km + " km added to your journey! 🏃");
  };

  const handleReset = () => {
    const fresh = { ...defaultData };
    setData(fresh);
    saveData(fresh);
  };

  if (!data) return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center" } as any}>
      <div style={{ color: "#4ade80", fontFamily: "monospace", fontSize: 18 }}>Loading...</div>
    </div>
  );

  if (!data.onboardingDone) return <OnboardingScreen onDone={handleOnboard} />;

  const journey = JOURNEYS.find((j) => j.id === data.journeyId) || JOURNEYS[0];
  const totalKm = getTotalKm(data.sessions);
  const streak = getStreak(data.sessions);
  const consistency = getMonthlyConsistency(data.sessions);
  const todayDone = data.sessions.some((s: any) => s.date === today());
  const totalHours = data.sessions.reduce((a: any, s: any) => a + s.duration, 0) / 60;
  const totalCalories = data.sessions.reduce((a: any, s: any) => a + s.calories, 0);

  const tabs = [
    { id: "home", label: "Home", icon: "🏠" },
    { id: "journey", label: "Journey", icon: "🗺️" },
    { id: "stats", label: "Stats", icon: "📊" },
    { id: "calendar", label: "Calendar", icon: "📅" },
  ];

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0a0f",
      fontFamily: "'Space Grotesk', 'Inter', sans-serif", color: "#e8f5e9",
      paddingBottom: 80
    } as any}>
      {toast && (
        <div style={{
          position: "fixed", top: 24, left: "50%", transform: "translateX(-50%)",
          background: "#1a2e1a", border: "1px solid rgba(74,222,128,0.3)",
          color: "#4ade80", padding: "12px 24px", borderRadius: 100,
          fontSize: 14, fontWeight: 600, zIndex: 200, whiteSpace: "nowrap",
          boxShadow: "0 4px 24px rgba(0,0,0,0.4)"
        } as any}>
          {toast}
        </div>
      )}
      <div style={{
        padding: "20px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center"
      } as any}>
        <div>
          <p style={{ color: "#4ade80", fontSize: 10, fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase", margin: 0 } as any}>
            12 · 3 · 30
          </p>
          <h1 style={{ color: "#e8f5e9", fontSize: 22, fontWeight: 800, margin: "2px 0 0", letterSpacing: "-0.5px" }}>
            Treadmill Quest
          </h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 } as any}>
          {streak.current > 0 && (
            <div style={{
              background: "rgba(249,115,22,0.15)", border: "1px solid rgba(249,115,22,0.3)",
              borderRadius: 20, padding: "6px 12px", display: "flex", alignItems: "center", gap: 6
            } as any}>
              <span style={{ fontSize: 16 }}>🔥</span>
              <span style={{ color: "#f97316", fontWeight: 800, fontSize: 16 }}>{streak.current}</span>
            </div>
          )}
        </div>
      </div>
      <div style={{ padding: "20px" } as any}>
        {tab === "home" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 } as any}>
            <div style={{
              background: todayDone
                ? "linear-gradient(135deg, rgba(74,222,128,0.12), rgba(74,222,128,0.06))"
                : "linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
              border: "1px solid " + (todayDone ? "rgba(74,222,128,0.3)" : "rgba(255,255,255,0.08)"),
              borderRadius: 20, padding: "24px"
            } as any}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" } as any}>
                <div>
                  <p style={{ color: "#6b7280", fontSize: 12, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 6 } as any}>
                    Today
                  </p>
                  <h2 style={{ fontSize: 28, fontWeight: 800, color: todayDone ? "#4ade80" : "#e8f5e9", margin: 0 }}>
                    {todayDone ? "Done ✓" : "Not yet"}
                  </h2>
                  <p style={{ color: "#4b5563", fontSize: 13, margin: "6px 0 0" } as any}>
                    {todayDone ? "Streak: " + streak.current + " days 🔥" : "30 minutes · 12% incline · 3 mph"}
                  </p>
                </div>
                {!todayDone && (
                  <button onClick={() => setShowLog(true)} style={{
                    background: "#4ade80", color: "#0a0a0f", border: "none",
                    borderRadius: 14, padding: "12px 20px", fontSize: 15,
                    fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap"
                  } as any}>
                    + Log
                  </button>
                )}
              </div>
            </div>
            <StreakRow streak={streak} consistency={consistency} />
            <JourneyMap journey={journey} totalKm={totalKm} />
          </div>
        )}
        {tab === "journey" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 } as any}>
            <JourneyMap journey={journey} totalKm={totalKm} />
          </div>
        )}
        {tab === "stats" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 } as any}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 } as any}>
              {[
                { label: "Total Sessions", value: data.sessions.length, unit: "", icon: "🏃" },
                { label: "Total Hours", value: totalHours.toFixed(1), unit: "h", icon: "⏱️" },
                { label: "Total Distance", value: totalKm.toFixed(1), unit: "km", icon: "📍" },
                { label: "Calories Burned", value: totalCalories.toLocaleString(), unit: "", icon: "🔥" },
              ].map((s) => (
                <div key={s.label} style={{
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 14, padding: 18
                } as any}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
                  <div style={{ color: "#e8f5e9", fontSize: 28, fontWeight: 800, lineHeight: 1 } as any}>
                    {s.value}<span style={{ fontSize: 14, color: "#6b7280" }}>{s.unit}</span>
                  </div>
                  <div style={{ color: "#4b5563", fontSize: 11, fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", marginTop: 4 } as any}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab === "calendar" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 } as any}>
            <CalendarMonth sessions={data.sessions} />
          </div>
        )}
      </div>
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: "rgba(10,10,15,0.95)", backdropFilter: "blur(12px)",
        borderTop: "1px solid rgba(255,255,255,0.07)",
        display: "flex", justifyContent: "space-around", padding: "10px 0 16px"
      } as any}>
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            background: "none", border: "none", cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
            padding: "4px 16px"
          } as any}>
            <span style={{ fontSize: 20 }}>{t.icon}</span>
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.5px",
              color: tab === t.id ? "#4ade80" : "#374151",
              textTransform: "uppercase"
            } as any}>
              {t.label}
            </span>
          </button>
        ))}
      </div>
      {showLog && <LogSessionModal onLog={handleLog} onClose={() => setShowLog(false)} />}
    </div>
  );
}
