
import { useState } from 'react';
import { Calendar, Users, FileText, Bell, BarChart3, Settings, Menu, X, LogOut, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Tableau de bord', icon: BarChart3 },
  { id: 'calendar', label: 'Calendrier', icon: Calendar },
  { id: 'requests', label: 'Demandes', icon: FileText },
  { id: 'absences', label: 'Absences', icon: Users },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'profile', label: 'Mon Profil', icon: User },
  { id: 'settings', label: 'Paramètres', icon: Settings }
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className={cn(
      "bg-slate-900 text-white transition-all duration-300 flex flex-col",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h1 className="text-xl font-bold text-blue-400">
              LeaveManager
            </h1>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            {isCollapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            // Hide admin-only features for employees
            if (user?.role === 'employee' && (item.id === 'requests' || item.id === 'settings')) {
              return null;
            }
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left",
                    activeTab === item.id
                      ? "bg-blue-600 text-white"
                      : "hover:bg-slate-700 text-slate-300"
                  )}
                >
                  <IconComponent size={20} />
                  {!isCollapsed && <span>{item.label}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              <p className="text-xs text-blue-400 capitalize">{user?.role}</p>
            </div>
          )}
        </div>
        
        {!isCollapsed && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="w-full text-slate-300 border-slate-600 hover:bg-slate-700"
          >
            <LogOut size={16} className="mr-2" />
            Déconnexion
          </Button>
        )}
      </div>
    </div>
  );
}
