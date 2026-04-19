import { cookies } from "next/headers";
import { verifyCSRFToken } from "@/lib/csrf";

export const requireCSRF = async (req: Request) => {
    const cookieStore = await cookies();
    
    const cookieToken = cookieStore.get("csrfToken")?.value;
    const headerToken = req.headers.get("x-csrf-token") || undefined;

    const isValid = verifyCSRFToken(cookieToken, headerToken);

    if (!isValid) {
        throw new Error("Invalid CSRF Token");
    }
};