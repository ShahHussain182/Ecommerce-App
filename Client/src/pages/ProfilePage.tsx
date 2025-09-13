import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { User, Mail, Phone, Calendar, LogOut, Edit } from 'lucide-react';

const ProfilePage = () => {
  const { user, logout: logoutFromStore } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:3001/api/v1/auth/logout', {}, {
        withCredentials: true,
      });
      logoutFromStore(); // This will show the "Logged out" toast
      navigate('/login');
    } catch (error) {
      toast.error("Logout Failed", {
        description: "An error occurred while trying to log out. Please try again.",
      });
    }
  };

  if (!user) {
    // This should theoretically not be reached due to ProtectedRoute, but it's good practice
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
                <Button className="w-full">
                  <Edit className="mr-2 h-4 w-4" /> Edit Profile
                </Button>
                <Button variant="destructive" onClick={handleLogout} className="w-full">
                  <LogOut className="mr-2 h-4 w-4" /> Logout
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