import { InputHTMLAttributes } from "react";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  className?: string;
}

export default function TextField({
  label,
  className,
  ...props
}: TextFieldProps) {
  return (
    <div className={`relative ${className}`}>
      <input className="w-full peer" type="text" placeholder=" " {...props} />
      <label className="absolute pointer-events-none duration-300 transform -translate-y-7 scale-75 top-4 origin-[0] left-3 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-7 bg-surface bg-gradient-to-r from-primary/5 to-primary/5 px-1 text-on-surface-variant peer-focus:text-primary">
        {label}
      </label>
    </div>
  );
}
