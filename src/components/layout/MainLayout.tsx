import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { TopBar } from "./TopBar";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar />
          
          <main className="flex-1 banking-pattern relative">
            {/* Sidebar trigger for mobile */}
            <div className="md:hidden absolute top-4 left-4 z-10">
              <SidebarTrigger className="h-10 w-10" />
            </div>
            
            <div className="h-full flex items-center justify-center p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}