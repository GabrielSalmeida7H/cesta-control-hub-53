
import { useState } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer 
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BarChart2, Eye, EyeOff } from "lucide-react";
import { useDeliveriesByInstitution, useDeliveries } from "@/hooks/useApi";
import { useAuth } from "@/contexts/AuthContext";

interface DeliveriesChartProps {
  institutionId?: number;
}

const DeliveriesChart = ({ institutionId }: DeliveriesChartProps) => {
  const { user } = useAuth();
  const [showChart, setShowChart] = useState<boolean>(true);
  
  // Se institutionId for fornecido, usar entregas filtradas, senão usar todas
  const { data: filteredDeliveries } = useDeliveriesByInstitution(institutionId);
  const { data: allDeliveries } = useDeliveries();
  
  const deliveries = institutionId ? filteredDeliveries : allDeliveries;

  // Processar dados para o gráfico
  const processChartData = () => {
    if (!deliveries) return [];
    
    const monthlyData: { [key: string]: number } = {};
    
    deliveries.forEach((delivery: any) => {
      const date = new Date(delivery.deliveryDate.split('/').reverse().join('-'));
      const monthKey = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
      
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + (delivery.items?.baskets || 1);
    });
    
    return Object.entries(monthlyData).map(([month, count]) => ({
      name: month,
      cestas: count
    })).slice(-6); // Últimos 6 meses
  };

  const chartData = processChartData();

  return (
    <Card className="p-6 shadow-md">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center gap-2">
          <BarChart2 className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">
            {user?.type === 'admin' 
              ? "Cestas por Mês - Todas as Instituições" 
              : `Cestas por Mês - ${user?.institution?.name || 'Sua Instituição'}`
            }
          </h2>
        </div>
        
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={() => setShowChart(!showChart)}
        >
          {showChart ? (
            <>
              <EyeOff className="h-4 w-4" />
              <span>Ocultar gráfico</span>
            </>
          ) : (
            <>
              <Eye className="h-4 w-4" />
              <span>Mostrar gráfico</span>
            </>
          )}
        </Button>
      </div>

      {showChart && (
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="cestas" fill="#004E64" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
};

export default DeliveriesChart;
