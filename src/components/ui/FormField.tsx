// components/ui/FormField.tsx
//
// Section 5 (non-functional requirements): real <label> elements tied to
// their inputs, consistent spacing and error display, shared by every form.

import type { InputHTMLAttributes } from 'react';

interface BaseProps {
  id: string;
  label: string;
  error?: string;
}

export function TextField({ id, label, error, ...rest }: BaseProps & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={id}
        className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        {...rest}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
