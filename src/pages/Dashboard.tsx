
import React, { useMemo, useState, useEffect } from "react";
import { useCloudData } from "@/context/CloudDataContext";
import StatsCards from "@/components/dashboard/StatsCards";
import SalesOverview from "@/components/dashboard/SalesOverview";
import InsightsCard from "@/components/dashboard/InsightsCard";
import RecentOrdersCard from "@/components/dashboard/RecentOrdersCard";
import TopSellingProducts from "@/components/dashboard/TopSellingProducts";
import InventoryStatus from "@/components/dashboard/InventoryStatus";

const Dashboard = () => {
  const { products, orders } = useCloudData();
  const [recentOrdersData, setRecentOrdersData] = useState([]);

  // Ensure we always have the latest data
  useEffect(() => {
    // Sort orders by date (most recent first)
    if (orders && orders.length > 0) {
      const sortedOrders = [...orders].sort((a, b) => 
        new Date(b.order_date).getTime() - new Date(a.order_date).getTime()
      );
      // Display only 5 most recent orders
      setRecentOrdersData(sortedOrders.slice(0, 5));
    } else {
      setRecentOrdersData([]);
    }
  }, [orders]);

  // Calculate stats based on real data
  const stats = useMemo(() => {
    if (!products || !orders) return {
      totalSales: 0,
      activeProducts: 0,
      lowStockItems: 0,
      pendingOrders: 0,
      todaysSales: 0,
      todaysOrders: 0,
      monthlySales: 0,
      monthlyOrders: 0
    };

    const activeProducts = products.filter(p => p.is_active !== false)?.length || 0;
    
    // Fix low stock calculation - count items where stock is less than or equal to minimum stock
    const lowStockItems = products.filter(p => {
      const minStock = p.min_stock || 10; // Default minimum stock to 10 if not set
      return p.stock <= minStock;
    })?.length || 0;

    // Calculate total sales amount from orders
    const totalSales = orders.reduce((sum, order) => sum + order.total, 0) || 0;

    // Get pending orders
    const pendingOrders = orders.filter(order => 
      order.order_status === 'Pending' || order.order_status === 'Processing'
    )?.length || 0;

    // Calculate today's sales
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todaysOrders = orders.filter(order => {
      const orderDate = new Date(order.order_date);
      orderDate.setHours(0, 0, 0, 0);
      return orderDate.getTime() === today.getTime();
    });

    const todaysSales = todaysOrders.reduce((sum, order) => sum + order.total, 0) || 0;

    // Calculate this month's sales
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const thisMonthOrders = orders.filter(order => {
      const orderDate = new Date(order.order_date);
      return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
    });

    const monthlySales = thisMonthOrders.reduce((sum, order) => sum + order.total, 0) || 0;

    return {
      totalSales,
      activeProducts,
      lowStockItems,
      pendingOrders,
      todaysSales,
      todaysOrders: todaysOrders.length,
      monthlySales,
      monthlyOrders: thisMonthOrders.length
    };
  }, [products, orders]);

  // Top selling products calculation
  const topSellingProducts = useMemo(() => {
    if (!orders || orders.length === 0) return [];
    
    try {
      const productSales = new Map();
      
      // Count product occurrences in orders
      orders.forEach(order => {
        if (!order.items) return;
        
        order.items.forEach(item => {
          if (!item || !item.name) return;
          const currentCount = productSales.get(item.name) || 0;
          productSales.set(item.name, currentCount + (item.quantity || 0));
        });
      });
      
      // Convert to array and sort
      return Array.from(productSales, ([name, quantity]) => ({ name, quantity }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);
    } catch (error) {
      console.error("Error calculating top products:", error);
      return [];
    }
  }, [orders]);

  // Calculate low stock products for insights
  const lowStockProducts = useMemo(() => {
    if (!products) return [];
    return products.filter(p => {
      const minStock = p.min_stock || 10;
      return p.stock <= minStock;
    });
  }, [products]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleDateString('en-US', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards 
        totalSales={stats.totalSales}
        activeProducts={stats.activeProducts}
        lowStockItems={stats.lowStockItems}
        pendingOrders={stats.pendingOrders}
        totalOrders={orders?.length || 0}
        todaysSales={stats.todaysSales}
        todaysOrders={stats.todaysOrders}
        monthlySales={stats.monthlySales}
        monthlyOrders={stats.monthlyOrders}
      />

      {/* Charts and Insights */}
      <div className="grid gap-4 md:grid-cols-2">
        <SalesOverview orders={orders || []} />
        <InsightsCard 
          products={products || []}
          orders={orders || []}
          lowStockItems={stats.lowStockItems}
          pendingOrders={stats.pendingOrders}
          activeProducts={stats.activeProducts}
          lowStockProducts={lowStockProducts}
          topSellingProducts={topSellingProducts}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Recent Orders Card */}
        <RecentOrdersCard recentOrders={recentOrdersData} />
        
        {/* Top Selling Products */}
        <TopSellingProducts products={topSellingProducts} />
        
        {/* Inventory Status */}
        <InventoryStatus products={products || []} />
      </div>
    </div>
  );
};

export default Dashboard;
