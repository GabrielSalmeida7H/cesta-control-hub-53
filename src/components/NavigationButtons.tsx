
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
    <Card>
      <CardHeader>
        <CardTitle>Navegação Rápida</CardTitle>
        <CardDescription>
          Acesse rapidamente as principais funcionalidades do sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <Button 
            onClick={() => navigate("/families")} 
            className="h-20 flex flex-col gap-2"
            variant="outline"
          >
            <Users className="h-6 w-6" />
            <span>Famílias</span>
          </Button>
          
          {userType === 'admin' && (
            <Button 
              onClick={() => navigate("/institutions")} 
              className="h-20 flex flex-col gap-2"
              variant="outline"
            >
              <Building className="h-6 w-6" />
              <span>Instituições</span>
            </Button>
          )}
          
          <Button 
            onClick={() => navigate("/delivery")} 
            className="h-20 flex flex-col gap-2"
            variant="outline"
          >
            <Package className="h-6 w-6" />
            <span>Entregas</span>
          </Button>
          
          <Button 
            onClick={() => navigate("/reports")} 
            className="h-20 flex flex-col gap-2"
            variant="outline"
          >
            <FileText className="h-6 w-6" />
            <span>Relatórios</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NavigationButtons;
