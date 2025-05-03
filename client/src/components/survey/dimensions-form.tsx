import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Ruler, Calculator } from "lucide-react";

interface DimensionsFormProps {
  onConfirm: (width: string, height: string, area: string) => void;
  onCancel: () => void;
}

export function DimensionsForm({ onConfirm, onCancel }: DimensionsFormProps) {
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [calculatedArea, setCalculatedArea] = useState<string | null>(null);
  
  // Função para calcular a área automaticamente
  const calculateArea = (w: string, h: string): string => {
    if (w && h) {
      const numWidth = parseFloat(w.replace(',', '.'));
      const numHeight = parseFloat(h.replace(',', '.'));
      
      if (!isNaN(numWidth) && !isNaN(numHeight)) {
        return (numWidth * numHeight).toFixed(2).replace('.', ',');
      }
    }
    return "0";
  };
  
  // Atualiza a área sempre que a largura ou altura mudar
  useEffect(() => {
    if (width && height) {
      const area = calculateArea(width, height);
      setCalculatedArea(area);
    } else {
      setCalculatedArea(null);
    }
  }, [width, height]);
  
  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWidth(e.target.value);
  };
  
  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHeight(e.target.value);
  };
  
  const handleConfirm = () => {
    const area = calculatedArea || "0";
    onConfirm(width, height, area);
  };
  
  const isValid = width.trim() !== "" && height.trim() !== "";
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-sky-100">
      <div className="flex-1 px-6 py-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">Informações da Pintura</h1>
          <p className="text-center text-muted-foreground mb-6">
            Informe as dimensões para cálculo da área de pintura
          </p>
          
          <div className="bg-white p-6 rounded-xl shadow-md mb-6">
            <div className="flex flex-col space-y-4">
              <div>
                <label htmlFor="width" className="block text-sm font-medium text-gray-700 mb-1">
                  Largura (m)
                </label>
                <div className="relative">
                  <Input
                    id="width"
                    type="text"
                    inputMode="decimal"
                    placeholder="Ex: 3,5"
                    value={width}
                    onChange={handleWidthChange}
                    className="pl-10"
                  />
                  <Ruler className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>
              
              <div>
                <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">
                  Altura (m)
                </label>
                <div className="relative">
                  <Input
                    id="height"
                    type="text"
                    inputMode="decimal"
                    placeholder="Ex: 2,8"
                    value={height}
                    onChange={handleHeightChange}
                    className="pl-10"
                  />
                  <Ruler className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>
              
              {calculatedArea && (
                <div className="bg-green-50 p-4 rounded-lg mt-2">
                  <p className="text-center font-medium text-green-800">
                    Área: {calculatedArea} m²
                  </p>
                </div>
              )}
            </div>
          </div>
          
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
              disabled={!isValid}
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