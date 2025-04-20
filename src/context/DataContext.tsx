import React, { createContext, useContext, useState, useEffect } from "react";
import { Product, Category, Order, ProductVariant } from "@/types/pos";
import { useToast } from "@/components/ui/use-toast";

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
  findProductByBarcode: (barcode: string) => Product | undefined;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // Load data from localStorage on initial render
  useEffect(() => {
    const savedProducts = localStorage.getItem("products");
    const savedCategories = localStorage.getItem("categories");
    const savedOrders = localStorage.getItem("orders");

    if (savedProducts) setProducts(JSON.parse(savedProducts));
    if (savedCategories) setCategories(JSON.parse(savedCategories));
    if (savedOrders) setOrders(JSON.parse(savedOrders));
    
    // If no categories exist, create the default "All" category
    if (!savedCategories || JSON.parse(savedCategories).length === 0) {
      setCategories([
        { id: 1, name: "All", isActive: true },
      ]);
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("products", JSON.stringify(products));
    localStorage.setItem("categories", JSON.stringify(categories));
    localStorage.setItem("orders", JSON.stringify(orders));
  }, [products, categories, orders]);

  // Find product by barcode
  const findProductByBarcode = (barcode: string): Product | undefined => {
    return products.find(product => product.barcode === barcode);
  };

  // Product CRUD operations
  const addProduct = (product: Product) => {
    try {
      // Generate new id if not provided
      if (!product.id) {
        const maxId = products.length > 0 ? Math.max(...products.map(p => p.id)) : 0;
        product.id = maxId + 1;
      }
      
      // If there are no variants, create a default one
      if ((!product.variants || product.variants.length === 0) && product.price) {
        product.variants = [{
          id: 1,
          productId: product.id,
          name: 'Default',
          weight: 1,
          unit: 'kg',
          price: parseFloat(product.price.toString()),
          stock: product.stock ? parseFloat(product.stock.toString()) : 0,
          sku: product.sku + '-1'
        }];
      }
      
      setProducts(prev => [...prev, product]);
      toast({
        title: "Success",
        description: `Product "${product.name}" has been added.`,
      });
    } catch (error) {
      console.error("Error adding product:", error);
      toast({
        title: "Error",
        description: "Failed to add product. Please try again.",
        variant: "destructive"
      });
    }
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
      deleteVariant,
      findProductByBarcode
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
