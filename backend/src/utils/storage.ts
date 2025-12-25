import fs from "fs";
import path from "path";
import { config } from "../config.ts";

export async function loadPdfBytes(pdfId: string): Promise<Uint8Array> {

  const file = path.join(config.STORAGE_DIR, pdfId);
  return fs.readFileSync(file);
}

export async function saveSignedPdfAndGetUrl(pdfId: string, bytes: Uint8Array): Promise<string> {
  
  const signedName = pdfId.endsWith(".pdf")
    ? pdfId.replace(".pdf", "-signed.pdf")
    : `${pdfId}-signed.pdf`;

  const file = path.join(config.STORAGE_DIR, signedName);
  fs.writeFileSync(file, Buffer.from(bytes));
  return `/files/${signedName}`;
}