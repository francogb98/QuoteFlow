/**
 * Extrae el public_id de una URL de Cloudinary
 * @param url - URL completa de Cloudinary
 * @returns public_id o null si no se puede extraer
 */
export function extractCloudinaryPublicId(url: string): string | null {
  try {
    // Patrón para URLs de Cloudinary: https://res.cloudinary.com/cloud-name/image/upload/v1234567890/public_id.extension
    const regex = /\/upload\/(?:v\d+\/)?([^.]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  } catch (error) {
    console.error("Error extracting public_id from Cloudinary URL:", error);
    return null;
  }
}

/**
 * Elimina una imagen de Cloudinary usando su public_id
 * @param publicId - public_id de la imagen a eliminar
 * @returns Promise<boolean> - true si se eliminó exitosamente
 */
export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.NEXT_CLOUDINARY_CLOUD_API_KEY;
    const apiSecret = process.env.NEXT_CLOUDINARY_CLOUD_SECRET_KEY;

    if (!cloudName || !apiKey || !apiSecret) {
      console.error("Missing Cloudinary environment variables");
      return false;
    }

    // Crear signature para la API de Cloudinary
    const crypto = require("crypto");
    const signature = crypto
      .createHash("sha1")
      .update(`public_id=${publicId}&timestamp=${timestamp}${apiSecret}`)
      .digest("hex");

    const formData = new FormData();
    formData.append("public_id", publicId);
    formData.append("timestamp", timestamp.toString());
    formData.append("api_key", apiKey);
    formData.append("signature", signature);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
      {
        method: "POST",
        body: formData,
      }
    );

    const result = await response.json();
    return result.result === "ok";
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    return false;
  }
}
