import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌍 Seeding Brand & Product Translations (EN / FR)...');

  /* ===========================
   * BRAND TRANSLATIONS
   * =========================== */

  const brands = await prisma.brand.findMany();

  for (const brand of brands) {
    // EN (mirror original content)
    await prisma.brandTranslation.upsert({
      where: {
        brandId_locale: {
          brandId: brand.id,
          locale: 'en',
        },
      },
      update: {
        name: brand.name,
        description: brand.description,
        metaTitle: brand.metaTitle,
        metaDescription: brand.metaDescription,
      },
      create: {
        brandId: brand.id,
        locale: 'en',
        name: brand.name,
        description: brand.description,
        metaTitle: brand.metaTitle,
        metaDescription: brand.metaDescription,
      },
    });

    // FR
    await prisma.brandTranslation.upsert({
      where: {
        brandId_locale: {
          brandId: brand.id,
          locale: 'fr',
        },
      },
      update: {
        name: brand.name,
        description: brandDescriptionFR(brand.slug),
        metaTitle: brandMetaTitleFR(brand.slug),
        metaDescription: brandMetaDescriptionFR(brand.slug),
      },
      create: {
        brandId: brand.id,
        locale: 'fr',
        name: brand.name,
        description: brandDescriptionFR(brand.slug),
        metaTitle: brandMetaTitleFR(brand.slug),
        metaDescription: brandMetaDescriptionFR(brand.slug),
      },
    });
  }

  /* ===========================
   * PRODUCT TRANSLATIONS
   * =========================== */

  const products = await prisma.product.findMany();

  for (const product of products) {
    // EN
    await prisma.productTranslation.upsert({
      where: {
        productId_locale: {
          productId: product.id,
          locale: 'en',
        },
      },
      update: {
        name: product.name,
        shortDescription: product.shortDescription,
        fullDescription: product.fullDescription,
        metaTitle: product.metaTitle,
        metaDescription: product.metaDescription,
      },
      create: {
        productId: product.id,
        locale: 'en',
        name: product.name,
        shortDescription: product.shortDescription,
        fullDescription: product.fullDescription,
        metaTitle: product.metaTitle,
        metaDescription: product.metaDescription,
      },
    });

    // FR
    await prisma.productTranslation.upsert({
      where: {
        productId_locale: {
          productId: product.id,
          locale: 'fr',
        },
      },
      update: {
        name: productNameFR(product.slug),
        shortDescription: productShortDescFR(product.slug),
        fullDescription: productFullDescFR(product.slug),
        metaTitle: productMetaTitleFR(product.slug),
        metaDescription: productMetaDescriptionFR(product.slug),
      },
      create: {
        productId: product.id,
        locale: 'fr',
        name: productNameFR(product.slug),
        shortDescription: productShortDescFR(product.slug),
        fullDescription: productFullDescFR(product.slug),
        metaTitle: productMetaTitleFR(product.slug),
        metaDescription: productMetaDescriptionFR(product.slug),
      },
    });
  }

  console.log('✅ Brand & Product translations seeded successfully!');
}

/* ======================================================
 * BRAND TRANSLATIONS – FR
 * ====================================================== */

function brandDescriptionFR(slug: string): string {
  switch (slug) {
    case 'mindray':
      return 'Fabricant leader de dispositifs médicaux offrant des solutions innovantes pour améliorer les soins de santé.';
    case 'edan':
      return 'EDAN est une entreprise mondiale spécialisée dans les dispositifs médicaux, le diagnostic et la surveillance des patients.';
    default:
      return '';
  }
}

function brandMetaTitleFR(slug: string): string {
  switch (slug) {
    case 'mindray':
      return 'Équipements médicaux Mindray';
    case 'edan':
      return 'Dispositifs médicaux EDAN';
    default:
      return '';
  }
}

function brandMetaDescriptionFR(slug: string): string {
  switch (slug) {
    case 'mindray':
      return 'Découvrez les solutions et équipements médicaux Mindray.';
    case 'edan':
      return 'EDAN propose des solutions médicales innovantes à l’échelle mondiale.';
    default:
      return '';
  }
}

/* ======================================================
 * PRODUCT TRANSLATIONS – FR
 * ====================================================== */

function productNameFR(slug: string): string {
  switch (slug) {
    case 'consona-n7':
      return 'Consona N7 – Échographe cardiaque avancé';
    case 'dp-30':
      return 'DP-30 – Système d’échographie portable';
    case 'recho-n9':
      return 'Recho N9 – Échographie cardiovasculaire';
    default:
      return '';
  }
}

function productShortDescFR(slug: string): string {
  switch (slug) {
    case 'consona-n7':
      return 'Système d’échographie cardiaque avancé avec assistance par intelligence artificielle.';
    case 'dp-30':
      return 'Système d’échographie portable noir et blanc avec Doppler.';
    case 'recho-n9':
      return 'Solution fiable pour le diagnostic cardiovasculaire.';
    default:
      return '';
  }
}

function productFullDescFR(slug: string): string {
  switch (slug) {
    case 'consona-n7':
      return 'Le Consona N7 offre une qualité d’image exceptionnelle et des outils intelligents pour les applications cardiologiques.';
    case 'dp-30':
      return 'Le DP-30 combine mobilité, ergonomie et performances Doppler pour les soins primaires.';
    case 'recho-n9':
      return 'Le Recho N9 fournit des solutions avancées pour le diagnostic cardiovasculaire.';
    default:
      return '';
  }
}

function productMetaTitleFR(slug: string): string {
  switch (slug) {
    case 'consona-n7':
      return 'Mindray Consona N7 – Échographie cardiaque premium';
    case 'dp-30':
      return 'Mindray DP-30 – Échographe portable';
    case 'recho-n9':
      return 'Recho N9 – Échographie cardiovasculaire';
    default:
      return '';
  }
}

function productMetaDescriptionFR(slug: string): string {
  switch (slug) {
    case 'consona-n7':
      return 'Imagerie cardiaque avancée avec des fonctionnalités basées sur l’IA.';
    case 'dp-30':
      return 'Système d’échographie portable performant pour les soins primaires.';
    case 'recho-n9':
      return 'Solution fiable et performante pour l’échographie cardiovasculaire.';
    default:
      return '';
  }
}

/* ====================================================== */

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
