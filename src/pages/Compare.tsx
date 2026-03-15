import React, { useEffect, useState, useMemo } from "react";
import { Search, BarChart3 } from "lucide-react";
import { ComparisonBarChart, SafetyRing } from "../components/Charts";
import { buildApiUrl } from "../lib/api";

interface StateCrime {
  id: string;
  state: string;
  ipc_crimes: number;
  women_crimes: number;
  cyber_crimes: number;
  safety_score: number;
}

export const Compare: React.FC = () => {

  const [states, setStates] = useState<StateCrime[]>([]);
  const [regionAId, setRegionAId] = useState("");
  const [regionBId, setRegionBId] = useState("");
  const [initialSelectionApplied, setInitialSelectionApplied] = useState(false);

  const compareParams = useMemo(() => {
    const [, queryString = ""] = window.location.hash.split("?");
    const params = new URLSearchParams(queryString);
    return {
      stateA: params.get("stateA") ?? "",
      stateB: params.get("stateB") ?? "",
    };
  }, []);

  const normalizeState = (value: string) =>
    STATE_ALIASES[
      value
        .trim()
        .toLowerCase()
        .replace(/&/g, " and ")
        .replace(/[().,-]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
    ] ??
    value
      .trim()
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[().,-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  /* ---------------- FETCH DATA ---------------- */

  useEffect(() => {
    fetch(buildApiUrl("/states"))
      .then(res => res.json())
      .then(data => {

        const formatted = data.map((row:any) => ({
          id: String(row.id),
          state: row.state,
          ipc_crimes: row.ipc_crimes,
          women_crimes: row.women_crimes,
          cyber_crimes: row.cyber_crimes,
          safety_score: row.safety_score,
        }));

        setStates(formatted);

        if (formatted.length > 1) {
          setRegionAId(formatted[0].id);
          setRegionBId(formatted[1].id);
        }

      });
  }, []);

  useEffect(() => {
    if (initialSelectionApplied || states.length === 0) return;

    const matchedA = states.find((state) => normalizeState(state.state) === normalizeState(compareParams.stateA));
    const matchedB = states.find((state) => normalizeState(state.state) === normalizeState(compareParams.stateB));

    if (matchedA) {
      setRegionAId(matchedA.id);
    }

    if (matchedB) {
      setRegionBId(matchedB.id);
    }

    setInitialSelectionApplied(true);
  }, [compareParams.stateA, compareParams.stateB, initialSelectionApplied, states]);

  /* ---------------- SELECT STATES ---------------- */

  const regionA = useMemo(
    () => states.find(s => s.id === regionAId),
    [states, regionAId]
  );

  const regionB = useMemo(
    () => states.find(s => s.id === regionBId),
    [states, regionBId]
  );

  if (!regionA || !regionB) return null;

  const scoreA = regionA.safety_score;
  const scoreB = regionB.safety_score;

  /* ---------------- COMPARISON STATS ---------------- */

  const stats = [
    {
      label: "IPC Crimes",
      a: regionA.ipc_crimes,
      b: regionB.ipc_crimes,
      better: "lower"
    },
    {
      label: "Women Crimes",
      a: regionA.women_crimes,
      b: regionB.women_crimes,
      better: "lower"
    },
    {
      label: "Cyber Crimes",
      a: regionA.cyber_crimes,
      b: regionB.cyber_crimes,
      better: "lower"
    },
    {
      label: "Safety Score",
      a: scoreA,
      b: scoreB,
      better: "higher"
    }
  ];

  const comparisonChartData = [
    { label: "IPC", a: regionA.ipc_crimes, b: regionB.ipc_crimes },
    { label: "Women", a: regionA.women_crimes, b: regionB.women_crimes },
    { label: "Cyber", a: regionA.cyber_crimes, b: regionB.cyber_crimes },
  ];

  const getWinner = (better:string, a:number, b:number) => {
    if (better === "higher") return a > b ? "A" : "B";
    return a < b ? "A" : "B";
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="pt-32 pb-20 px-6 max-w-6xl mx-auto">

      <h1 className="text-4xl font-bold text-white mb-12">
        Compare States
      </h1>

      {/* STATE SELECTORS */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

        {/* STATE A */}

        <div>

          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"/>

            <select
              value={regionAId}
              onChange={(e)=>setRegionAId(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl py-4 pl-12 pr-4 text-white"
            >
              {states.map(s => (
                <option key={s.id} value={s.id}>
                  {s.state}
                </option>
              ))}
            </select>

          </div>

          <div className="bg-surface border border-border rounded-3xl p-8 text-center">

            <div className="flex justify-center mb-6">
              <SafetyRing score={scoreA} size={160}/>
            </div>

            <h2 className="text-2xl font-bold text-white">
              {regionA.state}
            </h2>

          </div>

        </div>

        {/* STATE B */}

        <div>

          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"/>

            <select
              value={regionBId}
              onChange={(e)=>setRegionBId(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl py-4 pl-12 pr-4 text-white"
            >
              {states.map(s => (
                <option key={s.id} value={s.id}>
                  {s.state}
                </option>
              ))}
            </select>

          </div>

          <div className="bg-surface border border-border rounded-3xl p-8 text-center">

            <div className="flex justify-center mb-6">
              <SafetyRing score={scoreB} size={160}/>
            </div>

            <h2 className="text-2xl font-bold text-white">
              {regionB.state}
            </h2>

          </div>

        </div>

      </div>

      {/* COMPARISON TABLE */}

      <div className="mt-12 space-y-4">

        {stats.map(stat => {

          const winner = getWinner(stat.better, stat.a, stat.b);

          return (

            <div
              key={stat.label}
              className="bg-surface border border-border rounded-2xl p-6 grid grid-cols-3 items-center"
            >

              <div className={`text-center ${winner==="A" ? "text-green-500 font-bold" : "text-gray-400"}`}>
                {stat.a.toLocaleString()}
              </div>

              <div className="text-center text-xs text-gray-500 uppercase tracking-wider">
                {stat.label}
              </div>

              <div className={`text-center ${winner==="B" ? "text-green-500 font-bold" : "text-gray-400"}`}>
                {stat.b.toLocaleString()}
              </div>

            </div>

          );

        })}

      </div>

      {/* COMPARISON CHART */}

      <div className="mt-12 bg-surface border border-border p-8 rounded-3xl">

        <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-green-500"/>
          Crime Totals Comparison
        </h3>

        <ComparisonBarChart data={comparisonChartData} height={320} />

        <div className="mt-8 flex justify-center gap-8">

          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"/>
            <span className="text-xs font-mono text-gray-400 uppercase">
              {regionA.state}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"/>
            <span className="text-xs font-mono text-gray-400 uppercase">
              {regionB.state}
            </span>
          </div>

        </div>

      </div>

    </div>
  );
};
  const STATE_ALIASES: Record<string, string> = {
    "uttarpradesh": "uttar pradesh",
    "uttar pradesh": "uttar pradesh",
    "tamilnadu": "tamil nadu",
    "tamil nadu": "tamil nadu",
    "telengana": "telangana",
    "telangana": "telangana",
    "meghalya": "meghalaya",
    "meghalaya": "meghalaya",
    "jammu kashmir": "jammu and kashmir",
    "jammu and kashmir": "jammu and kashmir",
    "uttaranchal": "uttarakhand",
    "uttarakhand": "uttarakhand",
    "orissa": "odisha",
    "odisha": "odisha",
    "a and n islands": "andaman and nicobar islands",
    "a&n islands": "andaman and nicobar islands",
    "andaman and nicobar": "andaman and nicobar islands",
    "d and n haveli": "dadra and nagar haveli and daman and diu",
    "d&n haveli": "dadra and nagar haveli and daman and diu",
    "dadra and nagar haveli": "dadra and nagar haveli and daman and diu",
    "daman and diu": "dadra and nagar haveli and daman and diu",
  };
