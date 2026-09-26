"use client";

import { useRef, useState, useTransition } from "react";
import { ImageIcon, Trash2, Loader2, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { atualizarAparenciaTenant, registarLogoTenant, eliminarLogoTenant } from "@/lib/actions/tenant";
import { nomeSeguro } from "@/lib/nomeSeguro";
import { COR_FUNDO_BARRA_OMISSAO, COR_DESTAQUE_OMISSAO, COR_TEXTO_OMISSAO } from "@/lib/branding";
import type { TenantRow } from "@/lib/supabase/types";

export function AparenciaCard({ tenant, logoUrl }: { tenant: TenantRow; logoUrl: string | null }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [arrastando, setArrastando] = useState(false);
  const [pendingLogo, startLogoTransition] = useTransition();
  const [pendingForm, startFormTransition] = useTransition();
  const [erroLogo, setErroLogo] = useState<string | null>(null);
  const [erroForm, setErroForm] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);
  const [corFundoBarra, setCorFundoBarra] = useState(tenant.cor_fundo_barra ?? COR_FUNDO_BARRA_OMISSAO);
  const [corDestaque, setCorDestaque] = useState(tenant.cor_destaque ?? COR_DESTAQUE_OMISSAO);
  const [corTexto, setCorTexto] = useState(tenant.cor_texto ?? COR_TEXTO_OMISSAO);

  function enviarLogo(ficheiro: File) {
    setErroLogo(null);
    startLogoTransition(async () => {
      try {
        const supabase = createClient();
        const path = `${tenant.id}/logo-${crypto.randomUUID()}-${nomeSeguro(ficheiro.name)}`;
        const { error: uploadError } = await supabase.storage
          .from("tenant-branding")
          .upload(path, ficheiro, { contentType: ficheiro.type || undefined });
        if (uploadError) {
          setErroLogo(uploadError.message);
          return;
        }
        const resultado = await registarLogoTenant({ nome: ficheiro.name, path });
        if (resultado.error) setErroLogo(resultado.error);
      } catch (err) {
        console.error("Falha ao enviar logótipo", err);
        setErroLogo("Falha inesperada. Verifica a ligação e tenta outra vez.");
      } finally {
        if (inputRef.current) inputRef.current.value = "";
      }
    });
  }

  function guardar(formData: FormData) {
    setErroForm(null);
    setGuardado(false);
    startFormTransition(async () => {
      const resultado = await atualizarAparenciaTenant(formData);
      if (resultado.error) {
        setErroForm(resultado.error);
        return;
      }
      setGuardado(true);
    });
  }

  return (
    <div className="bg-white border border-[#E4E1D6] rounded-xl p-5 max-w-xl mb-8">
      <p className="text-[13px] font-medium text-[#4A4740] mb-1">Aparência do painel</p>
      <p className="text-[11px] text-[#8A8578] mb-4">
        O logótipo e as cores aparecem no teu painel e no portal dos teus clientes — para casar com a tua marca.
      </p>

      <div className="flex items-center gap-3 mb-5">
        <div className="w-14 h-14 rounded-lg border border-[#E4E1D6] bg-[#F5F4EF] flex items-center justify-center overflow-hidden shrink-0">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="Logótipo" className="w-full h-full object-contain" />
          ) : (
            <ImageIcon size={20} className="text-[#C7C3B6]" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div
            role="button"
            tabIndex={0}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setArrastando(true);
            }}
            onDragLeave={() => setArrastando(false)}
            onDrop={(e) => {
              e.preventDefault();
              setArrastando(false);
              const ficheiro = e.dataTransfer.files?.[0];
              if (ficheiro) enviarLogo(ficheiro);
            }}
            className={`cursor-pointer border-2 border-dashed rounded-lg flex items-center justify-center gap-2 text-center py-2.5 px-3 transition-colors ${
              arrastando
                ? "border-[#14283A] bg-[#EAF0F5]"
                : pendingLogo
                  ? "border-[#C9A050] bg-[#FBF7EC]"
                  : "border-[#C7C3B6] hover:border-[#8A8578] bg-white"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && enviarLogo(e.target.files[0])}
            />
            {pendingLogo ? (
              <Loader2 size={16} className="text-[#C9A050] animate-spin shrink-0" />
            ) : (
              <Upload size={16} className="text-[#8A8578] shrink-0" />
            )}
            <span className="text-[#8A8578] text-[11px]">
              {pendingLogo ? "A enviar..." : "Arrasta ou clica para escolher o logótipo"}
            </span>
          </div>
          {logoUrl && !pendingLogo && (
            <form action={eliminarLogoTenant} className="mt-1">
              <button type="submit" className="text-[11px] text-[#B0402F] flex items-center gap-1">
                <Trash2 size={11} /> Remover logótipo
              </button>
            </form>
          )}
          {erroLogo && <p className="text-[11px] text-[#B0402F] mt-1">{erroLogo}</p>}
        </div>
      </div>

      <form action={guardar}>
        <div className="mb-3">
          <label className="text-[12px] font-medium text-[#4A4740] block mb-1">Nome da empresa</label>
          <input
            name="nome_empresa"
            defaultValue={tenant.nome_empresa}
            required
            autoComplete="off"
            className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px]"
          />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-2">
          <div>
            <label className="text-[12px] font-medium text-[#4A4740] block mb-1">Cor da barra lateral</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                name="cor_fundo_barra"
                value={corFundoBarra}
                onChange={(e) => setCorFundoBarra(e.target.value)}
                className="w-9 h-9 rounded border border-[#DEDBD2] p-0.5 cursor-pointer shrink-0"
              />
              <span className="text-[11px] text-[#8A8578] font-mono">{corFundoBarra}</span>
            </div>
          </div>
          <div>
            <label className="text-[12px] font-medium text-[#4A4740] block mb-1">Cor das letras</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                name="cor_texto"
                value={corTexto}
                onChange={(e) => setCorTexto(e.target.value)}
                className="w-9 h-9 rounded border border-[#DEDBD2] p-0.5 cursor-pointer shrink-0"
              />
              <span className="text-[11px] text-[#8A8578] font-mono">{corTexto}</span>
            </div>
          </div>
          <div>
            <label className="text-[12px] font-medium text-[#4A4740] block mb-1">Cor de destaque</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                name="cor_destaque"
                value={corDestaque}
                onChange={(e) => setCorDestaque(e.target.value)}
                className="w-9 h-9 rounded border border-[#DEDBD2] p-0.5 cursor-pointer shrink-0"
              />
              <span className="text-[11px] text-[#8A8578] font-mono">{corDestaque}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <button
            type="submit"
            disabled={pendingForm}
            className="px-4 py-2 rounded-lg bg-[#14283A] text-white text-[13px] font-medium disabled:opacity-60"
          >
            {pendingForm ? "A guardar..." : "Guardar"}
          </button>
          {guardado && !pendingForm && <span className="text-[12px] text-[#3E7A4D]">Guardado.</span>}
          {erroForm && <span className="text-[12px] text-[#B0402F]">{erroForm}</span>}
        </div>
      </form>
    </div>
  );
}
