import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Bell, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function AppLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center border-b bg-card px-4 gap-3 shrink-0">
            <SidebarTrigger className="text-foreground" />
            <h1 className="text-lg font-display font-bold text-primary flex-1">Eden</h1>
            <button onClick={() => navigate("/search")} className="p-2 rounded-lg hover:bg-muted transition-colors">
              <Search className="h-5 w-5 text-muted-foreground" />
            </button>
            <button onClick={() => navigate("/notifications")} className="p-2 rounded-lg hover:bg-muted transition-colors relative">
              <Bell className="h-5 w-5 text-muted-foreground" />
            </button>
          </header>
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
