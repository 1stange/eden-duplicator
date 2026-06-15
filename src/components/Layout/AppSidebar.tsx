import {
  Home, Search, Heart, MessageSquare, Bell, BarChart3, Clock, Settings,
  PlusCircle, LogOut, Leaf, UserCircle, Shield, Users, BadgeCheck, Eye,
  Briefcase, Building2, AlertTriangle,
} from "lucide-react";
import { useState } from "react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";

// Role-based menu definitions
const commonNav = [
  { title: "Accueil", url: "/", icon: Home },
  { title: "Recherche", url: "/search", icon: Search },
];

const publishItem = { title: "Publier", url: "/publish", icon: PlusCircle };

const socialItems = [
  { title: "Messages", url: "/messages", icon: MessageSquare },
  { title: "Notifications", url: "/notifications", icon: Bell },
];

const particulierItems = [
  { title: "Favoris", url: "/favorites", icon: Heart },
  ...socialItems,
];

const entrepriseItems = [
  ...socialItems,
  { title: "Mes annonces", url: "/analytics", icon: BarChart3 },
];

const moreParticulier = [
  { title: "Historique", url: "/history", icon: Clock },
  { title: "Paramètres", url: "/settings", icon: Settings },
];

const moreEntreprise = [
  { title: "Historique", url: "/history", icon: Clock },
  { title: "Paramètres", url: "/settings", icon: Settings },
];

const adminItems = [
  { title: "Modération", url: "/admin", icon: Shield },
  { title: "Analytiques", url: "/analytics", icon: BarChart3 },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const userRole = user?.role || "particulier";
  const isEntreprise = userRole === "entreprise";

  // Build navigation based on role
  const mainItems = [...commonNav, publishItem];
  const personalNav = isEntreprise ? entrepriseItems : particulierItems;
  const moreNav = isEntreprise ? moreEntreprise : moreParticulier;

  const roleLabel = isAdmin ? "Administrateur" : isEntreprise ? "Entreprise" : "Particulier";
  const roleColor = isAdmin ? "text-destructive" : isEntreprise ? "text-accent" : "text-primary";
  const RoleIcon = isAdmin ? Shield : isEntreprise ? Building2 : UserCircle;

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
        {/* Logo */}
        <div className={`flex items-center gap-2 px-4 mb-6 ${collapsed ? "justify-center" : ""}`}>
          <div className="w-8 h-8 rounded-lg eden-gradient flex items-center justify-center shrink-0">
            <Leaf className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && <span className="text-lg font-display font-bold text-sidebar-foreground">Eden</span>}
        </div>

        {/* Role badge */}
        {!collapsed && (
          <div className="px-4 mb-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-sidebar-accent/50">
              <RoleIcon className={`h-4 w-4 ${roleColor} shrink-0`} />
              <span className={`text-xs font-medium ${roleColor}`}>{roleLabel}</span>
            </div>
          </div>
        )}

        {/* Quick search */}
        {!collapsed && (
          <div className="px-4 mb-3">
            <form onSubmit={(e) => { e.preventDefault(); const q = (e.currentTarget.elements.namedItem("q") as HTMLInputElement).value.trim(); navigate(q ? `/search?q=${encodeURIComponent(q)}` : "/search"); }} className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-sidebar-foreground/50" />
              <input name="q" type="text" placeholder="Recherche rapide..." className="w-full h-8 pl-8 pr-2 text-xs rounded-lg bg-sidebar-accent/40 border border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/40 focus:outline-none focus:ring-1 focus:ring-sidebar-ring" />
            </form>
          </div>
        )}

        {/* Main nav */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 text-[10px] uppercase tracking-wider">Navigation</SidebarGroupLabel>
          <SidebarGroupContent><SidebarMenu>{renderItems(mainItems)}</SidebarMenu></SidebarGroupContent>
        </SidebarGroup>

        {/* Personal / Business */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 text-[10px] uppercase tracking-wider">
            {isEntreprise ? "Entreprise" : "Personnel"}
          </SidebarGroupLabel>
          <SidebarGroupContent><SidebarMenu>{renderItems(personalNav)}</SidebarMenu></SidebarGroupContent>
        </SidebarGroup>

        {/* More */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 text-[10px] uppercase tracking-wider">Plus</SidebarGroupLabel>
          <SidebarGroupContent><SidebarMenu>{renderItems(moreNav)}</SidebarMenu></SidebarGroupContent>
        </SidebarGroup>

        {/* Admin section */}
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/50 text-[10px] uppercase tracking-wider">Administration</SidebarGroupLabel>
            <SidebarGroupContent><SidebarMenu>{renderItems(adminItems)}</SidebarMenu></SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        {user && (
          <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
            <button onClick={() => navigate("/profile")} className="shrink-0 group relative">
              <img src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt={user.name} className="w-8 h-8 rounded-full bg-sidebar-accent object-cover" />
              {(user as any)?.is_certified && (
                <div className="absolute -bottom-0.5 -right-0.5 bg-eden-success rounded-full p-0.5 ring-2 ring-sidebar">
                  <BadgeCheck className="h-2.5 w-2.5 text-white" />
                </div>
              )}
            </button>
            {!collapsed && (
              <button onClick={() => navigate("/profile")} className="flex-1 min-w-0 text-left hover:opacity-80 transition-opacity">
                <p className="text-sm font-medium text-sidebar-foreground truncate flex items-center gap-1">
                  {user.pseudo || user.name}
                </p>
                <p className="text-[10px] text-sidebar-foreground/50 truncate">{user.city} • {roleLabel}</p>
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
