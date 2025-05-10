import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Camera, Sun, Moon, User, MessageCircle, ArrowLeft } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/use-theme";

export default function AccountPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  
  // Estado que reflete o tema atual
  const [isDarkMode, setIsDarkMode] = useState(theme === "dark");
  
  // Atualiza o estado local quando o tema mudar
  useEffect(() => {
    setIsDarkMode(theme === "dark");
  }, [theme]);
  
  // Estado para diálogo de suporte
  const [supportDialogOpen, setSupportDialogOpen] = useState(false);
  
  const handleToggleDarkMode = () => {
    toggleTheme();
    toast({
      title: `Modo ${isDarkMode ? "claro" : "escuro"} ativado`,
      description: "A configuração foi salva.",
    });
  };
  
  const contactSupport = () => {
    setSupportDialogOpen(false);
    toast({
      title: "Mensagem enviada",
      description: "Nossa equipe entrará em contato em breve.",
    });
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="p-4 flex justify-between items-center shadow-sm bg-card">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation("/")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">Minha Conta</h1>
        <div className="w-8"></div> {/* Espaçador para centralizar o título */}
      </header>
      
      {/* Main Content */}
      <main className="flex-1 p-6 max-w-md mx-auto w-full">
        {/* Perfil */}
        <div className="bg-card rounded-xl shadow-md p-6 mb-6 text-card-foreground">
          <div className="flex items-center space-x-4 mb-6">
            <Avatar className="h-16 w-16 border-2 border-blue-100">
              <AvatarImage src="" alt={user?.username || ""} />
              <AvatarFallback className="bg-blue-600 text-white text-xl">
                {user?.username?.substring(0, 2).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold">{user?.username}</h2>
              <p className="text-gray-500">{user?.email}</p>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center gap-2">
            <Camera className="h-4 w-4" />
            <span>Alterar foto</span>
          </Button>
        </div>
        
        {/* Configurações */}
        <div className="bg-card rounded-xl shadow-md p-6 mb-6 text-card-foreground">
          <h3 className="font-semibold text-lg mb-4">Configurações</h3>
          
          <div className="space-y-4">
            {/* Modo escuro */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {isDarkMode ? (
                  <Moon className="h-5 w-5 text-blue-600" />
                ) : (
                  <Sun className="h-5 w-5 text-amber-500" />
                )}
                <Label htmlFor="dark-mode" className="font-medium">
                  Modo escuro
                </Label>
              </div>
              <Switch 
                id="dark-mode" 
                checked={isDarkMode} 
                onCheckedChange={handleToggleDarkMode} 
              />
            </div>
            
            <Separator />
            
            {/* Suporte */}
            <div 
              className="flex items-center justify-between cursor-pointer py-2"
              onClick={() => setSupportDialogOpen(true)}
            >
              <div className="flex items-center space-x-2">
                <MessageCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium">Falar com suporte</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Informações do app */}
        <div className="text-center text-gray-500 text-sm mt-8">
          <p>MAFFENG v1.0.0</p>
          <p className="mt-1">© 2023-2024 MAFFENG</p>
        </div>
      </main>
      
      {/* Diálogo de suporte */}
      <Dialog open={supportDialogOpen} onOpenChange={setSupportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Falar com suporte</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <textarea 
              className="w-full p-3 border rounded-md h-32"
              placeholder="Descreva sua dúvida ou problema..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSupportDialogOpen(false)}>Cancelar</Button>
            <Button onClick={contactSupport}>Enviar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
