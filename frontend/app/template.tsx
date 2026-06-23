// app/template.tsx
import { PageTransition } from "@/lib/animations";

export default function Template({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
