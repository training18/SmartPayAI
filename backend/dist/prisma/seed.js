"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const adapter = new adapter_pg_1.PrismaPg(process.env.DATABASE_URL);
const prisma = new client_1.PrismaClient({ adapter });
async function main() {
    console.log('🌱 Seeding MCC mappings...');
    const mccMappings = [
        { mcc: '5411', category: 'grocery', description: 'Grocery Stores, Supermarkets', keywords: ['market', 'süpermarket'] },
        { mcc: '5422', category: 'grocery', description: 'Freezer/Locker Meat Provisioners', keywords: ['et', 'kasap'] },
        { mcc: '5462', category: 'grocery', description: 'Bakeries', keywords: ['fırın', 'ekmek'] },
        { mcc: '5812', category: 'restaurant', description: 'Eating Places, Restaurants', keywords: ['restoran', 'yemek'] },
        { mcc: '5813', category: 'restaurant', description: 'Bars, Taverns, Nightclubs', keywords: ['bar', 'pub'] },
        { mcc: '5814', category: 'restaurant', description: 'Fast Food Restaurants', keywords: ['fast food', 'burger'] },
        { mcc: '5541', category: 'fuel', description: 'Service Stations', keywords: ['akaryakıt', 'benzin'] },
        { mcc: '5542', category: 'fuel', description: 'Automated Fuel Dispensers', keywords: ['akaryakıt'] },
        { mcc: '5732', category: 'electronics', description: 'Electronics Stores', keywords: ['elektronik', 'bilgisayar'] },
        { mcc: '5734', category: 'electronics', description: 'Computer Software Stores', keywords: ['yazılım'] },
        { mcc: '5045', category: 'electronics', description: 'Computers & Peripherals', keywords: ['bilgisayar'] },
        { mcc: '5611', category: 'clothing', description: "Men's Clothing", keywords: ['giyim'] },
        { mcc: '5621', category: 'clothing', description: "Women's Clothing", keywords: ['giyim'] },
        { mcc: '5651', category: 'clothing', description: 'Family Clothing', keywords: ['giyim'] },
        { mcc: '5661', category: 'clothing', description: 'Shoe Stores', keywords: ['ayakkabı'] },
        { mcc: '5699', category: 'clothing', description: 'Miscellaneous Apparel', keywords: ['giyim'] },
        { mcc: '4511', category: 'travel', description: 'Airlines', keywords: ['havayolu', 'uçak'] },
        { mcc: '7011', category: 'travel', description: 'Hotels, Motels', keywords: ['otel'] },
        { mcc: '4722', category: 'travel', description: 'Travel Agencies', keywords: ['seyahat', 'tur'] },
        { mcc: '5912', category: 'health', description: 'Drug Stores, Pharmacies', keywords: ['eczane'] },
        { mcc: '8011', category: 'health', description: 'Doctors', keywords: ['doktor'] },
        { mcc: '8062', category: 'health', description: 'Hospitals', keywords: ['hastane'] },
        { mcc: '8211', category: 'education', description: 'Schools', keywords: ['okul', 'eğitim'] },
        { mcc: '8220', category: 'education', description: 'Colleges, Universities', keywords: ['üniversite'] },
        { mcc: '4121', category: 'transportation', description: 'Taxicabs', keywords: ['taksi'] },
        { mcc: '4111', category: 'transportation', description: 'Local Transportation', keywords: ['ulaşım'] },
        { mcc: '4814', category: 'utilities', description: 'Telecom Services', keywords: ['telekomünikasyon'] },
        { mcc: '5311', category: 'shopping', description: 'Department Stores', keywords: ['mağaza'] },
        { mcc: '5399', category: 'shopping', description: 'General Merchandise', keywords: ['genel'] },
        { mcc: '7832', category: 'entertainment', description: 'Motion Picture Theaters', keywords: ['sinema'] },
        { mcc: '7941', category: 'entertainment', description: 'Sports Clubs', keywords: ['spor'] },
    ];
    for (const mapping of mccMappings) {
        await prisma.mccMapping.upsert({
            where: { mcc: mapping.mcc },
            create: mapping,
            update: mapping,
        });
    }
    console.log(`✅ Seeded ${mccMappings.length} MCC mappings`);
    console.log('');
    console.log('📡 Campaign data will be populated from live bank sources.');
    console.log('   Run POST /campaigns/refresh or wait for the cron job.');
}
main()
    .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map