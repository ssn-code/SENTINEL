import React, { useEffect, useMemo, useState } from 'react';
import { GeoJSON, MapContainer, useMap } from 'react-leaflet';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { buildApiUrl, fetchApiJson } from '../lib/api';

export type CrimeMapRow = {
  id: number;
  state: string;
  ipc_crimes: number;
  women_crimes: number;
  cyber_crimes: number;
  safety_score?: number;
};

type IndiaCrimeMapProps = {
  className?: string;
  geoJsonUrl?: string;
  refreshKey?: number;
  onStateSelect?: (state: CrimeMapRow | null, stateName: string) => void;
  selectedStateName?: string | null;
};

type IndiaFeatureProps = {
  NAME_1?: string;
  VARNAME_1?: string;
  ST_NM?: string;
  name?: string;
};

const DEFAULT_GEOJSON_URL = '/india-states.geojson';

const INDIA_BOUNDS = L.latLngBounds(
  L.latLng(6.4, 68.0),
  L.latLng(37.6, 97.5),
);

const INDIA_MAX_BOUNDS = INDIA_BOUNDS.pad(0.12);

const NAME_ALIASES: Record<string, string> = {
  'uttarpradesh': 'uttar pradesh',
  'uttar pradesh': 'uttar pradesh',
  'uttaranchal': 'uttarakhand',
  'uttarakhand': 'uttarakhand',
  'tamilnadu': 'tamil nadu',
  'tamil nadu': 'tamil nadu',
  'telengana': 'telangana',
  'telangana': 'telangana',
  'meghalya': 'meghalaya',
  'meghalaya': 'meghalaya',
  'jammu kashmir': 'jammu and kashmir',
  'jammu and kashmir': 'jammu and kashmir',
  'andaman and nicobar': 'andaman and nicobar islands',
  'andaman and nicobar islands': 'andaman and nicobar islands',
  'a and n islands': 'andaman and nicobar islands',
  'a n islands': 'andaman and nicobar islands',
  'andaman nicobar islands': 'andaman and nicobar islands',
  'orissa': 'odisha',
  'odisha': 'odisha',
  'd&n haveli': 'dadra and nagar haveli and daman and diu',
  'd and n haveli': 'dadra and nagar haveli and daman and diu',
  'dn haveli': 'dadra and nagar haveli and daman and diu',
  'dadra and nagar haveli': 'dadra and nagar haveli and daman and diu',
  'daman and diu': 'dadra and nagar haveli and daman and diu',
  'dadra and nagar haveli and daman and diu': 'dadra and nagar haveli and daman and diu',
  'a&n islands': 'andaman and nicobar islands',
  'an islands': 'andaman and nicobar islands',
  'nct of delhi': 'delhi',
  'pondicherry': 'puducherry',
};

function normalizeStateName(value: string) {
  const cleaned = value
    .trim()
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[().,-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return NAME_ALIASES[cleaned] ?? cleaned;
}

function formatStateName(value: string) {
  return value
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function deriveSafetyScore(row: CrimeMapRow) {
  if (typeof row.safety_score === 'number') {
    return Math.max(0, Math.min(100, row.safety_score));
  }

  return Math.max(10, Math.min(100, Math.round(100 - row.ipc_crimes / 5000)));
}

function getSafetyColor(score: number) {
  if (score <= 20) return '#8b1e1e';
  if (score <= 40) return '#ea580c';
  if (score <= 60) return '#eab308';
  if (score <= 80) return '#84cc16';
  return '#166534';
}

function getFeatureStateName(feature: Feature<Geometry, IndiaFeatureProps>) {
  const props = feature.properties ?? {};
  return props.NAME_1 ?? props.ST_NM ?? props.name ?? 'Unknown';
}

function formatNumber(value?: number) {
  return typeof value === 'number' ? value.toLocaleString('en-IN') : 'N/A';
}

function styleForFeature(state?: CrimeMapRow, isSelected?: boolean) {
  const score = state ? deriveSafetyScore(state) : 0;

  return {
    color: isSelected ? '#f8fafc' : '#020617',
    weight: isSelected ? 2.5 : 1.2,
    fillColor: state ? getSafetyColor(score) : '#1f2937',
    fillOpacity: state ? 0.92 : 0.72,
  };
}

const MapViewportController: React.FC<{ bounds: L.LatLngBounds }> = ({ bounds }) => {
  const map = useMap();

  useEffect(() => {
    map.invalidateSize();
    map.fitBounds(bounds, { padding: [22, 22], animate: false });
    map.setMaxBounds(INDIA_MAX_BOUNDS);
    map.setMinZoom(map.getZoom());
  }, [bounds, map]);

  return null;
};

export const IndiaCrimeMap: React.FC<IndiaCrimeMapProps> = ({
  className = '',
  geoJsonUrl = DEFAULT_GEOJSON_URL,
  refreshKey = 0,
  onStateSelect,
  selectedStateName,
}) => {
  const [crimeRows, setCrimeRows] = useState<CrimeMapRow[]>([]);
  const [geoJson, setGeoJson] = useState<FeatureCollection<Geometry, IndiaFeatureProps> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [crimeData, geoJsonResponse] = await Promise.all([
          fetchApiJson<CrimeMapRow[]>('/states'),
          fetch(geoJsonUrl),
        ]);

        if (!geoJsonResponse.ok) throw new Error(`GeoJSON returned ${geoJsonResponse.status}`);

        const geoJsonData =
          (await geoJsonResponse.json()) as FeatureCollection<Geometry, IndiaFeatureProps>;

        if (!active) return;
        setCrimeRows(crimeData);
        setGeoJson(geoJsonData);
      } catch (caught) {
        if (!active) return;
        setError(caught instanceof Error ? caught.message : 'Failed to load India crime map data');
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void loadData();

    return () => {
      active = false;
    };
  }, [geoJsonUrl, refreshKey]);

  const crimeByState = useMemo(() => {
    return new Map(crimeRows.map((row) => [normalizeStateName(row.state), row]));
  }, [crimeRows]);

  const matchedCount = useMemo(() => {
    if (!geoJson) return 0;

    const geoNames = new Set(
      geoJson.features.map((feature) => normalizeStateName(getFeatureStateName(feature))).filter(Boolean),
    );

    let count = 0;
    crimeRows.forEach((row) => {
      if (geoNames.has(normalizeStateName(row.state))) {
        count += 1;
      }
    });

    return count;
  }, [crimeRows, geoJson]);

  const totalRegions = crimeRows.length;
  const geoJsonBounds = useMemo(() => {
    if (!geoJson) return INDIA_BOUNDS;
    return L.geoJSON(geoJson as GeoJSON.FeatureCollection).getBounds();
  }, [geoJson]);

  const onEachFeature = (feature: Feature<Geometry, IndiaFeatureProps>, layer: L.Layer) => {
    const leafletLayer = layer as L.Path & { bindPopup: L.Layer['bindPopup']; bringToFront: () => void };
    const featureStateName = getFeatureStateName(feature);
    const normalizedName = normalizeStateName(featureStateName);
    const matchingState = crimeByState.get(normalizedName);
    const effectiveScore = matchingState ? deriveSafetyScore(matchingState) : undefined;
    const isSelected = selectedStateName ? normalizeStateName(selectedStateName) === normalizedName : false;

    leafletLayer.setStyle(styleForFeature(matchingState, isSelected));
    const infoMarkup =
      [
        `<div style="min-width: 185px;">`,
        `<div style="font-weight:700;font-size:14px;margin-bottom:8px;">${formatStateName(normalizedName)}</div>`,
        `<div>IPC Crimes: ${formatNumber(matchingState?.ipc_crimes)}</div>`,
        `<div>Women Crimes: ${formatNumber(matchingState?.women_crimes)}</div>`,
        `<div>Cyber Crimes: ${formatNumber(matchingState?.cyber_crimes)}</div>`,
        `<div>Safety Score: ${effectiveScore ?? 'N/A'}</div>`,
        `</div>`,
      ].join('');

    leafletLayer.bindTooltip(infoMarkup, {
      sticky: true,
      direction: 'top',
      offset: L.point(0, -6),
      opacity: 0.96,
      className: 'secure-sphere-map-tooltip',
    });

    leafletLayer.on({
      mouseover: () => {
        leafletLayer.setStyle({
          color: '#ffffff',
          weight: 2.5,
          fillOpacity: 1,
        });
        leafletLayer.bringToFront();
        leafletLayer.openTooltip();
      },
      mouseout: () => {
        leafletLayer.setStyle(styleForFeature(matchingState, isSelected));
        leafletLayer.closeTooltip();
      },
      click: () => {
        if (onStateSelect) {
          onStateSelect(matchingState ?? null, formatStateName(normalizedName));
        }
      },
    });
  };

  if (isLoading) {
    return (
      <div className={`flex h-full min-h-[560px] items-center justify-center rounded-[2rem] border border-border bg-surface ${className}`.trim()}>
        <p className="text-sm text-gray-400">Loading SENTINEL map intelligence...</p>
      </div>
    );
  }

  if (error || !geoJson) {
    return (
      <div className={`flex h-full min-h-[560px] items-center justify-center rounded-[2rem] border border-border bg-surface p-6 text-center ${className}`.trim()}>
        <div>
          <p className="text-white">Unable to load the India crime map.</p>
          <p className="mt-2 text-sm text-gray-400">{error ?? 'GeoJSON data is unavailable.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative h-full min-h-[560px] overflow-hidden rounded-[2rem] border border-border bg-[#071019] cursor-target ${className}`.trim()}>
      <MapContainer
        bounds={geoJsonBounds}
        boundsOptions={{ padding: [22, 22] }}
        zoomControl={false}
        scrollWheelZoom={false}
        dragging={false}
        touchZoom={false}
        doubleClickZoom={false}
        boxZoom={false}
        keyboard={false}
        attributionControl={false}
        maxBounds={INDIA_MAX_BOUNDS}
        maxBoundsViscosity={1}
        className="h-full w-full bg-[#09131d]"
      >
        <MapViewportController bounds={geoJsonBounds} />
        <GeoJSON data={geoJson} style={() => ({ color: '#020617', weight: 1.2, fillOpacity: 0.75 })} onEachFeature={onEachFeature} />
      </MapContainer>

      <div className="pointer-events-none absolute right-4 top-4 z-[300] rounded-2xl border border-white/10 bg-bg/80 px-4 py-3 backdrop-blur">
        <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-300/70">Coverage</div>
        <div className="mt-2 text-lg font-bold text-white">{matchedCount} / {totalRegions} states matched</div>
        <p className="mt-1 text-xs text-gray-400">Backend spellings are normalized against India state boundaries.</p>
      </div>

      <div className="pointer-events-none absolute bottom-4 left-4 z-[400] rounded-2xl border border-white/10 bg-bg/80 px-4 py-3 backdrop-blur">
        <div className="mb-2 text-[10px] font-mono uppercase tracking-[0.3em] text-gray-500">Safety Scale</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-gray-300 md:grid-cols-5">
          <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#8b1e1e]" />0-20</div>
          <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#ea580c]" />21-40</div>
          <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#eab308]" />41-60</div>
          <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#84cc16]" />61-80</div>
          <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#166534]" />81-100</div>
        </div>
      </div>
    </div>
  );
};

export default IndiaCrimeMap;
