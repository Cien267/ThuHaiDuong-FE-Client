import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        sky: "bg-sky-500 text-white hover:bg-sky-600 shadow-[0_1px_2px_rgba(14,165,233,0.4)] active:scale-95",
        soft: "bg-primary/10 text-primary hover:bg-primary/20 border-transparent",
        glass:
          "bg-white/10 backdrop-blur-md border border-white/20 text-foreground hover:bg-white/20 shadow-sm",
        shiny:
          "bg-gradient-to-b from-primary to-primary/80 text-primary-foreground border-b-2 border-primary/50 shadow-inner hover:brightness-110 active:border-b-0 active:translate-y-[1px]",
        brutal:
          "border-2 border-foreground bg-background shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:translate-x-[4px] active:translate-y-[4px]",
        warn: "bg-amber-500 text-white hover:bg-amber-600 shadow-[0_1px_2px_rgba(245,158,11,0.4)] active:scale-95",
        green:
          "bg-emerald-500 text-white hover:bg-emerald-600 shadow-[0_1px_2px_rgba(16,185,129,0.4)] active:scale-95",
        greenSoft: "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-transparent",
        greenShiny:
          "bg-gradient-to-b from-emerald-500 to-emerald-600 text-white border-b-2 border-emerald-500 shadow-inner hover:brightness-110 active:border-b-0 active:translate-y-[1px]",
        greenGlass:
          "bg-emerald-500/10 backdrop-blur-md border border-emerald-400/30 text-emerald-600 hover:bg-emerald-500/20 shadow-sm",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
