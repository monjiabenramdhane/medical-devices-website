import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const translations = [
    // Navigation
    { key: 'nav.home', en: 'Home', fr: 'Accueil', category: 'navigation' },
    { key: 'nav.products', en: 'Products', fr: 'Produits', category: 'navigation' },
    { key: 'nav.about', en: 'About Us', fr: 'À propos', category: 'navigation' },
    { key: 'nav.contact', en: 'Contact', fr: 'Contact', category: 'navigation' },
    { key: 'nav.admin', en: 'Admin Dashboard', fr: 'Administration', category: 'navigation' },

    // Common UI
    { key: 'ui.readMore', en: 'Read More', fr: 'Lire la suite', category: 'ui' },
    { key: 'ui.viewProducts', en: 'View Products', fr: 'Voir les produits', category: 'ui' },
    { key: 'ui.requestQuote', en: 'Request Quote', fr: 'Demander un devis', category: 'ui' },
    { key: 'ui.contactUs', en: 'Contact Us', fr: 'Contactez-nous', category: 'ui' },
    { key: 'ui.learnMore', en: 'Learn More', fr: 'En savoir plus', category: 'ui' },
    { key: 'ui.search', en: 'Search', fr: 'Rechercher', category: 'ui' },
    { key: 'ui.submit', en: 'Submit', fr: 'Envoyer', category: 'ui' },
    { key: 'ui.cancel', en: 'Cancel', fr: 'Annuler', category: 'ui' },
    { key: 'ui.all', en: 'All', fr: 'Tous', category: 'ui' },

    // Home Page
    { key: 'home.featuredProducts', en: 'Featured Products', fr: 'Produits Vedettes', category: 'home' },
    { key: 'home.ourPartners', en: 'Our Partners', fr: 'Nos Partenaires', category: 'home' },
    { key: 'home.viewAll', en: 'View All', fr: 'Voir Tout', category: 'home' },

    // Footer
    { key: 'footer.rights', en: 'All rights reserved.', fr: 'Tous droits réservés.', category: 'footer' },
    { key: 'footer.quickLinks', en: 'Quick Links', fr: 'Liens Rapides', category: 'footer' },

    // Meta
    { key: 'meta.notFound', en: 'Page Not Found', fr: 'Page Non Trouvée', category: 'meta' },
    { key: 'lang.english', en: 'English', fr: 'English', category: 'lang' },
    { key: 'lang.french', en: 'Français', fr: 'Français', category: 'lang' },
];

async function main() {
    console.log('Seeding translations...');

    for (const t of translations) {
        // Upsert English
        await prisma.translation.upsert({
            where: { key_locale: { key: t.key, locale: 'en' } },
            update: { value: t.en, category: t.category },
            create: { key: t.key, locale: 'en', value: t.en, category: t.category },
        });

        // Upsert French
        await prisma.translation.upsert({
            where: { key_locale: { key: t.key, locale: 'fr' } },
            update: { value: t.fr, category: t.category },
            create: { key: t.key, locale: 'fr', value: t.fr, category: t.category },
        });
    }

    console.log('Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
