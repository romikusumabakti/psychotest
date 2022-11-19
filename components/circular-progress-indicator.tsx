import { SVGProps } from "react";

export default function CircularProgressIndicator({
  className,
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      className={`w-12 animate-spin ${className}`}
      viewBox="22 22 44 44"
      {...props}
    >
      <circle
        className="stroke-primary"
        cx="44"
        cy="44"
        r="20.2"
        fill="none"
        strokeWidth="4"
        style={{
          animation: "circular-progress-indicator 1.4s ease-in-out infinite",
        }}
      />
    </svg>
  );
}
