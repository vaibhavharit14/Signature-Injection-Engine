import { Rnd } from "react-rnd";
import { type SignField } from "../api/client";

interface DraggableFieldProps {
    field: SignField & { id: string };
    containerWidth: number;
    containerHeight: number;
    onUpdate: (id: string, updates: Partial<SignField>) => void;
    onDelete: (id: string) => void;
    onSignClick?: (id: string) => void;
}

export default function DraggableField({
    field,
    containerWidth,
    containerHeight,
    onUpdate,
    onDelete,
    onSignClick,
}: DraggableFieldProps) {
    const x = field.xNorm * containerWidth;
    const y = field.yNorm * containerHeight;
    const w = field.wNorm * containerWidth;
    const h = field.hNorm * containerHeight;

    return (
        <Rnd
            size={{ width: w, height: h }}
            position={{ x, y }}
            onDragStop={(_, d) => {
                onUpdate(field.id, {
                    xNorm: d.x / containerWidth,
                    yNorm: d.y / containerHeight,
                });
            }}
            onResizeStop={(_, __, ref, ___, position) => {
                onUpdate(field.id, {
                    wNorm: parseFloat(ref.style.width) / containerWidth,
                    hNorm: parseFloat(ref.style.height) / containerHeight,
                    xNorm: position.x / containerWidth,
                    yNorm: position.y / containerHeight,
                });
            }}
            bounds="parent"
            enableResizing={true}
            dragHandleClassName="drag-handle"
            cancel=".no-drag"
            style={{
                border: "2px solid var(--primary)",
                background: "rgba(255, 255, 255, 0.9)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                zIndex: 10,
                borderRadius: "12px",
                boxShadow: "0 8px 16px rgba(79, 70, 229, 0.12)",
                backdropFilter: "blur(4px)",
            }}
        >
            <div
                className="drag-handle"
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    cursor: "move",
                    zIndex: 1,
                }}
            />

            <div className="field-badge" style={{ position: "relative", zIndex: 2 }}>
                {field.type}
            </div>

            {field.type === "signature" && !field.value && (
                <button
                    onClick={() => onSignClick?.(field.id)}
                    className="btn btn-outline no-drag"
                    style={{ padding: "4px 12px", fontSize: 13, border: "1px dashed var(--primary)", color: "var(--primary)", background: "transparent", position: "relative", zIndex: 2 }}
                >
                    Add Signature
                </button>
            )}

            {field.type === "signature" && field.value && (
                <img src={field.value as string} alt="signature" style={{ maxWidth: "90%", maxHeight: "90%", objectFit: "contain", position: "relative", zIndex: 2, pointerEvents: "none" }} />
            )}

            {field.type === "image" && !field.value && (
                <label className="no-drag" style={{ cursor: "pointer", padding: "4px 12px", fontSize: 13, border: "1px dashed var(--primary)", color: "var(--primary)", background: "transparent", borderRadius: "8px", position: "relative", zIndex: 2 }}>
                    <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                const reader = new FileReader();
                                reader.onload = () => {
                                    onUpdate(field.id, { value: reader.result as string });
                                };
                                reader.readAsDataURL(file);
                            }
                        }}
                    />
                    Browse Image
                </label>
            )}

            {field.type === "image" && field.value && (
                <img src={field.value as string} alt="field" style={{ maxWidth: "90%", maxHeight: "90%", objectFit: "contain", position: "relative", zIndex: 2, pointerEvents: "none" }} />
            )}

            {field.type === "text" && (
                <input
                    type="text"
                    className="no-drag"
                    value={field.value as string}
                    onChange={(e) => onUpdate(field.id, { value: e.target.value })}
                    style={{
                        width: "100%",
                        height: "100%",
                        border: "none",
                        background: "transparent",
                        textAlign: "center",
                        fontSize: "calc(11px + 0.4vw)",
                        fontWeight: 500,
                        outline: "none",
                        color: "#1e293b",
                        position: "relative",
                        zIndex: 2,
                    }}
                    placeholder="Type text..."
                />
            )}

            {field.type === "date" && (
                <input
                    type="date"
                    className="no-drag"
                    value={field.value as string}
                    onChange={(e) => onUpdate(field.id, { value: e.target.value })}
                    style={{
                        width: "90%",
                        border: "none",
                        background: "transparent",
                        textAlign: "center",
                        fontSize: 13,
                        outline: "none",
                        color: "#475569",
                        position: "relative",
                        zIndex: 2,
                    }}
                />
            )}

            {field.type === "radio" && (
                <div
                    className="no-drag"
                    onClick={() => onUpdate(field.id, { value: (field.value as string) === "true" ? "false" : "true" })}
                    style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        border: "3px solid var(--primary)",
                        background: (field.value as string) === "true" ? "var(--primary)" : "transparent",
                        cursor: "pointer",
                        boxShadow: (field.value as string) === "true" ? "0 4px 12px var(--primary-glow)" : "none",
                        transition: "all 0.2s",
                        position: "relative",
                        zIndex: 2,
                    }}
                />
            )}

            <button
                className="no-drag"
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onDelete(field.id);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                style={{
                    position: "absolute",
                    top: -12,
                    right: -12,
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    background: "var(--accent)",
                    color: "white",
                    border: "2px solid #fff",
                    fontSize: 14,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    fontWeight: 700,
                    zIndex: 20,
                    transition: "transform 0.15s ease, background 0.15s ease",
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.15)";
                    e.currentTarget.style.background = "#dc2626";
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.background = "var(--accent)";
                }}
            >
                ×
            </button>
        </Rnd>
    );
}
