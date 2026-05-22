import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

/**
 * Seed only static reference data (MCC mappings).
 *
 * Campaign data is NOT seeded — it comes from live bank scraping.
 * Run `POST /campaigns/refresh` after app startup to populate campaigns
 * from real bank sources.
 */
async function main() {
  // ── MCC Mappings (static reference data) ─────────────────────────────────
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

  // ── Cargo Providers ───────────────────────────────────────────────────────
  console.log('🌱 Seeding cargo providers...');
  const cargoProviders = [
    {
      name: 'Yurtiçi Kargo',
      code: 'yurtici',
      baseRate: 45.00,
      perKgRate: 5.00,
      perDesiRate: 4.50,
      reliabilityScore: 91.00,
      deliverySuccessRate: 98.20,
      avgDeliveryDays: 1.2,
      isActive: true,
    },
    {
      name: 'Aras Kargo',
      code: 'aras',
      baseRate: 38.00,
      perKgRate: 4.50,
      perDesiRate: 4.00,
      reliabilityScore: 84.00,
      deliverySuccessRate: 95.50,
      avgDeliveryDays: 1.8,
      isActive: true,
    },
    {
      name: 'MNG Kargo',
      code: 'mng',
      baseRate: 32.00,
      perKgRate: 4.00,
      perDesiRate: 3.50,
      reliabilityScore: 79.00,
      deliverySuccessRate: 94.00,
      avgDeliveryDays: 2.2,
      isActive: true,
    },
  ];

  for (const provider of cargoProviders) {
    await prisma.cargoProvider.upsert({
      where: { code: provider.code },
      create: provider,
      update: provider,
    });
  }
  console.log(`✅ Seeded ${cargoProviders.length} cargo providers`);
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
