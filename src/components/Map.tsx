"use client"
// @ts-nocheck
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { Leaf } from 'lucide-react'
import ContractInteraction from './ContractInteraction'
import { supabase } from '@/lib/supabase'
import { encryptWasteData, submitEncryptedWasteData, performDataAnalysis } from '@/utils/litProtocol'
import { useSessionSigs } from '@/hooks/useSessionSigs' 

// Custom leaf icon
const leafIcon = new L.Icon({
  iconUrl: '/leaflet/leaf-green.png',
  shadowUrl: '/leaflet/leaf-shadow.png',
  iconSize: [38, 95],
  shadowSize: [50, 64],
  iconAnchor: [22, 94],
  shadowAnchor: [4, 62],
  popupAnchor: [-3, -76]
})

export default function Map() {
  const [encryptedWastePoints, setEncryptedWastePoints] = useState([]);
  const [insights, setInsights] = useState(null);
  const [missionPins, setMissionPins] = useState<any[]>([]);
  const sessionSigs = useSessionSigs();

  const missionIcon = new L.DivIcon({
    html: '<div style="background:#2563eb;border-radius:9999px;width:14px;height:14px;border:2px solid #fff;box-shadow:0 0 0 4px rgba(37,99,235,0.12)"></div>',
    className: ''
  });

  useEffect(() => {
    const fetchEncryptedWastePoints = async () => {
      // Implement fetching logic from your backend or IPFS
    };

    fetchEncryptedWastePoints();

    const fetchMissionPins = async () => {
      try {
        const res: any = await supabase
          .from('mission_submissions')
          .select('id, image_url, latitude, longitude, score, mission_id, created_at')
          .eq('status', 'verified')
          .not('latitude', 'is', null)
          .order('created_at', { ascending: false })
          .limit(200);

        const { data, error } = res || { data: [], error: null };
        if (error) {
          console.warn('fetchMissionPins supabase error', error);
          return;
        }
        if (Array.isArray(data) && data.length) setMissionPins(data);
      } catch (err) {
        console.warn('fetchMissionPins failed', err);
      }
    };

    fetchMissionPins();
  }, []);

  const handleWasteReport = async (location, quantity) => {
    const wasteData = { location, quantity };
    const encryptedData = await encryptWasteData(wasteData);
    await submitEncryptedWasteData(encryptedData);
    // Refresh the map or add the new point
    await updateInsights();
  };

  const updateInsights = async () => {
    if (sessionSigs) {
      const newInsights = await performDataAnalysis(sessionSigs);
      setInsights(newInsights);
    }
  };

  return (
    <div className="h-screen flex">
      <div className="w-3/4">
        <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {insights && insights.hotspotLocations.map((point, index) => (
            <Marker key={index} position={[point.lat, point.lng]} icon={leafIcon}>
              <Popup>
                Waste Hotspot <br />
                <Leaf className="w-6 h-6 inline-block mr-2 text-green-600" />
                High waste generation area
              </Popup>
            </Marker>
          ))}

          {missionPins && missionPins.map((s, idx) => (
            <Marker key={`mission-${s.id}`} position={[s.latitude, s.longitude]} icon={missionIcon}>
              <Popup>
                <div style={{ width: 220 }}>
                  <img src={s.image_url} alt="submission" style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 6 }} />
                  <div style={{ marginTop: 8, fontSize: 13 }}>{s.mission_id ? `Mission: ${s.mission_id}` : 'Mission submission'}</div>
                  <div style={{ fontSize: 12, color: '#666' }}>Score: {s.score ?? '—'}</div>
                </div>
              </Popup>
            </Marker>
          ))} 
        </MapContainer>
      </div>
      <div className="w-1/4 p-4 overflow-y-auto">
        <ContractInteraction onWasteReport={handleWasteReport} />
      </div>
    </div>
  )
}