import { PrismaService } from '../prisma';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findById(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        fullName: string;
        role: import("@prisma/client").$Enums.UserRole;
        isOnboarded: boolean;
    }>;
    completeOnboarding(id: string): Promise<{
        id: string;
        email: string;
        fullName: string;
        role: import("@prisma/client").$Enums.UserRole;
        isOnboarded: boolean;
    }>;
}
