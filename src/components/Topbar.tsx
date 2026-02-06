import React from 'react';
import { Search, Bell } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import logo from '@/assets/logo.png';

interface TopbarProps {
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
}

const Topbar: React.FC<TopbarProps> = ({ searchPlaceholder = "Search...", onSearch }) => {
  const { currentUser } = useAuth();
  const { notifications } = useData();
  
  const unreadCount = notifications.filter(n => !n.read).length;
  const userName = currentUser && 'name' in currentUser 
    ? currentUser.name 
    : currentUser && 'firstName' in currentUser 
      ? `${currentUser.firstName} ${currentUser.lastName}`
      : 'User';

  return (
    <div className="bg-card rounded-lg shadow-sm p-4 mb-6 flex items-center justify-between">
      {/* Search */}
      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={searchPlaceholder}
          className="pl-10 bg-muted/50 border-0"
          onChange={(e) => onSearch?.(e.target.value)}
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-6">
        {/* Notifications */}
        <div className="relative cursor-pointer">
          <Bell className="h-6 w-6 text-muted-foreground hover:text-foreground transition-colors" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-pink-500"
            >
              {unreadCount}
            </Badge>
          )}
        </div>

        {/* User Info */}
        <div className="flex items-center gap-3">
          <img 
            src={logo} 
            alt="User" 
            className="w-9 h-9 rounded-full object-cover"
          />
          <span className="font-medium text-foreground">
            {userName} <span className="text-muted-foreground">(Barangay Official)</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
