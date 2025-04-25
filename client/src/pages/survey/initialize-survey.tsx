import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Survey } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/ui/logo";

const surveyFormSchema = z.object({
  agencyName: z.string().min(1, { message: "Nome da agência é obrigatório" }),
  prefix: z.string().min(1, { message: "Prefixo é obrigatório" }),
  // Mantendo os campos no esquema para compatibilidade, mas com valores padrão
  street: z.string().default(""),
  number: z.string().default(""),
  neighborhood: z.string().default(""),
  city: z.string().default(""),
  state: z.string().default(""),
  cep: z.string().default(""),
  managerName: z.string().min(1, { message: "Nome do responsável é obrigatório" }),
  registration: z.string().min(1, { message: "Matrícula é obrigatória" }),
});

type SurveyFormValues = z.infer<typeof surveyFormSchema>;

export default function InitializeSurvey() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  
  const form = useForm<SurveyFormValues>({
    resolver: zodResolver(surveyFormSchema),
    defaultValues: {
      agencyName: "",
      prefix: "",
      street: "N/A",
      number: "N/A",
      neighborhood: "N/A",
      city: "N/A",
      state: "N/A",
      cep: "N/A",
      managerName: "",
      registration: "",
    },
  });
  
  const createSurveyMutation = useMutation({
    mutationFn: async (data: SurveyFormValues) => {
      const res = await apiRequest("POST", "/api/surveys", data);
      return res.json() as Promise<Survey>;
    },
    onSuccess: (survey) => {
      toast({
        title: "Levantamento criado",
        description: "Agora vamos adicionar os ambientes",
      });
      setLocation(`/surveys/${survey.id}/environments`);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar levantamento",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  function onSubmit(data: SurveyFormValues) {
    createSurveyMutation.mutate(data);
  }
  
  const navigateBack = () => {
    setLocation("/");
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
        <h1 className="text-2xl font-bold text-gray-800">Novo Levantamento</h1>
        <p className="text-muted-foreground mt-1">Preencha as informações da agência</p>
      </div>
      
      {/* Form */}
      <div className="flex-1 px-6 pb-6 overflow-y-auto">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-5 border-b border-gray-200 pb-5">
                <h2 className="font-bold text-lg text-primary">Informações Gerais</h2>
                
                <FormField
                  control={form.control}
                  name="agencyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Agência</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite o nome da agência" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="prefix"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prefixo</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite o prefixo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* A seção de endereço foi removida conforme solicitado */}
              
              <div className="space-y-5">
                <h2 className="font-bold text-lg text-primary">Responsável pelo Levantamento</h2>
                
                <FormField
                  control={form.control}
                  name="managerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Responsável</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite o nome do gerente" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="registration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Matrícula</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite a matrícula" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <Button 
                type="submit"
                className="w-full py-6 text-lg font-medium mt-6"
                disabled={createSurveyMutation.isPending}
              >
                {createSurveyMutation.isPending ? "Salvando..." : "Continuar"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
