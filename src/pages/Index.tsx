import { Package, Users, Building, AlertTriangle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DashboardCard from "@/components/DashboardCard";
import DeliveriesChart from "@/components/DeliveriesChart";
import RecentDeliveriesTable from "@/components/RecentDeliveriesTable";
import NavigationButtons from "@/components/NavigationButtons";
import { useAuth } from "@/contexts/AuthContext";
import { useFamilies, useInstitutions, useDeliveriesByInstitution, useDeliveries } from "@/hooks/useApi";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MockDataGenerator from "@/components/MockDataGenerator";

const Index = () => {
  const { user, isLoading: authLoading } = useAuth();
  
  const { data: families, isLoading: familiesLoading } = useFamilies();
  const { data: institutions, isLoading: institutionsLoading } = useInstitutions();
  
  // Para admin: todas as entregas, para usuário normal: apenas da sua instituição
  const { data: userDeliveries } = useDeliveriesByInstitution(user?.institution_id);
  const { data: allDeliveries } = useDeliveries();
  
  const deliveries = user?.type === 'admin' ? allDeliveries : userDeliveries;

  if (authLoading || !user) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-lg">Carregando...</div>
    </div>;
  }

  // Calcular estatísticas dos dados da API
  const monthlyDeliveries = deliveries?.length || 0;
  
  // Para admin: todas as instituições, para usuário normal: apenas a sua
  const totalInstitutions = user.type === 'admin' 
    ? institutions?.length || 0
    : 1;
  
  // Famílias atendidas pela instituição do usuário (se for usuário normal)
  const institutionFamilies = user.type === 'admin' 
    ? families 
    : families?.filter((f: any) => 
        f.deliveries?.some((d: any) => d.institution_id === user.institution_id)
      );
  
  const activeFamilies = institutionFamilies?.filter((f: any) => f.status === "active")?.length || 0;
  const blockedFamilies = institutionFamilies?.filter((f: any) => f.status === "blocked")?.length || 0;

  return (
    <div className="min-h-screen bg-gray-100 font-sans flex flex-col">
      <Header username={user?.name || ""} />
      
      <main className="pt-20 pb-8 px-4 md:px-8 max-w-[1400px] mx-auto flex-grow">
        <div className="mb-8">
          {/* Welcome Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Bem-vindo ao Sistema de Gestão de Cestas Básicas
            </h2>
            <p className="text-gray-600">
              {user?.type === 'admin' 
                ? 'Como administrador, você tem acesso completo ao sistema.' 
                : `Olá ${user?.name}, você está conectado à ${user?.institution?.name || 'plataforma'}.`
              }
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <DashboardCard 
              title="Cestas Entregues no Mês" 
              value={monthlyDeliveries} 
              icon={Package} 
              color="primary"
            />
            <DashboardCard 
              title={user.type === 'admin' ? "Total de Instituições" : "Sua Instituição"} 
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

          {/* Charts and Recent Data */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <DeliveriesChart institutionId={user.institution_id} />
            <RecentDeliveriesTable institutionId={user.institution_id} />
          </div>

          {/* Navigation and Mock Data */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <NavigationButtons userType={user?.type || 'normal'} />
            </div>
            <div>
              <MockDataGenerator />
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
