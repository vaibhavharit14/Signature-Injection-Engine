
export type SignField =
  | {
    pageIndex: number;
    xNorm: number;
    yNorm: number;
    wNorm: number;
    hNorm: number;
    type: "text" | "date";
    value: string;
  }
  | {
    pageIndex: number;
    xNorm: number;
    yNorm: number;
    wNorm: number;
    hNorm: number;
    type: "signature" | "image";
    value: string;
  }
  | {
    pageIndex: number;
    xNorm: number;
    yNorm: number;
    wNorm: number;
    hNorm: number;
    type: "radio";
    value: "true" | "false";
  };

export type SignRequest = {
  pdfId: string;
  fields: SignField[];
  pageSizesPt?: { W: number; H: number }[];
};

export type SignResponse = {
  url: string;
  originalHash: string;
  signedHash: string;
};

const BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace(/\/+$/, "");

async function http<T>(path: string, init: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || data.message || `HTTP ${res.status}`);
  }
  return data as T;
}

export const Api = {
  signPdf(payload: SignRequest) {
    return http<SignResponse>("/sign-pdf", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  uploadPdf(formData: FormData) {
    return fetch(`${BASE_URL}/upload-pdf`, {
      method: "POST",
      body: formData,
    }).then(async (res) => {
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Upload failed");
      return data as { filename: string; url: string };
    });
  },
  getSignedFileUrl(relativeUrl: string) {
    if (!relativeUrl) return "";
    const cleanPath = relativeUrl.startsWith("/") ? relativeUrl : `/${relativeUrl}`;
    return `${BASE_URL}${cleanPath}`;
  },
};