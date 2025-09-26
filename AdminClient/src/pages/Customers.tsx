import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Filter, Eye, Mail, Phone, MapPin, Calendar, Users as UsersIcon } from 'lucide-react';
import { format } from 'date-fns';

// Mock customer data
const mockCustomers = [
  {
    _id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    address: 'New York, NY',
    totalOrders: 5,
    totalSpent: 1250.00,
    lastOrderDate: '2024-01-20T10:00:00Z',
    joinDate: '2023-06-15T14:30:00Z',
    status: 'Active'
  },
  {
    _id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '+1 (555) 987-6543',
    address: 'Los Angeles, CA',
    totalOrders: 12,
    totalSpent: 3200.00,
    lastOrderDate: '2024-01-19T14:30:00Z',
    joinDate: '2023-03-22T09:15:00Z',
    status: 'VIP'
  },
  {
    _id: '3',
    name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    phone: '+1 (555) 456-7890',
    address: 'Chicago, IL',
    totalOrders: 2,
    totalSpent: 450.00,
    lastOrderDate: '2024-01-18T16:45:00Z',
    joinDate: '2023-11-08T11:20:00Z',
    status: 'Active'
  },
  {
    _id: '4',
    name: 'Alice Brown',
    email: 'alice.brown@example.com',
    phone: '+1 (555) 321-0987',
    address: 'Miami, FL',
    totalOrders: 8,
    totalSpent: 1800.00,
    lastOrderDate: '2024-01-21T12:20:00Z',
    joinDate: '2023-08-10T16:45:00Z',
    status: 'Active'
  },
  {
    _id: '5',
    name: 'Charlie Wilson',
    email: 'charlie.wilson@example.com',
    phone: '+1 (555) 654-3210',
    address: 'Seattle, WA',
    totalOrders: 1,
    totalSpent: 89.99,
    lastOrderDate: '2023-12-15T08:30:00Z',
    joinDate: '2023-12-10T13:25:00Z',
    status: 'Inactive'
  }
];

const getCustomerTypeVariant = (status: string, totalSpent: number) => {
  if (status === 'VIP' || totalSpent > 2000) return 'default';
  if (status === 'Inactive') return 'secondary';
  return 'outline';
};

const getCustomerType = (totalSpent: number, totalOrders: number) => {
  if (totalSpent > 2000) return 'VIP';
  if (totalOrders === 0) return 'New';
  if (totalSpent < 100) return 'Potential';
  return 'Regular';
};

export function Customers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filteredCustomers = mockCustomers.filter(customer => {
    const matchesSearch = 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || customer.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">Manage your customer relationships and insights</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockCustomers.length}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">VIP Customers</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockCustomers.filter(c => c.totalSpent > 2000).length}
            </div>
            <p className="text-xs text-muted-foreground">High-value customers</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$275</div>
            <p className="text-xs text-muted-foreground">+8% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active This Month</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockCustomers.filter(c => c.status === 'Active' || c.status === 'VIP').length}
            </div>
            <p className="text-xs text-muted-foreground">Users who made orders</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          {['Active', 'VIP', 'Inactive'].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(statusFilter === status ? '' : status)}
            >
              {status}
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
          Export
        </Button>
      </div>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customer List ({filteredCustomers.length})</CardTitle>
          <CardDescription>
            Complete customer information and purchase history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Last Order</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => {
                const customerType = getCustomerType(customer.totalSpent, customer.totalOrders);
                
                return (
                  <TableRow key={customer._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center mt-1">
                          <Calendar className="h-3 w-3 mr-1" />
                          Joined {format(new Date(customer.joinDate), 'MMM yyyy')}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Mail className="h-3 w-3 mr-2 text-muted-foreground" />
                          {customer.email}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Phone className="h-3 w-3 mr-2" />
                          {customer.phone}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3 mr-2" />
                          {customer.address}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{customer.totalOrders}</div>
                        <div className="text-sm text-muted-foreground">orders</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">${customer.totalSpent.toFixed(2)}</div>
                        <div className="text-sm text-muted-foreground">
                          ${(customer.totalSpent / Math.max(customer.totalOrders, 1)).toFixed(0)} avg
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getCustomerTypeVariant(customer.status, customer.totalSpent)}>
                        {customerType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {format(new Date(customer.lastOrderDate), 'MMM dd, yyyy')}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(customer.lastOrderDate), 'HH:mm')}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Mail className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          {filteredCustomers.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <UsersIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No customers found</h3>
                <p className="text-muted-foreground">No customers match your search criteria.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
