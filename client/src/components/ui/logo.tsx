import React from "react";
import { cn } from "@/lib/utils";

interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
  withText?: boolean;
}

export function Logo({ 
  size = "md", 
  withText = false,
  className,
  ...props 
}: LogoProps) {
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-20 h-20",
    lg: "w-32 h-32"
  };

  return (
    <div className={cn("flex flex-col items-center", className)} {...props}>
      <div className={cn(
        "rounded-full bg-gradient-to-r from-blue-600 to-sky-400 flex items-center justify-center overflow-hidden shadow-lg",
        sizeClasses[size]
      )}>
        <div className="text-white font-bold text-center">
          {size === "sm" && (
            <span className="text-lg">SB</span>
          )}
          {size === "md" && (
            <span className="text-2xl">SB</span>
          )}
          {size === "lg" && (
            <span className="text-4xl">SB</span>
          )}
        </div>
      </div>
      
      {withText && (
        <div className="mt-2 text-center">
          <h2 className="font-bold text-gray-800 text-lg">Survey Banco</h2>
          <p className="text-xs text-gray-500">Levantamento de Agências</p>
        </div>
      )}
    </div>
  );
}