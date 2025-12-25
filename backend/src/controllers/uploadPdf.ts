import type { Request, Response } from "express";
import multer from "multer";
import path from "path";
import { config } from "../config";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, config.STORAGE_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    },
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "application/pdf") {
            cb(null, true);
        } else {
            cb(new Error("Only PDF files are allowed"));
        }
    },
}).single("pdf");

export function uploadPdf(req: Request, res: Response) {
    upload(req, res, (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        res.json({
            filename: req.file.filename,
            url: `/files/${req.file.filename}`,
        });
    });
}
