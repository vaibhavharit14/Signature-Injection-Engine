import { Router } from "express";
import { signPdf } from "../controllers/signPdf.ts";
import { uploadPdf } from "../controllers/uploadPdf.ts";

const router = Router();
router.post("/upload-pdf", uploadPdf);
router.post("/sign-pdf", signPdf);
export default router;