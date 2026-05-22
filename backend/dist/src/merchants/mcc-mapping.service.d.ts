import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma';
export declare class MccMappingService implements OnModuleInit {
    private readonly prisma;
    private readonly logger;
    private mccMap;
    constructor(prisma: PrismaService);
    onModuleInit(): Promise<void>;
    resolveCategory(mcc: string | null | undefined): string | null;
    getKeywords(mcc: string | null | undefined): string[];
    getAllMappings(): Array<{
        mcc: string;
        category: string;
        description: string;
    }>;
    private loadFromDb;
    private fillDefaults;
}
