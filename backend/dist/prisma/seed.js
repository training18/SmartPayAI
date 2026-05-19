"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const adapter = new adapter_pg_1.PrismaPg(process.env.DATABASE_URL);
const prisma = new client_1.PrismaClient({ adapter });
async function main() {
    console.log('🌱 Seeding campaigns...');
    const campaigns = [
        {
            title: 'Migros %5 Cashback',
            description: 'Garanti Bonus kartınızla Migros alışverişlerinizde %5 nakit iade kazanın. Haftalık market harcamalarınızdan tasarruf edin.',
            bankName: 'Garanti BBVA',
            cardType: client_1.CardType.CREDIT,
            rewardType: client_1.RewardType.CASHBACK,
            category: 'grocery',
            rewardRate: 5.0,
            minAmount: 100,
            maxReward: 500,
        },
        {
            title: 'Market Alışverişinde %3 Puan',
            description: 'Yapı Kredi World kartınızla tüm market harcamalarınızda %3 World puan kazanın.',
            bankName: 'Yapı Kredi',
            cardType: client_1.CardType.CREDIT,
            rewardType: client_1.RewardType.POINTS,
            category: 'grocery',
            rewardRate: 3.0,
            maxReward: 300,
        },
        {
            title: 'Elektronik 12 Taksit',
            description: 'Akbank Axess kartınızla elektronik mağazalarında 12 taksit fırsatı. MediaMarkt, Teknosa ve daha fazlasında geçerli.',
            bankName: 'Akbank',
            cardType: client_1.CardType.CREDIT,
            rewardType: client_1.RewardType.INSTALLMENT,
            category: 'electronics',
            rewardRate: 0,
            installmentCount: 12,
            minAmount: 500,
        },
        {
            title: 'Teknoloji %4 Cashback',
            description: 'İş Bankası Maximum kartınızla elektronik alışverişlerinizde %4 nakit iade.',
            bankName: 'İş Bankası',
            cardType: client_1.CardType.CREDIT,
            rewardType: client_1.RewardType.CASHBACK,
            category: 'electronics',
            rewardRate: 4.0,
            maxReward: 1000,
        },
        {
            title: 'Akaryakıt %7 İndirim',
            description: 'Garanti Bonus kartınızla akaryakıt istasyonlarında %7 indirim. Shell, BP, Opet geçerli.',
            bankName: 'Garanti BBVA',
            cardType: client_1.CardType.CREDIT,
            rewardType: client_1.RewardType.DISCOUNT,
            category: 'fuel',
            rewardRate: 7.0,
            maxReward: 200,
        },
        {
            title: 'Yakıt Mil Kazanım',
            description: 'Yapı Kredi World kartınızla akaryakıt alımlarında 3x mil kazanın. Seyahat severlere özel.',
            bankName: 'Yapı Kredi',
            cardType: client_1.CardType.CREDIT,
            rewardType: client_1.RewardType.MILES,
            category: 'fuel',
            rewardRate: 3.0,
        },
        {
            title: 'Kahve %10 Cashback',
            description: 'Akbank Axess kartınızla Starbucks, Kahve Dünyası ve benzeri kahve dükkanlarında %10 nakit iade.',
            bankName: 'Akbank',
            cardType: client_1.CardType.CREDIT,
            rewardType: client_1.RewardType.CASHBACK,
            category: 'coffee',
            rewardRate: 10.0,
            maxReward: 100,
        },
        {
            title: 'Restoran %5 Puan',
            description: 'İş Bankası Maximum kartınızla restoran harcamalarınızda %5 MaxiPuan kazanın.',
            bankName: 'İş Bankası',
            cardType: client_1.CardType.CREDIT,
            rewardType: client_1.RewardType.POINTS,
            category: 'restaurant',
            rewardRate: 5.0,
            maxReward: 400,
        },
        {
            title: 'Yemek Siparişi %8 Cashback',
            description: 'Garanti Bonus kartınızla online yemek siparişlerinde %8 nakit iade. Yemeksepeti, Getir Yemek geçerli.',
            bankName: 'Garanti BBVA',
            rewardType: client_1.RewardType.CASHBACK,
            category: 'restaurant',
            rewardRate: 8.0,
            maxReward: 250,
        },
        {
            title: 'Seyahat 5x Mil',
            description: 'Yapı Kredi World kartınızla havayolu ve otel rezervasyonlarında 5x mil kazanın.',
            bankName: 'Yapı Kredi',
            cardType: client_1.CardType.CREDIT,
            rewardType: client_1.RewardType.MILES,
            category: 'travel',
            rewardRate: 5.0,
        },
        {
            title: 'Giyim 9 Taksit',
            description: 'Akbank Axess kartınızla giyim mağazalarında 9 taksit imkanı. Zara, H&M, Mango ve daha fazlası.',
            bankName: 'Akbank',
            cardType: client_1.CardType.CREDIT,
            rewardType: client_1.RewardType.INSTALLMENT,
            category: 'clothing',
            rewardRate: 0,
            installmentCount: 9,
            minAmount: 300,
        },
        {
            title: 'Online Alışveriş %3 Cashback',
            description: 'İş Bankası Maximum kartınızla tüm online alışverişlerinizde %3 nakit iade.',
            bankName: 'İş Bankası',
            rewardType: client_1.RewardType.CASHBACK,
            category: 'shopping',
            rewardRate: 3.0,
            maxReward: 600,
        },
    ];
    for (const campaign of campaigns) {
        await prisma.campaign.create({ data: campaign });
    }
    console.log(`✅ Seeded ${campaigns.length} campaigns`);
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