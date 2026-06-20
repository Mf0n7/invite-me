export function Centered({ children }: { children: React.ReactNode }) {
  return (
    <main className="container flex min-h-screen flex-col items-center justify-center text-center">
      {children}
    </main>
  );
}
