import type { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { Topbar } from "./Topbar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <aside className="hidden md:flex flex-col w-[224px] flex-shrink-0 glass border-r border-sidebar-border">
        <AppSidebar />
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1600px] px-5 md:px-10 pt-8 pb-16">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
