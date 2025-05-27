
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Package, Calendar, Search, Users, Check, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { useAuth } from "@/contexts/AuthContext";
import { useFamilies, useInstitutions, useDeliveriesByInstitution, useCreateDelivery, useUpdateFamily, useUpdateInstitution } from "@/hooks/useApi";

// Updated interfaces to match Supabase schema
interface Family {
  id: string;
  name: string;
  address: string;
  phone: string;
  members: number;
  income: number;
  status: "active" | "blocked";
  blocked_until?: string;
  created_at: string;
}

interface Institution {
  id: string;
  name: string;
  address: string;
  phone: string;
  inventory: {
    baskets: number;
    [key: string]: number;
  };
  created_at: string;
}

interface Delivery {
  id: string;
  family_id: string;
  institution_id: string;
  family_name: string;
  institution_name: string;
  delivery_date: string;
  items: {
    baskets: number;
    others?: string[];
  };
  created_at: string;
}

interface DeliveryFormValues {
  familyId: string;
  blockPeriod: string;
  basketCount: number;
  otherItems: string;
}

const DeliveryManagement = () => {
  const { user } = useAuth();
  const isAdmin = user?.type === 'admin';
  
  // API hooks
  const { data: families = [] } = useFamilies();
  const { data: institutions = [] } = useInstitutions();
  const { data: deliveries = [] } = useDeliveriesByInstitution(user?.institution_id);
  const createDeliveryMutation = useCreateDelivery();
  const updateFamilyMutation = useUpdateFamily();
  const updateInstitutionMutation = useUpdateInstitution();
  
  // States
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null);
  const [isDeliveryDialogOpen, setIsDeliveryDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("active");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Get current institution with proper typing
  const currentInstitution = institutions.find((i: any) => i.id === user?.institution_id);
  const currentInstitutionTyped = currentInstitution ? {
    ...currentInstitution,
    inventory: currentInstitution.inventory as { baskets: number; [key: string]: number }
  } : null;
  
  // Filter families for eligible families (all families are shared)
  const filteredFamilies = families.filter((family: any) => {
    const statusMatch = filterStatus === "all" || family.status === filterStatus;
    const searchMatch = family.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       family.phone.includes(searchTerm);
    return statusMatch && searchMatch;
  });
  
  // Filter deliveries for this institution only
  const institutionDeliveries = deliveries.sort((a: any, b: any) => {
    const dateA = new Date(a.delivery_date);
    const dateB = new Date(b.delivery_date);
    return dateB.getTime() - dateA.getTime();
  });
  
  // Setup form
  const form = useForm<DeliveryFormValues>({
    defaultValues: {
      familyId: "",
      blockPeriod: "30",
      basketCount: 1,
      otherItems: ""
    }
  });

  // Open delivery dialog for a family
  const handleDelivery = (family: any) => {
    setSelectedFamily(family);
    form.reset({
      familyId: family.id,
      blockPeriod: "30",
      basketCount: 1,
      otherItems: ""
    });
    setIsDeliveryDialogOpen(true);
  };
  
  // Handle delivery details view
  const handleViewDeliveryDetails = (delivery: any) => {
    const deliveryTyped = {
      ...delivery,
      items: delivery.items as { baskets: number; others?: string[] }
    };
    setSelectedDelivery(deliveryTyped);
    setIsDetailsDialogOpen(true);
  };
  
  // Function to format date as DD/MM/YYYY
  const formatDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  
  // Calculate block until date based on current date and period in days
  const calculateBlockUntilDate = (blockPeriod: number): string => {
    const today = new Date();
    const blockUntil = new Date(today);
    blockUntil.setDate(today.getDate() + blockPeriod);
    return blockUntil.toISOString().split('T')[0]; // Return YYYY-MM-DD format for database
  };

  // Process delivery submission
  const onSubmit = async (data: DeliveryFormValues) => {
    if (!selectedFamily || !currentInstitutionTyped || !user) return;
    
    try {
      const blockPeriod = parseInt(data.blockPeriod);
      const blockUntilDate = calculateBlockUntilDate(blockPeriod);
      
      // Create new delivery record
      const newDelivery = {
        family_id: selectedFamily.id,
        family_name: selectedFamily.name,
        institution_id: currentInstitutionTyped.id,
        institution_name: currentInstitutionTyped.name,
        delivery_date: new Date().toISOString().split('T')[0],
        items: {
          baskets: data.basketCount,
          others: data.otherItems ? data.otherItems.split(',').map(item => item.trim()) : []
        }
      };
      
      // Create delivery
      await createDeliveryMutation.mutateAsync(newDelivery);
      
      // Update family status
      await updateFamilyMutation.mutateAsync({
        ...selectedFamily,
        status: "blocked",
        blocked_until: blockUntilDate
      });
      
      // Update institution inventory
      if (currentInstitutionTyped.inventory) {
        const updatedInventory = {
          ...currentInstitutionTyped.inventory,
          baskets: Math.max(0, currentInstitutionTyped.inventory.baskets - data.basketCount)
        };
        
        await updateInstitutionMutation.mutateAsync({
          ...currentInstitutionTyped,
          inventory: updatedInventory
        });
      }
      
      setIsDeliveryDialogOpen(false);
      
      toast({
        title: "Entrega realizada",
        description: `Cesta básica entregue para a família ${selectedFamily.name}`,
      });
    } catch (error) {
      toast({
        title: "Erro ao registrar entrega",
        description: "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  if (!user || !currentInstitutionTyped) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans flex flex-col">
      <Header username={user.name} />
      
      <main className="pt-20 pb-8 px-4 md:px-8 max-w-[1400px] mx-auto flex-grow">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Gerenciamento de Entregas</h2>
          
          {/* Institution Info Card */}
          <Card className="mb-6">
            <CardHeader className="bg-primary text-white">
              <CardTitle>Sua Instituição</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="font-semibold">{currentInstitutionTyped.name}</p>
              <p className="text-sm text-gray-600 mt-1">{currentInstitutionTyped.address}</p>
              <p className="text-sm text-gray-600">{currentInstitutionTyped.phone}</p>
              <div className="mt-2 flex items-center gap-2">
                <Badge className="bg-green-500">
                  <Package className="h-3 w-3 mr-1" />
                  Cestas Disponíveis: {currentInstitutionTyped.inventory.baskets}
                </Badge>
              </div>
            </CardContent>
          </Card>
          
          {/* Eligible Families Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Famílias Disponíveis</h3>
              <div className="flex items-center gap-3">
                <Select 
                  defaultValue="active" 
                  onValueChange={(value) => setFilterStatus(value)}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Famílias</SelectItem>
                    <SelectItem value="active">Famílias Ativas</SelectItem>
                    <SelectItem value="blocked">Famílias Bloqueadas</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Buscar família..."
                    className="pl-9 w-[200px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Membros</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Bloqueada até</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFamilies.length > 0 ? (
                      filteredFamilies.map((family: any) => (
                        <TableRow key={family.id}>
                          <TableCell className="font-medium">{family.name}</TableCell>
                          <TableCell>{family.phone}</TableCell>
                          <TableCell>{family.members}</TableCell>
                          <TableCell>
                            {family.status === "active" ? (
                              <Badge className="bg-green-500">Ativa</Badge>
                            ) : (
                              <Badge className="bg-red-500">Bloqueada</Badge>
                            )}
                          </TableCell>
                          <TableCell>{family.blocked_until || "-"}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {family.status === "active" ? (
                                <Button 
                                  size="sm" 
                                  onClick={() => handleDelivery(family)}
                                  disabled={currentInstitutionTyped.inventory.baskets === 0}
                                >
                                  <Package className="h-4 w-4 mr-1" /> Entregar Cesta
                                </Button>
                              ) : (
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  disabled
                                  title={`Bloqueada até ${family.blocked_until}`}
                                >
                                  Bloqueada
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                          Nenhuma família encontrada com os filtros selecionados.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
          
          {/* Recent Deliveries Section */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Entregas Recentes - {currentInstitutionTyped.name}</h3>
            
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Família</TableHead>
                      <TableHead>Data da Entrega</TableHead>
                      <TableHead>Cestas</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {institutionDeliveries.length > 0 ? (
                      institutionDeliveries.map((delivery: any) => {
                        const deliveryItems = delivery.items as { baskets: number; others?: string[] };
                        return (
                          <TableRow key={delivery.id}>
                            <TableCell className="font-medium">{delivery.family_name}</TableCell>
                            <TableCell>{new Date(delivery.delivery_date).toLocaleDateString('pt-BR')}</TableCell>
                            <TableCell>{deliveryItems.baskets}</TableCell>
                            <TableCell>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleViewDeliveryDetails(delivery)}
                              >
                                Detalhes
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-6 text-gray-500">
                          Nenhuma entrega registrada por esta instituição.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Delivery Dialog */}
      <Dialog open={isDeliveryDialogOpen} onOpenChange={setIsDeliveryDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Registrar Entrega de Cesta</DialogTitle>
          </DialogHeader>
          
          {selectedFamily && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="bg-gray-50 p-3 rounded-md mb-2">
                  <p className="font-semibold">Família: {selectedFamily.name}</p>
                  <p className="text-sm text-gray-600">Membros: {selectedFamily.members} pessoas</p>
                  <p className="text-sm text-gray-600">Telefone: {selectedFamily.phone}</p>
                </div>
                
                <FormField
                  control={form.control}
                  name="basketCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantidade de Cestas</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={currentInstitutionTyped.inventory.baskets || 1}
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="otherItems"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Outros Itens (separados por vírgula)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Leite (2L), Arroz (5kg), Feijão (1kg)"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="blockPeriod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Período de Bloqueio</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o período" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="15">15 dias</SelectItem>
                            <SelectItem value="30">30 dias</SelectItem>
                            <SelectItem value="45">45 dias</SelectItem>
                            <SelectItem value="60">60 dias</SelectItem>
                            <SelectItem value="90">90 dias</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    <Calendar className="h-4 w-4 inline-block mr-1" />
                    A família ficará bloqueada por {form.watch("blockPeriod")} dias após esta entrega.
                  </p>
                </div>
                
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsDeliveryDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-primary hover:bg-primary/90"
                    disabled={createDeliveryMutation.isPending}
                  >
                    <Check className="h-4 w-4 mr-1" /> 
                    {createDeliveryMutation.isPending ? "Processando..." : "Confirmar Entrega"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delivery Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detalhes da Entrega</DialogTitle>
          </DialogHeader>
          
          {selectedDelivery && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-500">Família</p>
                  <p>{selectedDelivery.family_name}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500">Data da Entrega</p>
                  <p>{new Date(selectedDelivery.delivery_date).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-semibold text-gray-500">Itens Entregues</p>
                <div className="bg-gray-50 p-3 rounded-md mt-2">
                  <p><strong>Cestas básicas:</strong> {selectedDelivery.items.baskets}</p>
                  
                  {selectedDelivery.items.others && selectedDelivery.items.others.length > 0 && (
                    <>
                      <p className="mt-2"><strong>Outros itens:</strong></p>
                      <ul className="list-disc pl-5 mt-1">
                        {selectedDelivery.items.others.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setIsDetailsDialogOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default DeliveryManagement;
