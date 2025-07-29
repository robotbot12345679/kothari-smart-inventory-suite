
import React, { createContext, useContext, useState, useEffect } from "react";
import { Product, Category, Order, Customer, CartItem } from "@/types/pos";
import { deleteImage } from "@/utils/imageUtils";

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
  addCustomer: (customer: Customer) => Customer;
  updateCustomer: (id: number, updatedCustomer: Customer) => void;
  deleteCustomer: (id: number) => void;
  updateInventoryStock: (id: number, additionalStock: number) => void;
  updateInventoryAfterSale: (cartItems: CartItem[]) => void;
  createAccount: (email: string, name: string, password: string) => boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  currentUser: { email: string; name: string } | null;
  updateOrderPaymentStatus: (orderId: string, updatedOrder: Order) => void;
  showToast: (title: string, description: string, variant?: "default" | "destructive") => void;
}

interface UserAccount {
  email: string;
  name: string;
  password: string;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [userAccounts, setUserAccounts] = useState<UserAccount[]>([]);
  const [currentUser, setCurrentUser] = useState<{ email: string; name: string } | null>(null);
  
  // Toast function that can be passed down without using hooks
  const showToast = (title: string, description: string, variant: "default" | "destructive" = "default") => {
    console.log(`Toast: ${title} - ${description}`);
    // For now, we'll use console.log. In a real app, you'd integrate with your toast system here
  };

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
    
    showToast("Stock Updated", "Inventory stock has been updated successfully.");
  };

  const updateInventoryAfterSale = (cartItems: CartItem[]) => {
    setProducts(prev => prev.map(product => {
      const cartItem = cartItems.find(item => item.id === product.id);
      if (cartItem) {
        const newStock = Math.max(0, product.stock - cartItem.quantity);
        console.log(`Updating stock for ${product.name}: ${product.stock} - ${cartItem.quantity} = ${newStock}`);
        return {
          ...product,
          stock: newStock
        };
      }
      return product;
    }));
    console.log("Inventory updated after sale");
  };

  const createAccount = (email: string, name: string, password: string): boolean => {
    if (userAccounts.some(account => account.email === email)) {
      showToast("Account Creation Failed", "An account with this email already exists.", "destructive");
      return false;
    }

    const newAccount = { email, name, password };
    setUserAccounts(prev => [...prev, newAccount]);
    setCurrentUser({ email, name });
    
    showToast("Account Created", `Welcome, ${name}! Your account has been created successfully.`);
    return true;
  };

  const login = (email: string, password: string): boolean => {
    const account = userAccounts.find(account => account.email === email && account.password === password);
    
    if (account) {
      setCurrentUser({ email: account.email, name: account.name });
      showToast("Login Successful", `Welcome back, ${account.name}!`);
      return true;
    } else {
      showToast("Login Failed", "Invalid email or password.", "destructive");
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    showToast("Logged Out", "You have been logged out successfully.");
  };

  const addProduct = (product: Product) => {
    try {
      if (!product.id) {
        const maxId = products.length > 0 ? Math.max(...products.map(p => p.id)) : 0;
        product.id = maxId + 1;
      }
      
      if (!product.weight) {
        product.weight = 1;
      }
      
      if (!product.unit) {
        product.unit = 'kg';
      }
      
      product.priceIncludesGST = true;
      
      setProducts(prev => [...prev, product]);
      showToast("Success", `Product "${product.name}" has been added.`);
    } catch (error) {
      console.error("Error adding product:", error);
      showToast("Error", "Failed to add product. Please try again.", "destructive");
    }
  };

  const updateProduct = (id: number, updatedProduct: Product) => {
    updatedProduct.priceIncludesGST = true;
    setProducts(prev => prev.map(product => product.id === id ? updatedProduct : product));
  };

  const deleteProduct = (id: number) => {
    const productToDelete = products.find(product => product.id === id);
    
    if (productToDelete?.image) {
      deleteImage(productToDelete.image);
    }
    
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
    
    if (order.items && order.items.length > 0) {
      updateInventoryAfterSale(order.items);
    }
  };

  const updateOrder = (id: string, updatedOrder: Order) => {
    const oldOrder = orders.find(order => order.id === id);
    
    setOrders(prev => prev.map(order => order.id === id ? updatedOrder : order));
    
    if (oldOrder && updatedOrder.items) {
      updateInventoryAfterSale(updatedOrder.items);
    }
  };

  const deleteOrder = (id: string) => {
    setOrders(prev => prev.filter(order => order.id !== id));
  };

  const addCustomer = (customer: Customer): Customer => {
    try {
      if (!customer.id) {
        const maxId = customers.length > 0 ? Math.max(...customers.map(c => c.id)) : 0;
        customer.id = maxId + 1;
      }
      setCustomers(prev => [...prev, customer]);
      showToast("Success", `Customer "${customer.name}" has been added.`);
      return customer;
    } catch (error) {
      console.error("Error adding customer:", error);
      showToast("Error", "Failed to add customer. Please try again.", "destructive");
      return customer;
    }
  };

  const updateCustomer = (id: number, updatedCustomer: Customer) => {
    setCustomers(prev => prev.map(customer => customer.id === id ? updatedCustomer : customer));
    showToast("Success", `Customer "${updatedCustomer.name}" has been updated.`);
  };

  const deleteCustomer = (id: number) => {
    setCustomers(prev => prev.filter(customer => customer.id !== id));
    showToast("Success", "Customer has been deleted.");
  };

  const updateOrderPaymentStatus = (orderId: string, updatedOrder: Order) => {
    setOrders((prevOrders) => {
      return prevOrders.map((order) => {
        if (order.id === orderId) {
          return {
            ...order,
            ...updatedOrder
          };
        }
        return order;
      });
    });
    
    const updatedOrders = orders.map((order) => {
      if (order.id === orderId) {
        return {
          ...order,
          ...updatedOrder
        };
      }
      return order;
    });
    
    localStorage.setItem("orders", JSON.stringify(updatedOrders));
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
      updateInventoryAfterSale,
      createAccount,
      login,
      logout,
      currentUser,
      updateOrderPaymentStatus,
      showToast
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
