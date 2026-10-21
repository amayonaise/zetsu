import React from 'react';
import { Home, Film, Tv, Trophy, Bookmark, Clock, Settings } from 'lucide-react';
import { NavigationTab } from '../../types/index.ts';

interface Props {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  myListCount: number;
}

export const BottomNav: React.FC<Props> = ({
  activeTab,
  onSelectTab,
  myListCount,
}) => {
  const tabs: { tab: NavigationTab; label: string; icon: React.ElementType; badge?: number }[] = [
    { tab: 'home', label: 'Home', icon: Home },
    { tab: 'movies', label: 'Movies', icon: Film },
    { tab: 'tv', label: 'Series', icon: Tv },
    { tab: 'sports', label: 'Sports', icon: Trophy },
    { tab: 'mylist', label: 'My List', icon: Bookmark, badge: myListCount },
  ];

  return (
    <div className="fixed bottom-3.5 left-0 right-0 z-40 md:hidden flex justify-center pointer-events-none px-4">
      <nav className="pointer-events-auto w-full max-w-sm bg-[#080d0a]/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-1.5 shadow-[0_10px_35px_rgba(0,0,0,0.85)] flex items-center justify-between select-none">
        {tabs.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.tab;

          return (
            <button
              key={item.tab}
              onClick={() => onSelectTab(item.tab)}
              className={`relative flex-1 flex flex-col items-center justify-center py-1.5 rounded-xl transition-all duration-300 active:scale-95 ${
                isActive
                  ? 'bg-primary/15 text-primary font-bold shadow-[inset_0_0_12px_rgba(16,185,129,0.2)]'
                  : 'text-[#7e9589] hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110 stroke-[2.5]' : 'stroke-2'}`} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2.5 min-w-[14px] h-[14px] bg-primary text-black text-[9px] font-black rounded-full flex items-center justify-center px-1">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-0.5 tracking-tight ${isActive ? 'font-bold text-primary' : 'font-medium'}`}>
                {item.label}
              </span>
              {isActive && (
                <span className="absolute -bottom-0.5 w-3 h-0.5 bg-primary rounded-full shadow-[0_0_8px_rgba(16,185,129,0.9)]" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
