import { useState } from "react";
import { Search, Wrench } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Lista de serviços/itens padrão
const DEFAULT_SERVICE_ITEMS = [
  "17.11 - PINTURA ACRILICA (COLORIDA)",
  "17.8 - PINTURA DE PISO",
  "19.37 - SUBSTITUIÇÃO DE LÂMPADAS"
];

interface ServiceItemSearchProps {
  onSelect: (item: string) => void;
  onCancel: () => void;
}

export function ServiceItemSearch({ onSelect, onCancel }: ServiceItemSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedServiceItem, setSelectedServiceItem] = useState<string | null>(null);
  
  // Filtra os itens baseado na pesquisa
  const filteredItems = DEFAULT_SERVICE_ITEMS.filter(item => 
    item.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleSelect = (item: string) => {
    setSelectedServiceItem(item);
  };
  
  const handleConfirm = () => {
    if (selectedServiceItem) {
      onSelect(selectedServiceItem);
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-sky-100">
      <div className="flex-1 px-6 py-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">Serviços/Itens</h1>
          <p className="text-center text-muted-foreground mb-6">
            Selecione o serviço ou item que deseja fotografar
          </p>
          
          {/* Search bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar serviço ou item..."
              className="pl-10 bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Items list */}
          <div className="space-y-2 mb-6">
            {filteredItems.length > 0 ? (
              filteredItems.map((item, index) => (
                <Card 
                  key={index}
                  className={`p-4 cursor-pointer hover:bg-secondary/5 transition-colors
                    ${selectedServiceItem === item ? 'bg-secondary/10 border-secondary' : ''}`}
                  onClick={() => handleSelect(item)}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                      <Wrench size={16} />
                    </div>
                    <span className="text-sm">{item}</span>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-10 bg-white rounded-lg">
                <Wrench className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <p className="text-gray-500">Nenhum item encontrado com "{searchQuery}"</p>
              </div>
            )}
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={onCancel}
            >
              Cancelar
            </Button>
            <Button 
              className="flex-1"
              disabled={!selectedServiceItem}
              onClick={handleConfirm}
            >
              Confirmar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}