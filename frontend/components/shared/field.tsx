import { FieldError } from "@/components/shared/field-error";
import { Label } from "@/components/ui/label";

export function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>
        {label}
        {required && <span className="ml-0.5 text-primary">*</span>}
      </Label>
      {children}
      <FieldError message={error} />
    </div>
  );
}
