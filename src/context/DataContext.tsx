
import React, { createContext, useContext, useState, useEffect } from "react";
import { Product, Category, Order, ProductVariant } from "@/types/pos";

interface DataContextType {
  products: Product[];
  categories: Category[];
  orders: Order[];
  addProduct: (product: Product) => void;
  updateProduct: (id: number, updatedProduct: Product) => void;
  deleteProduct: (id: number) => void;
  addCategory: (category: Category) => void;
  updateCategory: (id: number, updatedCategory: Category) => void;
  deleteCategory: (id: number) => void;
  addOrder: (order: Order) => void;
  updateOrder: (id: string, updatedOrder: Order) => void;
  deleteOrder: (id: string) => void;
  addVariant: (productId: number, variant: ProductVariant) => void;
  updateVariant: (productId: number, variantId: number, updatedVariant: ProductVariant) => void;
  deleteVariant: (productId: number, variantId: number) => void;
}

const defaultCategories: Category[] = [
  { id: 1, name: "All", isActive: true },
  { id: 2, name: "Nuts", isActive: true },
  { id: 3, name: "Dried Fruits", isActive: true },
  { id: 4, name: "Assorted", isActive: true },
  { id: 5, name: "Gift Packs", isActive: true },
  { id: 6, name: "Spices", isActive: true },
];

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [orders, setOrders] = useState<Order[]>([]);

  // Load data from localStorage on initial render
  useEffect(() => {
    const savedProducts = localStorage.getItem("products");
    const savedCategories = localStorage.getItem("categories");
    const savedOrders = localStorage.getItem("orders");

    if (savedProducts) setProducts(JSON.parse(savedProducts));
    if (savedCategories) setCategories(JSON.parse(savedCategories));
    if (savedOrders) setOrders(JSON.parse(savedOrders));
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("products", JSON.stringify(products));
    localStorage.setItem("categories", JSON.stringify(categories));
    localStorage.setItem("orders", JSON.stringify(orders));
  }, [products, categories, orders]);

  // Product CRUD operations
  const addProduct = (product: Product) => {
    // Generate new id if not provided
    if (!product.id) {
      const maxId = products.length > 0 ? Math.max(...products.map(p => p.id)) : 0;
      product.id = maxId + 1;
    }
    setProducts(prev => [...prev, product]);
  };

  const updateProduct = (id: number, updatedProduct: Product) => {
    setProducts(prev => prev.map(product => product.id === id ? updatedProduct : product));
  };

  const deleteProduct = (id: number) => {
    setProducts(prev => prev.filter(product => product.id !== id));
  };

  // Category CRUD operations
  const addCategory = (category: Category) => {
    const maxId = categories.length > 0 ? Math.max(...categories.map(c => c.id)) : 0;
    setCategories(prev => [...prev, { ...category, id: maxId + 1 }]);
  };

  const updateCategory = (id: number, updatedCategory: Category) => {
    setCategories(prev => prev.map(category => category.id === id ? updatedCategory : category));
  };

  const deleteCategory = (id: number) => {
    setCategories(prev => prev.filter(category => category.id !== id));
  };

  // Order CRUD operations
  const addOrder = (order: Order) => {
    setOrders(prev => [...prev, order]);
  };

  const updateOrder = (id: string, updatedOrder: Order) => {
    setOrders(prev => prev.map(order => order.id === id ? updatedOrder : order));
  };

  const deleteOrder = (id: string) => {
    setOrders(prev => prev.filter(order => order.id !== id));
  };

  // Variant CRUD operations
  const addVariant = (productId: number, variant: ProductVariant) => {
    setProducts(prev => prev.map(product => {
      if (product.id === productId) {
        const maxVariantId = product.variants.length > 0 
          ? Math.max(...product.variants.map(v => v.id)) 
          : 0;
        return {
          ...product,
          variants: [...product.variants, { ...variant, id: maxVariantId + 1, productId }]
        };
      }
      return product;
    }));
  };

  const updateVariant = (productId: number, variantId: number, updatedVariant: ProductVariant) => {
    setProducts(prev => prev.map(product => {
      if (product.id === productId) {
        return {
          ...product,
          variants: product.variants.map(variant => 
            variant.id === variantId ? updatedVariant : variant
          )
        };
      }
      return product;
    }));
  };

  const deleteVariant = (productId: number, variantId: number) => {
    setProducts(prev => prev.map(product => {
      if (product.id === productId) {
        return {
          ...product,
          variants: product.variants.filter(variant => variant.id !== variantId)
        };
      }
      return product;
    }));
  };

  return (
    <DataContext.Provider value={{
      products,
      categories,
      orders,
      addProduct,
      updateProduct,
      deleteProduct,
      addCategory,
      updateCategory,
      deleteCategory,
      addOrder,
      updateOrder,
      deleteOrder,
      addVariant,
      updateVariant,
      deleteVariant
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
