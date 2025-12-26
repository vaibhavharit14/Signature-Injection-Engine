import { useRef, useState } from "react";

interface SignatureModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (base64: string) => void;
}

export default function SignatureModal({ isOpen, onClose, onSave }: SignatureModalProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);

    if (!isOpen) return null;

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDrawing(true);
        draw(e);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext("2d");
            ctx?.beginPath();
        }
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = ("touches" in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
        const y = ("touches" in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.strokeStyle = "black";

        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const clear = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext("2d");
            ctx?.clearRect(0, 0, canvas.width, canvas.height);
        }
    };

    const handleSave = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            onSave(canvas.toDataURL("image/png"));
            onClose();
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>Draw your Signature</h3>
                <div style={{
                    border: "1px solid #ccc",
                    background: "#fff",
                    cursor: "crosshair",
                    width: "100%",
                    height: "200px",
                    overflow: "hidden",
                    position: "relative"
                }}>
                    <canvas
                        ref={canvasRef}
                        width={600}
                        height={300}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        style={{
                            width: "100%",
                            height: "100%",
                            display: "block"
                        }}
                    />
                </div>
                <div className="modal-actions" style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button className="btn btn-secondary" onClick={clear}>Clear</button>
                    <button className="btn btn-primary" onClick={handleSave}>Save Signature</button>
                    <button className="btn btn-outline" onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
}
