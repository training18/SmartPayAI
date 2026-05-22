"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MccMappingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MccMappingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("../prisma");
const DEFAULT_MCC_MAP = {
    '5411': { category: 'grocery', description: 'Grocery Stores, Supermarkets', keywords: ['market', 'süpermarket', 'bakkal'] },
    '5422': { category: 'grocery', description: 'Freezer/Locker Meat Provisioners', keywords: ['et', 'kasap'] },
    '5441': { category: 'grocery', description: 'Candy, Nut, Confectionery Stores', keywords: ['şekerleme', 'kuruyemiş'] },
    '5451': { category: 'grocery', description: 'Dairy Products Stores', keywords: ['süt', 'mandıra'] },
    '5462': { category: 'grocery', description: 'Bakeries', keywords: ['fırın', 'ekmek', 'pasta'] },
    '5812': { category: 'restaurant', description: 'Eating Places, Restaurants', keywords: ['restoran', 'yemek', 'lokanta'] },
    '5813': { category: 'restaurant', description: 'Bars, Taverns, Nightclubs', keywords: ['bar', 'pub'] },
    '5814': { category: 'restaurant', description: 'Fast Food Restaurants', keywords: ['fast food', 'burger', 'pizza'] },
    '5815': { category: 'coffee', description: 'Digital Goods - Books/Movies/Music', keywords: [] },
    '5541': { category: 'fuel', description: 'Service Stations (with fuel)', keywords: ['akaryakıt', 'benzin', 'mazot'] },
    '5542': { category: 'fuel', description: 'Automated Fuel Dispensers', keywords: ['akaryakıt', 'otomat'] },
    '5732': { category: 'electronics', description: 'Electronics Stores', keywords: ['elektronik', 'bilgisayar', 'telefon'] },
    '5734': { category: 'electronics', description: 'Computer Software Stores', keywords: ['yazılım'] },
    '5045': { category: 'electronics', description: 'Computers & Peripherals', keywords: ['bilgisayar'] },
    '5065': { category: 'electronics', description: 'Electrical Parts & Equipment', keywords: ['elektrik'] },
    '5611': { category: 'clothing', description: "Men's Clothing Stores", keywords: ['giyim', 'erkek'] },
    '5621': { category: 'clothing', description: "Women's Clothing Stores", keywords: ['giyim', 'kadın'] },
    '5631': { category: 'clothing', description: "Women's Accessory Stores", keywords: ['aksesuar'] },
    '5641': { category: 'clothing', description: "Children's Clothing", keywords: ['çocuk', 'giyim'] },
    '5651': { category: 'clothing', description: 'Family Clothing Stores', keywords: ['giyim', 'aile'] },
    '5661': { category: 'clothing', description: 'Shoe Stores', keywords: ['ayakkabı'] },
    '5699': { category: 'clothing', description: 'Miscellaneous Apparel Stores', keywords: ['giyim'] },
    '3000': { category: 'travel', description: 'Airlines', keywords: ['havayolu', 'uçak'] },
    '3001': { category: 'travel', description: 'Airlines', keywords: ['havayolu'] },
    '4511': { category: 'travel', description: 'Airlines, Air Carriers', keywords: ['havayolu', 'uçak bileti'] },
    '7011': { category: 'travel', description: 'Hotels, Motels, Resorts', keywords: ['otel', 'konaklama'] },
    '4722': { category: 'travel', description: 'Travel Agencies', keywords: ['seyahat', 'tur'] },
    '7832': { category: 'entertainment', description: 'Motion Picture Theaters', keywords: ['sinema', 'film'] },
    '7841': { category: 'entertainment', description: 'Video Tape Rental Stores', keywords: ['video'] },
    '7911': { category: 'entertainment', description: 'Dance Halls, Studios', keywords: ['dans'] },
    '7922': { category: 'entertainment', description: 'Theatrical Producers', keywords: ['tiyatro'] },
    '7929': { category: 'entertainment', description: 'Bands, Orchestras', keywords: ['konser', 'müzik'] },
    '7941': { category: 'entertainment', description: 'Athletic Fields, Sports Clubs', keywords: ['spor', 'kulüp'] },
    '5912': { category: 'health', description: 'Drug Stores, Pharmacies', keywords: ['eczane', 'ilaç'] },
    '8011': { category: 'health', description: 'Doctors', keywords: ['doktor', 'hekim'] },
    '8021': { category: 'health', description: 'Dentists', keywords: ['diş'] },
    '8062': { category: 'health', description: 'Hospitals', keywords: ['hastane'] },
    '8211': { category: 'education', description: 'Schools', keywords: ['okul', 'eğitim'] },
    '8220': { category: 'education', description: 'Colleges, Universities', keywords: ['üniversite'] },
    '8241': { category: 'education', description: 'Correspondence Schools', keywords: ['kurs'] },
    '8299': { category: 'education', description: 'Schools, Educational Services', keywords: ['eğitim'] },
    '4111': { category: 'transportation', description: 'Local/Suburban Transportation', keywords: ['ulaşım', 'otobüs'] },
    '4121': { category: 'transportation', description: 'Taxicabs/Limousines', keywords: ['taksi'] },
    '4131': { category: 'transportation', description: 'Bus Lines', keywords: ['otobüs'] },
    '4784': { category: 'transportation', description: 'Tolls and Bridge Fees', keywords: ['köprü', 'geçiş'] },
    '4814': { category: 'utilities', description: 'Telecom Services', keywords: ['telekomünikasyon', 'telefon'] },
    '4816': { category: 'utilities', description: 'Computer Network Services', keywords: ['internet'] },
    '4899': { category: 'utilities', description: 'Cable, Satellite TV', keywords: ['kablo', 'uydu'] },
    '5311': { category: 'shopping', description: 'Department Stores', keywords: ['mağaza', 'alışveriş'] },
    '5331': { category: 'shopping', description: 'Variety Stores', keywords: ['çeşitli'] },
    '5399': { category: 'shopping', description: 'General Merchandise', keywords: ['genel'] },
    '5942': { category: 'shopping', description: 'Book Stores', keywords: ['kitap'] },
    '5943': { category: 'shopping', description: 'Stationery Stores', keywords: ['kırtasiye'] },
};
let MccMappingService = MccMappingService_1 = class MccMappingService {
    prisma;
    logger = new common_1.Logger(MccMappingService_1.name);
    mccMap = new Map();
    constructor(prisma) {
        this.prisma = prisma;
    }
    async onModuleInit() {
        await this.loadFromDb();
        this.fillDefaults();
        this.logger.log(`MCC mapping loaded: ${this.mccMap.size} codes`);
    }
    resolveCategory(mcc) {
        if (!mcc)
            return null;
        const entry = this.mccMap.get(mcc);
        return entry?.category ?? null;
    }
    getKeywords(mcc) {
        if (!mcc)
            return [];
        return this.mccMap.get(mcc)?.keywords ?? [];
    }
    getAllMappings() {
        return Array.from(this.mccMap.entries()).map(([mcc, entry]) => ({
            mcc,
            category: entry.category,
            description: entry.description ?? '',
        }));
    }
    async loadFromDb() {
        try {
            const dbMappings = await this.prisma.mccMapping.findMany();
            for (const m of dbMappings) {
                this.mccMap.set(m.mcc, {
                    category: m.category,
                    description: m.description ?? '',
                    keywords: m.keywords,
                });
            }
        }
        catch {
            this.logger.warn('Failed to load MCC mappings from DB — using defaults only');
        }
    }
    fillDefaults() {
        for (const [mcc, entry] of Object.entries(DEFAULT_MCC_MAP)) {
            if (!this.mccMap.has(mcc)) {
                this.mccMap.set(mcc, entry);
            }
        }
    }
};
exports.MccMappingService = MccMappingService;
exports.MccMappingService = MccMappingService = MccMappingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService])
], MccMappingService);
//# sourceMappingURL=mcc-mapping.service.js.map