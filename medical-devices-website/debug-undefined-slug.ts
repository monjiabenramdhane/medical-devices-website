
import { prisma } from './src/lib/prisma';

async function main() {
    console.log('Checking for EquipmentType with slug "undefined"...');

    const eq = await prisma.equipmentType.findFirst({
        where: { slug: 'undefined' },
        include: { brand: true, subcategories: true }
    });

    if (eq) {
        console.log('❌ FOUND EquipmentType with slug "undefined"!');
        console.log('ID:', eq.id);
        console.log('Brand:', eq.brand.name);
        console.log('Subcategories:', eq.subcategories.map(s => s.name).join(', '));

        // Check if we should fix it?
        // Maybe we should delete it if it's garbage?
    } else {
        console.log('✅ No EquipmentType with slug "undefined" found.');
    }

    // Also check subcategories
    const sub = await prisma.subcategory.findFirst({
        where: { slug: 'undefined' }
    });
    if (sub) {
        console.log('❌ FOUND Subcategory with slug "undefined"!');
    }
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
