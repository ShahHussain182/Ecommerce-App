import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate, Link } from 'react-router-dom';
import * as authApi from '@/lib/authApi';
import { toast } from 'sonner';
import { User, Mail, Phone, Calendar, LogOut, Edit, Package, Lock } from 'lucide-react';

const ProfilePage = () => {
  const { user, logout: logoutFromStore } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authApi.logout();
      logoutFromStore();
      navigate('/login');
    } catch (error) {
      toast.error("Logout Failed", {
        description: "An error occurred while trying to log out. Please try again.",
      });
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <p>Loading user profile...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <div className="inline-block bg-gray-100 p-4 rounded-full mx-auto mb-4">
                <User className="h-16 w-16 text-gray-600" />
              </div>
              <CardTitle className="text-3xl font-bold">{user.userName}</CardTitle>
              <CardDescription>Your personal account details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4 p-4 border rounded-md">
                <Mail className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-4 border rounded-md">
                <Phone className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Phone Number</p>
                  <p className="font-medium">{user.phoneNumber}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-4 border rounded-md">
                <Calendar className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Last Login</p>
                  <p className="font-medium">{new Date(user.lastLogin).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button asChild className="w-full">
                  <Link to="/orders">
                    <span><Package className="mr-2 h-4 w-4" /> My Orders</span>
                  </Link>
                </Button>
                <Button asChild className="w-full">
                  <Link to="/profile/edit">
                    <span><Edit className="mr-2 h-4 w-4" /> Edit Profile</span>
                  </Link>
                </Button>
                <Button asChild className="w-full">
                  <Link to="/profile/change-password">
                    <span><Lock className="mr-2 h-4 w-4" /> Change Password</span>
                  </Link>
                </Button>
                <Button variant="destructive" onClick={handleLogout} className="w-full">
                  <span><LogOut className="mr-2 h-4 w-4" /> Logout</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProfilePage;