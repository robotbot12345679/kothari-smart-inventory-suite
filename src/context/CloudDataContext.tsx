import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { RealtimeChannel } from '@supabase/supabase-js';

// Types
export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  barcode?: string;
  stock: number;
  min_stock: number;
  description?: string;
  image_url?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  customer_id?: string;
  customer_name?: string;
  items: any[];
  total: number;
  status: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  bills: any[];
  payments: any[];
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface CloudDataContextType {
  // Data
  products: Product[];
  categories: Category[];
  customers: Customer[];
  orders: Order[];
  suppliers: Supplier[];
  
  // Loading states
  loading: boolean;
  
  // Product methods
  addProduct: (product: Omit<Product, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  findProductByBarcode: (barcode: string) => Product | undefined;
  
  // Category methods
  addCategory: (name: string) => Promise<void>;
  updateCategory: (id: string, name: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  
  // Customer methods
  addCustomer: (customer: Omit<Customer, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateCustomer: (id: string, updates: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  
  // Order methods
  addOrder: (order: Omit<Order, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateOrder: (id: string, updates: Partial<Order>) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  
  // Supplier methods
  addSupplier: (supplier: Omit<Supplier, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateSupplier: (id: string, updates: Partial<Supplier>) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;
  
  // Utility methods
  showToast: (title: string, description: string, variant?: 'default' | 'destructive') => void;
}

const CloudDataContext = createContext<CloudDataContextType | undefined>(undefined);

export const CloudDataProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Real-time channel
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  // Utility function
  const showToast = (title: string, description: string, variant: 'default' | 'destructive' = 'default') => {
    toast({ title, description, variant });
  };

  // Fetch all data
  const fetchAllData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const [productsRes, categoriesRes, customersRes, ordersRes, suppliersRes] = await Promise.all([
        supabase.from('products').select('*').eq('user_id', user.id),
        supabase.from('categories').select('*').eq('user_id', user.id),
        supabase.from('customers').select('*').eq('user_id', user.id),
        supabase.from('orders').select('*').eq('user_id', user.id),
        supabase.from('suppliers').select('*').eq('user_id', user.id)
      ]);

      if (productsRes.error) throw productsRes.error;
      if (categoriesRes.error) throw categoriesRes.error;
      if (customersRes.error) throw customersRes.error;
      if (ordersRes.error) throw ordersRes.error;
      if (suppliersRes.error) throw suppliersRes.error;

      setProducts(productsRes.data || []);
      setCategories(categoriesRes.data || []);
      setCustomers(customersRes.data || []);
      setOrders((ordersRes.data || []).map(order => ({ 
        ...order, 
        items: Array.isArray(order.items) ? order.items : [] 
      })));
      setSuppliers((suppliersRes.data || []).map(supplier => ({ 
        ...supplier, 
        bills: Array.isArray(supplier.bills) ? supplier.bills : [],
        payments: Array.isArray(supplier.payments) ? supplier.payments : []
      })));
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast('Error', 'Failed to load data', 'destructive');
    } finally {
      setLoading(false);
    }
  };

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    const newChannel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products', filter: `user_id=eq.${user.id}` }, 
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setProducts(prev => [...prev, payload.new as Product]);
          } else if (payload.eventType === 'UPDATE') {
            setProducts(prev => prev.map(p => p.id === payload.new.id ? payload.new as Product : p));
          } else if (payload.eventType === 'DELETE') {
            setProducts(prev => prev.filter(p => p.id !== payload.old.id));
          }
        })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories', filter: `user_id=eq.${user.id}` }, 
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setCategories(prev => [...prev, payload.new as Category]);
          } else if (payload.eventType === 'UPDATE') {
            setCategories(prev => prev.map(c => c.id === payload.new.id ? payload.new as Category : c));
          } else if (payload.eventType === 'DELETE') {
            setCategories(prev => prev.filter(c => c.id !== payload.old.id));
          }
        })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'customers', filter: `user_id=eq.${user.id}` }, 
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setCustomers(prev => [...prev, payload.new as Customer]);
          } else if (payload.eventType === 'UPDATE') {
            setCustomers(prev => prev.map(c => c.id === payload.new.id ? payload.new as Customer : c));
          } else if (payload.eventType === 'DELETE') {
            setCustomers(prev => prev.filter(c => c.id !== payload.old.id));
          }
        })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `user_id=eq.${user.id}` }, 
        (payload) => {
          const orderData = { 
            ...payload.new, 
            items: Array.isArray((payload.new as any)?.items) ? (payload.new as any).items : [] 
          } as Order;
          
          if (payload.eventType === 'INSERT') {
            setOrders(prev => [...prev, orderData]);
          } else if (payload.eventType === 'UPDATE') {
            setOrders(prev => prev.map(o => o.id === orderData.id ? orderData : o));
          } else if (payload.eventType === 'DELETE') {
            setOrders(prev => prev.filter(o => o.id !== payload.old.id));
          }
        })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'suppliers', filter: `user_id=eq.${user.id}` }, 
        (payload) => {
          const supplierData = { 
            ...payload.new, 
            bills: Array.isArray((payload.new as any)?.bills) ? (payload.new as any).bills : [],
            payments: Array.isArray((payload.new as any)?.payments) ? (payload.new as any).payments : []
          } as Supplier;
          
          if (payload.eventType === 'INSERT') {
            setSuppliers(prev => [...prev, supplierData]);
          } else if (payload.eventType === 'UPDATE') {
            setSuppliers(prev => prev.map(s => s.id === supplierData.id ? supplierData : s));
          } else if (payload.eventType === 'DELETE') {
            setSuppliers(prev => prev.filter(s => s.id !== payload.old.id));
          }
        })
      .subscribe();

    setChannel(newChannel);

    // Initial data fetch
    fetchAllData();

    return () => {
      if (newChannel) {
        supabase.removeChannel(newChannel);
      }
    };
  }, [user]);

  // Product methods
  const addProduct = async (productData: Omit<Product, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('products')
      .insert([{ ...productData, user_id: user.id }]);
    
    if (error) {
      console.error('Error adding product:', error);
      showToast('Error', 'Failed to add product', 'destructive');
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    const { error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id);
    
    if (error) {
      console.error('Error updating product:', error);
      showToast('Error', 'Failed to update product', 'destructive');
    }
  };

  const deleteProduct = async (id: string) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting product:', error);
      showToast('Error', 'Failed to delete product', 'destructive');
    }
  };

  const findProductByBarcode = (barcode: string) => {
    return products.find(p => p.barcode === barcode);
  };

  // Category methods
  const addCategory = async (name: string) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('categories')
      .insert([{ name, user_id: user.id }]);
    
    if (error) {
      console.error('Error adding category:', error);
      showToast('Error', 'Failed to add category', 'destructive');
    }
  };

  const updateCategory = async (id: string, name: string) => {
    const { error } = await supabase
      .from('categories')
      .update({ name })
      .eq('id', id);
    
    if (error) {
      console.error('Error updating category:', error);
      showToast('Error', 'Failed to update category', 'destructive');
    }
  };

  const deleteCategory = async (id: string) => {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting category:', error);
      showToast('Error', 'Failed to delete category', 'destructive');
    }
  };

  // Customer methods
  const addCustomer = async (customerData: Omit<Customer, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('customers')
      .insert([{ ...customerData, user_id: user.id }]);
    
    if (error) {
      console.error('Error adding customer:', error);
      showToast('Error', 'Failed to add customer', 'destructive');
    }
  };

  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    const { error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', id);
    
    if (error) {
      console.error('Error updating customer:', error);
      showToast('Error', 'Failed to update customer', 'destructive');
    }
  };

  const deleteCustomer = async (id: string) => {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting customer:', error);
      showToast('Error', 'Failed to delete customer', 'destructive');
    }
  };

  // Order methods
  const addOrder = async (orderData: Omit<Order, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('orders')
      .insert([{ ...orderData, user_id: user.id }]);
    
    if (error) {
      console.error('Error adding order:', error);
      showToast('Error', 'Failed to add order', 'destructive');
    }
  };

  const updateOrder = async (id: string, updates: Partial<Order>) => {
    const { error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id);
    
    if (error) {
      console.error('Error updating order:', error);
      showToast('Error', 'Failed to update order', 'destructive');
    }
  };

  const deleteOrder = async (id: string) => {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting order:', error);
      showToast('Error', 'Failed to delete order', 'destructive');
    }
  };

  // Supplier methods
  const addSupplier = async (supplierData: Omit<Supplier, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('suppliers')
      .insert([{ ...supplierData, user_id: user.id }]);
    
    if (error) {
      console.error('Error adding supplier:', error);
      showToast('Error', 'Failed to add supplier', 'destructive');
    }
  };

  const updateSupplier = async (id: string, updates: Partial<Supplier>) => {
    const { error } = await supabase
      .from('suppliers')
      .update(updates)
      .eq('id', id);
    
    if (error) {
      console.error('Error updating supplier:', error);
      showToast('Error', 'Failed to update supplier', 'destructive');
    }
  };

  const deleteSupplier = async (id: string) => {
    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting supplier:', error);
      showToast('Error', 'Failed to delete supplier', 'destructive');
    }
  };

  const value = {
    products,
    categories,
    customers,
    orders,
    suppliers,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    findProductByBarcode,
    addCategory,
    updateCategory,
    deleteCategory,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addOrder,
    updateOrder,
    deleteOrder,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    showToast
  };

  return (
    <CloudDataContext.Provider value={value}>
      {children}
    </CloudDataContext.Provider>
  );
};

export const useCloudData = () => {
  const context = useContext(CloudDataContext);
  if (context === undefined) {
    throw new Error('useCloudData must be used within a CloudDataProvider');
  }
  return context;
};