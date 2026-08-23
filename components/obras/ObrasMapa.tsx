"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Maximize2, X } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { ObraRow } from "@/lib/supabase/types";

const CENTRO_PORTUGAL: [number, number] = [39.6, -8.0];

const CORES_ESTADO: Record<string, string> = {
  "Em curso": "#14283A",
  Concluída: "#2C6B45",
  Suspensa: "#8A8578",
};

// "OBRA-014" -> "14" — número curto para caber no marcador.
function numeroCurto(codigo: string | null) {
  if (!codigo) return "?";
  const m = codigo.match(/(\d+)$/);
  return m ? String(Number(m[1])) : codigo;
}

function iconePorEstado(estado: string, codigo: string | null) {
  const cor = CORES_ESTADO[estado] ?? "#14283A";
  const numero = numeroCurto(codigo);
  return L.divIcon({
    className: "",
    html: `<div style="
      min-width:24px;height:24px;padding:0 4px;border-radius:12px;
      background:${cor};border:2px solid #C9A050;box-shadow:0 1px 4px rgba(0,0,0,0.4);
      display:flex;align-items:center;justify-content:center;
      color:#fff;font-family:ui-monospace,monospace;font-size:11px;font-weight:700;
    ">${numero}</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
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

function MapaObras({ obras }: { obras: (ObraRow & { latitude: number; longitude: number })[] }) {
  return (
    <MapContainer center={CENTRO_PORTUGAL} zoom={7} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <AjustarAosMarcadores pontos={obras.map((o) => [o.latitude, o.longitude])} />
      {obras.map((o) => (
        <Marker key={o.id} position={[o.latitude, o.longitude]} icon={iconePorEstado(o.estado, o.codigo)}>
          <Tooltip direction="top" offset={[0, -12]} opacity={1}>
            {o.codigo ? `${o.codigo} — ${o.nome}` : o.nome}
          </Tooltip>
          <Popup>
            <div style={{ fontSize: 13, lineHeight: 1.5 }}>
              <span style={{ fontFamily: "ui-monospace, monospace", color: "#8A8578" }}>{o.codigo ?? "—"}</span>
              <br />
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
  );
}

export function ObrasMapa({ obras }: { obras: ObraRow[] }) {
  const [expandido, setExpandido] = useState(false);
  const comLocalizacao = obras.filter(
    (o): o is ObraRow & { latitude: number; longitude: number } => o.latitude != null && o.longitude != null
  );

  useEffect(() => {
    if (!expandido) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setExpandido(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [expandido]);

  if (comLocalizacao.length === 0) {
    return (
      <div className="bg-white border border-dashed border-[#C7C3B6] rounded-xl p-6 text-center text-[13px] text-[#8A8578] mb-4">
        Ainda nenhuma obra tem localização marcada. Edita uma obra e clica no mapa para a colocar aqui.
      </div>
    );
  }

  return (
    <>
      <div className="relative isolate rounded-xl overflow-hidden border border-[#E4E1D6] h-[240px] sm:h-[320px] md:h-[380px] mb-4">
        <MapaObras obras={comLocalizacao} />
        <button
          type="button"
          onClick={() => setExpandido(true)}
          title="Expandir mapa"
          className="absolute top-2.5 right-2.5 z-[1000] bg-white border border-[#DEDBD2] rounded-lg p-1.5 text-[#14283A] shadow-sm hover:border-[#C9A050]"
        >
          <Maximize2 size={15} />
        </button>
      </div>

      {expandido &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
            onClick={() => setExpandido(false)}
          >
            <div
              className="bg-white rounded-xl shadow-2xl w-full h-full max-w-6xl relative isolate overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setExpandido(false)}
                title="Fechar"
                className="absolute top-3 right-3 z-[1000] bg-white border border-[#DEDBD2] rounded-lg p-1.5 text-[#14283A] shadow-sm hover:border-[#C9A050]"
              >
                <X size={16} />
              </button>
              <MapaObras obras={comLocalizacao} />
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
