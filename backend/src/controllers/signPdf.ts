import type { Request, Response } from "express";
import { PDFDocument, rgb } from "pdf-lib";
import Audit from "../models/Audit.ts";
import { sha256 } from "../utils/hash.ts";
import { loadPdfBytes, saveSignedPdfAndGetUrl } from "../utils/storage.ts";

function normToPdf(f: any, pagePt: { W:number; H:number }) {
  const xPt = f.xNorm * pagePt.W;
  const yPt = (1 - f.yNorm - f.hNorm) * pagePt.H;
  const wPt = f.wNorm * pagePt.W;
  const hPt = f.hNorm * pagePt.H;
  return { xPt, yPt, wPt, hPt };
}

export async function signPdf(req: Request, res: Response) {
  try {
    const { pdfId, fields, pageSizesPt } = req.body;

    const originalBytes = await loadPdfBytes(pdfId);
    const originalHash = sha256(Buffer.from(originalBytes));

    const pdfDoc = await PDFDocument.load(originalBytes);

    for (const f of fields) {
      const page = pdfDoc.getPage(f.pageIndex);
      const { W, H } = pageSizesPt?.[f.pageIndex] || { W: page.getWidth(), H: page.getHeight() };
      const { xPt, yPt, wPt, hPt } = normToPdf(f, { W, H });

      if (f.type === "signature" || f.type === "image") {
        const base64 = f.value || "";
        if (!base64) continue;
        
        const b64 = base64.includes(",") ? base64.split(",")[1] : base64;
        const imgBytes = Buffer.from(b64, "base64");
        let image;
        try { 
          image = await pdfDoc.embedPng(imgBytes); 
        } catch { 
          try {
            image = await pdfDoc.embedJpg(imgBytes); 
          } catch (err) {
            console.error("Failed to embed image:", err);
            continue;
          }
        }
        
        const iw = image.width, ih = image.height;
        const s = Math.min(wPt / iw, hPt / ih);
        const Wp = iw * s, Hp = ih * s;
        const xC = xPt + (wPt - Wp) / 2;
        const yC = yPt + (hPt - Hp) / 2;
        page.drawImage(image, { x: xC, y: yC, width: Wp, height: Hp });
      } else if (f.type === "radio") {
     
        const centerX = xPt + wPt / 2;
        const centerY = yPt + hPt / 2;
        const radius = Math.min(wPt, hPt) / 3;
        page.drawCircle({
          x: centerX,
          y: centerY,
          size: radius,
          borderWidth: 2,
          borderColor: rgb(0, 0, 0),
          color: (f.value === "true" || f.value === true) ? rgb(0, 0, 0) : undefined,
        });
      } else {
      
        page.drawText(f.value ?? "", {
          x: xPt + 4,
          y: yPt + hPt / 2 - 6,
          size: 11,
          color: rgb(0,0,0)
        });
      }
    }

    const signedBytes = await pdfDoc.save();
    const signedHash = sha256(Buffer.from(signedBytes));
    await Audit.create({ pdfId, originalHash, signedHash, fields });

    const url = await saveSignedPdfAndGetUrl(pdfId, signedBytes);
    res.json({ url, originalHash, signedHash });
  } catch (e: any) {
    console.error("Sign PDF Error:", e);
    res.status(500).json({ error: e.message || "Sign failed" });
  }
}