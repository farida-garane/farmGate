const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const products = [
  'Noix brute de cajou',
  'Mangue fraîche',
  'Oignon',
  'Sésame',
  'Tomate',
  'Miel brut',
  'Soja',
  'Maïs',
  'Niébé',
  'Arachide en coque',
  'Arachide décortiquée',
];

const markets = [
  { name: 'Marché Central de Bobo', region: 'Hauts-Bassins' },
  { name: 'Marché de Banfora', region: 'Cascades' },
  { name: 'Marché de Dédougou', region: 'Boucle du Mouhoun' },
  { name: 'Marché de Koudougou', region: 'Centre-Ouest' },
  { name: 'Marché de Ouahigouya', region: 'Nord' },
];

async function main() {
  console.log('Début du seeding...');

  // 1. Seed des produits
  for (const name of products) {
    await prisma.product.upsert({
      where: { name: name },
      update: {},
      create: { name: name },
    });
  }
  console.log(`${products.length} produits insérés ou vérifiés.`);

  // 2. Seed des marchés
  for (const market of markets) {
    // Si vous aviez une contrainte unique sur le nom du marché on utiliserait upsert, 
    // sinon on le crée simplement (à adapter selon vos besoins)
    const existing = await prisma.market.findFirst({ where: { name: market.name } });
    if (!existing) {
      await prisma.market.create({ data: market });
    }
  }
  console.log('Seeding terminé avec succès !');
}

main()
  .catch((e) => {
    console.error('Erreur lors du seeding :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
