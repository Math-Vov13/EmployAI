import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Default tags to create
const defaultTags = [
  { name: 'Report', description: 'Business reports and analytics' },
  { name: 'Invoice', description: 'Financial invoices and receipts' },
  { name: 'Contract', description: 'Legal contracts and agreements' },
  { name: 'Manual', description: 'User manuals and guides' },
  { name: 'Policy', description: 'Company policies and procedures' },
  { name: 'Guide', description: 'How-to guides and tutorials' },
  { name: 'Template', description: 'Document templates' },
  { name: 'Other', description: 'Miscellaneous documents' },
];

async function main() {
  console.log('🌱 Starting database seed...');

  // Seed tags
  console.log('📝 Creating default tags...');
  for (const tag of defaultTags) {
    await prisma.tag.upsert({
      where: { name: tag.name },
      update: {},
      create: { name: tag.name },
    });
    console.log(`  ✓ Created tag: ${tag.name}`);
  }

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
