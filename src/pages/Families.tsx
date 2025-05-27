
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Users, UserPlus, Search, Lock, Unlock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useFamilies, useCreateFamily, useUpdateFamily } from "@/hooks/useApi";

// Updated interface for families matching Supabase schema
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

interface FamilyFormData {
  name: string;
  address: string;
  phone: string;
  members: number;
  income: number;
}

const Families = () => {
  const { user } = useAuth();
  const { data: families = [], isLoading, refetch } = useFamilies();
  const createFamilyMutation = useCreateFamily();
  const updateFamilyMutation = useUpdateFamily();

  // Dialog states
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isUnblockDialogOpen, setIsUnblockDialogOpen] = useState(false);
  const [isNewFamilyDialogOpen, setIsNewFamilyDialogOpen] = useState(false);

  const form = useForm<FamilyFormData>({
    defaultValues: {
      name: "",
      address: "",
      phone: "",
      members: 1,
      income: 0,
    }
  });

  // Function to create a new family
  const handleCreateFamily = async (data: FamilyFormData) => {
    try {
      const newFamily = {
        ...data,
        status: "active",
      };

      await createFamilyMutation.mutateAsync(newFamily);
      
      toast({
        title: "Família criada com sucesso!",
        description: `A família ${data.name} foi cadastrada.`,
      });
      
      setIsNewFamilyDialogOpen(false);
      form.reset();
    } catch (error) {
      toast({
        title: "Erro ao criar família",
        description: "Verifique os dados e tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Function to unblock a family
  const handleUnblock = (family: Family) => {
    if (user?.type !== 'admin') return;
    
    setSelectedFamily(family);
    setIsUnblockDialogOpen(true);
  };

  // Function to confirm family unblock
  const confirmUnblock = async () => {
    if (!selectedFamily) return;
    
    try {
      const updatedFamily = {
        ...selectedFamily,
        status: "active",
        blocked_until: null
      };

      await updateFamilyMutation.mutateAsync(updatedFamily);
      
      setIsUnblockDialogOpen(false);
      toast({
        title: "Família desbloqueada",
        description: `A família ${selectedFamily.name} foi desbloqueada com sucesso.`
      });
    } catch (error) {
      toast({
        title: "Erro ao desbloquear família",
        description: "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Function to view family details
  const handleViewDetails = (family: Family) => {
    setSelectedFamily(family);
    setIsDetailsOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-lg">Carregando famílias...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans flex flex-col">
      <Header username={user?.name || ""} />
      
      <main className="pt-20 pb-8 px-4 md:px-8 max-w-[1400px] mx-auto flex-grow">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Famílias Cadastradas</h2>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Buscar família..."
                  className="pl-9 w-full sm:w-64"
                />
              </div>
              <Button 
                className="bg-primary hover:bg-primary/90"
                onClick={() => setIsNewFamilyDialogOpen(true)}
              >
                <UserPlus className="mr-2 h-4 w-4" /> Nova Família
              </Button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Endereço</TableHead>
                    <TableHead>Pessoas</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Bloqueada até</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {families.map((family: any) => (
                    <TableRow key={family.id}>
                      <TableCell className="font-medium">{family.name}</TableCell>
                      <TableCell>{family.phone}</TableCell>
                      <TableCell>{family.address}</TableCell>
                      <TableCell>{family.members}</TableCell>
                      <TableCell>
                        {family.status === "active" ? (
                          <Badge className="bg-green-500">Ativa</Badge>
                        ) : (
                          <Badge className="bg-red-500">
                            <Lock className="h-3 w-3 mr-1" /> 
                            Bloqueada
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{family.blocked_until || "-"}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Editar</Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewDetails(family)}
                          >
                            Detalhes
                          </Button>
                          {user?.type === 'admin' && family.status === "blocked" && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleUnblock(family)}
                              className="border-red-500 text-red-500 hover:bg-red-50"
                            >
                              <Unlock className="h-3 w-3 mr-1" /> Desbloquear
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </main>
      
      {/* New Family Dialog */}
      <Dialog open={isNewFamilyDialogOpen} onOpenChange={setIsNewFamilyDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Família</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreateFamily)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Família</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: Família Silva" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="(34) 99999-9999" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Rua, número - Bairro" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="members"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Membros</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        value={field.value}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        min="1"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="income"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Renda Familiar (R$)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        {...field} 
                        value={field.value}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        min="0"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsNewFamilyDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={createFamilyMutation.isPending}
                >
                  {createFamilyMutation.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Family Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detalhes da Família</DialogTitle>
          </DialogHeader>
          
          {selectedFamily && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-500">Nome</p>
                  <p>{selectedFamily.name}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500">Telefone</p>
                  <p>{selectedFamily.phone}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-semibold text-gray-500">Endereço</p>
                <p>{selectedFamily.address}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-500">Membros</p>
                  <p>{selectedFamily.members} pessoas</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500">Renda</p>
                  <p>R$ {selectedFamily.income.toFixed(2)}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-semibold text-gray-500">Status</p>
                <div className="mt-1">
                  {selectedFamily.status === "active" ? (
                    <Badge className="bg-green-500">Ativa</Badge>
                  ) : (
                    <Badge className="bg-red-500">Bloqueada</Badge>
                  )}
                </div>
              </div>
              
              {selectedFamily.status === "blocked" && selectedFamily.blocked_until && (
                <div>
                  <p className="text-sm font-semibold text-gray-500">Bloqueada até</p>
                  <p>{new Date(selectedFamily.blocked_until).toLocaleDateString('pt-BR')}</p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setIsDetailsOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Unblock Confirmation Dialog */}
      <Dialog open={isUnblockDialogOpen} onOpenChange={setIsUnblockDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Confirmar Desbloqueio</DialogTitle>
          </DialogHeader>
          
          {selectedFamily && (
            <div className="py-4">
              <p>
                Tem certeza que deseja desbloquear a família <strong>{selectedFamily.name}</strong>?
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Esta ação permitirá que a família receba cestas básicas novamente.
              </p>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsUnblockDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              className="bg-red-500 hover:bg-red-600" 
              onClick={confirmUnblock}
            >
              Desbloquear
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Families;
