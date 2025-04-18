
import { Product, Category } from '@/types/pos';

export const categories: Category[] = [
  { id: 1, name: "All" },
  { id: 2, name: "Nuts" },
  { id: 3, name: "Dried Fruits" },
  { id: 4, name: "Assorted" },
  { id: 5, name: "Gift Packs" },
  { id: 6, name: "Spices" },
];

export const products: Product[] = [
  { 
    id: 1, 
    name: "Premium Cashews", 
    sku: "CF-001", 
    barcode: "8901234567890",
    price: 850, 
    category: "Nuts", 
    image: "https://placehold.co/100x100?text=Cashews",
    unit: "kg",
    stock: 50,
    expiryDate: "2024-12-31"
  },
  { 
    id: 2, 
    name: "California Almonds", 
    sku: "AM-002", 
    barcode: "8901234567891",
    price: 980, 
    category: "Nuts", 
    image: "https://placehold.co/100x100?text=Almonds",
    unit: "kg",
    stock: 45,
    expiryDate: "2024-12-31"
  },
  { 
    id: 3, 
    name: "Iranian Pistachios", 
    sku: "PS-003", 
    barcode: "8901234567892",
    price: 1250, 
    category: "Nuts", 
    image: "https://placehold.co/100x100?text=Pistachios",
    unit: "kg",
    stock: 30,
    expiryDate: "2024-11-30"
  },
  { 
    id: 4, 
    name: "Chilean Walnuts", 
    sku: "WN-004", 
    barcode: "8901234567893",
    price: 1100, 
    category: "Nuts", 
    image: "https://placehold.co/100x100?text=Walnuts",
    unit: "kg",
    stock: 35,
    expiryDate: "2024-10-31"
  },
  { 
    id: 5, 
    name: "Dried Apricots", 
    sku: "DA-005", 
    barcode: "8901234567894",
    price: 750, 
    category: "Dried Fruits", 
    image: "https://placehold.co/100x100?text=Apricots",
    unit: "kg",
    stock: 40,
    expiryDate: "2024-09-30"
  },
  { 
    id: 6, 
    name: "Mixed Dry Fruits", 
    sku: "MD-006", 
    barcode: "8901234567895",
    price: 650, 
    category: "Assorted", 
    image: "https://placehold.co/100x100?text=Mixed",
    unit: "kg",
    stock: 55,
    expiryDate: "2024-08-31"
  },
  { 
    id: 7, 
    name: "Raisins Golden", 
    sku: "RG-007", 
    barcode: "8901234567896",
    price: 320, 
    category: "Dried Fruits", 
    image: "https://placehold.co/100x100?text=Raisins",
    unit: "kg",
    stock: 60,
    expiryDate: "2024-12-31"
  },
  { 
    id: 8, 
    name: "Brazil Nuts", 
    sku: "BN-008", 
    barcode: "8901234567897",
    price: 1300, 
    category: "Nuts", 
    image: "https://placehold.co/100x100?text=Brazil+Nuts",
    unit: "kg",
    stock: 25,
    expiryDate: "2024-11-30"
  },
  { 
    id: 9, 
    name: "Dry Fruit Gift Box", 
    sku: "GF-009", 
    barcode: "8901234567898",
    price: 1500, 
    category: "Gift Packs", 
    image: "https://placehold.co/100x100?text=Gift+Box",
    unit: "box",
    stock: 20,
    expiryDate: "2024-12-31"
  },
];
