import cloudinary from "@/lib/cloudinary";
import { authorize } from "@/middleware/role.middleware";

export async function POST(req: Request) {
    const auth = await authorize(["VENDOR", "ADMIN"])(req);

    if ("error" in auth) {
        return new Response(JSON.stringify({ error: auth.error }), { status: auth.status });
    }

    try {
        const body = await req.json();

        const { file } = body;

        if (!file) {
            return new Response(JSON.stringify({ error: "No file provided" }), { status: 400 });
        }

        const uploadResponse = await cloudinary.uploader.upload(file, {
            folder: "food_items",
        });

        return Response.json({ url: uploadResponse.secure_url });
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        return new Response(JSON.stringify({ error: "Failed to upload image" }), { status: 500 });
    }
}