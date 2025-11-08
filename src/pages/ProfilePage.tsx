import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate, Link } from 'react-router-dom';
import * as authApi from '@/lib/authApi';
import { toast } from 'sonner';
import { useState } from 'react';
import { Spinner } from '@/components/ui/Spinner';
import { User, Mail, Phone, Calendar, LogOut, Edit, Package, Lock, AlertTriangle } from 'lucide-react';

const ProfilePage = () => {
  const { user, logout: logoutFromStore ,isVerified} = useAuthStore();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authApi.logout();
      logoutFromStore();
      navigate('/login');
    } catch (error) {
      toast.error("Logout Failed", {
        description: "An error occurred while trying to log out. Please try again.",
      });
    } finally {
      setIsLoggingOut(false);
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
    <div className="flex flex-col min-h-screen bg-muted/50">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
    
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <div className="inline-block bg-muted p-4 rounded-full mx-auto mb-4">
                <User className="h-16 w-16 text-muted-foreground" />
              </div>
              <CardTitle className="text-3xl font-bold">{user.userName}</CardTitle>
              <CardDescription>Your personal account details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4 p-4 border rounded-md">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 border rounded-md">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone Number</p>
                  <p className="font-medium">{user.phoneNumber}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 border rounded-md">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Last Login</p>
                  <p className="font-medium">{new Date(user.lastLogin).toLocaleString()}</p>
                </div>
              </div>
              {!isVerified && (
    <div className="mb-8 rounded-md border border-yellow-300 bg-yellow-50 p-4 flex items-start space-x-3 shadow-sm">
      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
      <div>
        <p className="text-sm font-medium text-yellow-800">
          Your email is not verified.
        </p>
        <p className="text-sm text-yellow-700">
          Please verify your email to unlock all features and secure your account.
        </p>
      </div>
    </div>
  )}

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button asChild className="w-full">
                  <Link to="/orders">
                    <Package className="mr-2 h-4 w-4" /> My Orders
                  </Link>
                </Button>

                <Button asChild className="w-full">
                  <Link to="/profile/edit">
                    <Edit className="mr-2 h-4 w-4" /> Edit Profile
                  </Link>
                </Button>

                {!user.googleId && (
    <Button asChild className="w-full">
      <Link to="/profile/change-password">
        <Lock className="mr-2 h-4 w-4" /> Change Password
      </Link>
    </Button>
  )}

                <Button
                  variant="destructive"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2"
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? (
                    <>
                      <Spinner size={18} color="text-white" />
                      Logging out...
                    </>
                  ) : (
                    <>
                      <LogOut className="mr-2 h-4 w-4" /> Logout
                    </>
                  )}
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