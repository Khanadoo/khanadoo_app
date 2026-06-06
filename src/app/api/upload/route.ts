import cloudinary from "@/lib/cloudinary";
import { authorize } from "@/middleware/role.middleware";
import { rateLimit } from "@/lib/rateLimiter";

export async function POST(req: Request) {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";

    await rateLimit(`upload:${ip}`, {
        limit: 20,
        window: 60,
    });

    const auth = await authorize(["BROKER", "ADMIN"])(req);

    if ("error" in auth) {
        return new Response(JSON.stringify({ error: auth.error }), { status: auth.status });
    }

    try {
        const body = await req.json();

        const { file } = body;

        if (!file.startsWith("data:image/")) {
            return new Response(JSON.stringify({ error: "Invalid file format. Only images are allowed" }), { status: 400 });
        }

        if (!file) {
            return new Response(JSON.stringify({ error: "No file provided" }), { status: 400 });
        }

        const sizeInBytes = Buffer.from(
            file.split(",")[1],
            "base64"
        ).length;

        if (sizeInBytes > 5 * 1024 * 1024) {
            return new Response(JSON.stringify({ error: "File size exceeds 5MB limit" }), { status: 400 });
        }

        const uploadResponse = await cloudinary.uploader.upload(file, {
            folder: "real_estate/properties",
        });

        return Response.json({ url: uploadResponse.secure_url, publicId: uploadResponse.public_id });
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        return new Response(JSON.stringify({ error: "Failed to upload image" }), { status: 500 });
    }
}