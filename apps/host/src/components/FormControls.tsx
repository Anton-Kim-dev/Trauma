import React from "react";
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

type FieldShellProps = {
  description?: string;
  error?: string | null;
  label: string;
  required?: boolean;
};

const FieldShell = ({
  children,
  description,
  error,
  label,
  required,
}: FieldShellProps & { children: ReactNode }) => (
  <label className="field-shell">
    <span className="field-label">
      {label}
      {required ? <span className="field-required"> *</span> : null}
    </span>
    {description ? <span className="field-description">{description}</span> : null}
    {children}
    {error ? <span className="field-error">{error}</span> : null}
  </label>
);

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & FieldShellProps;

export const InputField = ({ description, error, label, required, ...props }: InputFieldProps) => (
  <FieldShell description={description} error={error} label={label} required={required}>
    <input className="field-control" {...props} />
  </FieldShell>
);

type SelectFieldProps = FieldShellProps &
  SelectHTMLAttributes<HTMLSelectElement> & {
    options: Array<{ label: string; value: string }>;
  };

export const SelectField = ({
  description,
  error,
  label,
  options,
  required,
  ...props
}: SelectFieldProps) => (
  <FieldShell description={description} error={error} label={label} required={required}>
    <select className="field-control" {...props}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </FieldShell>
);

type TextareaFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> & FieldShellProps;

export const TextareaField = ({
  description,
  error,
  label,
  required,
  ...props
}: TextareaFieldProps) => (
  <FieldShell description={description} error={error} label={label} required={required}>
    <textarea className="field-control field-control-textarea" {...props} />
  </FieldShell>
);
