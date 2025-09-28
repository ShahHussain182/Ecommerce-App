import { useState, useMemo, useEffect } from 'react'; // Import useEffect
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow,
  TableCaption
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Package, 
  Truck, 
  CheckCircle, 
  XCircle, 
  Clock, 
  MoreHorizontal, 
  Download, 
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { orderService } from '@/services/orderService';
import { Order, OrderStatus } from '@/types';
import { cn } from '@/lib/utils';

const statusConfig = {
  'Pending': { icon: Clock, color: 'text-yellow-500', bgColor: 'bg-yellow-100', variant: 'secondary' as const },
  'Processing': { icon: Package, color: 'text-blue-500', bgColor: 'bg-blue-100', variant: 'default' as const },
  'Shipped': { icon: Truck, color: 'text-purple-500', bgColor: 'bg-purple-100', variant: 'outline' as const },
  'Delivered': { icon: CheckCircle, color: 'text-green-500', bgColor: 'bg-green-100', variant: 'default' as const },
  'Cancelled': { icon: XCircle, color: 'text-red-500', bgColor: 'bg-red-100', variant: 'destructive' as const },
};

export function Orders() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(''); // New state for debounced search
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'All'>('All');
  const [sortBy, setSortBy] = useState<'date' | 'total'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const limit = 10;

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(1); // Reset to first page on new search term
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Query for orders from API
  const { data: ordersData, isLoading, error, refetch } = useQuery({
    queryKey: ['orders', page, limit, debouncedSearchTerm, statusFilter, sortBy, sortOrder], // Include all filters in queryKey
    queryFn: () => orderService.getAllOrders({ 
      page, 
      limit, 
      searchTerm: debouncedSearchTerm || undefined,
      statusFilter: statusFilter === 'All' ? undefined : statusFilter,
      sortBy,
      sortOrder,
    }),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const orders = ordersData?.data || [];
  const totalOrders = ordersData?.totalOrders || 0;
  const totalPages = Math.ceil(totalOrders / limit);

  // Filter and sort orders are now handled by the backend, so this memo is simplified
  const displayedOrders = orders;

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order status updated successfully');
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const handleBulkUpdateStatus = async (newStatus: OrderStatus) => {
    if (selectedOrders.length === 0) return;
    
    try {
      await Promise.all(
        selectedOrders.map(id => orderService.updateOrderStatus(id, newStatus))
      );
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setSelectedOrders([]);
      toast.success(`Updated ${selectedOrders.length} orders to ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update orders');
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    const config = statusConfig[status];
    const Icon = config.icon;
    return <Icon className={`h-4 w-4 ${config.color}`} />;
  };

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId) 
        : [...prev, orderId]
    );
  };

  const selectAllOrders = () => {
    if (selectedOrders.length === displayedOrders.length && displayedOrders.length > 0) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(displayedOrders.map(order => order._id));
    }
  };

  const exportOrders = () => {
    // In a real app, this would generate a CSV file
    toast.success('Orders exported successfully');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">Manage customer orders and track fulfillment</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={exportOrders}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter(o => o.status === 'Pending').length}
            </div>
            <p className="text-xs text-muted-foreground">Orders awaiting processing</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shipped</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter(o => o.status === 'Shipped').length}
            </div>
            <p className="text-xs text-muted-foreground">Orders in transit</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter(o => o.status === 'Delivered').length}
            </div>
            <p className="text-xs text-muted-foreground">Successfully delivered</p>
          </CardContent>
        </Card>
      </div>

      {/* Search, Filters, and Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-1 gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select value={statusFilter} onValueChange={(value) => {setStatusFilter(value as OrderStatus | 'All'); setPage(1);}}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Statuses</SelectItem>
              {Object.keys(statusConfig).map((status) => (
                <SelectItem key={status} value={status}>
                  <div className="flex items-center">
                    {getStatusIcon(status as OrderStatus)}
                    <span className="ml-2">{status}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center space-x-2">
          <Select value={sortBy} onValueChange={(value) => {setSortBy(value as 'date' | 'total'); setPage(1);}}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="total">Total</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => {setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); setPage(1);}}
          >
            {sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedOrders.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <p>{selectedOrders.length} orders selected</p>
          <div className="flex space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Update Status
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Set Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {Object.keys(statusConfig).map((status) => (
                  <DropdownMenuItem 
                    key={status} 
                    onClick={() => handleBulkUpdateStatus(status as OrderStatus)}
                  >
                    <div className="flex items-center">
                      {getStatusIcon(status as OrderStatus)}
                      <span className="ml-2">{status}</span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" onClick={() => setSelectedOrders([])}>
              Clear Selection
            </Button>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders ({totalOrders})</CardTitle>
          <CardDescription>
            View and manage all customer orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <input
                    type="checkbox"
                    checked={selectedOrders.length === displayedOrders.length && displayedOrders.length > 0}
                    onChange={selectAllOrders}
                    className="h-4 w-4"
                  />
                </TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading orders...
                    </div>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center">
                      <XCircle className="h-12 w-12 text-destructive mb-2" />
                      <h3 className="text-lg font-semibold">Error loading orders</h3>
                      <p className="text-muted-foreground mb-4">
                        There was an issue fetching the orders.
                      </p>
                      <Button onClick={() => refetch()}>Try Again</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : displayedOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center">
                      <Package className="h-12 w-12 text-muted-foreground mb-2" />
                      <h3 className="mt-4 text-lg font-semibold">No orders found</h3>
                      <p className="text-muted-foreground">
                        No orders match your search criteria.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                displayedOrders.map((order) => {
                  const config = statusConfig[order.status];
                  const StatusIcon = config.icon;
                  
                  return (
                    <TableRow 
                      key={order._id}
                      className={cn(selectedOrders.includes(order._id) ? "bg-muted" : "")}
                    >
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedOrders.includes(order._id)}
                          onChange={() => toggleOrderSelection(order._id)}
                          className="h-4 w-4"
                        />
                      </TableCell>
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
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
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
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>View Details</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setIsOrderDialogOpen(true);
                                }}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Order
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                              {Object.keys(statusConfig).map((status) => (
                                <DropdownMenuItem 
                                  key={status} 
                                  onClick={() => handleUpdateOrderStatus(order._id, status as OrderStatus)}
                                >
                                  <div className="flex items-center">
                                    {getStatusIcon(status as OrderStatus)}
                                    <span className="ml-2">{status}</span>
                                  </div>
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-2 py-4">
              <div className="text-sm text-muted-foreground">
                Showing page {page} of {totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(prev => Math.max(1, prev - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={page === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
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