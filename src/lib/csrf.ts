import crypto from "crypto";

export const generateCSRFToken = ()=>{
    return crypto.randomBytes(32).toString("hex");
};

export const verifyCSRFToken = ( cookieToken?: string, headerToken?: string ) => {
    if ( !cookieToken || !headerToken ) return false;
    return cookieToken === headerToken;
};