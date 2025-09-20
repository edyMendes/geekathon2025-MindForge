import { listProfiles, getHistory, loadProfile } from "../hooks/useSettings.js";

export default function Relatorios() {
  const profiles = listProfiles();

  const exportAll = () => {
    if (!profiles.length) return alert("No profiles.");
    let zipCsv = "";
    profiles.forEach((p, idx) => {
      const hist = getHistory(p);
      zipCsv += `# ${p}\n`;
      zipCsv += "date,weight_kg,eggs,feed_kg,feed_per_egg_kg\n";
      hist.forEach((h) => zipCsv += `${h.date},${h.weight},${h.eggs},${h.feed},${h.eggs>0?(h.feed/h.eggs).toFixed(3):""}\n`);
      if (idx < profiles.length - 1) zipCsv += "\n";
    });
    const blob = new Blob([zipCsv], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "reports_all.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="card shadow-sm p-6" data-aos="fade-up">
      <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-4">Reports</h2>
      {profiles.length === 0 ? (
        <p className="text-slate-500 dark:text-slate-400">No profiles or records.</p>
      ) : (
        <>
          <ul className="list-disc ml-6">
            {profiles.map((p) => {
              const g = loadProfile(p);
              return <li key={p} className="mb-1 text-slate-700 dark:text-slate-300">{p} — {g.quantity} birds, {(+g.weight||0).toFixed(2)}kg, age {g.age} weeks</li>;
            })}
          </ul>
          <button onClick={exportAll} className="btn-sec px-4 py-2 rounded mt-4">Export CSV (all)</button>
        </>
      )}
    </div>
  );
}
