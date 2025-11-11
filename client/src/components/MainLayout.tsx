import { ReactNode } from "react";
import { Link } from "wouter";
import { Sidebar } from "./Sidebar";
import { BellIcon } from "./Icons";
import { Badge } from "./ui/badge";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const logoutMutation = trpc.auth.logout.useMutation();

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    window.location.href = "/login";
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar 
        userRole={user.role as "admin" | "professor" | "user"} 
        onLogout={handleLogout}
      />
      <main className="min-h-screen">
        {/* Header with notifications */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:ml-64">
          <div className="container flex h-14 items-center justify-end">
            <Link href="/notificacoes">
              <button className="relative p-2 hover:bg-muted rounded-lg transition-colors" aria-label="Notificações">
                <BellIcon size={20} />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs" variant="destructive">
                  3
                </Badge>
              </button>
            </Link>
          </div>
        </div>
        <div className="container py-6 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
