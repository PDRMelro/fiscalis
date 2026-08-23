"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Portugal continental, vista geral — ponto de partida quando a obra ainda não tem localização definida.
const CENTRO_PORTUGAL: [number, number] = [39.6, -8.0];

const iconeObra = L.divIcon({
  className: "",
  html: `<div style="width:20px;height:20px;border-radius:50%;background:#14283A;border:3px solid #C9A050;box-shadow:0 1px 4px rgba(0,0,0,0.4);"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

function CliqueNoMapa({ onEscolher }: { onEscolher: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onEscolher(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export function LocalizacaoObraPicker({
  defaultLat,
  defaultLng,
}: {
  defaultLat?: number | null;
  defaultLng?: number | null;
}) {
  const [posicao, setPosicao] = useState<{ lat: number; lng: number } | null>(
    defaultLat != null && defaultLng != null ? { lat: defaultLat, lng: defaultLng } : null
  );
  const latRef = useRef<HTMLInputElement>(null);
  const lngRef = useRef<HTMLInputElement>(null);

  // Escreve o valor diretamente no DOM (em vez de depender só do value=
  // controlado pelo React), para garantir que o FormData apanha sempre a
  // posição mais recente ao submeter, mesmo vindo de um componente
  // carregado dinamicamente (next/dynamic ssr:false).
  useEffect(() => {
    if (latRef.current) latRef.current.value = posicao ? String(posicao.lat) : "";
    if (lngRef.current) lngRef.current.value = posicao ? String(posicao.lng) : "";
  }, [posicao]);

  return (
    <div>
      <input ref={latRef} type="hidden" name="latitude" defaultValue={posicao?.lat ?? ""} />
      <input ref={lngRef} type="hidden" name="longitude" defaultValue={posicao?.lng ?? ""} />
      <div className="relative isolate rounded-lg overflow-hidden border border-[#DEDBD2] h-[220px] sm:h-[280px]">
        <MapContainer
          center={posicao ?? CENTRO_PORTUGAL}
          zoom={posicao ? 15 : 7}
          scrollWheelZoom
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <CliqueNoMapa onEscolher={(lat, lng) => setPosicao({ lat, lng })} />
          {posicao && <Marker position={posicao} icon={iconeObra} />}
        </MapContainer>
      </div>
      <p className="text-[11px] text-[#8A8578] mt-1">
        {posicao
          ? `Localização marcada (${posicao.lat.toFixed(5)}, ${posicao.lng.toFixed(5)}). Clica no mapa para ajustar.`
          : "Clica no mapa para marcar o local exato da obra (opcional)."}
      </p>
    </div>
  );
}
