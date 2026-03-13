import { Home, Search, Heart, MessageSquare, Bell, BarChart3, Clock, Settings, PlusCircle, LogOut, Leaf, UserCircle, Shield } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Accueil", url: "/", icon: Home },
  { title: "Recherche", url: "/search", icon: Search },
  { title: "Publier", url: "/publish", icon: PlusCircle },
];

const personalItems = [
  { title: "Favoris", url: "/favorites", icon: Heart },
  { title: "Messages", url: "/messages", icon: MessageSquare },
  { title: "Notifications", url: "/notifications", icon: Bell },
];

const moreItems = [
  { title: "Analytiques", url: "/analytics", icon: BarChart3 },
  { title: "Historique", url: "/history", icon: Clock },
  { title: "Paramètres", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const renderItems = (items: typeof mainItems) =>
    items.map((item) => (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton asChild>
          <NavLink to={item.url} end={item.url === "/"} className="hover:bg-sidebar-accent/50 relative" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
            <item.icon className="mr-2 h-4 w-4 shrink-0" />
            {!collapsed && <span className="truncate">{item.title}</span>}
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    ));

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarContent className="py-4">
        <div className={`flex items-center gap-2 px-4 mb-6 ${collapsed ? "justify-center" : ""}`}>
          <div className="w-8 h-8 rounded-lg eden-gradient flex items-center justify-center shrink-0">
            <Leaf className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && <span className="text-lg font-display font-bold text-sidebar-foreground">Eden</span>}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 text-[10px] uppercase tracking-wider">Navigation</SidebarGroupLabel>
          <SidebarGroupContent><SidebarMenu>{renderItems(mainItems)}</SidebarMenu></SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 text-[10px] uppercase tracking-wider">Personnel</SidebarGroupLabel>
          <SidebarGroupContent><SidebarMenu>{renderItems(personalItems)}</SidebarMenu></SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 text-[10px] uppercase tracking-wider">Plus</SidebarGroupLabel>
          <SidebarGroupContent><SidebarMenu>{renderItems(moreItems)}</SidebarMenu></SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/50 text-[10px] uppercase tracking-wider">Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink to="/admin" className="hover:bg-sidebar-accent/50" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                      <Shield className="mr-2 h-4 w-4 shrink-0 text-destructive" />
                      {!collapsed && <span className="truncate">Modération</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        {user && (
          <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
            <button onClick={() => navigate("/profile")} className="shrink-0 group relative">
              <img src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt={user.name} className="w-8 h-8 rounded-full bg-sidebar-accent object-cover" />
              <div className="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <UserCircle className="h-4 w-4 text-white" />
              </div>
            </button>
            {!collapsed && (
              <button onClick={() => navigate("/profile")} className="flex-1 min-w-0 text-left hover:opacity-80 transition-opacity">
                <p className="text-sm font-medium text-sidebar-foreground truncate">{user.pseudo || user.name}</p>
                <p className="text-xs text-sidebar-foreground/50 truncate">{user.city}</p>
              </button>
            )}
            {!collapsed && (
              <button onClick={() => logout()} className="text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors shrink-0" title="Déconnexion">
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
