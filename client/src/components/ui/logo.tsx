import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
        <span className="text-primary-foreground font-bold text-sm">M</span>
      </div>
      <div className="flex flex-col">
        <span className="text-lg font-bold text-foreground">MAFFENG</span>
        <span className="text-xs text-muted-foreground">Levantamento Preventivo</span>
      </div>
    </div>
  );
}