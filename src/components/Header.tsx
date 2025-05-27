
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  username: string;
}

const Header = ({ username }: HeaderProps) => {
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="bg-blue-600 text-white shadow-lg fixed top-0 left-0 right-0 z-50">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <img 
                src="/lovable-uploads/1cb439f6-d870-455d-a7a7-2ab401d03c6b.png" 
                alt="Brasão" 
                className="h-10 w-10"
              />
              <div>
                <h1 className="text-xl font-bold">Sistema de Cestas Básicas</h1>
                <p className="text-blue-100 text-sm">Prefeitura Municipal de Araguari</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <div className="text-right">
                <p className="font-medium">{username}</p>
                <div className="flex items-center gap-2">
                  <Badge variant={user?.type === 'admin' ? 'default' : 'secondary'}>
                    {user?.type === 'admin' ? 'Administrador' : 'Usuário'}
                  </Badge>
                  {user?.institution && (
                    <span className="text-blue-100 text-xs">
                      {user.institution.name}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="text-white border-white hover:bg-white hover:text-blue-600"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
