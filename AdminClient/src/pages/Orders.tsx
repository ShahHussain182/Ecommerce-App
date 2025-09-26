import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Filter, Eye, Edit, Package, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { orderService } from '@/services/orderService';
import { Order, OrderStatus } from '@/types';

const statusConfig = {
  'Pending': { icon: Clock, color: 'text-yellow-500', bgColor: 'bg-yellow-100', variant: 'secondary' as const },
  'Processing': { icon: Package, color: 'text-blue-500', bgColor: 'bg-blue-100', variant: 'default' as const },
  'Shipped': { icon: Truck, color: 'text-purple-500', bgColor: 'bg-purple-100', variant: 'outline' as const },
  'Delivered': { icon: CheckCircle, color: 'text-green-500', bgColor: 'bg-green-100', variant: 'default' as const },
  'Cancelled': { icon: XCircle, color: 'text-red-500', bgColor: 'bg-red-100', variant: 'destructive' as const },
};

export function Orders() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);

  // Query for orders from API
  const { data: ordersData, isLoading, error, refetch } = useQuery({
    queryKey: ['orders'],
    queryFn: orderService.getAllOrders,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const orders = ordersData?.data || [];

  // Filter orders based on search and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toString().includes(searchTerm) ||
      order.shippingAddress.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some(item => item.nameAtTime.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = !statusFilter || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      refetch();
      toast.success('Order status updated successfully');
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    const config = statusConfig[status];
    const Icon = config.icon;
    return <Icon className={`h-4 w-4 ${config.color}`} />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">Manage customer orders and track fulfillment</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          {Object.keys(statusConfig).map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(statusFilter === status ? '' : status)}
            >
              {getStatusIcon(status as OrderStatus)}
              <span className="ml-2">{status}</span>
            </Button>
          ))}
          <Button
            variant={statusFilter === '' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('')}
          >
            All
          </Button>
        </div>
        
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          More Filters
        </Button>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders ({filteredOrders.length})</CardTitle>
          <CardDescription>
            View and manage all customer orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => {
                const config = statusConfig[order.status];
                const StatusIcon = config.icon;
                
                return (
                  <TableRow key={order._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">#{order.orderNumber}</div>
                        <div className="text-sm text-muted-foreground">ID: {order._id.slice(-8)}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.shippingAddress.fullName}</div>
                        <div className="text-sm text-muted-foreground">
                          {order.shippingAddress.city}, {order.shippingAddress.state}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</div>
                        <div className="text-sm text-muted-foreground">
                          {order.items[0]?.nameAtTime}{order.items.length > 1 && ` +${order.items.length - 1} more`}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">${order.totalAmount.toFixed(2)}</div>
                      <div className="text-sm text-muted-foreground">{order.paymentMethod}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
                        <StatusIcon className="h-3 w-3" />
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{format(new Date(order.createdAt), 'MMM dd, yyyy')}</div>
                        <div className="text-sm text-muted-foreground">{format(new Date(order.createdAt), 'HH:mm')}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsOrderDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value as OrderStatus)}
                          className="text-xs px-2 py-1 rounded border"
                        >
                          {Object.keys(statusConfig).map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                <h3 className="mt-4 text-lg font-semibold">Loading orders...</h3>
              </div>
            </div>
          )}
          
          {error && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Package className="mx-auto h-12 w-12 text-destructive" />
                <h3 className="mt-4 text-lg font-semibold">Error loading orders</h3>
                <p className="text-muted-foreground mb-4">There was an issue fetching the orders.</p>
                <Button onClick={() => refetch()}>Try Again</Button>
              </div>
            </div>
          )}
          
          {!isLoading && !error && filteredOrders.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No orders found</h3>
                <p className="text-muted-foreground">No orders match your search criteria.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details - #{selectedOrder?.orderNumber}</DialogTitle>
            <DialogDescription>
              Complete order information and items
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Status */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(selectedOrder.status)}
                  <div>
                    <h3 className="font-semibold">Status: {selectedOrder.status}</h3>
                    <p className="text-sm text-muted-foreground">
                      Order placed on {format(new Date(selectedOrder.createdAt), 'MMMM dd, yyyy \\at HH:mm')}
                    </p>
                  </div>
                </div>
                <Badge variant={statusConfig[selectedOrder.status].variant} className="text-sm">
                  {selectedOrder.status}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Customer Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium">Full Name</label>
                        <p className="text-sm">{selectedOrder.shippingAddress.fullName}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Shipping Address</label>
                        <p className="text-sm">
                          {selectedOrder.shippingAddress.addressLine1}<br />
                          {selectedOrder.shippingAddress.addressLine2 && (
                            <>{selectedOrder.shippingAddress.addressLine2}<br /></>
                          )}
                          {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.postalCode}<br />
                          {selectedOrder.shippingAddress.country}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Payment Method</label>
                        <p className="text-sm">{selectedOrder.paymentMethod}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Order Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Total Items:</span>
                        <span className="text-sm font-medium">{selectedOrder.items.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Total Quantity:</span>
                        <span className="text-sm font-medium">
                          {selectedOrder.items.reduce((sum, item) => sum + item.quantity, 0)}
                        </span>
                      </div>
                      <div className="flex justify-between text-lg font-semibold">
                        <span>Total Amount:</span>
                        <span>${selectedOrder.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedOrder.items.map((item, index) => (
                      <div key={item._id || index} className="flex items-center space-x-4 p-4 border rounded-lg">
                        <img
                          src={item.imageAtTime}
                          alt={item.nameAtTime}
                          className="h-16 w-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium">{item.nameAtTime}</h4>
                          <p className="text-sm text-muted-foreground">
                            {item.sizeAtTime} • {item.colorAtTime}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Qty: {item.quantity} × ${item.priceAtTime.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${(item.quantity * item.priceAtTime).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
