
import { Package, Users, Building, AlertTriangle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DashboardCard from "@/components/DashboardCard";
import DeliveriesChart from "@/components/DeliveriesChart";
import RecentDeliveriesTable from "@/components/RecentDeliveriesTable";
import { useAuth } from "@/contexts/AuthContext";
import { useFamilies, useInstitutions, useDeliveries } from "@/hooks/useApi";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const { data: families, isLoading: familiesLoading } = useFamilies();
  const { data: institutions, isLoading: institutionsLoading } = useInstitutions();
  const { data: deliveries, isLoading: deliveriesLoading } = useDeliveries();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  if (authLoading || !user) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-lg">Carregando...</div>
    </div>;
  }

  // Calcular estatísticas dos dados da API
  const monthlyDeliveries = deliveries?.length || 0;
  const totalInstitutions = institutions?.length || 0;
  const activeFamilies = families?.filter((f: any) => f.status === "active")?.length || 0;
  const blockedFamilies = families?.filter((f: any) => f.status === "blocked")?.length || 0;

  return (
    <div className="min-h-screen bg-gray-100 font-sans flex flex-col">
      <Header username={user.name} />
      
      <main className="pt-20 pb-8 px-4 md:px-8 max-w-[1400px] mx-auto w-full flex-grow">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Painel de Controle</h2>
          
          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <DashboardCard 
              title="Cestas Entregues no Mês" 
              value={monthlyDeliveries} 
              icon={Package} 
              color="primary"
            />
            <DashboardCard 
              title="Total de Instituições" 
              value={totalInstitutions} 
              icon={Building} 
              color="secondary"
            />
            <DashboardCard 
              title="Famílias Atendidas" 
              value={activeFamilies} 
              icon={Users} 
              color="success"
            />
            <DashboardCard 
              title="Famílias Bloqueadas" 
              value={blockedFamilies} 
              icon={AlertTriangle} 
              color="danger"
            />
          </div>
          
          {/* Chart Section */}
          <div className="mb-8">
            <DeliveriesChart />
          </div>
          
          {/* Table Section */}
          <div className="mb-8">
            <RecentDeliveriesTable />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
