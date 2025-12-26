# Signature Injection Engine

## Overview
This project is a full‑stack application that enables digital signing and editing of PDF files. Users can upload or reference existing PDFs, inject text, signatures, or images, and generate a new signed version with an audit trail for verification. The frontend is deployed on Vercel and the backend is deployed on Render.

- Frontend: https://signature-injection-engine-five.vercel.app/ 
- Backend: https://signature-injection-engine-l6qm.onrender.com  

## Features
- Upload and view PDF files
- Inject text, signatures, dates, radio buttons, and images
- Generate a new signed PDF without overwriting the original
- Compute and store SHA256 hashes for both original and signed PDFs
- Maintain an audit trail in the database for every signing action
- Simple frontend interface connected to backend API

## Tech Stack
- Frontend: React, TypeScript, Vite
- Backend: Node.js, Express, TypeScript
- Database: MongoDB
- Libraries: pdf-lib, Mongoose, Multer, Crypto

## Project Structure
```
backend/
  src/
    controllers/
    models/
    routes/
    utils/
  server.ts
  config.ts

frontend/
  src/
    api/
    pages/
    App.tsx
    main.tsx
```

## Setup

### Backend
```
cd backend
npm install
npm run build
npm run start
```
### Frontend
```
cd frontend
npm install
npm run dev
```

## Usage
1. Place a PDF in the backend storage folder.
2. Open the frontend application.
3. Enter the PDF name and add fields such as text or signature.
4. Click Burn‑In & Download to generate the signed PDF.
5. The backend returns the signed file URL and hash values.
6. The frontend displays a link to view or download the signed PDF.

## Outcome
The system ensures that original PDFs remain safe, signed versions are generated with injected fields, and audit trails provide integrity and verification. This project demonstrates full‑stack development skills, backend problem solving, and recruiter‑ready documentation.
