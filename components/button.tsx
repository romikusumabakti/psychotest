import { ButtonHTMLAttributes } from "react";

type ButtonVariant = "filled" | "tonal";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  variant?: ButtonVariant;
}

const styles: Record<ButtonVariant, string> = {
  filled:
    "bg-primary text-on-primary from-on-primary/[.08] to-on-primary/[.08]",
  tonal:
    "bg-secondary-container text-on-secondary-container from-on-secondary-container/[.08] to-on-secondary-container/[.08]",
};

export default function Button({
  className,
  variant = "filled",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`flex items-center justify-center h-10 gap-2 px-6 text-sm font-medium rounded-full shrink-0 hover:bg-gradient-to-r ${styles[variant]} ${className}`}
      {...props}
    />
  );
}
