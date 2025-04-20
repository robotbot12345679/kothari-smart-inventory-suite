
import { Product, Category } from '@/types/pos';

// These are just default categories to get started
export const categories: Category[] = [
  { id: 1, name: "All", isActive: true },
  { id: 2, name: "Nuts", isActive: true },
  { id: 3, name: "Dried Fruits", isActive: true },
  { id: 4, name: "Assorted", isActive: true },
  { id: 5, name: "Gift Packs", isActive: true },
  { id: 6, name: "Spices", isActive: true },
];

// Empty products array - will be populated through the UI
export const products: Product[] = [];
