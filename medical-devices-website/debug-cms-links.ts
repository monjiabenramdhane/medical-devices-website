
import { prisma } from './src/lib/prisma';

async function main() {
    console.log('Checking HeroSlides for bad links...');
    const slides = await prisma.heroSlide.findMany();
    slides.forEach(s => {
        if (s.ctaLink?.includes('undefined')) {
            console.log(`❌ HeroSlide "${s.title}" has bad link: ${s.ctaLink}`);
        } else {
            console.log(`Slide "${s.title}": ${s.ctaLink || 'no link'}`);
        }
    });

    console.log('\nChecking HomeSections...');
    const sections = await prisma.homeSection.findMany();
    sections.forEach(s => {
        if (s.ctaLink?.includes('undefined')) {
            console.log(`❌ HomeSection "${s.title}" has bad link: ${s.ctaLink}`);
        } else {
            console.log(`Section "${s.title}": ${s.ctaLink || 'no link'}`);
        }
    });
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
