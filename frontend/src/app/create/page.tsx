"use client";
import CreateToprow from "@/components/CreateToprow";
import CreateMenu from "@/components/CreateMenu";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import Navbar from "@/components/Navbar";

export default function Create() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Navbar />
        <div className="w-full h-[calc(100vh-5rem)] border-2 border-white">
          <div className="flex flex-col gap-10 items-center border-2 border-blue-400">
            <CreateToprow />
            <CreateMenu />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
