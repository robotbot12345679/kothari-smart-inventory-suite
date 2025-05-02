import React, { createContext, useContext, useState, useEffect } from "react";
import { Product, Category, Order, Customer } from "@/types/pos";
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
  findProductByBarcode: (barcode: string) => Product | undefined;
  addCustomer: (customer: Customer) => void;
  updateCustomer: (id: number, updatedCustomer: Customer) => void;
  deleteCustomer: (id: number) => void;
  updateInventoryStock: (id: number, additionalStock: number) => void;
  createAccount: (email: string, name: string, password: string) => boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  currentUser: { email: string; name: string } | null;
}

interface UserAccount {
  email: string;
  name: string;
  password: string;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [userAccounts, setUserAccounts] = useState<UserAccount[]>([]);
  const [currentUser, setCurrentUser] = useState<{ email: string; name: string } | null>(null);

  useEffect(() => {
    const savedProducts = localStorage.getItem("products");
    const savedCategories = localStorage.getItem("categories");
    const savedOrders = localStorage.getItem("orders");
    const savedCustomers = localStorage.getItem("customers");
    const savedUserAccounts = localStorage.getItem("userAccounts");
    const savedCurrentUser = localStorage.getItem("currentUser");

    if (savedProducts) setProducts(JSON.parse(savedProducts));
    if (savedCategories) setCategories(JSON.parse(savedCategories));
    if (savedOrders) setOrders(JSON.parse(savedOrders));
    if (savedCustomers) setCustomers(JSON.parse(savedCustomers));
    if (savedUserAccounts) setUserAccounts(JSON.parse(savedUserAccounts));
    if (savedCurrentUser) setCurrentUser(JSON.parse(savedCurrentUser));

    if (!savedCategories || JSON.parse(savedCategories).length === 0) {
      setCategories([
        { id: 1, name: "All", isActive: true },
        { id: 2, name: "Dry Fruits", isActive: true },
        { id: 3, name: "Nuts", isActive: true },
        { id: 4, name: "Seeds", isActive: true },
        { id: 5, name: "Spices", isActive: true }
      ]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("products", JSON.stringify(products));
    localStorage.setItem("categories", JSON.stringify(categories));
    localStorage.setItem("orders", JSON.stringify(orders));
    localStorage.setItem("customers", JSON.stringify(customers));
    localStorage.setItem("userAccounts", JSON.stringify(userAccounts));
    if (currentUser) {
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("currentUser");
    }
  }, [products, categories, orders, customers, userAccounts, currentUser]);

  const findProductByBarcode = (barcode: string): Product | undefined => {
    return products.find(product => product.barcode === barcode);
  };

  const updateInventoryStock = (id: number, additionalStock: number) => {
    setProducts(prev => prev.map(product => {
      if (product.id === id) {
        const newStock = product.stock + additionalStock;
        return { ...product, stock: newStock };
      }
      return product;
    }));
    
    toast({
      title: "Stock Updated",
      description: `Inventory stock has been updated successfully.`,
    });
  };

  const createAccount = (email: string, name: string, password: string): boolean => {
    // Check if email already exists
    if (userAccounts.some(account => account.email === email)) {
      toast({
        title: "Account Creation Failed",
        description: "An account with this email already exists.",
        variant: "destructive"
      });
      return false;
    }

    // Create new account
    const newAccount = { email, name, password };
    setUserAccounts(prev => [...prev, newAccount]);
    setCurrentUser({ email, name });
    
    toast({
      title: "Account Created",
      description: `Welcome, ${name}! Your account has been created successfully.`,
    });
    return true;
  };

  const login = (email: string, password: string): boolean => {
    const account = userAccounts.find(account => account.email === email && account.password === password);
    
    if (account) {
      setCurrentUser({ email: account.email, name: account.name });
      
      toast({
        title: "Login Successful",
        description: `Welcome back, ${account.name}!`,
      });
      return true;
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid email or password.",
        variant: "destructive"
      });
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully.",
    });
  };

  const addProduct = (product: Product) => {
    try {
      if (!product.id) {
        const maxId = products.length > 0 ? Math.max(...products.map(p => p.id)) : 0;
        product.id = maxId + 1;
      }
      
      // Ensure product has all required fields
      if (!product.weight) {
        product.weight = 1;
      }
      
      if (!product.unit) {
        product.unit = 'kg';
      }
      
      // Ensure price includes GST
      product.priceIncludesGST = true;
      
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
    // Ensure price includes GST flag is preserved
    updatedProduct.priceIncludesGST = true;
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
      findProductByBarcode,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      updateInventoryStock,
      createAccount,
      login,
      logout,
      currentUser
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
