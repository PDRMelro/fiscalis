const LADO_MAXIMO_PX = 1920;
const QUALIDADE_JPEG = 0.82;
const TAMANHO_MINIMO_PARA_COMPRIMIR = 800 * 1024;

/**
 * Redimensiona e recomprime uma imagem no browser antes do upload, para
 * poupar espaço de armazenamento sem perda visível numa fotografia de obra
 * ou documento. Ficheiros não-imagem ou já pequenos ficam como estão; se
 * algo correr mal, devolve o ficheiro original em vez de bloquear o upload.
 */
export async function comprimirImagem(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.size < TAMANHO_MINIMO_PARA_COMPRIMIR) return file;

  try {
    const bitmap = await createImageBitmap(file);
    const escala = Math.min(1, LADO_MAXIMO_PX / Math.max(bitmap.width, bitmap.height));
    const largura = Math.round(bitmap.width * escala);
    const altura = Math.round(bitmap.height * escala);

    const canvas = document.createElement("canvas");
    canvas.width = largura;
    canvas.height = altura;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, largura, altura);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", QUALIDADE_JPEG));
    if (!blob || blob.size >= file.size) return file;

    const nomeBase = file.name.replace(/\.[^/.]+$/, "");
    return new File([blob], `${nomeBase}.jpg`, { type: "image/jpeg" });
  } catch (err) {
    console.error("Falha ao comprimir imagem, a usar o ficheiro original", err);
    return file;
  }
}
