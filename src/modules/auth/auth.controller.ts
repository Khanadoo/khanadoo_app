import { registeredUser, loginUser } from './auth.service';
import { registerSchema, loginSchema } from './auth.schema';

export const register = async (req: Request) => {
    const body = await req.json();

    const parsed = registerSchema.parse(body);

    const user = await registeredUser(parsed);

    return Response.json(user);
};

export const login = async (req: Request) => {
    const body = await req.json();

    const parsed = loginSchema.parse(body);

    const tokens = await loginUser(parsed);

    return Response.json(tokens);
};