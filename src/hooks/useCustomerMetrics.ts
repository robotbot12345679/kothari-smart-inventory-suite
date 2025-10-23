
import { useCloudData } from "@/context/CloudDataContext";

export const useCustomerMetrics = () => {
  const { customers, orders } = useCloudData();

  const activeCustomers = customers.filter(c => c.status === 'Active').length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
  const customerLifetimeValue = customers.length > 0 ? totalRevenue / customers.length : 0;
  const activeRate = customers.length > 0 ? (activeCustomers / customers.length) * 100 : 0;

  return {
    totalCustomers: customers.length,
    activeCustomers,
    totalRevenue,
    averageOrderValue,
    customerLifetimeValue,
    activeRate
  };
};
