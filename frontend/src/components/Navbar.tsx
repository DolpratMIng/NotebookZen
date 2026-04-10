"use client";
import Image from "next/image";
import {
  Show,
  SignInButton,
  UserButton,
} from "@clerk/nextjs";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarInset } from "@/components/ui/sidebar";

export default function Navbar() {
  return (
    <div className="flex">
      <SidebarTrigger />
      <nav className="border-white border-2 flex-1 h-30 sm:h-20 flex flex-col sm:flex-row justify-between items-center p-5">
        <div className="flex items-center gap-3">
          <Image
            src="/zenLogo2.png"
            alt="Logo"
            width={40}
            height={40}
            className="rounded-full"
          />
          <div className="hidden md:block">ZenNote</div>
        </div>
        <div className="flex gap-4 items-center">
          <header className="flex justify-end items-center p-4 gap-4 h-16">
            <Show when="signed-out">
              <div className="bg-violet-600 p-2 rounded-md cursor-pointer">
                <SignInButton />
              </div>
            </Show>
            <Show when="signed-in">
              <UserButton />
            </Show>
          </header>
        </div>
      </nav>
    </div>
  );
}
