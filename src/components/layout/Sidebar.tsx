import React from 'react';
import {
  Home,
  Film,
  Tv,
  Trophy,
  Radio,
  Bookmark,
  Clock,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { NavigationTab } from '../../types/index.ts';

interface Props {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  myListCount: number;
}

export const Sidebar: React.FC<Props> = ({
  activeTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  myListCount,
}) => {
  const navItems: { tab: NavigationTab; label: string; icon: React.ElementType; badge?: number }[] = [
    { tab: 'home', label: 'Home', icon: Home },
    { tab: 'movies', label: 'Movies', icon: Film },
    { tab: 'tv', label: 'TV Shows', icon: Tv },
    { tab: 'sports', label: 'Sports Center', icon: Trophy },
    { tab: 'livetv', label: 'Live TV', icon: Radio },
    { tab: 'mylist', label: 'My List', icon: Bookmark, badge: myListCount },
    { tab: 'history', label: 'Continue Watching', icon: Clock },
    { tab: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className={`h-screen bg-[#070b09] border-r border-[#151e1a] flex flex-col justify-between transition-all duration-300 z-30 select-none ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center px-4 border-b border-[#141d19] gap-3">
          <img
            src="/logo.png"
            alt="Zetsu"
            className="w-9 h-9 object-contain rounded-lg p-0.5 bg-black/40 border border-[#1b2622] shrink-0"
          />
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-extrabold text-base tracking-wider text-white font-sans flex items-center gap-1.5">
                ZETSU
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              </span>
              <span className="text-[10px] text-[#6b7f76] uppercase tracking-widest font-mono">
                Stream Engine
              </span>
            </div>
          )}
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1.5 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.tab;
            return (
              <button
                key={item.tab}
                onClick={() => onSelectTab(item.tab)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group relative ${
                  isActive
                    ? 'bg-primary/15 text-white border border-primary/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                    : 'text-[#879d92] hover:text-[#e4eee9] hover:bg-[#101714]'
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 bg-primary rounded-r-full" />
                )}
                <Icon
                  className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-primary' : 'text-[#6d8177] group-hover:text-white'
                  }`}
                />
                {!isCollapsed && (
                  <span className="truncate tracking-wide">{item.label}</span>
                )}
                {!isCollapsed && item.badge !== undefined && item.badge > 0 && (
                  <span className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-[#16211c] text-primary border border-primary/20">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Collapse Toggle Footer */}
      <div className="p-3 border-t border-[#141d19]">
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs text-[#70847a] hover:text-white hover:bg-[#101714] transition-all"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span className="text-[11px] font-mono">Collapse Sidebar</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
