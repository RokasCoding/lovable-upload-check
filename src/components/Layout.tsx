
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { User } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { currentUser, isAuthenticated, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-vcs-darker flex flex-col">
      {/* Navigation Bar */}
      <header className="bg-vcs-dark py-4 px-6 shadow-md">
        <div className="container mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img 
              src="https://www.vilniuscoding.lt/wp-content/uploads/2023/08/VCS-Logo-2023-PNG-be-fono-08-130x57.png" 
              alt="Vilnius Coding School Logo" 
              className="h-12 object-contain"
            />
            <span className="hidden sm:inline-block text-xl font-semibold text-white ml-2">Bonus CRM</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            {isAuthenticated && (
              <>
                <Link to="/dashboard" className="text-gray-200 hover:text-white transition-colors">
                  Dashboard
                </Link>
                <Link to="/prizes" className="text-gray-200 hover:text-white transition-colors">
                  Prizes
                </Link>
                <Link to="/history" className="text-gray-200 hover:text-white transition-colors">
                  History
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="text-gray-200 hover:text-white transition-colors">
                    Admin
                  </Link>
                )}
              </>
            )}
          </nav>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-vcs-green text-white">
                      {currentUser?.name.charAt(0) || <User size={22} />}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{currentUser?.name}</p>
                      <p className="text-sm text-muted-foreground">{currentUser?.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="cursor-pointer w-full">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/prizes" className="cursor-pointer w-full">Prizes</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/history" className="cursor-pointer w-full">History</Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="cursor-pointer w-full">Admin Panel</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="outline" onClick={() => navigate('/login')} className="text-white border-vcs-green hover:bg-vcs-green hover:text-white">
                Login
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Navigation Bar (shown only on small screens) */}
      {isAuthenticated && (
        <div className="md:hidden bg-vcs-gray border-t border-gray-700">
          <div className="container mx-auto flex justify-between">
            <Link to="/dashboard" className="flex-1 text-center py-3 text-gray-300 hover:bg-vcs-green hover:text-white transition-colors">
              Dashboard
            </Link>
            <Link to="/prizes" className="flex-1 text-center py-3 text-gray-300 hover:bg-vcs-green hover:text-white transition-colors">
              Prizes
            </Link>
            <Link to="/history" className="flex-1 text-center py-3 text-gray-300 hover:bg-vcs-green hover:text-white transition-colors">
              History
            </Link>
            {isAdmin && (
              <Link to="/admin" className="flex-1 text-center py-3 text-gray-300 hover:bg-vcs-green hover:text-white transition-colors">
                Admin
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-vcs-dark py-6 px-6 mt-auto">
        <div className="container mx-auto">
          <div className="text-center text-gray-400 text-sm">
            <p>Vilnius Coding School © {new Date().getFullYear()} - Bonus Point CRM</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
