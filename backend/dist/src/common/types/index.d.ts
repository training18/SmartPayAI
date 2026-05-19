export declare class JwtPayload {
    sub: string;
    email: string;
    role: string;
}
export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}
