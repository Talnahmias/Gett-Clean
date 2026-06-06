import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-semibold transition-all active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" && "bg-gett-green text-white hover:bg-gett-green-dark shadow-sm",
        variant === "secondary" && "bg-gett-yellow text-gett-black hover:brightness-95 shadow-sm",
        variant === "outline" &&
          "border-2 border-gett-green text-gett-green hover:bg-gett-green/5",
        variant === "ghost" && "text-gett-black hover:bg-black/5",
        size === "sm" && "px-3 py-2 text-sm",
        size === "md" && "px-5 py-3 text-base",
        size === "lg" && "px-6 py-4 text-lg w-full",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
