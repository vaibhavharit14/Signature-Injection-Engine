import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

interface PdfViewerProps {
    pdfUrl: string;
    onLoad: (dimensions: { width: number; height: number }) => void;
    children?: React.ReactNode;
}

export default function PdfViewer({ pdfUrl, onLoad, children }: PdfViewerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        let renderTask: any = null;

        async function loadPdf() {
            if (cancelled) return;
            setLoading(true);
            try {
                const loadingTask = pdfjsLib.getDocument(pdfUrl);
                const pdf = await loadingTask.promise;
                if (cancelled) return;

                const page = await pdf.getPage(1);
                if (cancelled) return;

                const viewport = page.getViewport({ scale: 1.5 });
                const canvas = canvasRef.current;
                if (!canvas || cancelled) return;

                const context = canvas.getContext("2d");
                if (!context || cancelled) return;

                canvas.height = viewport.height;
                canvas.width = viewport.width;

                context.setTransform(1, 0, 0, 1, 0, 0);

                renderTask = page.render({
                    canvasContext: context,
                    viewport: viewport,
                } as any);

                await renderTask.promise;

                if (!cancelled) {
                    onLoad({ width: viewport.width, height: viewport.height });
                }
            } catch (err: any) {
                if (err.name !== 'RenderingCancelledException' && !cancelled) {
                    console.error("PDF Render Error:", err);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        if (pdfUrl) {
            loadPdf();
        }

        return () => {
            cancelled = true;
            if (renderTask) {
                renderTask.cancel();
            }
        };
    }, [pdfUrl, onLoad]);

    return (
        <div
            ref={containerRef}
            className="pdf-viewer-container"
            style={{
                position: "relative",
                border: "1px solid #ddd",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                background: "#f0f0f0",
                margin: "0 auto",
                display: "inline-block"
            }}
        >
            {loading && <div style={{ padding: 20 }}>Loading PDF...</div>}
            <canvas ref={canvasRef} style={{ display: "block" }} />
            {!loading && (
                <div
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        pointerEvents: "none"
                    }}
                >
                    <div style={{ position: "relative", width: "100%", height: "100%", pointerEvents: "auto" }}>
                        {children}
                    </div>
                </div>
            )}
        </div>
    );
}
