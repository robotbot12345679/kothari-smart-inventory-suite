
import { Product, Category } from '@/types/pos';

export const categories: Category[] = [
  { id: 1, name: "All", isActive: true },
  { id: 2, name: "Nuts", isActive: true },
  { id: 3, name: "Dried Fruits", isActive: true },
  { id: 4, name: "Assorted", isActive: true },
  { id: 5, name: "Gift Packs", isActive: true },
  { id: 6, name: "Spices", isActive: true },
];

export const products: Product[] = [
  { 
    id: 1, 
    name: "Premium Cashews", 
    sku: "CF-001", 
    barcode: "8901234567890",
    category: "Nuts", 
    image: "https://placehold.co/100x100?text=Cashews",
    description: "High-quality premium cashews",
    isActive: true,
    variants: [
      {
        id: 1,
        productId: 1,
        name: "Standard Pack",
        weight: 500,
        unit: "g",
        price: 850,
        stock: 50,
        sku: "CF-001-500G"
      },
      {
        id: 2,
        productId: 1,
        name: "Economy Pack",
        weight: 1,
        unit: "kg",
        price: 1600,
        stock: 30,
        sku: "CF-001-1KG"
      }
    ],
    expiryDate: "2024-12-31",
    minimumStock: 10
  },
  { 
    id: 2, 
    name: "California Almonds", 
    sku: "AM-002", 
    barcode: "8901234567891",
    category: "Nuts", 
    image: "https://placehold.co/100x100?text=Almonds",
    description: "Premium California almonds",
    isActive: true,
    variants: [
      {
        id: 3,
        productId: 2,
        name: "Standard Pack",
        weight: 500,
        unit: "g",
        price: 980,
        stock: 45,
        sku: "AM-002-500G"
      }
    ],
    expiryDate: "2024-12-31",
    minimumStock: 15
  },
  { 
    id: 3, 
    name: "Iranian Pistachios", 
    sku: "PS-003", 
    barcode: "8901234567892",
    category: "Nuts", 
    image: "https://placehold.co/100x100?text=Pistachios",
    description: "Premium Iranian pistachios",
    isActive: true,
    variants: [
      {
        id: 4,
        productId: 3,
        name: "Standard Pack",
        weight: 500,
        unit: "g",
        price: 1250,
        stock: 30,
        sku: "PS-003-500G"
      }
    ],
    expiryDate: "2024-11-30",
    minimumStock: 10
  },
  { 
    id: 4, 
    name: "Chilean Walnuts", 
    sku: "WN-004", 
    barcode: "8901234567893",
    category: "Nuts", 
    image: "https://placehold.co/100x100?text=Walnuts",
    description: "Premium Chilean walnuts",
    isActive: true,
    variants: [
      {
        id: 5,
        productId: 4,
        name: "Standard Pack",
        weight: 500,
        unit: "g",
        price: 1100,
        stock: 35,
        sku: "WN-004-500G"
      }
    ],
    expiryDate: "2024-10-31",
    minimumStock: 10
  },
  { 
    id: 5, 
    name: "Dried Apricots", 
    sku: "DA-005", 
    barcode: "8901234567894",
    category: "Dried Fruits", 
    image: "https://placehold.co/100x100?text=Apricots",
    description: "Premium dried apricots",
    isActive: true,
    variants: [
      {
        id: 6,
        productId: 5,
        name: "Standard Pack",
        weight: 500,
        unit: "g",
        price: 750,
        stock: 40,
        sku: "DA-005-500G"
      }
    ],
    expiryDate: "2024-09-30",
    minimumStock: 15
  },
  { 
    id: 6, 
    name: "Mixed Dry Fruits", 
    sku: "MD-006", 
    barcode: "8901234567895",
    category: "Assorted", 
    image: "https://placehold.co/100x100?text=Mixed",
    description: "Premium mixed dry fruits",
    isActive: true,
    variants: [
      {
        id: 7,
        productId: 6,
        name: "Standard Pack",
        weight: 500,
        unit: "g",
        price: 650,
        stock: 55,
        sku: "MD-006-500G"
      }
    ],
    expiryDate: "2024-08-31",
    minimumStock: 20
  },
  { 
    id: 7, 
    name: "Raisins Golden", 
    sku: "RG-007", 
    barcode: "8901234567896",
    category: "Dried Fruits", 
    image: "https://placehold.co/100x100?text=Raisins",
    description: "Premium golden raisins",
    isActive: true,
    variants: [
      {
        id: 8,
        productId: 7,
        name: "Standard Pack",
        weight: 500,
        unit: "g",
        price: 320,
        stock: 60,
        sku: "RG-007-500G"
      }
    ],
    expiryDate: "2024-12-31",
    minimumStock: 20
  },
  { 
    id: 8, 
    name: "Brazil Nuts", 
    sku: "BN-008", 
    barcode: "8901234567897",
    category: "Nuts", 
    image: "https://placehold.co/100x100?text=Brazil+Nuts",
    description: "Premium Brazil nuts",
    isActive: true,
    variants: [
      {
        id: 9,
        productId: 8,
        name: "Standard Pack",
        weight: 500,
        unit: "g",
        price: 1300,
        stock: 25,
        sku: "BN-008-500G"
      }
    ],
    expiryDate: "2024-11-30",
    minimumStock: 10
  },
  { 
    id: 9, 
    name: "Dry Fruit Gift Box", 
    sku: "GF-009", 
    barcode: "8901234567898",
    category: "Gift Packs", 
    image: "https://placehold.co/100x100?text=Gift+Box",
    description: "Premium dry fruit gift box",
    isActive: true,
    variants: [
      {
        id: 10,
        productId: 9,
        name: "Standard Box",
        weight: 1,
        unit: "box",
        price: 1500,
        stock: 20,
        sku: "GF-009-BOX"
      }
    ],
    expiryDate: "2024-12-31",
    minimumStock: 5
  },
];
