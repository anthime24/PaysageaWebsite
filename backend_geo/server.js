/**
 * Paysagea – Climate API
 * Stack : Node.js + Express
 *
 * Endpoints :
 *   GET /geocode/search?q=Lyon              → autocomplete Google Places
 *   GET /geocode/resolve?place_id=...       → lat/lon depuis un place_id Google
 *   GET /climate?lat=45.75&lon=4.85         → profil météo temps réel (7j)
 *   GET /climate/annual?lat=45.75&lon=4.85  → normales annuelles (12 mois glissants)
 */

import express from "express";
import cors from "cors";
import NodeCache from "node-cache";
import "dotenv/config";
import { writeFileSync, mkdirSync } from "fs";

const app = express();
const PORT = process.env.PORT || 3001;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

if (!GOOGLE_API_KEY) {
  console.warn("⚠️  GOOGLE_API_KEY manquante — /geocode/search ne fonctionnera pas");
}

// ─── Cache ────────────────────────────────────────────────────────────────────
const geocodeCache = new NodeCache({ stdTTL: 60 * 60 * 24 });      // 24h
const climateCache = new NodeCache({ stdTTL: 60 * 30 });            // 30 min
const annualCache = new NodeCache({ stdTTL: 60 * 60 * 24 * 7 });  // 7 jours (données stables)

app.use(cors());
app.use(express.json());

// ─── HELPERS ──────────────────────────────────────────────────────────────────
async function fetchWithTimeout(url, options = {}, timeoutMs = 10000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

function avg(arr) {
  const valid = arr.filter((v) => v !== null && v !== undefined && !isNaN(v));
  if (!valid.length) return null;
  return Math.round((valid.reduce((a, b) => a + b, 0) / valid.length) * 10) / 10;
}

function sum(arr) {
  const valid = arr.filter((v) => v !== null && v !== undefined && !isNaN(v));
  if (!valid.length) return null;
  return Math.round(valid.reduce((a, b) => a + b, 0) * 10) / 10;
}

// ─── ROUTE : Autocomplete Google Places ───────────────────────────────────────
app.get("/geocode/search", async (req, res) => {
  const q = req.query.q?.trim();
  if (!q || q.length < 2) return res.json([]);

  const cacheKey = `gplaces:${q.toLowerCase()}`;
  const cached = geocodeCache.get(cacheKey);
  if (cached) return res.json(cached);

  try {
    const url =
      `https://maps.googleapis.com/maps/api/place/autocomplete/json` +
      `?input=${encodeURIComponent(q)}&language=fr&types=geocode&key=${GOOGLE_API_KEY}`;

    const raw = await fetchWithTimeout(url);
    const data = await raw.json();

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      throw new Error(`Google Places error: ${data.status}`);
    }

    const suggestions = (data.predictions ?? []).map((p) => ({
      label: p.description,
      short_label: p.structured_formatting?.main_text ?? p.description,
      secondary: p.structured_formatting?.secondary_text ?? "",
      place_id: p.place_id,
    }));

    geocodeCache.set(cacheKey, suggestions);
    res.json(suggestions);
  } catch (err) {
    console.error("[geocode/search]", err.message);
    res.status(502).json({ error: "Google Places indisponible", detail: err.message });
  }
});

// ─── ROUTE : Resolve place_id → lat/lon ──────────────────────────────────────
app.get("/geocode/resolve", async (req, res) => {
  const place_id = req.query.place_id?.trim();
  if (!place_id) return res.status(400).json({ error: "Paramètre place_id requis" });

  const cacheKey = `gresolve:${place_id}`;
  const cached = geocodeCache.get(cacheKey);
  if (cached) return res.json(cached);

  try {
    const url =
      `https://maps.googleapis.com/maps/api/place/details/json` +
      `?place_id=${encodeURIComponent(place_id)}` +
      `&fields=geometry,formatted_address,name&language=fr&key=${GOOGLE_API_KEY}`;

    const raw = await fetchWithTimeout(url);
    const data = await raw.json();

    if (data.status !== "OK") throw new Error(`Google Places Details error: ${data.status}`);

    const result = {
      label: data.result.formatted_address,
      short_label: data.result.name,
      lat: data.result.geometry.location.lat,
      lon: data.result.geometry.location.lng,
      place_id,
    };

    geocodeCache.set(cacheKey, result);
    res.json(result);
  } catch (err) {
    console.error("[geocode/resolve]", err.message);
    res.status(502).json({ error: "Google Places indisponible", detail: err.message });
  }
});

// ─── ROUTE : Profil météo temps réel ─────────────────────────────────────────
app.get("/climate", async (req, res) => {
  const lat = parseFloat(req.query.lat);
  const lon = parseFloat(req.query.lon);
  if (isNaN(lat) || isNaN(lon))
    return res.status(400).json({ error: "Paramètres lat et lon requis" });

  const cacheKey = `climate:${lat.toFixed(2)}:${lon.toFixed(2)}`;
  const cached = climateCache.get(cacheKey);
  if (cached) return res.json(cached);

  try {
    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${lat}&longitude=${lon}` +
      `&current_weather=true` +
      `&hourly=relativehumidity_2m,precipitation,windspeed_10m,cloudcover,uv_index` +
      `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,sunrise,sunset` +
      `&timezone=auto&forecast_days=7`;

    const raw = await fetchWithTimeout(url);
    const data = await raw.json();

    const current = data.current_weather ?? {};

    // Trouver l'index de l'heure actuelle dans le tableau hourly
    const nowISO = current.time;
    const hourlyTimes = data.hourly?.time ?? [];
    const currentHourIndex = nowISO
      ? hourlyTimes.findIndex((t) => t === nowISO)
      : 0;
    const hi = currentHourIndex >= 0 ? currentHourIndex : 0;

    const hNow = (key) => data.hourly?.[key]?.[hi] ?? null;
    const d0 = (key) => data.daily?.[key]?.[0] ?? null;

    const precipWeek = sum(data.daily?.precipitation_sum ?? []);
    const avgHumidity = avg(data.hourly?.relativehumidity_2m?.slice(0, 24) ?? []);

    const climate_profile = {
      current: {
        temp_c: current.temperature ?? null,
        windspeed_kmh: current.windspeed ?? null,
        wind_direction: current.winddirection ?? null,
        is_day: current.is_day ?? null,
        weathercode: current.weathercode ?? null,
      },
      today: {
        temp_max_c: d0("temperature_2m_max"),
        temp_min_c: d0("temperature_2m_min"),
        precip_mm: d0("precipitation_sum"),
        sunrise: d0("sunrise"),
        sunset: d0("sunset"),
        humidity_avg_pct: avgHumidity,
        cloudcover_pct: hNow("cloudcover"),   // ← heure actuelle (fix)
        uv_index: hNow("uv_index"),     // ← heure actuelle (fix)
      },
      week: {
        precip_total_mm: precipWeek,
        temp_max_c: Math.max(...(data.daily?.temperature_2m_max?.filter(Boolean) ?? [])) || null,
        temp_min_c: Math.min(...(data.daily?.temperature_2m_min?.filter(Boolean) ?? [])) || null,
      },
      timezone: data.timezone ?? null,
      timezone_abbreviation: data.timezone_abbreviation ?? null,
      generated_at: new Date().toISOString(),
    };

    climateCache.set(cacheKey, climate_profile);
    res.json(climate_profile);
  } catch (err) {
    console.error("[climate]", err.message);
    res.status(502).json({ error: "Open-Meteo indisponible", detail: err.message });
  }
});

// ─── ROUTE : Normales annuelles (12 mois glissants) ──────────────────────────
// GET /climate/annual?lat=45.75&lon=4.85
//
// Retourne les normales climatiques sur les 12 derniers mois :
// températures moyennes/min/max, précipitations, humidité, ensoleillement,
// jours de gel, classification botanique (zone de rusticité approx.)
app.get("/climate/annual", async (req, res) => {
  const lat = parseFloat(req.query.lat);
  const lon = parseFloat(req.query.lon);
  if (isNaN(lat) || isNaN(lon))
    return res.status(400).json({ error: "Paramètres lat et lon requis" });

  const cacheKey = `annual:${lat.toFixed(2)}:${lon.toFixed(2)}`;
  const cached = annualCache.get(cacheKey);
  if (cached) return res.json(cached);

  try {
    // Calculer les dates : 12 mois glissants
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 5); // Open-Meteo archive a ~5 jours de délai
    const startDate = new Date(endDate);
    startDate.setFullYear(startDate.getFullYear() - 1);

    const fmt = (d) => d.toISOString().split("T")[0]; // YYYY-MM-DD

    const url =
      `https://archive-api.open-meteo.com/v1/archive` +
      `?latitude=${lat}&longitude=${lon}` +
      `&start_date=${fmt(startDate)}&end_date=${fmt(endDate)}` +
      `&daily=temperature_2m_max,temperature_2m_min,temperature_2m_mean,` +
      `precipitation_sum,sunshine_duration,windspeed_10m_max` +
      `&hourly=relativehumidity_2m` +
      `&timezone=auto`;

    const raw = await fetchWithTimeout(url, {}, 15000); // timeout plus long pour l'archive
    const data = await raw.json();

    if (data.error) throw new Error(data.reason ?? "Open-Meteo Archive error");

    const daily = data.daily ?? {};
    const hourly = data.hourly ?? {};

    // ── Températures ─────────────────────────────────────────────────────────
    const tempMean = avg(daily.temperature_2m_mean ?? []);
    const tempMax = Math.max(...(daily.temperature_2m_max?.filter(v => v !== null) ?? [-Infinity]));
    const tempMin = Math.min(...(daily.temperature_2m_min?.filter(v => v !== null) ?? [Infinity]));

    // ── Gel (jours où temp min < 0°C) ────────────────────────────────────────
    const frostDays = (daily.temperature_2m_min ?? [])
      .filter((v) => v !== null && v < 0).length;

    // ── Précipitations ───────────────────────────────────────────────────────
    const precipAnnual = sum(daily.precipitation_sum ?? []);

    // ── Ensoleillement (sunshine_duration en secondes → heures/jour) ─────────
    const sunshineHoursPerDay = daily.sunshine_duration?.length
      ? Math.round((avg(daily.sunshine_duration) / 3600) * 10) / 10
      : null;

    // ── Humidité moyenne annuelle ─────────────────────────────────────────────
    const humidityAnnual = avg(hourly.relativehumidity_2m ?? []);

    // ── Moyennes mensuelles (pour graphiques futurs) ──────────────────────────
    const months = Array.from({ length: 12 }, (_, i) => i); // 0=Jan … 11=Dec
    const monthly = months.map((m) => {
      const times = daily.time ?? [];
      const indices = times.reduce((acc, t, i) => {
        if (new Date(t).getMonth() === m) acc.push(i);
        return acc;
      }, []);

      const pick = (key) => indices.map((i) => daily[key]?.[i]).filter((v) => v !== null);

      return {
        month: m + 1, // 1=Jan … 12=Dec
        temp_mean_c: avg(pick("temperature_2m_mean")),
        temp_max_c: avg(pick("temperature_2m_max")),
        temp_min_c: avg(pick("temperature_2m_min")),
        precip_mm: sum(pick("precipitation_sum")),
        frost_days: pick("temperature_2m_min").filter((v) => v < 0).length,
        sunshine_h_day: pick("sunshine_duration").length
          ? Math.round((avg(pick("sunshine_duration")) / 3600) * 10) / 10
          : null,
      };
    });

    // ── Classification botanique approximative (zones USDA simplifiées) ───────
    let hardiness_zone;
    if (tempMin >= 10) hardiness_zone = "Zone 12+ (tropical)";
    else if (tempMin >= 4) hardiness_zone = "Zone 11 (subtropical)";
    else if (tempMin >= -1) hardiness_zone = "Zone 10 (méditerranéen chaud)";
    else if (tempMin >= -7) hardiness_zone = "Zone 9 (méditerranéen)";
    else if (tempMin >= -12) hardiness_zone = "Zone 8 (océanique doux)";
    else if (tempMin >= -18) hardiness_zone = "Zone 7 (tempéré)";
    else if (tempMin >= -23) hardiness_zone = "Zone 6 (continental modéré)";
    else if (tempMin >= -29) hardiness_zone = "Zone 5 (continental froid)";
    else if (tempMin >= -34) hardiness_zone = "Zone 4 (froid)";
    else hardiness_zone = "Zone 3 ou moins (très froid)";

    // ── Type de climat simplifié ──────────────────────────────────────────────
    let climate_type;
    const drySummer = monthly.slice(5, 8).every((m) => (m.precip_mm ?? 0) < 40);
    if (tempMean > 18 && precipAnnual < 400) climate_type = "Aride / semi-aride";
    else if (tempMean > 14 && drySummer) climate_type = "Méditerranéen";
    else if (tempMean > 8 && precipAnnual > 600) climate_type = "Océanique tempéré";
    else if (frostDays > 60) climate_type = "Continental";
    else climate_type = "Tempéré";

    const annual_profile = {
      // Résumé global
      summary: {
        temp_mean_annual_c: tempMean,
        temp_max_record_c: Math.round(tempMax * 10) / 10,
        temp_min_record_c: Math.round(tempMin * 10) / 10,
        precip_annual_mm: precipAnnual,
        humidity_annual_pct: humidityAnnual,
        sunshine_h_per_day: sunshineHoursPerDay,
        frost_days_per_year: frostDays,
        hardiness_zone,        // Zone de rusticité USDA approx.
        climate_type,          // Classification botanique
      },
      // Détail mois par mois
      monthly,
      // Méta
      period: { start: fmt(startDate), end: fmt(endDate) },
      source: "Open-Meteo Historical Archive",
      generated_at: new Date().toISOString(),
    };

    annualCache.set(cacheKey, annual_profile);
    res.json(annual_profile);
  } catch (err) {
    console.error("[climate/annual]", err.message);
    res.status(502).json({ error: "Open-Meteo Archive indisponible", detail: err.message });
  }
});

// ─── ROUTE : IA INTEGRATION BRIDGE ──────────────────────────────────────────
// POST /api/project/generate
// Reçoit le manifeste complet pour le RAG et la Génération d'Images
app.post("/api/project/generate", (req, res) => {
  const manifest = req.body;
  
  console.log("\n🚀 [IA BRIDGE] Nouveau Manifeste Projet Reçu :");
  console.log(JSON.stringify(manifest, null, 2));
  console.log("-------------------------------------------\n");

  // ── Sauvegarder dans un fichier JSON accessible par les scripts IA ──
  try {
    mkdirSync("./shared", { recursive: true });
    writeFileSync(
      "./shared/latest_project.json",
      JSON.stringify(manifest, null, 2),
      "utf-8"
    );
    console.log("💾 Manifeste sauvegardé → shared/latest_project.json");
  } catch (err) {
    console.error("⚠️ Erreur écriture fichier:", err.message);
  }

  res.json({ 
    status: "received", 
    timestamp: new Date().toISOString(),
    manifest
  });
});

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => res.json({ status: "ok", ts: new Date().toISOString() }));

app.listen(PORT, () => console.log(`Paysagea Climate API → http://localhost:${PORT}`));
