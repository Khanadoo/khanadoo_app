"use client";

interface ImageUploaderProps {
    onChange: (files: File[]) => void;
}

export default function ImageUploader({
    onChange,
}: ImageUploaderProps) {
    return (
        <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) =>
                onChange(
                    Array.from(e.target.files || [])
                )
            }
        />
    );
}