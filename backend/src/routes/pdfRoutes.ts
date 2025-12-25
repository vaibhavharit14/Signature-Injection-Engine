import { Router } from "express";
import { signPdf } from "../controllers/signPdf";
import { uploadPdf } from "../controllers/uploadPdf";

const router = Router();
router.post("/upload-pdf", uploadPdf);
router.post("/sign-pdf", signPdf);
export default router;