import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Survey } from "@shared/schema";
import { useLocation } from "wouter";
import { Folder, Plus, LogOut, User } from "lucide-react";
import { Logo } from "@/components/ui/logo";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();
  
  const { data: surveys } = useQuery<Survey[]>({
    queryKey: ["/api/surveys"],
  });
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const navigateToSurveys = () => {
    setLocation("/surveys");
  };
  
  const navigateToNewSurvey = () => {
    setLocation("/surveys/new");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-sky-100">
      {/* Header */}
      <header className="p-4 flex justify-end gap-4">
        <button 
          onClick={() => setLocation("/account")} 
          className="text-gray-600 hover:text-blue-500 transition-colors"
        >
          <User className="h-6 w-6" />
        </button>
        <button 
          onClick={handleLogout} 
          disabled={logoutMutation.isPending}
          className="text-gray-600 hover:text-red-500 transition-colors"
        >
          <LogOut className="h-6 w-6" />
        </button>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-between p-6">
        {/* Top section with logo and welcome */}
        <div className="flex-1 flex flex-col items-center justify-center w-full">
          <Logo size="lg" withText />
          
          <div className="text-center mt-8 mb-6">
            <h2 className="text-2xl font-bold text-blue-800 drop-shadow-sm">
              Bem-vindo(a), {user?.username}
            </h2>
            <p className="text-gray-700 mt-2 font-medium">
              Selecione uma opção abaixo
            </p>
          </div>
        </div>
        
        {/* Bottom section with two option boxes */}
        <div className="w-full max-w-md grid grid-cols-1 gap-4 mb-8">
          {/* Meus Levantamentos */}
          <div 
            onClick={navigateToSurveys} 
            className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center cursor-pointer hover:shadow-xl transition-shadow h-48 justify-center"
          >
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-4">
              <Folder className="h-8 w-8" />
            </div>
            <h3 className="font-bold text-gray-800">Meus Levantamentos</h3>
            <p className="text-sm text-gray-500 mt-1">
              {surveys?.length || 0} levantamento(s)
            </p>
          </div>
          
          {/* Novo Levantamento */}
          <div 
            onClick={navigateToNewSurvey}
            className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center cursor-pointer hover:shadow-xl transition-shadow h-48 justify-center"
          >
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-4">
              <Plus className="h-8 w-8" />
            </div>
            <h3 className="font-bold text-gray-800">Novo Levantamento</h3>
            <p className="text-sm text-gray-500 mt-1">
              Iniciar um novo levantamento
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
