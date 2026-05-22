import { UsersService } from './users.service';
import { JwtPayload } from '../common/types';
export declare class UsersController {
    private readonly users;
    constructor(users: UsersService);
    getProfile(user: JwtPayload): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        fullName: string;
        role: import("@prisma/client").$Enums.UserRole;
        isOnboarded: boolean;
    }>;
    completeOnboarding(user: JwtPayload): Promise<{
        id: string;
        email: string;
        fullName: string;
        role: import("@prisma/client").$Enums.UserRole;
        isOnboarded: boolean;
    }>;
}
