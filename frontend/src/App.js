import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";

function App() {
  const [incidents, setIncidents] = useState([]);
  const mapRef = useRef();

  useEffect(() => {
    fetch("http://127.0.0.1:8000/incidents")
      .then((res) => res.json())
      .then((data) => {
        setIncidents(data.features);
      });
  }, []);

  useEffect(() => {
    if (!mapRef.current || incidents.length === 0) return;

    const map = mapRef.current;

    const heatPoints = incidents.map((incident) => [
      incident.geometry.coordinates[1],
      incident.geometry.coordinates[0],
      0.5,
    ]);

    L.heatLayer(heatPoints, {
      radius: 25,
      blur: 20,
      maxZoom: 17,
    }).addTo(map);
  }, [incidents]);

  return (
    <MapContainer
      center={[13.0827, 80.2707]}
      zoom={11}
      style={{ height: "100vh", width: "100vw" }}
      whenCreated={(mapInstance) => (mapRef.current = mapInstance)}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
    </MapContainer>
  );
}

export default App;