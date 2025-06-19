
import { useState } from 'react';
import { Calendar, Users, FileText, Bell, BarChart3, Settings, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  { id: 'settings', label: 'Paramètres', icon: Settings }
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

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
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium">M</span>
          </div>
          {!isCollapsed && (
            <div>
              <p className="text-sm font-medium">Manager</p>
              <p className="text-xs text-slate-400">marie@entreprise.fr</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
