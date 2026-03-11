/**
 * buildPlantFilter
 * Transforme un projectContext Paysagea en filtre botanique
 * prêt pour le filtrage de plantes.
 *
 * Usage :
 *   import { buildPlantFilter } from "./buildPlantFilter";
 *   const filter = buildPlantFilter(projectContext);
 *
 * Retourne :
 * {
 *   usda_zone      : 9,
 *   temp_min_local : -1,
 *   temp_max_local : 34,
 *   humidity_level : "medium",   // "dry" | "medium" | "humid"
 *   sun_exposure   : "sun",      // "shade" | "partial" | "sun"
 *   annual_rain_mm : 833,
 *   current_month  : 3,
 * }
 */

// ─── Seuils ───────────────────────────────────────────────────────────────────

function getHumidityLevel(pct) {
  if (pct === null || pct === undefined) return null;
  if (pct < 50) return "dry";
  if (pct < 70) return "medium";
  return "humid";
}

function getSunExposure(hoursPerDay) {
  if (hoursPerDay === null || hoursPerDay === undefined) return null;
  if (hoursPerDay < 4) return "shade";
  if (hoursPerDay < 6) return "partial";
  return "sun";
}

function parseUsdaZone(zoneString) {
  // Ex : "Zone 9 (méditerranéen)" → 9
  if (!zoneString) return null;
  const match = zoneString.match(/Zone\s+(\d+)/i);
  return match ? parseInt(match[1], 10) : null;
}

// ─── Fonction principale ──────────────────────────────────────────────────────

export function buildPlantFilter(projectContext) {
  if (!projectContext?.annual_profile) {
    console.warn("[buildPlantFilter] annual_profile manquant dans projectContext");
    return null;
  }

  const summary = projectContext.annual_profile.summary;

  return {
    usda_zone:      parseUsdaZone(summary.hardiness_zone),
    temp_min_local: summary.temp_min_record_c     ?? null,
    temp_max_local: summary.temp_max_record_c     ?? null,
    humidity_level: getHumidityLevel(summary.humidity_annual_pct),
    sun_exposure:   getSunExposure(summary.sunshine_h_per_day),
    annual_rain_mm: summary.precip_annual_mm      ?? null,
    current_month:  new Date().getMonth() + 1,    // 1 = janvier … 12 = décembre
  };
}
