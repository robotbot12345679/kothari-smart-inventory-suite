
import { Product, Category } from '@/types/pos';

// Sample categories array
export const categories: Category[] = [
  {
    id: 1,
    name: "Dry Fruits",
    description: "All types of dry fruits",
    isActive: true
  },
  {
    id: 2,
    name: "Nuts",
    description: "All types of nuts",
    isActive: true
  },
  {
    id: 3,
    name: "Spices",
    description: "Various spices",
    isActive: true
  },
  {
    id: 4,
    name: "Snacks",
    description: "Ready to eat snacks",
    isActive: true
  }
];

// Sample products array
export const products: Product[] = [
  {
    id: 1,
    name: "Cashew Nuts",
    sku: "CF-001",
    category: "Nuts",
    image: "",
    barcode: "8901234567890",
    description: "Premium quality cashew nuts",
    price: 850,
    stock: 25,
    weight: 1,
    unit: "kg",
    priceIncludesGST: true,
    expiryDate: "2025-12-31",
    minimumStock: 10,
    isActive: true
  },
  {
    id: 2,
    name: "Almonds",
    sku: "AM-002",
    category: "Nuts",
    image: "",
    barcode: "8901234567891",
    description: "California almonds",
    price: 950,
    stock: 15,
    weight: 1,
    unit: "kg",
    priceIncludesGST: true,
    expiryDate: "2025-11-30",
    minimumStock: 8,
    isActive: true
  },
  {
    id: 3,
    name: "Raisins",
    sku: "RS-003",
    category: "Dry Fruits",
    image: "",
    description: "Sweet golden raisins",
    price: 350,
    stock: 30,
    weight: 500,
    unit: "g",
    priceIncludesGST: true,
    expiryDate: "2025-10-15",
    minimumStock: 5,
    isActive: true
  }
];
