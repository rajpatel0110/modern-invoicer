// src/app/(app)/layout.tsx
import Sidebar from '@/components/Sidebar';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="d-flex vh-100">
      <Sidebar />
      <main className="flex-grow-1 p-4 overflow-auto">
        {children}
      </main>
    </div>
  );
}