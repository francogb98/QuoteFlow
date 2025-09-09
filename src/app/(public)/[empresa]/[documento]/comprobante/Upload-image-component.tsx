"use client";
import { CldUploadWidget, CldImage } from "next-cloudinary";
import { useState } from "react";
import { ImageIcon } from "lucide-react";

export default function UploadImageComponent() {
  const [imageUrl, setImageUrl] = useState("");

  return (
    <>
      <CldUploadWidget
        options={{
          sources: ["local", "url"],
          multiple: false,
          maxFiles: 1,
          styles: {
            palette: {
              window: "#FFFFFF",
              windowBorder: "#90A0B3",
              tabIcon: "#0078FF",
              menuIcons: "#5A616A",
              textDark: "#000000",
              textLight: "#FFFFFF",
              link: "#0078FF",
              action: "#FF620C",
              inactiveTabIcon: "#0E2F5A",
              error: "#F44235",
              inProgress: "#0078FF",
              complete: "#20B832",
              sourceBg: "#E4EBF1",
            },
          },
        }}
        uploadPreset="cuotaFacil"
        onSuccess={(results) => {
          //@ts-ignore
          setImageUrl(results.info?.secure_url);
        }}
      >
        {({ open }) => {
          return (
            <div
              className={`
                flex flex-col items-center justify-center text-center p-5 rounded-lg cursor-pointer
                border-2 border-dashed
                ${imageUrl ? "border-gray-300 bg-gray-50" : "border-blue-400 bg-blue-50 hover:bg-blue-100"}
              `}
              onClick={() => open()}
            >
              <ImageIcon
                size={48}
                className={`
                ${imageUrl ? "text-gray-400" : "text-blue-500"}
              `}
              />
              <h4
                className={`mt-3 ${imageUrl ? "text-gray-500" : "text-gray-700"}`}
              >
                {imageUrl ? "Imagen Subida ✅" : "Carga tus archivos aquí"}
              </h4>
              <span
                className={`text-sm ${imageUrl ? "text-gray-400" : "text-gray-500"}`}
              >
                {imageUrl
                  ? "Haz clic para cambiar la imagen"
                  : "o haz clic para explorar"}
              </span>
            </div>
          );
        }}
      </CldUploadWidget>

      {imageUrl && (
        <CldImage
          width="500"
          height="300"
          src={imageUrl}
          alt="Descripción de la imagen"
          crop="fill"
          gravity="auto"
        />
      )}
    </>
  );
}
