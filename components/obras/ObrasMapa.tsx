"use client";

import { useEffect } from "react";
import Link from "next/link";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { ObraRow } from "@/lib/supabase/types";

const CENTRO_PORTUGAL: [number, number] = [39.6, -8.0];

const CORES_ESTADO: Record<string, string> = {
  "Em curso": "#14283A",
  Concluída: "#2C6B45",
  Suspensa: "#8A8578",
};

function iconePorEstado(estado: string) {
  const cor = CORES_ESTADO[estado] ?? "#14283A";
  return L.divIcon({
    className: "",
    html: `<div style="width:20px;height:20px;border-radius:50%;background:${cor};border:3px solid #C9A050;box-shadow:0 1px 4px rgba(0,0,0,0.4);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

function AjustarAosMarcadores({ pontos }: { pontos: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (pontos.length === 0) return;
    if (pontos.length === 1) {
      map.setView(pontos[0], 14);
      return;
    }
    map.fitBounds(L.latLngBounds(pontos), { padding: [32, 32] });
  }, [map, pontos]);
  return null;
}

export function ObrasMapa({ obras }: { obras: ObraRow[] }) {
  const comLocalizacao = obras.filter(
    (o): o is ObraRow & { latitude: number; longitude: number } => o.latitude != null && o.longitude != null
  );
  if (comLocalizacao.length === 0) {
    return (
      <div className="bg-white border border-dashed border-[#C7C3B6] rounded-xl p-6 text-center text-[13px] text-[#8A8578] mb-4">
        Ainda nenhuma obra tem localização marcada. Edita uma obra e clica no mapa para a colocar aqui.
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden border border-[#E4E1D6] h-[240px] sm:h-[320px] md:h-[380px] mb-4">
      <MapContainer center={CENTRO_PORTUGAL} zoom={7} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <AjustarAosMarcadores pontos={comLocalizacao.map((o) => [o.latitude, o.longitude])} />
        {comLocalizacao.map((o) => (
          <Marker key={o.id} position={[o.latitude, o.longitude]} icon={iconePorEstado(o.estado)}>
            <Popup>
              <div style={{ fontSize: 13, lineHeight: 1.5 }}>
                <strong>{o.nome}</strong>
                <br />
                {o.local}
                <br />
                <span style={{ color: "#8A8578" }}>{o.cliente_nome}</span>
                <br />
                <Link href={`/obras/${o.id}`} style={{ color: "#14283A", textDecoration: "underline" }}>
                  Ver obra →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
