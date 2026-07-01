export function Divider({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative my-2 flex items-center">
      <span className="flex-grow border-t border-border" />
      <span className="mx-3 text-xs uppercase tracking-wider text-muted-foreground">{children}</span>
      <span className="flex-grow border-t border-border" />
    </div>
  );
}
