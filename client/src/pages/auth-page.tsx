import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/ui/logo";

const loginSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(6, { message: "Senha deve ter pelo menos 6 caracteres" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function AuthPage() {
  const { user, loginMutation } = useAuth();
  
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  
  const onLoginSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values);
  };
  
  // Redirect if user is already logged in
  if (user) {
    return <Redirect to="/" />;
  }
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-sky-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="pt-8 pb-2 flex flex-col items-center">
          <Logo size="lg" withText />
        </CardHeader>
        
        <CardContent className="pt-6 pb-8 px-8">
          <CardTitle className="text-center text-2xl mb-6">Login</CardTitle>
          <CardDescription className="text-center mb-8">
            Digite seu e-mail e senha para acessar o sistema ou registre-se
          </CardDescription>

          <Button 
            variant="outline"
            className="w-full mb-6"
            onClick={() => {
              const email = prompt("Digite seu email:");
              const username = prompt("Digite seu nome de usuário:"); 
              const password = prompt("Digite sua senha (mínimo 6 caracteres):");
              
              if (email && username && password) {
                registerMutation.mutate({ email, username, password });
              }
            }}
          >
            Registrar Nova Conta
          </Button>
          
          <Form {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
              <FormField
                control={loginForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input placeholder="Digite seu e-mail" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Digite sua senha" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full py-6 text-lg font-medium mt-6" 
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          </Form>
          
          <div className="mt-8 text-sm text-center text-muted-foreground">
            <p>O aplicativo é restrito a usuários autorizados.</p>
            <p>Por favor, entre em contato com o administrador se precisar de acesso.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
