
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FileText, Download, Calendar, Users, Building, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useFamilies, useInstitutions, useDeliveries } from "@/hooks/useApi";
import { exportToCSV, formatFamiliesForCSV, formatInstitutionsForCSV, formatDeliveriesForCSV } from "@/utils/csvExport";
import { toast } from "@/hooks/use-toast";

const Reports = () => {
  const { user } = useAuth();
  const { data: families = [] } = useFamilies();
  const { data: institutions = [] } = useInstitutions();
  const { data: deliveries = [] } = useDeliveries();
  const [isExporting, setIsExporting] = useState(false);

  const handleExportFamilies = async () => {
    setIsExporting(true);
    try {
      const formattedData = formatFamiliesForCSV(families);
      exportToCSV(formattedData, `familias_${new Date().toISOString().split('T')[0]}`);
      toast({
        title: "Relatório exportado!",
        description: "O relatório de famílias foi baixado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar o relatório.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportInstitutions = async () => {
    setIsExporting(true);
    try {
      const formattedData = formatInstitutionsForCSV(institutions);
      exportToCSV(formattedData, `instituicoes_${new Date().toISOString().split('T')[0]}`);
      toast({
        title: "Relatório exportado!",
        description: "O relatório de instituições foi baixado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar o relatório.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportDeliveries = async () => {
    setIsExporting(true);
    try {
      const formattedData = formatDeliveriesForCSV(deliveries);
      exportToCSV(formattedData, `entregas_${new Date().toISOString().split('T')[0]}`);
      toast({
        title: "Relatório exportado!",
        description: "O relatório de entregas foi baixado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar o relatório.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Calculate statistics
  const activeFamilies = families.filter(f => f.status === 'active').length;
  const blockedFamilies = families.filter(f => f.status === 'blocked').length;
  const totalBaskets = institutions.reduce((sum, inst) => {
    return sum + (inst.inventory?.baskets || 0);
  }, 0);
  const deliveriesThisMonth = deliveries.filter(d => {
    const deliveryDate = new Date(d.delivery_date);
    const now = new Date();
    return deliveryDate.getMonth() === now.getMonth() && 
           deliveryDate.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="min-h-screen bg-gray-100 font-sans flex flex-col">
      <Header username={user?.name || ""} />
      
      <main className="pt-20 pb-8 px-4 md:px-8 max-w-[1400px] mx-auto flex-grow">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Relatórios e Estatísticas</h2>
          
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Famílias Ativas</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{activeFamilies}</div>
                <p className="text-xs text-muted-foreground">
                  {blockedFamilies} bloqueadas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Instituições</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{institutions.length}</div>
                <p className="text-xs text-muted-foreground">
                  Cadastradas no sistema
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cestas Disponíveis</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{totalBaskets}</div>
                <p className="text-xs text-muted-foreground">
                  Em todas as instituições
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Entregas Este Mês</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{deliveriesThisMonth}</div>
                <p className="text-xs text-muted-foreground">
                  {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Export Reports Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Relatório de Famílias
                </CardTitle>
                <CardDescription>
                  Exportar dados completos das famílias cadastradas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-gray-600">
                    <p>• Total de famílias: <Badge variant="outline">{families.length}</Badge></p>
                    <p>• Ativas: <Badge className="bg-green-500">{activeFamilies}</Badge></p>
                    <p>• Bloqueadas: <Badge className="bg-red-500">{blockedFamilies}</Badge></p>
                  </div>
                  <Button 
                    onClick={handleExportFamilies} 
                    disabled={isExporting || families.length === 0}
                    className="w-full"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {isExporting ? "Exportando..." : "Exportar CSV"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Relatório de Instituições
                </CardTitle>
                <CardDescription>
                  Exportar dados das instituições e seus estoques
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-gray-600">
                    <p>• Total de instituições: <Badge variant="outline">{institutions.length}</Badge></p>
                    <p>• Cestas disponíveis: <Badge className="bg-orange-500">{totalBaskets}</Badge></p>
                  </div>
                  <Button 
                    onClick={handleExportInstitutions} 
                    disabled={isExporting || institutions.length === 0}
                    className="w-full"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {isExporting ? "Exportando..." : "Exportar CSV"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Relatório de Entregas
                </CardTitle>
                <CardDescription>
                  Exportar histórico completo de entregas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-gray-600">
                    <p>• Total de entregas: <Badge variant="outline">{deliveries.length}</Badge></p>
                    <p>• Este mês: <Badge className="bg-purple-500">{deliveriesThisMonth}</Badge></p>
                  </div>
                  <Button 
                    onClick={handleExportDeliveries} 
                    disabled={isExporting || deliveries.length === 0}
                    className="w-full"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {isExporting ? "Exportando..." : "Exportar CSV"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Information */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Informações dos Relatórios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600 space-y-2">
                <p>• Os relatórios são exportados no formato CSV, compatível com Excel e outros softwares de planilha.</p>
                <p>• Os dados incluem informações completas e atualizadas do sistema.</p>
                <p>• Datas são formatadas no padrão brasileiro (DD/MM/AAAA).</p>
                <p>• Valores monetários são apresentados em reais (R$).</p>
                {user?.type !== 'admin' && (
                  <p className="text-orange-600">• Como usuário normal, você só tem acesso aos dados da sua instituição.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Reports;
