const MB = 1024 * 1024;
const GB = 1024 * MB;

export const PACKS_TENANT = {
  base: { nome: "Pack Base", limiteClientes: 10, limiteArmazenamentoBytes: 500 * MB },
  pro: { nome: "Pack Pro", limiteClientes: 50, limiteArmazenamentoBytes: 5 * GB },
} as const;

export type PackId = keyof typeof PACKS_TENANT;
