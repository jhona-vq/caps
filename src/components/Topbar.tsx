import React from 'react';
import { Search, Sun, Moon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import logo from '@/assets/logo.png';

interface TopbarProps {
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
}

const Topbar: React.FC<TopbarProps> = ({ searchPlaceholder = "Search...", onSearch }) => {
  const { profile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  const userName = profile ? `${profile.first_name} ${profile.last_name}` : 'User';

  return (
    <div className="bg-card rounded-lg shadow-sm p-4 mb-6 flex items-center justify-between">
      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={searchPlaceholder}
          className="pl-10 bg-muted/50 border-0"
          onChange={(e) => onSearch?.(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-muted-foreground hover:text-foreground">
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-primary/30 overflow-hidden bg-primary/10 flex items-center justify-center">
            <img src={logo} alt="Barangay Logo" className="w-full h-full object-cover" />
          </div>
          <span className="font-medium text-foreground">
            {userName} <span className="text-muted-foreground">(Official)</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
