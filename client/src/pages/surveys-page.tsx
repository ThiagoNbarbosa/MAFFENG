import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Survey } from "@shared/schema";
import { ArrowLeft, MapPin, Calendar, FileText, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function SurveysPage() {
  const [, setLocation] = useLocation();
  
  const { data: surveys, isLoading } = useQuery<Survey[]>({
    queryKey: ["/api/surveys"],
  });
  
  const navigateBack = () => {
    setLocation("/");
  };
  
  const navigateToSurvey = (surveyId: number) => {
    setLocation(`/surveys/${surveyId}/environments`);
  };
  
  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-sky-100">
      {/* Header */}
      <header className="p-4 flex justify-between items-center">
        <Button variant="ghost" size="icon" onClick={navigateBack} className="rounded-full h-10 w-10">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Logo size="sm" />
        <div className="w-10"></div> {/* Spacer to balance the header */}
      </header>
      
      {/* Title */}
      <div className="pt-2 pb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-800">Meus Levantamentos</h1>
        <p className="text-muted-foreground mt-1">
          {surveys?.length || 0} levantamento(s) encontrado(s)
        </p>
      </div>
      
      {/* Survey List */}
      <div className="flex-1 px-6 pb-6 overflow-y-auto">
        <div className="max-w-md mx-auto space-y-4">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Carregando levantamentos...</p>
            </div>
          ) : surveys && surveys.length > 0 ? (
            surveys.map((survey) => (
              <div 
                key={survey.id}
                className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigateToSurvey(survey.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-800">{survey.agencyName}</h3>
                    <p className="text-sm text-gray-500">Prefixo: {survey.prefix}</p>
                    
                    <div className="mt-3 flex items-center text-xs text-gray-500">
                      <Calendar className="h-3.5 w-3.5 mr-1.5" />
                      <span>{formatDate(survey.createdAt)}</span>
                    </div>
                    
                    <div className="mt-1.5 flex items-center text-xs text-gray-500">
                      <FileText className="h-3.5 w-3.5 mr-1.5" />
                      <span>{survey.managerName || "Sem responsável"}</span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white p-8 rounded-xl shadow-md text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-4">
                <FileText className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">Nenhum levantamento encontrado</h3>
              <p className="text-sm text-gray-500 mt-2 mb-6">
                Clique no botão abaixo para criar seu primeiro levantamento
              </p>
              <Button 
                className="w-full py-6"
                onClick={() => setLocation("/surveys/new")}
              >
                Novo Levantamento
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}