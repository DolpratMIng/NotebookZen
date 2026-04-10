"use client";

import MenuBody from "@/components/MenuBody";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="h-screen border-2">
          <Navbar />
          <MenuBody />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
