
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {

    const key = req.nextUrl.searchParams.get("key");
    // Validate key: must be a simple filename (no slashes, no traversal)
    if (!key || !/^[a-zA-Z0-9._-]+$/.test(key)) {
        return new Response("Invalid or missing 'key' parameter", { status: 400 });
    }


    const bucketUrl = process.env.NEXT_PUBLIC_STORAGE_BUCKET;
    const imageUrl = `${bucketUrl}/website-images/${key}`;

    const imageResponse = await fetch(imageUrl);
    if (!imageResponse || !imageResponse.ok) {
        return new Response('Image not found', { status: 404 });
    }
    const contentType = imageResponse.headers.get("Content-Type") || "image/jpeg";
    const imageBuffer = await imageResponse.arrayBuffer();

    return new Response(imageBuffer, {
        headers: {
            "Content-Type": contentType,
            // Security headers
            "X-Content-Type-Options": "nosniff",
            "Cache-Control": "public, max-age=86400, immutable"
        }
    });
}