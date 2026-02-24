import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";

function Home() {
  const mapRef = useRef(null);
  const startRef = useRef(null);
  const endRef = useRef(null);
  const routeLineRef = useRef(null);
  const startMarkerRef = useRef(null);
  const endMarkerRef = useRef(null);

  const [stats, setStats] = useState(null);
  const [routeRisk, setRouteRisk] = useState(null);

  useEffect(() => {
    if (mapRef.current) return;

    const map = L.map("map", { doubleClickZoom: false })
      .setView([13.0827, 80.2707], 13);

    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    map.on("click", (e) => {
      if (!startRef.current) {
        startRef.current = e.latlng;
        startMarkerRef.current = L.marker(e.latlng)
          .addTo(map)
          .bindPopup("Start")
          .openPopup();
      } else if (!endRef.current) {
        endRef.current = e.latlng;
        endMarkerRef.current = L.marker(e.latlng)
          .addTo(map)
          .bindPopup("End")
          .openPopup();

        drawRoute(
          startRef.current.lat,
          startRef.current.lng,
          endRef.current.lat,
          endRef.current.lng
        );
      } else {
        resetRoute();
      }
    });

    fetch("http://127.0.0.1:8000/heatmap")
      .then(res => res.json())
      .then(data => {
        const heatPoints = data.features.map(cell => [
          cell.geometry.coordinates[1],
          cell.geometry.coordinates[0],
          cell.properties.count
        ]);

        L.heatLayer(heatPoints, {
          radius: 40,
          blur: 30,
        }).addTo(map);
      });

    fetch("http://127.0.0.1:8000/dashboard")
      .then(res => res.json())
      .then(data => setStats(data));

  }, []);

  const drawRoute = async (startLat, startLng, endLat, endLng) => {
    const map = mapRef.current;

    const routeRes = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`
    );
    const routeData = await routeRes.json();

    const routeCoords = routeData.routes[0].geometry.coordinates.map(coord => [
      coord[1],
      coord[0]
    ]);

    if (routeLineRef.current) map.removeLayer(routeLineRef.current);

    routeLineRef.current = L.polyline(routeCoords, {
      color: "cyan",
      weight: 4
    }).addTo(map);

    map.fitBounds(routeLineRef.current.getBounds());

    const riskRes = await fetch("http://127.0.0.1:8000/route-risk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ coordinates: routeCoords })
    });

    const riskData = await riskRes.json();
    setRouteRisk(riskData);
  };

  const resetRoute = () => {
    const map = mapRef.current;

    startRef.current = null;
    endRef.current = null;
    setRouteRisk(null);

    if (routeLineRef.current) map.removeLayer(routeLineRef.current);
    if (startMarkerRef.current) map.removeLayer(startMarkerRef.current);
    if (endMarkerRef.current) map.removeLayer(endMarkerRef.current);
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{
        width: "300px",
        background: "#111",
        color: "white",
        padding: "20px"
      }}>
        <h2>SecureSphere</h2>

        {stats && (
          <>
            <p>Total: {stats.total_incidents}</p>
            <p>Verified: {stats.verified_incidents}</p>
            <p>Top Crime: {stats.top_crime_type}</p>
          </>
        )}

        <hr />

        <h3>Route Risk</h3>

        {routeRisk ? (
          <>
            <p>Score: {routeRisk.risk_score}</p>
            <p>Level: {routeRisk.risk_level}</p>
            <button onClick={resetRoute}>Reset</button>
          </>
        ) : (
          <p>Click two points</p>
        )}
      </div>

      <div id="map" style={{ flex: 1 }} />
    </div>
  );
}

export default Home;