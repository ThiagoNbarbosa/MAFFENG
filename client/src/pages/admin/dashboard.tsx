
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Survey, User } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, Users, FileText } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { useLocation } from "wouter";

export default function AdminDashboard() {
  const { user, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();

  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const { data: surveys } = useQuery<Survey[]>({
    queryKey: ["/api/admin/surveys"],
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-sky-100">
      <header className="p-4 flex justify-between items-center">
        <Logo size="sm" />
        <button 
          onClick={handleLogout}
          className="text-gray-600 hover:text-red-500 transition-colors"
        >
          <LogOut className="h-6 w-6" />
        </button>
      </header>

      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Painel Administrativo</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Usuários
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{users?.length || 0}</p>
              <Button 
                className="mt-4 w-full"
                onClick={() => setLocation("/admin/users")}
              >
                Gerenciar Usuários
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Levantamentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{surveys?.length || 0}</p>
              <Button 
                className="mt-4 w-full"
                onClick={() => setLocation("/admin/surveys")}
              >
                Ver Levantamentos
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
