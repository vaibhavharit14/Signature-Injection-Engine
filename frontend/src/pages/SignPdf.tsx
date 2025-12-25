import { useState, useCallback } from "react";
import { Api, type SignField } from "../api/client";
import PdfViewer from "../components/PdfViewer";
import DraggableField from "../components/DraggableField";
import SignatureModal from "../components/SignatureModal";

type FieldWithId = SignField & { id: string };

export default function SignPdfPage() {
  const [pdfId, setPdfId] = useState("sample.pdf");
  const [customPdfUrl, setCustomPdfUrl] = useState<string | null>(null);
  const [fields, setFields] = useState<FieldWithId[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSignFieldId, setActiveSignFieldId] = useState<string | null>(null);

  const handlePdfLoad = useCallback((dims: { width: number; height: number }) => {
    setDimensions(dims);
  }, []);

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      try {
        const formData = new FormData();
        formData.append('pdf', file);

        const response = await fetch('http://localhost:4000/upload-pdf', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Upload failed');
        }

        setPdfId(data.filename);
        setCustomPdfUrl(null); 
        setFields([]);
        setResultUrl(null);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to upload PDF');
      }
    }
  };

  const addField = (type: "text" | "signature" | "image" | "date" | "radio") => {
    const id = Math.random().toString(36).substr(2, 9);

    const offset = fields.length * 0.05; 
    const startX = 0.15 + (offset % 0.5); 
    const startY = 0.15 + (offset % 0.5); 

    let newField: FieldWithId;

    if (type === "radio") {
      newField = {
        id,
        pageIndex: 0,
        xNorm: startX,
        yNorm: startY,
        wNorm: 0.05,
        hNorm: 0.03,
        type: "radio",
        value: "false",
      };
    } else if (type === "signature" || type === "image") {
      newField = {
        id,
        pageIndex: 0,
        xNorm: startX,
        yNorm: startY,
        wNorm: 0.2,
        hNorm: 0.08,
        type: type,
        value: "",
      };
    } else {
      newField = {
        id,
        pageIndex: 0,
        xNorm: startX,
        yNorm: startY,
        wNorm: 0.25,
        hNorm: 0.06,
        type: type as "text" | "date",
        value: type === "date" ? new Date().toISOString().split('T')[0] : "",
      };
    }
    setFields([...fields, newField]);
  };

  const updateField = (id: string, updates: Partial<SignField>) => {
    setFields(fields.map((f) => (f.id === id ? { ...f, ...updates } as FieldWithId : f)));
  };

  const deleteField = (id: string) => {
    setFields(fields.filter((f) => f.id !== id));
  };

  const handleSignClick = (id: string) => {
    setActiveSignFieldId(id);
    setIsModalOpen(true);
  };

  const handleSaveSignature = (base64: string) => {
    if (activeSignFieldId) {
      updateField(activeSignFieldId, { value: base64 });
    }
  };

  const handleBurnIn = async () => {
    setLoading(true);
    setError(null);
    setResultUrl(null);
    try {
      const apiFields: SignField[] = fields.map(({ id, ...rest }) => rest as SignField);
      const res = await Api.signPdf({
        pdfId,
        fields: apiFields,
      });
      setResultUrl(Api.getSignedFileUrl(res.url));
    } catch (e: any) {
      setError(e.message || "Failed to process document");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo">BoloForms <span>Signature Engine</span></div>
        <div className="header-actions" style={{ display: "flex", gap: "12px" }}>
          <label className="btn btn-secondary" style={{ cursor: "pointer", margin: 0 }}>
            <input
              type="file"
              accept="application/pdf"
              style={{ display: "none" }}
              onChange={handlePdfUpload}
            />
            📄 Upload PDF
          </label>
          <button className="btn btn-primary" onClick={handleBurnIn} disabled={loading || fields.length === 0}>
            {loading ? "Processing..." : "Burn-In & Download"}
          </button>
        </div>
      </header>

      <main className="app-main">
        <aside className="sidebar">
          <h3>Form Fields</h3>
          <p className="sidebar-hint">Select a field type to place on the document.</p>
          <div className="tool-grid">
            <button className="tool-btn" onClick={() => addField("signature")}>
              <span className="icon">🖋️</span>
              <span>Signature</span>
            </button>
            <button className="tool-btn" onClick={() => addField("text")}>
              <span className="icon">📝</span>
              <span>Text Box</span>
            </button>
            <button className="tool-btn" onClick={() => addField("date")}>
              <span className="icon">📅</span>
              <span>Date</span>
            </button>
            <button className="tool-btn" onClick={() => addField("radio")}>
              <span className="icon">🔘</span>
              <span>Radio</span>
            </button>
            <button className="tool-btn" onClick={() => addField("image")}>
              <span className="icon">🖼️</span>
              <span>Image</span>
            </button>
          </div>

          <div style={{ marginTop: 'auto', borderTop: '1px solid #E2E8F0', paddingTop: '24px' }}>
            {error && <div className="error-msg">{error}</div>}

            {resultUrl && (
              <div className="success-card">
                <h4>Document Ready</h4>
                <p>Your PDF has been processed with all fields embedded.</p>
                <a href={resultUrl} target="_blank" rel="noreferrer" className="btn btn-success">
                  Download PDF
                </a>
              </div>
            )}
          </div>
        </aside>

        <section className="canvas-area">
          <PdfViewer pdfUrl={customPdfUrl || `http://localhost:4000/files/${pdfId}`} onLoad={handlePdfLoad}>
            {fields.map((field) => (
              <DraggableField
                key={field.id}
                field={field}
                containerWidth={dimensions.width}
                containerHeight={dimensions.height}
                onUpdate={updateField}
                onDelete={deleteField}
                onSignClick={handleSignClick}
              />
            ))}
          </PdfViewer>
        </section>
      </main>

      <SignatureModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSignature}
      />
    </div>
  );
}