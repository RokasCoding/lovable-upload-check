import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { User, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const isAdmin = user?.user_metadata.role === 'admin';

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navigation Bar */}
      <header className="bg-white py-4 px-6 shadow-md border-b-2 border-vcs-black">
        <div className="container mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img 
              src="https://www.vilniuscoding.lt/wp-content/uploads/2023/08/VCS-Logo-2023-PNG-be-fono-08-130x57.png" 
              alt="Vilnius Coding School Logo" 
              className="h-12 object-contain"
            />
            <span className="hidden sm:inline-block text-xl font-semibold text-vcs-black ml-2">VCS Bonus Sistema</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            {user && (
              <>
                <Link to="/dashboard" className="text-vcs-black hover:text-vcs-blue transition-colors font-medium">
                  Pagrindinis
                </Link>
                <Link to="/prizes" className="text-vcs-black hover:text-vcs-blue transition-colors font-medium">
                  Prizai
                </Link>
                <Link to="/history" className="text-vcs-black hover:text-vcs-blue transition-colors font-medium">
                  Istorija
                </Link>
                <Link to="/rules" className="text-vcs-black hover:text-vcs-blue transition-colors font-medium">
                  Taisyklės
                </Link>
                <Link to="/faq" className="text-vcs-black hover:text-vcs-blue transition-colors font-medium">
                  D.U.K.
                </Link>
                <a 
                  href="https://www.vilniuscoding.lt/privatumo-politika/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-vcs-black hover:text-vcs-blue transition-colors font-medium flex items-center gap-1"
                >
                  Privatumo politika
                  <ExternalLink size={14} />
                </a>
                {isAdmin && (
                  <Link to="/admin" className="text-vcs-black hover:text-vcs-blue transition-colors font-medium">
                    Admin
                  </Link>
                )}
              </>
            )}
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      {user.user_metadata.name?.charAt(0) || user.email?.charAt(0)}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.user_metadata.name || user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="cursor-pointer w-full">Pagrindinis</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/prizes" className="cursor-pointer w-full">Prizai</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/history" className="cursor-pointer w-full">Istorija</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/rules" className="cursor-pointer w-full">Taisyklės</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/faq" className="cursor-pointer w-full">D.U.K.</Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="cursor-pointer w-full">Admin panelė</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    Atsijungti
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="outline" onClick={() => navigate('/login')} className="text-vcs-black border-vcs-blue hover:bg-vcs-blue hover:text-white">
                Prisijungti
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Navigation Bar (shown only on small screens) */}
      {user && (
        <div className="md:hidden bg-white border-t border-vcs-black">
          <div className="container mx-auto flex justify-between">
            <Link to="/dashboard" className="flex-1 text-center py-3 text-vcs-black hover:bg-vcs-blue hover:text-white transition-colors">
              Pagrindinis
            </Link>
            <Link to="/prizes" className="flex-1 text-center py-3 text-vcs-black hover:bg-vcs-blue hover:text-white transition-colors">
              Prizai
            </Link>
            <Link to="/history" className="flex-1 text-center py-3 text-vcs-black hover:bg-vcs-blue hover:text-white transition-colors">
              Istorija
            </Link>
            <Link to="/rules" className="flex-1 text-center py-3 text-vcs-black hover:bg-vcs-blue hover:text-white transition-colors">
              Taisyklės
            </Link>
            <Link to="/faq" className="flex-1 text-center py-3 text-vcs-black hover:bg-vcs-blue hover:text-white transition-colors">
              D.U.K.
            </Link>
            {isAdmin && (
              <Link to="/admin" className="flex-1 text-center py-3 text-vcs-black hover:bg-vcs-blue hover:text-white transition-colors">
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
      <footer className="bg-white py-6 px-6 mt-auto border-t-2 border-vcs-black">
        <div className="container mx-auto">
          <div className="text-center text-vcs-black text-sm">
            <p>Vilnius Coding School © {new Date().getFullYear()} - Bonus Point CRM</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
