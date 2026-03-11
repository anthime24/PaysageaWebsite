/**
 * AddressSearch — composant d'autocomplétion d'adresse
 *
 * Props :
 *   onResolve(projectContext) — appelé quand location + climate sont prêts
 *
 * Dépendances : useClimate.js (dans le même dossier)
 * Style : Tailwind CSS (classes utilitaires uniquement)
 */

import { useState, useRef, useEffect } from "react";
import { useClimate } from "../hooks/useClimate";

export default function AddressSearch({ onResolve }) {
  const [inputValue, setInputValue] = useState("");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  const { suggestions, location, climate, annual, projectContext, error, loading, search, resolve, reset } =
    useClimate();

  // Fermer dropdown au clic extérieur
  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const lastResolvedId = useRef(null);

  // Remonter le projectContext dès qu'il est prêt
  useEffect(() => {
    const currentId = projectContext?.location?.place_id || null;
    if (currentId !== lastResolvedId.current) {
      console.log("[AddressSearch] Context update:", currentId ? `New location resolved: ${currentId}` : "Cleared");
      lastResolvedId.current = currentId;
      onResolve?.(projectContext);
    }
  }, [projectContext, onResolve]);

  function handleChange(e) {
    const val = e.target.value;
    setInputValue(val);
    setOpen(true);
    search(val);
    if (!val) reset();
  }

  function handleSelect(suggestion) {
    setInputValue(suggestion.short_label || suggestion.label);
    setOpen(false);
    resolve(suggestion);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      if (suggestions.length > 0) {
        handleSelect(suggestions[0]);
      } else if (inputValue.trim()) {
        setOpen(false);
      }
    }
    if (e.key === "Escape") setOpen(false);
  }

  const showDropdown = open && suggestions.length > 0;
  const isDone = !!projectContext;

  return (
    <div className="relative w-full max-w-xl" ref={wrapperRef}>
      {/* ── Input ─────────────────────────────────────────────── */}
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) setOpen(true);
          }}
          placeholder="Entrez votre ville ou adresse"
          className={[
            "w-full px-6 py-4 pr-12 rounded-2xl border text-sm outline-none transition-all duration-300 shadow-sm",
            "bg-white/90 text-[var(--color-structure)] placeholder:text-gray-400 font-medium",
            isDone
              ? "border-[var(--color-nature)] shadow-md shadow-[#7b9872]/10"
              : "border-gray-100 focus:border-[var(--color-nature)]/50 focus:bg-white focus:shadow-md",
          ].join(" ")}
        />

        {/* Spinner / icône état */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center">
          {loading.suggestions || loading.climate ? (
            <Spinner />
          ) : isDone ? (
            <div className="w-6 h-6 rounded-full bg-[var(--color-nature)] flex items-center justify-center text-white scale-in shadow-sm">
              <span className="text-xs">✓</span>
            </div>
          ) : (
            <span className="text-gray-300 text-lg group-focus-within:text-[var(--color-nature)] transition-colors">🔍</span>
          )}
        </div>
      </div>

      {/* ── Dropdown suggestions ───────────────────────────────── */}
      {showDropdown && (
        <ul className="absolute z-[100] mt-3 w-full bg-white/95 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
          {suggestions.map((s, i) => (
            <li
              key={s.place_id ?? i}
              onClick={() => handleSelect(s)}
              className="px-6 py-4 cursor-pointer hover:bg-[var(--color-nature)]/5 transition-colors border-b border-gray-50 last:border-0"
            >
              <p className="text-sm font-bold text-[var(--color-structure)] truncate">
                {s.short_label}
              </p>
              <p className="text-xs text-gray-400 truncate mt-0.5">{s.label}</p>
            </li>
          ))}
        </ul>
      )}

      {/* ── Erreur ────────────────────────────────────────────── */}
      {error && (
        <div className="mt-3 px-4 py-2 bg-red-50 border border-red-100 rounded-xl text-xs text-red-500 flex items-center gap-2 animate-in slide-in-from-top-1">
          <span>⚠</span> {error}
        </div>
      )}

      {/* ── Résultat affiché (Masqué dans le dashboard selon la demande utilisateur) */}
    </div>
  );
}

// ─── Sous-composants ──────────────────────────────────────────────────────────

function Spinner() {
  return (
    <svg className="animate-spin h-5 w-5 text-[var(--color-nature)]" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-10" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

function ClimateCard({ location, climate, annual }) {
  if (!location || !climate) return null;
  const { current = {}, today = {} } = climate;
  const summary = annual?.summary ?? {};

  const metrics = [
    { icon: "🌡️", label: "Temp. Actuelle", value: `${current.temp_c} °C` },
    { icon: "🌿", label: "Zone USDA", value: summary.hardiness_zone ? summary.hardiness_zone.split('(')[0] : "—" },
    { icon: "🌧️", label: "Pluie annuelle", value: summary.precip_annual_mm ? `${summary.precip_annual_mm} mm` : "—" },
    { icon: "❄️", label: "Jours de gel", value: summary.frost_days_per_year ?? "—" },
    { icon: "☀️", label: "UV index", value: today.uv_index ?? "—" },
    { icon: "💨", label: "Vent", value: `${current.windspeed_kmh} km/h` },
  ];

  return (
    <div className="mt-6 rounded-3xl border border-gray-100 overflow-hidden bg-white/60 backdrop-blur-md shadow-xl shadow-gray-200/20 animate-in fade-in slide-in-from-bottom-3 duration-500">
      {/* Header localisation */}
      <div className="bg-[var(--color-nature)]/5 px-6 py-5 flex items-start gap-4 border-b border-gray-50">
        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-xl shadow-sm border border-gray-100 shrink-0">
          <span>📍</span>
        </div>
        <div>
          <p className="text-[10px] text-[var(--color-nature)] font-bold uppercase tracking-[0.2em] mb-1">
            Géo-analyse confirmée
          </p>
          <p className="text-lg font-bold text-[var(--color-structure)]">
            {location.short_label ?? location.label}
          </p>
          <p className="text-[10px] text-gray-400 font-mono mt-0.5 tracking-wider">
            {location.lat.toFixed(4)}, {location.lon.toFixed(4)}
          </p>
        </div>
      </div>

      {/* Grille métriques */}
      <div className="grid grid-cols-3 divide-x divide-y divide-gray-50">
        {metrics.map((m) => (
          <div key={m.label} className="px-5 py-5 hover:bg-white transition-colors leading-tight group">
            <p className="text-[10px] text-gray-400 mb-2 font-bold uppercase tracking-widest group-hover:text-[var(--color-nature)] transition-colors">
              {m.icon} {m.label}
            </p>
            <p className="text-base font-bold text-[var(--color-structure)]">{m.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
