"use client";

interface ImageUploaderProps {
    onChange: (files: File[]) => void;
}

export default function ImageUploader({
    onChange,
}: ImageUploaderProps) {
    return (
        <label
            className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed p-8"
        >
            Upload Images

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
        </label>
    );
}