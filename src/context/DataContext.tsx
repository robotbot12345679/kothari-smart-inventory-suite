import React, { createContext, useContext, useState, useEffect } from "react";
import { Product, Category, Order, ProductVariant, Customer } from "@/types/pos";
import { useToast } from "@/components/ui/use-toast";

interface DataContextType {
  products: Product[];
  categories: Category[];
  orders: Order[];
  customers: Customer[];
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
  addCustomer: (customer: Customer) => void;
  updateCustomer: (id: number, updatedCustomer: Customer) => void;
  deleteCustomer: (id: number) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    const savedProducts = localStorage.getItem("products");
    const savedCategories = localStorage.getItem("categories");
    const savedOrders = localStorage.getItem("orders");
    const savedCustomers = localStorage.getItem("customers");

    if (savedProducts) setProducts(JSON.parse(savedProducts));
    if (savedCategories) setCategories(JSON.parse(savedCategories));
    if (savedOrders) setOrders(JSON.parse(savedOrders));
    if (savedCustomers) setCustomers(JSON.parse(savedCustomers));

    if (!savedCategories || JSON.parse(savedCategories).length === 0) {
      setCategories([
        { id: 1, name: "All", isActive: true },
      ]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("products", JSON.stringify(products));
    localStorage.setItem("categories", JSON.stringify(categories));
    localStorage.setItem("orders", JSON.stringify(orders));
    localStorage.setItem("customers", JSON.stringify(customers));
  }, [products, categories, orders, customers]);

  const findProductByBarcode = (barcode: string): Product | undefined => {
    return products.find(product => product.barcode === barcode);
  };

  const addProduct = (product: Product) => {
    try {
      if (!product.id) {
        const maxId = products.length > 0 ? Math.max(...products.map(p => p.id)) : 0;
        product.id = maxId + 1;
      }
      
      if ((!product.variants || product.variants.length === 0) && product.variants && product.variants[0]) {
        const variant = product.variants[0];
        product.variants = [{
          id: 1,
          productId: product.id,
          name: 'Default',
          weight: 1,
          unit: 'kg',
          price: variant.price,
          stock: variant.stock || 0,
          sku: product.sku + '-1'
        }];
      } else if (!product.variants || product.variants.length === 0) {
        product.variants = [{
          id: 1,
          productId: product.id,
          name: 'Default',
          weight: 1,
          unit: 'kg',
          price: 0,
          stock: 0,
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

  const addOrder = (order: Order) => {
    setOrders(prev => [...prev, order]);
  };

  const updateOrder = (id: string, updatedOrder: Order) => {
    setOrders(prev => prev.map(order => order.id === id ? updatedOrder : order));
  };

  const deleteOrder = (id: string) => {
    setOrders(prev => prev.filter(order => order.id !== id));
  };

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

  const addCustomer = (customer: Customer) => {
    try {
      if (!customer.id) {
        const maxId = customers.length > 0 ? Math.max(...customers.map(c => c.id)) : 0;
        customer.id = maxId + 1;
      }
      setCustomers(prev => [...prev, customer]);
      toast({
        title: "Success",
        description: `Customer "${customer.name}" has been added.`,
      });
    } catch (error) {
      console.error("Error adding customer:", error);
      toast({
        title: "Error",
        description: "Failed to add customer. Please try again.",
        variant: "destructive"
      });
    }
  };

  const updateCustomer = (id: number, updatedCustomer: Customer) => {
    setCustomers(prev => prev.map(customer => customer.id === id ? updatedCustomer : customer));
    toast({
      title: "Success",
      description: `Customer "${updatedCustomer.name}" has been updated.`,
    });
  };

  const deleteCustomer = (id: number) => {
    setCustomers(prev => prev.filter(customer => customer.id !== id));
    toast({
      title: "Success",
      description: "Customer has been deleted.",
    });
  };

  return (
    <DataContext.Provider value={{
      products,
      categories,
      orders,
      customers,
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
      findProductByBarcode,
      addCustomer,
      updateCustomer,
      deleteCustomer
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
