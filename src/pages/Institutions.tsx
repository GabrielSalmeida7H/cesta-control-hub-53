import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Building, Edit, Info, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useInstitutions, useCreateInstitution, useUpdateInstitution } from "@/hooks/useApi";

// Interface for our institution data model
interface Institution {
  id: number;
  name: string;
  address: string; 
  phone: string;
  availableBaskets: number; // Changed from deliveries to availableBaskets
  color: string;
  inventory?: {
    baskets: number;
    milk: number;
    rice: number;
    beans: number;
    vegetables: number;
    peppers: number;
    others: string[];
  };
}

interface InstitutionFormData {
  name: string;
  address: string;
  phone: string;
  availableBaskets: number;
}

const Institutions = () => {
  const { user } = useAuth();
  const { data: institutions = [], isLoading } = useInstitutions();
  const createInstitutionMutation = useCreateInstitution();
  const updateInstitutionMutation = useUpdateInstitution();
  
  // Derive isAdmin from user type
  const isAdmin = user?.type === 'admin';
  
  // State for dialog controls
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isNewInstitutionDialogOpen, setIsNewInstitutionDialogOpen] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);

  // Setup form
  const form = useForm<InstitutionFormData>({
    defaultValues: {
      name: "",
      address: "",
      phone: "",
      availableBaskets: 0,
    }
  });

  const editForm = useForm<Institution>({
    defaultValues: {
      name: "",
      address: "",
      phone: "",
      availableBaskets: 0,
    }
  });

  // Function to handle opening the edit dialog
  const handleEdit = (institution: Institution) => {
    setSelectedInstitution(institution);
    editForm.reset({
      id: institution.id,
      name: institution.name,
      address: institution.address,
      phone: institution.phone,
      availableBaskets: institution.availableBaskets,
      color: institution.color
    });
    setIsEditDialogOpen(true);
  };

  // Function to save edited institution
  const onSubmitEdit = async (data: Institution) => {
    try {
      await updateInstitutionMutation.mutateAsync(data);
      setIsEditDialogOpen(false);
      toast({
        title: "Instituição atualizada!",
        description: "As alterações foram salvas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar instituição",
        description: "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Function to handle opening the details dialog
  const handleDetails = (institution: Institution) => {
    setSelectedInstitution(institution);
    setIsDetailsDialogOpen(true);
  };

  // Function to handle creating a new institution
  const handleCreateInstitution = async (data: InstitutionFormData) => {
    try {
      const newInstitution = {
        ...data,
        color: "bg-primary",
        inventory: {
          baskets: data.availableBaskets,
          milk: 0,
          rice: 0,
          beans: 0,
          vegetables: 0,
          peppers: 0,
          others: []
        }
      };

      await createInstitutionMutation.mutateAsync(newInstitution);
      
      toast({
        title: "Instituição criada com sucesso!",
        description: `A instituição ${data.name} foi cadastrada.`,
      });
      
      setIsNewInstitutionDialogOpen(false);
      form.reset();
    } catch (error) {
      toast({
        title: "Erro ao criar instituição",
        description: "Verifique os dados e tente novamente.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-lg">Carregando instituições...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans flex flex-col">
      {/* Header component with username */}
      <Header username={user?.name || ""} />
      
      <main className="pt-20 pb-8 px-4 md:px-8 max-w-[1400px] mx-auto flex-grow">
        <div className="mb-8">
          {/* Page title and add new institution button */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Instituições</h2>
            <Button 
              className="bg-primary hover:bg-primary/90"
              onClick={() => setIsNewInstitutionDialogOpen(true)}
            >
              <Building className="mr-2 h-4 w-4" /> Nova Instituição
            </Button>
          </div>
          
          {/* Grid layout for institution cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {institutions.map((institution) => (
              <Card key={institution.id} className="overflow-hidden">
                {/* Card header with institution name */}
                <CardHeader className={`${institution.color} text-white`}>
                  <CardTitle>{institution.name}</CardTitle>
                </CardHeader>
                {/* Card content with institution details */}
                <CardContent className="pt-4">
                  <p className="mb-2"><strong>Endereço:</strong> {institution.address}</p>
                  <p className="mb-2"><strong>Telefone:</strong> {institution.phone}</p>
                  <p className="mb-4"><strong>Cestas disponíveis:</strong> {institution.availableBaskets}</p>
                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleEdit(institution)}
                    >
                      <Edit className="mr-2 h-4 w-4" /> Editar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleDetails(institution)}
                    >
                      <Info className="mr-2 h-4 w-4" /> Detalhes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      {/* New Institution Dialog */}
      <Dialog open={isNewInstitutionDialogOpen} onOpenChange={setIsNewInstitutionDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Nova Instituição</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreateInstitution)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Instituição</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: Centro Comunitário" />
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
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="(00) 0000-0000" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="availableBaskets"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cestas Disponíveis</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        value={field.value}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
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
                  onClick={() => setIsNewInstitutionDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={createInstitutionMutation.isPending}
                >
                  {createInstitutionMutation.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Institution Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Instituição</DialogTitle>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onSubmitEdit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="availableBaskets"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cestas Disponíveis</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        value={field.value} 
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} 
                        disabled={!isAdmin} // Only admins can edit this field
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
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">Salvar Alterações</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Details Institution Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              Detalhes da Instituição: {selectedInstitution?.name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedInstitution && selectedInstitution.inventory && (
            <div className="py-4">
              <h3 className="text-lg font-medium mb-4">Inventário de Alimentos</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">Quantidade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Cestas Básicas</TableCell>
                    <TableCell className="text-right">{selectedInstitution.inventory.baskets}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Leite</TableCell>
                    <TableCell className="text-right">{selectedInstitution.inventory.milk} litros</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Arroz</TableCell>
                    <TableCell className="text-right">{selectedInstitution.inventory.rice} kg</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Feijão</TableCell>
                    <TableCell className="text-right">{selectedInstitution.inventory.beans} kg</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Hortaliças</TableCell>
                    <TableCell className="text-right">{selectedInstitution.inventory.vegetables} kg</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Pimentão</TableCell>
                    <TableCell className="text-right">{selectedInstitution.inventory.peppers} kg</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              
              <div className="mt-4">
                <h4 className="font-medium mb-2">Outros Itens:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedInstitution.inventory.others.map((item, index) => (
                    <span 
                      key={index} 
                      className="bg-slate-100 px-2 py-1 rounded-md text-sm"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              onClick={() => setIsDetailsDialogOpen(false)}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Institutions;
