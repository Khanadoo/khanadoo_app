import { apiFetch } from "@/lib/api";

interface UploadResponse {
  url: string;
  publicId: string;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = () => resolve(reader.result as string);

    reader.onerror = reject;
  });
}

export const uploadClient = {
  async upload(file: File, accessToken: string) {
    const base64 = await fileToBase64(file);

    return apiFetch<UploadResponse>("/api/upload", {
      method: "POST",

      headers: {
        Authorization: `Bearer ${accessToken}`
      },

      body: JSON.stringify({
        file: base64,
      }),
    });
  },
};
