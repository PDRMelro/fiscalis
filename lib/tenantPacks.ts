const MB = 1024 * 1024;
const GB = 1024 * MB;

export const PACKS_TENANT = {
  base: { nome: "Pack Base", limiteClientes: 10, limiteArmazenamentoBytes: 500 * MB, limiteFiscais: 5 },
  pro: { nome: "Pack Pro", limiteClientes: 50, limiteArmazenamentoBytes: 5 * GB, limiteFiscais: 20 },
} as const;

export type PackId = keyof typeof PACKS_TENANT;
