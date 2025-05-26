
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDeliveriesByInstitution, useDeliveries } from "@/hooks/useApi";
import { useAuth } from "@/contexts/AuthContext";

interface RecentDeliveriesTableProps {
  institutionId?: number;
}

const RecentDeliveriesTable = ({ institutionId }: RecentDeliveriesTableProps) => {
  const { user } = useAuth();
  
  // Se institutionId for fornecido, usar entregas filtradas, senão usar todas
  const { data: filteredDeliveries } = useDeliveriesByInstitution(institutionId);
  const { data: allDeliveries } = useDeliveries();
  
  const deliveries = institutionId ? filteredDeliveries : allDeliveries;

  // Ordenar entregas por data mais recente
  const sortedDeliveries = deliveries?.slice().sort((a: any, b: any) => {
    const dateA = new Date(a.deliveryDate.split('/').reverse().join('-'));
    const dateB = new Date(b.deliveryDate.split('/').reverse().join('-'));
    return dateB.getTime() - dateA.getTime();
  }).slice(0, 8) || []; // Mostrar apenas as 8 mais recentes

  return (
    <Card className="shadow-md overflow-hidden">
      <div className="bg-primary text-white p-4">
        <h2 className="text-xl font-bold">
          {user?.type === 'admin' 
            ? "Entregas Recentes - Todas as Instituições" 
            : `Entregas Recentes - ${user?.institution?.name || 'Sua Instituição'}`
          }
        </h2>
      </div>
      <div className="overflow-x-auto max-h-[400px]">
        <Table>
          <TableHeader className="bg-secondary sticky top-0">
            <TableRow>
              <TableHead className="font-semibold text-primary">Família</TableHead>
              <TableHead className="font-semibold text-primary">Data da Entrega</TableHead>
              <TableHead className="font-semibold text-primary">Instituição</TableHead>
              <TableHead className="font-semibold text-primary text-right">Quantidade</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedDeliveries.length > 0 ? (
              sortedDeliveries.map((delivery: any) => (
                <TableRow key={delivery.id}>
                  <TableCell className="font-medium">{delivery.familyName}</TableCell>
                  <TableCell>{delivery.deliveryDate}</TableCell>
                  <TableCell>{delivery.institutionName}</TableCell>
                  <TableCell className="text-right">{delivery.items?.baskets || 1}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6 text-gray-500">
                  Nenhuma entrega encontrada
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};

export default RecentDeliveriesTable;
