import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { RealtimeChannel, User, Session } from '@supabase/supabase-js';
import { productSchema, customerSchema, categorySchema, orderSchema, supplierSchema } from '@/lib/validation';
import { z } from 'zod';

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
  sku?: string;
  image?: string;
  weight: number;
  unit: string;
  price_includes_gst: boolean;
  expiry_date?: string;
  is_active: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
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
  city?: string;
  state?: string;
  pincode?: string;
  notes?: string;
  birthday?: string;
  total_orders: number;
  total_spent: number;
  last_order_date?: string;
  status: string;
  order_history?: string[];
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  customer_id?: string;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  items: any[];
  subtotal: number;
  gst: number;
  total: number;
  payment_method?: string;
  payment_status: string;
  order_date: string;
  shipping_address?: string;
  order_status: string;
  tracking_number?: string;
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

export interface BillingTemplate {
  shopName: string;
  address: string;
  phone: string;
  gstNumber: string;
  logoUrl: string;
  footerText: string[];
}

export interface Settings {
  id: string;
  user_id: string;
  billing_template: BillingTemplate;
  created_at: string;
  updated_at: string;
}

interface CloudDataContextType {
  // Auth
  user: User | null;
  session: Session | null;
  
  // Data
  products: Product[];
  categories: Category[];
  customers: Customer[];
  orders: Order[];
  suppliers: Supplier[];
  billingTemplate: BillingTemplate | null;
  
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
  updateOrderPaymentStatus: (orderId: string, updates: Partial<Order>) => Promise<void>;
  
  // Supplier methods
  addSupplier: (supplier: Omit<Supplier, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateSupplier: (id: string, updates: Partial<Supplier>) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;
  addSupplierBill: (supplierId: string, bill: any) => Promise<void>;
  updateSupplierBill: (supplierId: string, billId: string, updates: any) => Promise<void>;
  deleteSupplierBill: (supplierId: string, billId: string) => Promise<void>;
  addSupplierPayment: (supplierId: string, payment: any) => Promise<void>;
  updateSupplierPayment: (supplierId: string, paymentId: string, updates: any) => Promise<void>;
  deleteSupplierPayment: (supplierId: string, paymentId: string) => Promise<void>;
  
  // Settings methods
  updateBillingTemplate: (template: BillingTemplate) => Promise<void>;
  
  // Inventory methods
  updateInventoryStock: (id: string, additionalStock: number) => Promise<void>;
  updateInventoryAfterSale: (cartItems: Array<{id: string, quantity: number}>) => Promise<void>;
  
  // Utility methods
  showToast: (title: string, description: string, variant?: 'default' | 'destructive') => void;
}

const CloudDataContext = createContext<CloudDataContextType | undefined>(undefined);

export const CloudDataProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  
  // Data state
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [billingTemplate, setBillingTemplate] = useState<BillingTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Real-time channel
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  // Utility function
  const showToast = (title: string, description: string, variant: 'default' | 'destructive' = 'default') => {
    toast({ title, description, variant });
  };

  // Fetch all data - public access without user filtering
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [productsRes, categoriesRes, customersRes, ordersRes, suppliersRes, settingsRes] = await Promise.all([
        supabase.from('products').select('*'),
        supabase.from('categories').select('*'),
        supabase.from('customers').select('*'),
        supabase.from('orders').select('*'),
        supabase.from('suppliers').select('*'),
        supabase.from('settings').select('*').maybeSingle()
      ]);

      if (productsRes.error) throw productsRes.error;
      if (categoriesRes.error) throw categoriesRes.error;
      if (customersRes.error) throw customersRes.error;
      if (ordersRes.error) throw ordersRes.error;
      if (suppliersRes.error) throw suppliersRes.error;
      if (settingsRes.error) throw settingsRes.error;

      console.log('Fetched data:', {
        products: productsRes.data?.length,
        categories: categoriesRes.data?.length,
        customers: customersRes.data?.length,
        orders: ordersRes.data?.length,
        suppliers: suppliersRes.data?.length
      });

      setProducts(productsRes.data || []);
      setCategories(categoriesRes.data || []);
      setCustomers((customersRes.data || []).map(c => ({
        ...c,
        order_history: Array.isArray(c.order_history) ? c.order_history as string[] : []
      })));
      setOrders((ordersRes.data || []).map(order => ({ 
        ...order, 
        items: Array.isArray(order.items) ? order.items : []
      })));
      setSuppliers((suppliersRes.data || []).map(supplier => ({ 
        ...supplier, 
        bills: Array.isArray(supplier.bills) ? supplier.bills : [],
        payments: Array.isArray(supplier.payments) ? supplier.payments : []
      })));
      
      // Set billing template from settings or use default
      if (settingsRes.data?.billing_template) {
        setBillingTemplate(settingsRes.data.billing_template as unknown as BillingTemplate);
      } else {
        // Set default billing template
        setBillingTemplate({
          shopName: "Kothari's Dry Fruits & More",
          address: "89, Sukan Mall, Nr. CIMS Hospital, Science City Road, Ahmedabad, Gujarat 380060",
          phone: "+91 75677 00090",
          gstNumber: "",
          logoUrl: "/lovable-uploads/6ab04e40-2860-4562-bace-e35da6383972.png",
          footerText: ["Thank you for shopping with us!", "Visit again soon!"]
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast('Error', 'Failed to load data', 'destructive');
    } finally {
      setLoading(false);
    }
  };

  // Initialize app without authentication
  useEffect(() => {
    // Load all data immediately without authentication
    fetchAllData();
  }, []);

  // Set up real-time subscriptions for all data changes with notifications
  useEffect(() => {
    const newChannel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setProducts(prev => [...prev, payload.new as Product]);
            showToast('Product Added', `${(payload.new as Product).name} was added`, 'default');
          } else if (payload.eventType === 'UPDATE') {
            setProducts(prev => prev.map(p => p.id === payload.new.id ? payload.new as Product : p));
            showToast('Product Updated', `${(payload.new as Product).name} was updated`, 'default');
          } else if (payload.eventType === 'DELETE') {
            setProducts(prev => prev.filter(p => p.id !== payload.old.id));
            showToast('Product Deleted', 'A product was deleted', 'default');
          }
        })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setCategories(prev => [...prev, payload.new as Category]);
            showToast('Category Added', `${(payload.new as Category).name} was added`, 'default');
          } else if (payload.eventType === 'UPDATE') {
            setCategories(prev => prev.map(c => c.id === payload.new.id ? payload.new as Category : c));
            showToast('Category Updated', `${(payload.new as Category).name} was updated`, 'default');
          } else if (payload.eventType === 'DELETE') {
            setCategories(prev => prev.filter(c => c.id !== payload.old.id));
            showToast('Category Deleted', 'A category was deleted', 'default');
          }
        })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'customers' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setCustomers(prev => [...prev, payload.new as Customer]);
            showToast('Customer Added', `${(payload.new as Customer).name} was added`, 'default');
          } else if (payload.eventType === 'UPDATE') {
            setCustomers(prev => prev.map(c => c.id === payload.new.id ? payload.new as Customer : c));
            showToast('Customer Updated', `${(payload.new as Customer).name} was updated`, 'default');
          } else if (payload.eventType === 'DELETE') {
            setCustomers(prev => prev.filter(c => c.id !== payload.old.id));
            showToast('Customer Deleted', 'A customer was deleted', 'default');
          }
        })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          const orderData = { 
            ...payload.new, 
            items: Array.isArray((payload.new as any)?.items) ? (payload.new as any).items : [] 
          } as Order;
          
          if (payload.eventType === 'INSERT') {
            setOrders(prev => [...prev, orderData]);
            showToast('Order Added', `Order for ${orderData.customer_name || 'customer'} was added`, 'default');
          } else if (payload.eventType === 'UPDATE') {
            setOrders(prev => prev.map(o => o.id === orderData.id ? orderData : o));
            showToast('Order Updated', `Order ${orderData.id.slice(0, 8)} was updated`, 'default');
          } else if (payload.eventType === 'DELETE') {
            setOrders(prev => prev.filter(o => o.id !== payload.old.id));
            showToast('Order Deleted', 'An order was deleted', 'default');
          }
        })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'suppliers' },
        (payload) => {
          const supplierData = { 
            ...payload.new, 
            bills: Array.isArray((payload.new as any)?.bills) ? (payload.new as any).bills : [],
            payments: Array.isArray((payload.new as any)?.payments) ? (payload.new as any).payments : []
          } as Supplier;
          
          if (payload.eventType === 'INSERT') {
            setSuppliers(prev => [...prev, supplierData]);
            showToast('Supplier Added', `${supplierData.name} was added`, 'default');
          } else if (payload.eventType === 'UPDATE') {
            setSuppliers(prev => prev.map(s => s.id === supplierData.id ? supplierData : s));
            showToast('Supplier Updated', `${supplierData.name} was updated`, 'default');
          } else if (payload.eventType === 'DELETE') {
            setSuppliers(prev => prev.filter(s => s.id !== payload.old.id));
            showToast('Supplier Deleted', 'A supplier was deleted', 'default');
          }
        })
      .subscribe();

    setChannel(newChannel);

    return () => {
      if (newChannel) {
        supabase.removeChannel(newChannel);
      }
    };
  }, []);

  // Product methods
  const addProduct = async (productData: Omit<Product, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      productSchema.parse(productData);
      const { data, error } = await supabase
        .from('products')
        .insert([{ ...productData, user_id: 'default' }])
        .select();
      
      if (error) {
        console.error('Supabase insert error:', error);
        throw error;
      }
      console.log('Product added successfully:', data);
    } catch (error: any) {
      console.error('Error in addProduct:', error);
      if (error instanceof z.ZodError) {
        showToast('Validation Error', error.errors[0].message, 'destructive');
      } else {
        showToast('Error', `Failed to add product: ${error.message || 'Unknown error'}`, 'destructive');
      }
      throw error;
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      productSchema.partial().parse(updates);
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select();
      
      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }
      console.log('Product updated successfully:', data);
    } catch (error: any) {
      console.error('Error in updateProduct:', error);
      if (error instanceof z.ZodError) {
        showToast('Validation Error', error.errors[0].message, 'destructive');
      } else {
        showToast('Error', `Failed to update product: ${error.message || 'Unknown error'}`, 'destructive');
      }
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) {
      showToast('Error', 'Failed to delete product', 'destructive');
    }
  };

  const findProductByBarcode = (barcode: string) => {
    return products.find(p => p.barcode === barcode);
  };

  // Category methods
  const addCategory = async (name: string) => {
    try {
      categorySchema.parse({ name });
      const { error } = await supabase
        .from('categories')
        .insert([{ name, user_id: 'default' }]);
      
      if (error) throw error;
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        showToast('Validation Error', error.errors[0].message, 'destructive');
      } else {
        showToast('Error', 'Failed to add category', 'destructive');
      }
    }
  };

  const updateCategory = async (id: string, name: string) => {
    try {
      categorySchema.parse({ name });
      const { error } = await supabase
        .from('categories')
        .update({ name })
        .eq('id', id);
      
      if (error) throw error;
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        showToast('Validation Error', error.errors[0].message, 'destructive');
      } else {
        showToast('Error', 'Failed to update category', 'destructive');
      }
    }
  };

  const deleteCategory = async (id: string) => {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    
    if (error) {
      showToast('Error', 'Failed to delete category', 'destructive');
    }
  };

  // Customer methods
  const addCustomer = async (customerData: Omit<Customer, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      customerSchema.parse(customerData);
      const { error } = await supabase
        .from('customers')
        .insert([{ ...customerData, user_id: 'default' }]);
      
      if (error) throw error;
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        showToast('Validation Error', error.errors[0].message, 'destructive');
      } else {
        showToast('Error', 'Failed to add customer', 'destructive');
      }
    }
  };

  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    try {
      customerSchema.partial().parse(updates);
      const { error } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        showToast('Validation Error', error.errors[0].message, 'destructive');
      } else {
        showToast('Error', 'Failed to update customer', 'destructive');
      }
    }
  };

  const deleteCustomer = async (id: string) => {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);
    
    if (error) {
      showToast('Error', 'Failed to delete customer', 'destructive');
    }
  };

  // Order methods
  const addOrder = async (orderData: Omit<Order, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      orderSchema.parse(orderData);
      const { error } = await supabase
        .from('orders')
        .insert([{ ...orderData, user_id: 'default' }]);
      
      if (error) throw error;
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        showToast('Validation Error', error.errors[0].message, 'destructive');
      } else {
        showToast('Error', 'Failed to add order', 'destructive');
      }
    }
  };

  const updateOrder = async (id: string, updates: Partial<Order>) => {
    try {
      orderSchema.partial().parse(updates);
      const { error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        showToast('Validation Error', error.errors[0].message, 'destructive');
      } else {
        showToast('Error', 'Failed to update order', 'destructive');
      }
    }
  };

  const deleteOrder = async (id: string) => {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);
    
    if (error) {
      showToast('Error', 'Failed to delete order', 'destructive');
    }
  };

  // Supplier methods
  const addSupplier = async (supplierData: Omit<Supplier, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      supplierSchema.parse(supplierData);
      const { error } = await supabase
        .from('suppliers')
        .insert([{ ...supplierData, user_id: 'default' }]);
      
      if (error) throw error;
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        showToast('Validation Error', error.errors[0].message, 'destructive');
      } else {
        showToast('Error', 'Failed to add supplier', 'destructive');
      }
    }
  };

  const updateSupplier = async (id: string, updates: Partial<Supplier>) => {
    try {
      supplierSchema.partial().parse(updates);
      const { error } = await supabase
        .from('suppliers')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        showToast('Validation Error', error.errors[0].message, 'destructive');
      } else {
        showToast('Error', 'Failed to update supplier', 'destructive');
      }
    }
  };

  const deleteSupplier = async (id: string) => {
    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', id);
    
    if (error) {
      showToast('Error', 'Failed to delete supplier', 'destructive');
    }
  };

  // Supplier bill methods
  const addSupplierBill = async (supplierId: string, bill: any) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    if (!supplier) {
      showToast('Error', 'Supplier not found', 'destructive');
      return;
    }

    const newBill = {
      ...bill,
      id: bill.id || `PB-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdDate: new Date().toISOString()
    };

    const updatedBills = [...(supplier.bills || []), newBill];
    await updateSupplier(supplierId, { bills: updatedBills });
    showToast('Success', 'Purchase bill added successfully');
  };

  const updateSupplierBill = async (supplierId: string, billId: string, updates: any) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    if (!supplier) return;

    const updatedBills = (supplier.bills || []).map((bill: any) =>
      bill.id === billId ? { ...bill, ...updates } : bill
    );

    await updateSupplier(supplierId, { bills: updatedBills });
  };

  const deleteSupplierBill = async (supplierId: string, billId: string) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    if (!supplier) return;

    const updatedBills = (supplier.bills || []).filter((bill: any) => bill.id !== billId);
    await updateSupplier(supplierId, { bills: updatedBills });
    showToast('Success', 'Bill deleted successfully');
  };

  // Supplier payment methods
  const addSupplierPayment = async (supplierId: string, payment: any) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    if (!supplier) {
      showToast('Error', 'Supplier not found', 'destructive');
      return;
    }

    const newPayment = {
      ...payment,
      id: payment.id || `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdDate: new Date().toISOString()
    };

    const updatedPayments = [...(supplier.payments || []), newPayment];
    await updateSupplier(supplierId, { payments: updatedPayments });
    showToast('Success', 'Payment recorded successfully');
  };

  const updateSupplierPayment = async (supplierId: string, paymentId: string, updates: any) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    if (!supplier) return;

    const updatedPayments = (supplier.payments || []).map((payment: any) =>
      payment.id === paymentId ? { ...payment, ...updates } : payment
    );

    await updateSupplier(supplierId, { payments: updatedPayments });
  };

  const deleteSupplierPayment = async (supplierId: string, paymentId: string) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    if (!supplier) return;

    const updatedPayments = (supplier.payments || []).filter((payment: any) => payment.id !== paymentId);
    await updateSupplier(supplierId, { payments: updatedPayments });
    showToast('Success', 'Payment deleted successfully');
  };

  // Settings methods
  const updateBillingTemplate = async (template: BillingTemplate) => {
    try {
      // Check if settings exist
      const { data: existing } = await supabase
        .from('settings')
        .select('id')
        .maybeSingle();

      if (existing) {
        // Update existing settings
        const { error } = await supabase
          .from('settings')
          .update({ billing_template: template as any })
          .eq('id', existing.id);
        
        if (error) throw error;
      } else {
        // Insert new settings
        const { error } = await supabase
          .from('settings')
          .insert([{ user_id: 'default', billing_template: template as any }]);
        
        if (error) throw error;
      }

      setBillingTemplate(template);
      showToast('Success', 'Billing template updated successfully');
    } catch (error) {
      showToast('Error', 'Failed to update billing template', 'destructive');
    }
  };

  // Inventory methods
  const updateInventoryStock = async (id: string, additionalStock: number) => {
    const product = products.find(p => p.id === id);
    if (!product) {
      showToast('Error', 'Product not found', 'destructive');
      return;
    }

    const newStock = product.stock + additionalStock;
    await updateProduct(id, { stock: newStock });
    showToast('Success', 'Stock updated successfully');
  };

  const updateInventoryAfterSale = async (cartItems: Array<{id: string, quantity: number}>) => {
    for (const item of cartItems) {
      const product = products.find(p => p.id === item.id);
      if (product) {
        const newStock = Math.max(0, product.stock - item.quantity);
        await updateProduct(item.id, { stock: newStock });
      }
    }
  };

  const updateOrderPaymentStatus = async (orderId: string, updates: Partial<Order>) => {
    try {
      orderSchema.partial().parse(updates);
      const { error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', orderId);
      
      if (error) throw error;
      showToast('Success', 'Order payment status updated');
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        showToast('Validation Error', error.errors[0].message, 'destructive');
      } else {
        showToast('Error', 'Failed to update order', 'destructive');
      }
    }
  };

  const value = {
    user,
    session,
    products,
    categories,
    customers,
    orders,
    suppliers,
    billingTemplate,
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
    addSupplierBill,
    updateSupplierBill,
    deleteSupplierBill,
    addSupplierPayment,
    updateSupplierPayment,
    deleteSupplierPayment,
    updateBillingTemplate,
    updateInventoryStock,
    updateInventoryAfterSale,
    updateOrderPaymentStatus,
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