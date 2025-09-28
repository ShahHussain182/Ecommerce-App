import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { orderService } from '@/services/orderService';
import { productService } from '@/services/productService';

function MetricCard({ 
  title, 
  value, 
  growth, 
  icon: Icon,
  prefix = '' 
}: { 
  title: string; 
  value: number; 
  growth: number; 
  icon: any;
  prefix?: string;
}) {
  const isPositive = growth > 0;
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {prefix}{value.toLocaleString()}
        </div>
        <div className="flex items-center text-xs text-muted-foreground">
          {isPositive ? (
            <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
          ) : (
            <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
          )}
          <span className={isPositive ? 'text-green-500' : 'text-red-500'}>
            {Math.abs(growth)}%
          </span>
          <span className="ml-1">from last month</span>
        </div>
      </CardContent>
    </Card>
  );
}

export function Dashboard() {
  // Query for dashboard metrics
  const { data: metricsData, isLoading: metricsLoading } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: orderService.getOrderMetrics,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Query for product count (this is now redundant as getOrderMetrics provides totalProducts)
  // Keeping it for now, but ideally, getOrderMetrics would be the single source for all dashboard numbers.
  const { data: productsData } = useQuery({
    queryKey: ['products-count'],
    queryFn: () => productService.getProducts({ limit: 1 }),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const metrics = metricsData || {
    totalRevenue: 0,
    revenueGrowth: 0,
    totalOrders: 0,
    ordersGrowth: 0,
    totalCustomers: 0,
    customersGrowth: 0,
    totalProducts: 0,
    productsGrowth: 0,
  };

  // Use totalProducts from metricsData, which is now provided by the backend
  const totalProducts = metrics.totalProducts; 
  const recentOrders = metricsData?.recentOrders || [];

  if (metricsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
            <h3 className="mt-4 text-lg font-semibold">Loading dashboard...</h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening with your store.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Revenue"
          value={metrics.totalRevenue}
          growth={metrics.revenueGrowth}
          icon={DollarSign}
          prefix="$"
        />
        <MetricCard
          title="Orders"
          value={metrics.totalOrders}
          growth={metrics.ordersGrowth}
          icon={ShoppingCart}
        />
        <MetricCard
          title="Customers"
          value={metrics.totalCustomers}
          growth={metrics.customersGrowth}
          icon={Users}
        />
        <MetricCard
          title="Products"
          value={totalProducts}
          growth={metrics.productsGrowth}
          icon={Package}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>
              Latest orders from your store
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order._id} className="flex items-center justify-between space-x-4">
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="text-sm font-medium">#{order.orderNumber}</p>
                      <p className="text-sm text-muted-foreground">{order.userId?.userName || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge variant={getStatusBadgeVariant(order.status)}>
                      {order.status}
                    </Badge>
                    <div className="text-right">
                      <p className="text-sm font-medium">${order.totalAmount.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">{format(new Date(order.createdAt), 'yyyy-MM-dd')}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'Delivered':
      return 'default';
    case 'Processing':
      return 'secondary';
    case 'Shipped':
      return 'outline';
    case 'Pending':
      return 'destructive';
    case 'Cancelled':
      return 'destructive';
    default:
      return 'default';
  }
};