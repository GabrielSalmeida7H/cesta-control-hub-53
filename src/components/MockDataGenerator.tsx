
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { useCreateFamily, useCreateInstitution, useCreateDelivery } from "@/hooks/useApi";
import { toast } from "@/hooks/use-toast";
import { Users, Building, Package } from "lucide-react";

const MockDataGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const createFamilyMutation = useCreateFamily();
  const createInstitutionMutation = useCreateInstitution();
  const createDeliveryMutation = useCreateDelivery();

  const generateMockFamilies = async () => {
    const mockFamilies = [
      {
        name: "Família Santos",
        address: "Rua das Palmeiras, 123 - Centro",
        phone: "(11) 98765-4321",
        members: 4,
        income: 1200.00,
        status: "active"
      },
      {
        name: "Família Rodrigues",
        address: "Av. Brasil, 456 - Vila Nova",
        phone: "(11) 98765-4322",
        members: 3,
        income: 950.00,
        status: "active"
      },
      {
        name: "Família Ferreira",
        address: "Rua do Comércio, 789 - Centro",
        phone: "(11) 98765-4323",
        members: 5,
        income: 1800.00,
        status: "blocked"
      }
    ];

    for (const family of mockFamilies) {
      try {
        await createFamilyMutation.mutateAsync(family);
      } catch (error) {
        console.log("Família já existe ou erro:", error);
      }
    }
  };

  const generateMockInstitutions = async () => {
    const mockInstitutions = [
      {
        name: "Centro Social Esperança",
        address: "Rua da Esperança, 100 - Jardim Primavera",
        phone: "(11) 91234-5678",
        inventory: { baskets: 25 }
      },
      {
        name: "Associação Comunitária Unidos",
        address: "Av. Solidariedade, 200 - Vila União",
        phone: "(11) 91234-5679",
        inventory: { baskets: 40 }
      }
    ];

    for (const institution of mockInstitutions) {
      try {
        await createInstitutionMutation.mutateAsync(institution);
      } catch (error) {
        console.log("Instituição já existe ou erro:", error);
      }
    }
  };

  const generateMockData = async () => {
    setIsGenerating(true);
    try {
      await generateMockFamilies();
      await generateMockInstitutions();
      
      toast({
        title: "Dados de exemplo criados!",
        description: "Famílias e instituições de exemplo foram adicionadas ao sistema.",
      });
    } catch (error) {
      toast({
        title: "Erro ao gerar dados",
        description: "Alguns dados podem já existir no sistema.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>
          Dados de Exemplo
        </CardTitle>
        <CardDescription>
          Gerar dados mockup para testar o sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            <p className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              3 famílias de exemplo
            </p>
            <p className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              2 instituições com estoque
            </p>
          </div>
          
          <Button 
            onClick={generateMockData} 
            disabled={isGenerating}
            className="w-full"
          >
            <Package className="mr-2 h-4 w-4" />
            {isGenerating ? "Gerando..." : "Gerar Dados de Exemplo"}
          </Button>
          
          <p className="text-xs text-gray-500">
            Nota: Dados duplicados serão ignorados automaticamente.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MockDataGenerator;
