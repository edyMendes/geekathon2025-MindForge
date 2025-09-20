import { listProfiles, getHistory, loadProfile } from "../hooks/useSettings.js";
import { useState, useEffect } from "react";

function ProfileItem({ profileName }) {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const data = await loadProfile(profileName);
        setProfile(data);
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };
    loadProfileData();
  }, [profileName]);

  if (!profile) {
    return <li className="mb-1 text-slate-500 dark:text-slate-400">Loading...</li>;
  }

  return (
    <li className="mb-1 text-slate-700 dark:text-slate-300">
      {profileName} — {profile.quantity} birds, {(+profile.weight||0).toFixed(2)}kg, age {profile.age} weeks
    </li>
  );
}

export default function Relatorios() {
  const [profiles, setProfiles] = useState([]);

  useEffect(() => {
    const loadProfiles = async () => {
      try {
        const profileList = await listProfiles();
        setProfiles(profileList);
      } catch (error) {
        console.error('Error loading profiles:', error);
      }
    };
    loadProfiles();
  }, []);

  const exportAll = async () => {
    if (!profiles.length) return alert("No profiles.");
    try {
      let zipCsv = "";
      for (let idx = 0; idx < profiles.length; idx++) {
        const p = profiles[idx];
        const hist = getHistory(p);
        zipCsv += `# ${p}\n`;
        zipCsv += "date,weight_kg,eggs,feed_kg,feed_per_egg_kg\n";
        hist.forEach((h) => zipCsv += `${h.date},${h.weight},${h.eggs},${h.feed},${h.eggs>0?(h.feed/h.eggs).toFixed(3):""}\n`);
        if (idx < profiles.length - 1) zipCsv += "\n";
      }
      const blob = new Blob([zipCsv], { type: "text/plain;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = "reports_all.csv"; a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert("Error exporting data. Please try again.");
    }
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
              return <ProfileItem key={p} profileName={p} />;
            })}
          </ul>
          <button onClick={exportAll} className="btn-sec px-4 py-2 rounded mt-4">Export CSV (all)</button>
        </>
      )}
    </div>
  );
}
