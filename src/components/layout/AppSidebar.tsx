import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  Search,
  MessageSquare,
  FileText,
  Users,
  BarChart3,
  Star,
  LogOut,
  ChevronDown,
  ChevronRight,
  Clock,
  Calendar,
  Archive,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const navigationItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Search", url: "/search", icon: Search },
];

const chatHistoryItems = [
  { title: "Today", items: ["Account Queries", "Compliance Questions"] },
  { title: "Last Week", items: ["CNBV Regulations", "IT Policy Review"] },
  { title: "Last Month", items: ["Operational Manual", "Accounting Procedures"] },
  { title: "Historical", items: ["Legacy Documents", "Archived Chats"] },
];

const middleItems = [
  { title: "Documents", url: "/documents", icon: FileText },
  { title: "Users", url: "/users", icon: Users },
  { title: "Reports", url: "/reports", icon: BarChart3 },
  { title: "Favorites", url: "/favorites", icon: Star },
];

const logoutItem = { title: "Logout", url: "/logout", icon: LogOut };

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    chats: true,
    today: false,
    "last-week": false,
    "last-month": false,
    historical: false,
  });

  const isCollapsed = state === "collapsed";
  const isActive = (path: string) => currentPath === path;
  
  const getNavClassName = ({ isActive: active }: { isActive: boolean }) =>
    active 
      ? "bg-banking-surface text-white font-medium" 
      : "text-white hover:bg-banking-surface-hover hover:text-white transition-all duration-200";

  const toggleGroup = (groupKey: string) => {
    setOpenGroups(prev => ({ ...prev, [groupKey]: !prev[groupKey] }));
  };

  const getTimeIcon = (title: string) => {
    switch (title.toLowerCase()) {
      case "today": return Clock;
      case "last week": return Calendar;
      case "last month": return Calendar;
      case "historical": return Archive;
      default: return Clock;
    }
  };

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar" collapsible="icon">
      <SidebarContent className="px-2 py-4">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarMenu>
            {navigationItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild className="h-10">
                  <NavLink to={item.url} className={getNavClassName}>
                    <item.icon className="h-5 w-5" />
                    {!isCollapsed && <span className="font-medium">{item.title}</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {/* My Chats Section */}
        <SidebarGroup>
          <Collapsible open={openGroups.chats} onOpenChange={() => toggleGroup("chats")}>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton className="h-10 text-white hover:bg-banking-surface-hover">
                <MessageSquare className="h-5 w-5" />
                {!isCollapsed && (
                  <>
                    <span className="font-medium">My Chats</span>
                    {openGroups.chats ? (
                      <ChevronDown className="ml-auto h-4 w-4" />
                    ) : (
                      <ChevronRight className="ml-auto h-4 w-4" />
                    )}
                  </>
                )}
              </SidebarMenuButton>
            </CollapsibleTrigger>
            
            {!isCollapsed && (
              <CollapsibleContent>
                <SidebarMenuSub>
                  {chatHistoryItems.map((group) => {
                    const IconComponent = getTimeIcon(group.title);
                    const groupKey = group.title.toLowerCase().replace(" ", "-");
                    
                    return (
                      <SidebarMenuSubItem key={group.title}>
                        <Collapsible open={openGroups[groupKey]} onOpenChange={() => toggleGroup(groupKey)}>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuSubButton className="text-white hover:text-white hover:bg-banking-surface-hover">
                              <IconComponent className="h-4 w-4" />
                              <span>{group.title}</span>
                              {openGroups[groupKey] ? (
                                <ChevronDown className="ml-auto h-3 w-3" />
                              ) : (
                                <ChevronRight className="ml-auto h-3 w-3" />
                              )}
                            </SidebarMenuSubButton>
                          </CollapsibleTrigger>
                          
                          <CollapsibleContent>
                            <div className="ml-6 space-y-1">
                              {group.items.map((item, index) => (
                                <div
                                  key={index}
                                  className="text-sm text-white hover:text-white cursor-pointer py-1 px-2 rounded hover:bg-banking-surface-hover transition-colors"
                                >
                                  {item}
                                </div>
                              ))}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      </SidebarMenuSubItem>
                    );
                  })}
                </SidebarMenuSub>
              </CollapsibleContent>
            )}
          </Collapsible>
        </SidebarGroup>

        {/* Middle Navigation */}
        <SidebarGroup>
          <SidebarMenu>
            {middleItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild className="h-10">
                  <NavLink to={item.url} className={getNavClassName}>
                    <item.icon className="h-5 w-5" />
                    {!isCollapsed && <span className="font-medium">{item.title}</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {/* Logout at Bottom */}
        <SidebarGroup className="mt-auto">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild className="h-10">
                <NavLink to={logoutItem.url} className={getNavClassName}>
                  <logoutItem.icon className="h-5 w-5" />
                  {!isCollapsed && <span className="font-medium">{logoutItem.title}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}