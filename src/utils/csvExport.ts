
export const exportToCSV = (data: any[], filename: string) => {
  if (data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Get headers from the first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    headers.join(','), // Header row
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle values that might contain commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      }).join(',')
    )
  ].join('\n');

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// Format data for families export
export const formatFamiliesForCSV = (families: any[]) => {
  return families.map(family => ({
    'ID': family.id,
    'Nome': family.name,
    'Endereço': family.address,
    'Telefone': family.phone,
    'Membros': family.members,
    'Renda': `R$ ${family.income?.toFixed(2) || '0,00'}`,
    'Status': family.status === 'active' ? 'Ativa' : 'Bloqueada',
    'Bloqueada até': family.blocked_until || 'N/A',
    'Criado em': new Date(family.created_at).toLocaleDateString('pt-BR')
  }));
};

// Format data for institutions export
export const formatInstitutionsForCSV = (institutions: any[]) => {
  return institutions.map(institution => ({
    'ID': institution.id,
    'Nome': institution.name,
    'Endereço': institution.address,
    'Telefone': institution.phone,
    'Cestas Disponíveis': institution.inventory?.baskets || 0,
    'Criado em': new Date(institution.created_at).toLocaleDateString('pt-BR')
  }));
};

// Format data for deliveries export
export const formatDeliveriesForCSV = (deliveries: any[]) => {
  return deliveries.map(delivery => ({
    'ID': delivery.id,
    'Família': delivery.family_name,
    'Instituição': delivery.institution_name,
    'Data da Entrega': new Date(delivery.delivery_date).toLocaleDateString('pt-BR'),
    'Cestas Entregues': delivery.items?.baskets || 1,
    'Criado em': new Date(delivery.created_at).toLocaleDateString('pt-BR')
  }));
};
