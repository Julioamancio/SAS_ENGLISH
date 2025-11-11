import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  HomeIcon,
  UsersIcon,
  BookOpenIcon,
  FileTextIcon,
  UploadIcon,
  SettingsIcon,
  LogOutIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MenuIcon,
  ChartBarIcon,
} from "./Icons";
import { APP_TITLE } from "@/const";
import { Button } from "./ui/button";

interface SidebarProps {
  userRole?: "admin" | "professor" | "user";
  onLogout?: () => void;
}

interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  roles?: ("admin" | "professor")[];
}

const navItems: NavItem[] = [
  { path: "/", label: "Dashboard", icon: HomeIcon },
  { path: "/turmas", label: "Turmas", icon: UsersIcon },
  { path: "/atividades", label: "Atividades", icon: BookOpenIcon },
  { path: "/feedbacks", label: "Feedbacks", icon: FileTextIcon },
  { path: "/estatisticas", label: "Estatísticas", icon: ChartBarIcon },
  { path: "/relatorios", label: "Relatórios", icon: FileTextIcon },
  { path: "/importar", label: "Importar Excel", icon: UploadIcon, roles: ["admin"] },
  { path: "/configuracoes", label: "Configurações", icon: SettingsIcon, roles: ["admin"] },
];

export function Sidebar({ userRole = "user", onLogout }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [location] = useLocation();

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);
  const toggleMobile = () => setIsMobileOpen(!isMobileOpen);

  const filteredNavItems = navItems.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(userRole as "admin" | "professor");
  });

  const isActive = (path: string) => {
    if (path === "/") return location === "/";
    return location.startsWith(path);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobile}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-sidebar text-sidebar-foreground no-print"
        aria-label={isMobileOpen ? "Fechar menu" : "Abrir menu"}
      >
        {isMobileOpen ? <MenuIcon size={24} /> : <MenuIcon size={24} />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 no-print"
          onClick={toggleMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-sidebar text-sidebar-foreground z-40 transition-all duration-300 no-print
          ${isCollapsed ? "w-20" : "w-64"}
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        aria-label="Navegação principal"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
            {!isCollapsed && (
              <h1 className="text-xl font-semibold truncate">{APP_TITLE}</h1>
            )}
            <button
              onClick={toggleCollapse}
              className="hidden lg:flex p-2 rounded-lg hover:bg-sidebar-hover transition-colors"
              aria-label={isCollapsed ? "Expandir menu" : "Recolher menu"}
            >
              {isCollapsed ? (
                <ChevronRightIcon size={20} />
              ) : (
                <ChevronLeftIcon size={20} />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4" aria-label="Menu de navegação">
            <ul className="space-y-1 px-2">
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                
                return (
                  <li key={item.path}>
                    <Link
                      href={item.path}
                      className={`
                        sidebar-link
                        ${active ? "sidebar-link-active" : ""}
                      `}
                      onClick={() => setIsMobileOpen(false)}
                      aria-current={active ? "page" : undefined}
                    >
                      <Icon size={20} aria-hidden="true" />
                      {!isCollapsed && <span>{item.label}</span>}
                      {isCollapsed && (
                        <span className="sr-only">{item.label}</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-sidebar-border">
            <button
              onClick={onLogout}
              className="sidebar-link w-full text-left"
              aria-label="Sair do sistema"
            >
              <LogOutIcon size={20} aria-hidden="true" />
              {!isCollapsed && <span>Sair</span>}
              {isCollapsed && <span className="sr-only">Sair</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Spacer for desktop */}
      <div
        className={`hidden lg:block transition-all duration-300 ${
          isCollapsed ? "w-20" : "w-64"
        }`}
        aria-hidden="true"
      />
    </>
  );
}
