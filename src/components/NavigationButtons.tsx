
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building, FileText, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface NavigationButtonsProps {
  userType: 'admin' | 'normal';
}

const NavigationButtons = ({ userType }: NavigationButtonsProps) => {
  const navigate = useNavigate();

  return (
    <Card className="shadow-lg border-0 bg-white/50 backdrop-blur-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-lg font-semibold text-primary">Navegação Rápida</CardTitle>
        <CardDescription className="text-sm text-gray-600">
          Acesse rapidamente as principais funcionalidades do sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <Button 
            onClick={() => navigate("/families")} 
            className="h-20 flex flex-col gap-2 bg-white border border-gray-200 text-gray-700 hover:bg-primary hover:text-white shadow-md transition-all duration-300"
            variant="outline"
          >
            <Users className="h-6 w-6" />
            <span className="text-sm font-medium">Famílias</span>
          </Button>
          
          {userType === 'admin' && (
            <Button 
              onClick={() => navigate("/institutions")} 
              className="h-20 flex flex-col gap-2 bg-white border border-gray-200 text-gray-700 hover:bg-primary hover:text-white shadow-md transition-all duration-300"
              variant="outline"
            >
              <Building className="h-6 w-6" />
              <span className="text-sm font-medium">Instituições</span>
            </Button>
          )}
          
          <Button 
            onClick={() => navigate("/delivery")} 
            className="h-20 flex flex-col gap-2 bg-white border border-gray-200 text-gray-700 hover:bg-primary hover:text-white shadow-md transition-all duration-300"
            variant="outline"
          >
            <Package className="h-6 w-6" />
            <span className="text-sm font-medium">Entregas</span>
          </Button>
          
          <Button 
            onClick={() => navigate("/reports")} 
            className="h-20 flex flex-col gap-2 bg-white border border-gray-200 text-gray-700 hover:bg-primary hover:text-white shadow-md transition-all duration-300"
            variant="outline"
          >
            <FileText className="h-6 w-6" />
            <span className="text-sm font-medium">Relatórios</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NavigationButtons;
