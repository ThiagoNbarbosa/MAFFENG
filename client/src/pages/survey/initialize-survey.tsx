import { useState } from "react";
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

const surveyFormSchema = z.object({
  agencyName: z.string().min(1, { message: "Nome da agência é obrigatório" }),
  prefix: z.string().min(1, { message: "Prefixo é obrigatório" }),
  managerName: z.string().min(1, { message: "Nome do gerente é obrigatório" }),
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
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white py-4 px-6 shadow-sm">
        <div className="flex justify-between items-center">
          <Button variant="ghost" size="icon" onClick={navigateBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold text-secondary">Iniciar Levantamento</h1>
          <div className="w-8"></div> {/* Spacer */}
        </div>
      </header>
      
      {/* Form */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-md mx-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              
              <FormField
                control={form.control}
                name="managerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Gerente</FormLabel>
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
            </form>
          </Form>
        </div>
      </div>
      
      {/* Footer with Button */}
      <div className="p-6 bg-white shadow-inner">
        <Button 
          className="w-full py-6"
          onClick={form.handleSubmit(onSubmit)}
          disabled={!form.formState.isValid || createSurveyMutation.isPending}
        >
          {createSurveyMutation.isPending ? "Salvando..." : "Continuar"}
        </Button>
      </div>
    </div>
  );
}
