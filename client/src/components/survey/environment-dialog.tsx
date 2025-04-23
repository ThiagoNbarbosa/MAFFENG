import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const environmentSchema = z.object({
  name: z.string().min(1, { message: "Nome do ambiente é obrigatório" }),
});

type EnvironmentFormValues = z.infer<typeof environmentSchema>;

type EnvironmentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (name: string) => void;
  isPending: boolean;
};

export function EnvironmentDialog({
  open,
  onOpenChange,
  onAdd,
  isPending
}: EnvironmentDialogProps) {
  const form = useForm<EnvironmentFormValues>({
    resolver: zodResolver(environmentSchema),
    defaultValues: {
      name: "",
    },
  });
  
  const onSubmit = (data: EnvironmentFormValues) => {
    onAdd(data.name);
    form.reset();
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Ambiente</DialogTitle>
          <DialogDescription>
            Informe o nome do ambiente que deseja adicionar ao levantamento.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Ambiente</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Recepção, Copa, Sala de Reunião"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="sm:justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Adicionando..." : "Adicionar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
