import { useState, useEffect } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { auth } from '@/lib/supabase'
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
} from 'lucide-react'

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
} from '@/components/ui/sidebar'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

export function AppSidebar() {
  const { t } = useTranslation()
  const { state } = useSidebar()
  const location = useLocation()
  const navigate = useNavigate()
  const currentPath = location.pathname
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    chats: true,
    today: false,
    'last-week': false,
    'last-month': false,
    historical: false,
    favorites: false,
  })

  // Handle logout function
  const handleLogout = async () => {
    try {
      const { error } = await auth.signOut()
      if (error) {
        console.error('Error logging out:', error.message)
      } else {
        navigate('/')
      }
    } catch (err) {
      console.error('Logout error:', err)
      // Even if there's an error, redirect to login
      navigate('/')
    }
  }

  // Dynamic navigation items with translations
  const navigationItems = [
    { title: t('sidebar.dashboard'), url: '/', icon: Home },
    { title: t('sidebar.search'), url: '/search', icon: Search },
  ]

  const chatHistoryItems = [
    {
      title: t('sidebar.today'),
      items: ['Account Queries', 'Compliance Questions'],
    },
    {
      title: t('sidebar.last_week'),
      items: ['CNBV Regulations', 'IT Policy Review'],
    },
    {
      title: t('sidebar.last_month'),
      items: ['Operational Manual', 'Accounting Procedures'],
    },
    {
      title: t('sidebar.historical'),
      items: ['Legacy Documents', 'Archived Chats'],
    },
  ]

  const middleItems = [
    { title: t('sidebar.documents'), url: '/documents', icon: FileText },
    { title: t('sidebar.users'), url: '/users', icon: Users },
    { title: t('sidebar.reports'), url: '/reports', icon: BarChart3 },
  ]

  const favoriteDocuments = [
    { title: 'Manual One', url: '/documents/manual-one' },
    { title: 'Manual Two', url: '/documents/manual-two' },
    { title: 'CNBV Regulations', url: '/documents/cnbv' },
    { title: 'IT Security Policy', url: '/documents/it-security' },
  ]

  const logoutItem = {
    title: t('sidebar.logout'),
    url: '/',
    icon: LogOut,
  }

  // Detect dark/light mode changes
  useEffect(() => {
    const checkTheme = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'))
    }

    // Check initial theme
    checkTheme()

    // Watch for theme changes
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => observer.disconnect()
  }, [])

  const isCollapsed = state === 'collapsed'
  const isActive = (path: string) => currentPath === path

  const getNavClassName = ({ isActive: active }: { isActive: boolean }) =>
    active
      ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200'

  const toggleGroup = (groupKey: string) => {
    setOpenGroups((prev) => ({ ...prev, [groupKey]: !prev[groupKey] }))
  }

  const getTimeIcon = (title: string) => {
    switch (title.toLowerCase()) {
      case 'today':
        return Clock
      case 'last week':
        return Calendar
      case 'last month':
        return Calendar
      case 'historical':
        return Archive
      default:
        return Clock
    }
  }

  return (
    <Sidebar
      className="border-r border-sidebar-border bg-sidebar"
      collapsible="icon"
    >
      <SidebarContent className="px-2 py-4">
        {/* LexiMind Logo */}
        <div className="flex items-center justify-center mb-6 mt-2">
          {isCollapsed ? (
            <div className="flex items-center justify-center h-8 w-8 text-lg font-bold">
              <span className={isDarkMode ? 'text-white' : 'text-black'}>
                L
              </span>
              <span className="text-[#6667AB]">M</span>
            </div>
          ) : (
            <img
              src={
                isDarkMode ? '/Logo_Lexi_710.png' : '/Logo_Lexi_710_MClaro.png'
              }
              alt="LexiMind"
              className="h-12 w-auto max-w-[160px] transition-all duration-200"
            />
          )}
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarMenu>
            {navigationItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild className="h-10">
                  <NavLink to={item.url} className={getNavClassName}>
                    <item.icon className="h-5 w-5" />
                    {!isCollapsed && (
                      <span className="font-medium">{item.title}</span>
                    )}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {/* My Chats Section */}
        <SidebarGroup>
          <Collapsible
            open={openGroups.chats}
            onOpenChange={() => toggleGroup('chats')}
          >
            <CollapsibleTrigger asChild>
              <SidebarMenuButton className="h-10 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                <MessageSquare className="h-5 w-5" />
                {!isCollapsed && (
                  <>
                    <span className="font-medium">{t('sidebar.chats')}</span>
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
                    const IconComponent = getTimeIcon(group.title)
                    const groupKey = group.title.toLowerCase().replace(' ', '-')

                    return (
                      <SidebarMenuSubItem key={group.title}>
                        <Collapsible
                          open={openGroups[groupKey]}
                          onOpenChange={() => toggleGroup(groupKey)}
                        >
                          <CollapsibleTrigger asChild>
                            <SidebarMenuSubButton className="text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent">
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
                                  className="text-sm text-sidebar-foreground hover:text-sidebar-accent-foreground cursor-pointer py-1 px-2 rounded hover:bg-sidebar-accent transition-colors"
                                >
                                  {item}
                                </div>
                              ))}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      </SidebarMenuSubItem>
                    )
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
                    {!isCollapsed && (
                      <span className="font-medium">{item.title}</span>
                    )}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {/* Favorites Section */}
        <SidebarGroup>
          <Collapsible
            open={openGroups.favorites}
            onOpenChange={() => toggleGroup('favorites')}
          >
            <CollapsibleTrigger asChild>
              <SidebarMenuButton className="h-10 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                <Star className="h-5 w-5" />
                {!isCollapsed && (
                  <>
                    <span className="font-medium">
                      {t('sidebar.favorites')}
                    </span>
                    {openGroups.favorites ? (
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
                  {favoriteDocuments.map((doc) => (
                    <SidebarMenuSubItem key={doc.title}>
                      <SidebarMenuSubButton
                        asChild
                        className="text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent"
                      >
                        <NavLink to={doc.url}>
                          <FileText className="h-4 w-4" />
                          <span>{doc.title}</span>
                        </NavLink>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            )}
          </Collapsible>
        </SidebarGroup>

        {/* Logout at Bottom */}
        <SidebarGroup className="mt-auto">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild className="h-10">
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full h-full px-3 py-2 text-left rounded-md transition-colors hover:bg-gray-700 text-gray-300 hover:text-white"
                >
                  <LogOut className="h-5 w-5" />
                  {!isCollapsed && (
                    <span className="font-medium ml-3">
                      {t('sidebar.logout')}
                    </span>
                  )}
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
