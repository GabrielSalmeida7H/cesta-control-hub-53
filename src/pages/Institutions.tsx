
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Building, Edit, Info, Plus, Package, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useInstitutions, useCreateInstitution, useUpdateInstitution, useUpdateInventory } from "@/hooks/useApi";

// Interface for our institution data model
interface Institution {
  id: number;
  name: string;
  address: string; 
  phone: string;
  availableBaskets: number;
  color: string;
  inventory?: {
    baskets: number;
    [key: string]: number;
  };
}

interface InstitutionFormData {
  name: string;
  address: string;
  phone: string;
  availableBaskets: number;
}

interface InventoryItem {
  name: string;
  quantity: number;
}

const Institutions = () => {
  const { user } = useAuth();
  const { data: institutions = [], isLoading } = useInstitutions();
  const createInstitutionMutation = useCreateInstitution();
  const updateInstitutionMutation = useUpdateInstitution();
  const updateInventoryMutation = useUpdateInventory();
  
  // Derive isAdmin from user type
  const isAdmin = user?.type === 'admin';
  
  // State for dialog controls
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isNewInstitutionDialogOpen, setIsNewInstitutionDialogOpen] = useState(false);
  const [isInventoryDialogOpen, setIsInventoryDialogOpen] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState(0);

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

  // Get user's institution or all institutions for admin
  const userInstitutions = isAdmin 
    ? institutions 
    : institutions.filter(inst => inst.id === user?.institution_id);

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

  // Function to handle opening inventory dialog
  const handleInventory = (institution: Institution) => {
    setSelectedInstitution(institution);
    setIsInventoryDialogOpen(true);
  };

  // Function to add new inventory item
  const handleAddInventoryItem = async () => {
    if (!selectedInstitution || !newItemName || newItemQuantity <= 0) return;
    
    try {
      const updatedInventory = {
        ...selectedInstitution.inventory,
        [newItemName.toLowerCase()]: (selectedInstitution.inventory?.[newItemName.toLowerCase()] || 0) + newItemQuantity
      };

      await updateInventoryMutation.mutateAsync({
        institutionId: selectedInstitution.id,
        inventory: updatedInventory
      });

      toast({
        title: "Item adicionado!",
        description: `${newItemQuantity} ${newItemName} adicionado(s) ao inventário.`,
      });

      setNewItemName("");
      setNewItemQuantity(0);
    } catch (error) {
      toast({
        title: "Erro ao adicionar item",
        description: "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Function to handle creating a new institution
  const handleCreateInstitution = async (data: InstitutionFormData) => {
    try {
      const newInstitution = {
        ...data,
        color: "bg-primary",
        inventory: {
          baskets: data.availableBaskets,
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
      <Header username={user?.name || ""} />
      
      <main className="pt-20 pb-8 px-4 md:px-8 max-w-[1400px] mx-auto flex-grow">
        <div className="mb-8">
          {/* Page title and add new institution button */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <h2 className="text-2xl font-bold text-gray-800">
              {isAdmin ? "Instituições" : "Minha Instituição"}
            </h2>
            {isAdmin && (
              <Button 
                className="bg-primary hover:bg-primary/90"
                onClick={() => setIsNewInstitutionDialogOpen(true)}
              >
                <Building className="mr-2 h-4 w-4" /> Nova Instituição
              </Button>
            )}
          </div>
          
          {/* Grid layout for institution cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userInstitutions.map((institution) => (
              <Card key={institution.id} className="overflow-hidden">
                <CardHeader className={`${institution.color} text-white`}>
                  <CardTitle>{institution.name}</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="mb-2"><strong>Endereço:</strong> {institution.address}</p>
                  <p className="mb-2"><strong>Telefone:</strong> {institution.phone}</p>
                  <p className="mb-4"><strong>Cestas disponíveis:</strong> {institution.availableBaskets}</p>
                  
                  {/* Inventory preview */}
                  {institution.inventory && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-md">
                      <h4 className="font-semibold mb-2">Inventário:</h4>
                      <div className="text-sm space-y-1">
                        {Object.entries(institution.inventory).slice(0, 3).map(([item, quantity]) => (
                          <div key={item} className="flex justify-between">
                            <span className="capitalize">{item}:</span>
                            <span>{String(quantity)}</span>
                          </div>
                        ))}
                        {Object.keys(institution.inventory).length > 3 && (
                          <div className="text-gray-500">+ {Object.keys(institution.inventory).length - 3} mais...</div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Action buttons */}
                  <div className="flex gap-2 flex-wrap">
                    {isAdmin && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleEdit(institution)}
                      >
                        <Edit className="mr-2 h-4 w-4" /> Editar
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleDetails(institution)}
                    >
                      <Info className="mr-2 h-4 w-4" /> Detalhes
                    </Button>
                    {!isAdmin && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full mt-2"
                        onClick={() => handleInventory(institution)}
                      >
                        <Package className="mr-2 h-4 w-4" /> Gerenciar Estoque
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      {/* New Institution Dialog - Admin only */}
      {isAdmin && (
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
      )}

      {/* Edit Institution Dialog - Admin only */}
      {isAdmin && (
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
                          disabled={isAdmin} // Only normal users can edit this field
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
      )}

      {/* Inventory Management Dialog - Normal users only */}
      <Dialog open={isInventoryDialogOpen} onOpenChange={setIsInventoryDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Gerenciar Estoque - {selectedInstitution?.name}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Current inventory */}
            <div>
              <h3 className="text-lg font-medium mb-4">Estoque Atual</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">Quantidade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedInstitution?.inventory && Object.entries(selectedInstitution.inventory).map(([item, quantity]) => (
                    <TableRow key={item}>
                      <TableCell className="capitalize">{item}</TableCell>
                      <TableCell className="text-right">{String(quantity)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {/* Add new item */}
            <div>
              <h3 className="text-lg font-medium mb-4">Adicionar Item</h3>
              <div className="flex gap-3">
                <Input
                  placeholder="Nome do item (ex: leite, carne, etc)"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="flex-1"
                />
                <Input
                  type="number"
                  placeholder="Quantidade"
                  value={newItemQuantity}
                  onChange={(e) => setNewItemQuantity(parseInt(e.target.value) || 0)}
                  className="w-32"
                  min={1}
                />
                <Button onClick={handleAddInventoryItem}>
                  <Plus className="h-4 w-4 mr-2" /> Adicionar
                </Button>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setIsInventoryDialogOpen(false)}>Fechar</Button>
          </DialogFooter>
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
              <h3 className="text-lg font-medium mb-4">Inventário Completo</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">Quantidade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(selectedInstitution.inventory).map(([item, quantity]) => (
                    <TableRow key={item}>
                      <TableCell className="capitalize">{item}</TableCell>
                      <TableCell className="text-right">{String(quantity)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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

export default Institutions;
