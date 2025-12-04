import os

# Root folder
PROJECT_NAME = "medical-devices-website"

# List of files and folders
structure = [
    ".env.local",
    ".env.production",
    "next.config.js",
    "package.json",
    "tsconfig.json",
    "tailwind.config.ts",
    "prisma/schema.prisma",
    "prisma/seed.ts",
    "src/app/layout.tsx",
    "src/app/page.tsx",
    "src/app/globals.css",
    # Brands
    "src/app/brands/page.tsx",
    "src/app/brands/[brandSlug]/page.tsx",
    "src/app/brands/[brandSlug]/[equipmentSlug]/page.tsx",
    "src/app/brands/[brandSlug]/[equipmentSlug]/[subcategorySlug]/page.tsx",
    "src/app/brands/[brandSlug]/[equipmentSlug]/[subcategorySlug]/[productSlug]/page.tsx",
    # Products
    "src/app/products/page.tsx",
    "src/app/products/[slug]/page.tsx",
    # API
    "src/app/api/auth/[...nextauth]/route.ts",
    "src/app/api/auth/login/route.ts",
]

# Admin API folders
admin_folders = [
    "hero-slides",
    "home-sections",
    "brands",
    "equipment-types",
    "subcategories",
    "series",
    "products"
]

for folder in admin_folders:
    structure.append(f"src/app/api/admin/{folder}/route.ts")
    structure.append(f"src/app/api/admin/{folder}/[id]/route.ts")

# Admin upload and public API
structure.append("src/app/api/admin/upload/route.ts")
structure.append("src/app/api/public/hero-slides/route.ts")
structure.append("src/app/api/public/home-sections/route.ts")
structure.append("src/app/api/public/brands/route.ts")
structure.append("src/app/api/public/products/route.ts")
structure.append("src/app/api/public/products/[slug]/route.ts")

# Admin pages
structure.extend([
    "src/app/admin/layout.tsx",
    "src/app/admin/page.tsx",
    "src/app/admin/login/page.tsx",
])

# Admin pages by sections
sections = ["hero-slides", "home-sections", "brands", "equipment-types", "subcategories", "series", "products"]
for section in sections:
    structure.append(f"src/app/admin/{section}/page.tsx")
    structure.append(f"src/app/admin/{section}/new/page.tsx")
    structure.append(f"src/app/admin/{section}/[id]/page.tsx")

# Components
components = {
    "layout": ["Header.tsx", "Footer.tsx", "Navigation.tsx", "AdminNav.tsx"],
    "home": ["HeroCarousel.tsx", "FeaturedProducts.tsx", "BrandCarousel.tsx", "HomeSectionList.tsx"],
    "products": ["ProductCard.tsx", "ProductGrid.tsx", "ProductDetail.tsx", "ProductGallery.tsx", "ProductSections.tsx", "ProductSpecs.tsx"],
    "admin/forms": ["HeroSlideForm.tsx", "HomeSectionForm.tsx", "BrandForm.tsx", "EquipmentTypeForm.tsx", "SubcategoryForm.tsx", "SeriesForm.tsx", "ProductForm.tsx"],
    "admin/tables": ["DataTable.tsx", "ActionButtons.tsx"],
    "admin": ["ImageUpload.tsx"],
    "ui": ["Button.tsx", "Input.tsx", "Select.tsx", "Textarea.tsx", "Card.tsx", "Modal.tsx", "LoadingSpinner.tsx"]
}

for folder, files in components.items():
    for file in files:
        structure.append(f"src/components/{folder}/{file}")

# Services
services = ["heroSlide", "homeSection", "brand", "equipmentType", "subcategory", "series", "product", "user", "cloudinary", "auth"]
for service in services:
    structure.append(f"src/services/{service}.service.ts")

# Types
types = ["hero", "homeSection", "brand", "equipmentType", "subcategory", "series", "product", "user"]
for t in types:
    structure.append(f"src/types/{t}.type.ts")
structure.append("src/types/index.ts")

# Lib
structure.extend([
    "src/lib/prisma.ts",
    "src/lib/auth.ts",
    "src/lib/cloudinary.ts",
    "src/lib/utils.ts"
])

# Constants
structure.extend([
    "src/constants/navigation.ts",
    "src/constants/seo.ts"
])

# Middleware
structure.append("src/middleware.ts")

# Public
structure.append("public/images/placeholder.jpg")
structure.append("public/favicon.ico")

# Function to create files and folders
for path in structure:
    full_path = os.path.join(PROJECT_NAME, path)
    dir_path = os.path.dirname(full_path)
    if not os.path.exists(dir_path):
        os.makedirs(dir_path)
    if not os.path.exists(full_path):
        open(full_path, "a").close()

print(f"Project structure '{PROJECT_NAME}' created successfully!")
