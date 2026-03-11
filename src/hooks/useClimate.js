/**
 * useClimate — hook React pour le pipeline Paysagea
 *
 * Flux :
 *   1. search(query)        → suggestions Google Places (autocomplete)
 *   2. resolve(suggestion)  → place_id → lat/lon → météo + normales annuelles
 *   3. projectContext prêt  → store Zustand / LLM
 */

import { useState, useCallback, useRef } from "react";

const API_BASE = import.meta.env.VITE_CLIMATE_API_URL ?? "http://localhost:3001";

export function useClimate() {
  const [suggestions, setSuggestions] = useState([]);
  const [location, setLocation]       = useState(null);
  const [climate, setClimate]         = useState(null);     // météo temps réel
  const [annual, setAnnual]           = useState(null);     // normales annuelles
  const [loading, setLoading]         = useState({ suggestions: false, climate: false });
  const [error, setError]             = useState(null);

  const debounceTimer = useRef(null);

  // ── Autocomplete (debounced 300ms) ─────────────────────────────────────────
  const search = useCallback((query) => {
    clearTimeout(debounceTimer.current);
    if (!query || query.length < 2) { setSuggestions([]); return; }

    debounceTimer.current = setTimeout(async () => {
      setLoading((l) => ({ ...l, suggestions: true }));
      try {
        const res = await fetch(`${API_BASE}/geocode/search?q=${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error("Erreur autocomplétion");
        setSuggestions(await res.json());
      } catch (e) {
        console.error("[useClimate/search]", e);
        setSuggestions([]);
      } finally {
        setLoading((l) => ({ ...l, suggestions: false }));
      }
    }, 300);
  }, []);

  // ── Resolve : sélection → location + météo + normales annuelles ────────────
  const resolve = useCallback(async (suggestion) => {
    setError(null);
    setClimate(null);
    setAnnual(null);
    setSuggestions([]);
    setLoading((l) => ({ ...l, climate: true }));

    try {
      // 1. Résoudre place_id → lat/lon
      const geoRes = await fetch(
        `${API_BASE}/geocode/resolve?place_id=${encodeURIComponent(suggestion.place_id)}`
      );
      if (!geoRes.ok) {
        const err = await geoRes.json();
        throw new Error(err.error ?? "Adresse introuvable");
      }
      const loc = await geoRes.json();
      setLocation(loc);

      // 2. Météo temps réel + normales annuelles en parallèle
      const [climateRes, annualRes] = await Promise.all([
        fetch(`${API_BASE}/climate?lat=${loc.lat}&lon=${loc.lon}`),
        fetch(`${API_BASE}/climate/annual?lat=${loc.lat}&lon=${loc.lon}`),
      ]);

      if (!climateRes.ok) throw new Error("Données météo indisponibles");
      if (!annualRes.ok)  throw new Error("Données annuelles indisponibles");

      const [climateData, annualData] = await Promise.all([
        climateRes.json(),
        annualRes.json(),
      ]);

      setClimate(climateData);
      setAnnual(annualData);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading((l) => ({ ...l, climate: false }));
    }
  }, []);

  // ── Reset ──────────────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    setLocation(null);
    setClimate(null);
    setAnnual(null);
    setSuggestions([]);
    setError(null);
  }, []);

  // ── ProjectContext complet pour le LLM ────────────────────────────────────
  const projectContext = location && climate && annual
    ? {
        location,
        climate_profile:  climate,   // météo actuelle + 7j
        annual_profile:   annual,    // normales 12 mois : temp, précip, gel, zone rusticité…
        source: { geocoder: "Google Places", weather: "Open-Meteo" },
      }
    : null;

  return {
    suggestions,
    location,
    climate,
    annual,
    projectContext,
    error,
    loading,
    isLoading: loading.climate || loading.suggestions,
    search,
    resolve,
    reset,
  };
}
