"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export function PasswordInput({
  name,
  required,
  autoComplete,
  placeholder,
  className = "",
}: {
  name: string;
  required?: boolean;
  autoComplete?: string;
  placeholder?: string;
  className?: string;
}) {
  const [visivel, setVisivel] = useState(false);

  return (
    <div className="relative">
      <input
        name={name}
        type={visivel ? "text" : "password"}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className={`${className} pr-9`}
      />
      <button
        type="button"
        onClick={() => setVisivel((v) => !v)}
        tabIndex={-1}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8A8578] hover:text-[#4A4740]"
      >
        {visivel ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  );
}
