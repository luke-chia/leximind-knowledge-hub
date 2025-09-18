import { Bell, Sun, Moon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";

export function TopBar() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Set dark mode on mount
    document.documentElement.classList.add("dark");
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <header className="h-16 border-b border-sidebar-border bg-sidebar/50 backdrop-blur-sm">
      <div className="flex h-full items-center justify-between px-6">
        {/* Logo/Brand */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Sparkles className="h-6 w-6 text-banking-primary" />
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-gradient-banking rounded-full animate-pulse" />
            </div>
            <span className="text-xl font-bold bg-gradient-banking bg-clip-text text-transparent">
              LexiMind
            </span>
          </div>
        </div>

        {/* Center - New Chat Button */}
        <Button variant="outline" className="btn-banking-primary h-10 px-6 font-medium">
          <Sparkles className="mr-2 h-4 w-4" />
          New Chat
        </Button>

        {/* Right side actions */}
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-10 w-10 text-sidebar-foreground hover:text-banking-primary hover:bg-banking-surface-hover"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-sidebar-foreground hover:text-banking-primary hover:bg-banking-surface-hover"
            >
              <Bell className="h-5 w-5" />
            </Button>
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              3
            </Badge>
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-10 px-2 hover:bg-banking-surface-hover">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8 border-2 border-banking-primary/30">
                    <AvatarImage src="/api/placeholder/32/32" alt="User" />
                    <AvatarFallback className="bg-banking-primary text-banking-primary-foreground">
                      TC
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-sidebar-foreground">Tom Cook</p>
                    <p className="text-xs text-muted-foreground">Bank Analyst</p>
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Preferences</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}