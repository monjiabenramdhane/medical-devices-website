import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('Admin123!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@medicaldevices.com' },
    update: {},
    create: {
      email: 'admin@medicaldevices.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create hero slides
  const heroSlides = await Promise.all([
    prisma.heroSlide.create({
      data: {
        title: 'Sailing Beyond Borders',
        subtitle: 'Mindray Joins Mercy Ships',
        description: 'Mindray joins Mercy Ships to deliver better care across Africa',
        ctaText: 'Explore',
        ctaLink: '/about',
        imageUrl: 'https://via.placeholder.com/800x600/0066CC/FFFFFF?text=Medical+Equipment',
        imageAlt: 'Medical equipment on display',
        order: 0,
        isActive: true,
      },
    }),
    prisma.heroSlide.create({
      data: {
        title: 'Advanced Medical Technology',
        subtitle: 'Innovation in Healthcare',
        description: 'Bringing world-class medical devices to healthcare providers across Africa',
        ctaText: 'Learn More',
        ctaLink: '/products',
        imageUrl: 'https://via.placeholder.com/800x600/00CC66/FFFFFF?text=Healthcare+Innovation',
        imageAlt: 'Advanced medical technology',
        order: 1,
        isActive: true,
      },
    }),
  ]);
  console.log(`✅ Created ${heroSlides.length} hero slides`);

  // Create home sections
  const aboutSection = await prisma.homeSection.create({
    data: {
      sectionKey: 'about',
      title: 'Faces Behind The Device',
      subtitle: 'Meet Our Team',
      content: 'We are dedicated to bringing the best medical technology to healthcare providers.',
      imageUrl: 'https://via.placeholder.com/600x400/333333/FFFFFF?text=Our+Team',
      imageAlt: 'Medical Devices Group team',
      ctaText: 'Meet Our Team',
      ctaLink: '/about',
      order: 0,
      isActive: true,
    },
  });
  console.log('✅ Created home section:', aboutSection.sectionKey);

  // Create brands
  const mindray = await prisma.brand.create({
    data: {
      name: 'Mindray',
      slug: 'mindray',
      description: 'Leading medical device manufacturer',
      logoUrl: 'https://via.placeholder.com/200x80/0066CC/FFFFFF?text=Mindray',
      logoAlt: 'Mindray logo',
      websiteUrl: 'https://www.mindray.com',
      order: 0,
      isActive: true,
      metaTitle: 'Mindray Medical Devices',
      metaDescription: 'Explore Mindray medical equipment and solutions',
    },
  });

  const ge = await prisma.brand.create({
    data: {
      name: 'GE Healthcare',
      slug: 'ge-healthcare',
      description: 'Global leader in medical technology',
      logoUrl: 'https://via.placeholder.com/200x80/00AA00/FFFFFF?text=GE+Healthcare',
      logoAlt: 'GE Healthcare logo',
      websiteUrl: 'https://www.gehealthcare.com',
      order: 1,
      isActive: true,
      metaTitle: 'GE Healthcare Medical Equipment',
      metaDescription: 'Discover GE Healthcare solutions',
    },
  });
  console.log('✅ Created 2 brands');

  // Create equipment types for Mindray
  const ultrasound = await prisma.equipmentType.create({
    data: {
      name: 'Ultrasound Systems',
      slug: 'ultrasound',
      description: 'Advanced ultrasound imaging solutions',
      brandId: mindray.id,
      order: 0,
      isActive: true,
    },
  });

  const patientMonitor = await prisma.equipmentType.create({
    data: {
      name: 'Patient Monitors',
      slug: 'patient-monitors',
      description: 'Real-time patient monitoring systems',
      brandId: mindray.id,
      order: 1,
      isActive: true,
    },
  });
  console.log('✅ Created 2 equipment types');

  // Create subcategories
  const cardiology = await prisma.subcategory.create({
    data: {
      name: 'Cardiology',
      slug: 'cardiology',
      description: 'Cardiac imaging and monitoring',
      equipmentTypeId: ultrasound.id,
      order: 0,
      isActive: true,
    },
  });

  const generalist = await prisma.subcategory.create({
    data: {
      name: 'General Imaging',
      slug: 'general-imaging',
      description: 'Multi-purpose imaging solutions',
      equipmentTypeId: ultrasound.id,
      order: 1,
      isActive: true,
    },
  });
  console.log('✅ Created 2 subcategories');

  // Create series
  const consonaSeries = await prisma.series.create({
    data: {
      name: 'Consona Series',
      slug: 'consona',
      description: 'Premium ultrasound systems',
      subcategoryId: cardiology.id,
      order: 0,
      isActive: true,
    },
  });
  console.log('✅ Created 1 series');

  // Create products
  const consonaN7 = await prisma.product.create({
    data: {
      name: 'Consona N7',
      slug: 'consona-n7',
      shortDescription: 'Advanced cardiac ultrasound system with AI-powered imaging',
      fullDescription: 'The Consona N7 delivers exceptional image quality for cardiac applications.',
      gamme: 'HIGH',
      specialty: 'CARDIOLOGY',
      heroImageUrl: 'https://via.placeholder.com/800x600/0066CC/FFFFFF?text=Consona+N7',
      heroImageAlt: 'Mindray Consona N7 ultrasound system',
      isFeatured: true,
      isActive: true,
      order: 0,
      brandId: mindray.id,
      equipmentTypeId: ultrasound.id,
      subcategoryId: cardiology.id,
      seriesId: consonaSeries.id,
      metaTitle: 'Mindray Consona N7 - Premium Cardiac Ultrasound',
      metaDescription: 'Advanced cardiac imaging with AI-powered features',
      metaKeywords: 'ultrasound, cardiology, imaging, mindray, consona',
    },
  });

  // Add product images
  await prisma.productImage.createMany({
    data: [
      {
        productId: consonaN7.id,
        url: 'https://via.placeholder.com/400x300/0066CC/FFFFFF?text=Image+1',
        alt: 'Consona N7 front view',
        order: 0,
      },
      {
        productId: consonaN7.id,
        url: 'https://via.placeholder.com/400x300/0066CC/FFFFFF?text=Image+2',
        alt: 'Consona N7 interface',
        order: 1,
      },
    ],
  });

  // Add product sections
  await prisma.productSection.createMany({
    data: [
      {
        productId: consonaN7.id,
        title: 'Advanced Imaging Technology',
        content: '<p>Experience exceptional image quality with cutting-edge ultrasound technology designed for precise cardiac diagnostics.</p>',
        order: 0,
      },
      {
        productId: consonaN7.id,
        title: 'AI-Powered Analysis',
        content: '<p>Automated measurements and intelligent workflow optimization powered by artificial intelligence.</p>',
        order: 1,
      },
    ],
  });

  // Add specifications
  await prisma.productSpecification.createMany({
    data: [
      {
        productId: consonaN7.id,
        category: 'Display',
        name: 'Screen Size',
        value: '21.5" Full HD LED',
        order: 0,
      },
      {
        productId: consonaN7.id,
        category: 'Display',
        name: 'Resolution',
        value: '1920 x 1080 pixels',
        order: 1,
      },
      {
        productId: consonaN7.id,
        category: 'Technical',
        name: 'Imaging Modes',
        value: 'B, M, Color, PW, CW, Tissue Doppler',
        order: 2,
      },
      {
        productId: consonaN7.id,
        category: 'Connectivity',
        name: 'Network',
        value: 'DICOM 3.0, HL7, Ethernet',
        order: 3,
      },
    ],
  });

  console.log('✅ Created product with images, sections, and specifications');

  console.log('🎉 Seeding completed successfully!');
  console.log('\n📝 Login credentials:');
  console.log('   Email: admin@medicaldevices.com');
  console.log('   Password: Admin123!');
  console.log(`\n🔗 Admin URL: http://localhost:3000${process.env.ADMIN_LOGIN_PATH || '/admin/login'}`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });