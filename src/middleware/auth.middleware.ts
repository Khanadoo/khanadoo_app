import jwt from 'jsonwebtoken';

export const verifyToken = (req: Request) => {
    const authHeader = req.headers.get("authorization");

    if(!authHeader) {
        throw new Error("No token provided");
    }

    const token = authHeader.split(" ")[1];

    if(!token) {
        throw new Error("Invalid token format");
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string);
        return decoded;
    } catch (err: any) {
        throw new Error("Invalid or expired token");
    }
};