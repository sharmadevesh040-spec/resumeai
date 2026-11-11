import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 hover:shadow active:bg-indigo-800",
        tactile:
          "bg-indigo-600 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_2px_4px_rgba(79,70,229,0.3),0_6px_14px_rgba(79,70,229,0.25)] hover:bg-indigo-500 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_4px_8px_rgba(79,70,229,0.35),0_10px_20px_rgba(79,70,229,0.3)] active:translate-y-[1.5px] active:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_1px_2px_rgba(79,70,229,0.4)] border border-indigo-400/30",
        tactileSilver:
          "bg-gradient-to-b from-[#fbfbfb] via-[#e5e5e5] to-[#c0c0c0] text-slate-900 font-semibold shadow-[inset_0_1px_0_#ffffff,inset_0_-1px_0_rgba(0,0,0,0.35),0_0_0_1px_rgba(0,0,0,0.12),0_2px_4px_rgba(0,0,0,0.1),0_8px_20px_rgba(0,0,0,0.08)] hover:from-[#ffffff] hover:via-[#ececec] hover:to-[#c8c8c8] active:translate-y-[1.5px] active:shadow-[inset_0_1px_0_#ffffff,0_1px_2px_rgba(0,0,0,0.2)] border border-white/70",
        tactileDark:
          "bg-gradient-to-b from-[#242429] via-[#16161a] to-[#0d0d10] text-white font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.2),inset_0_-1px_0_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.08),0_2px_4px_rgba(0,0,0,0.4),0_8px_20px_rgba(0,0,0,0.3)] hover:from-[#2c2c33] hover:via-[#1c1c22] hover:to-[#121216] active:translate-y-[1.5px] active:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_1px_2px_rgba(0,0,0,0.5)] border border-white/10",
        destructive:
          "bg-red-500 text-white shadow-sm hover:bg-red-600 active:bg-red-700",
        outline:
          "border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200",
        secondary:
          "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700",
        ghost:
          "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white",
        link: "text-indigo-600 dark:text-indigo-400 underline-offset-4 hover:underline",
        subtle:
          "bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200/50 dark:border-indigo-800/60",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 rounded-xl px-6 text-base font-semibold",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
