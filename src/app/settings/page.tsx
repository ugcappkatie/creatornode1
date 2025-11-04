"use client";

import { Sidebar } from "@/components/sidebar/Sidebar";
import { Card } from "@/components/ui/card";
import { GearIcon } from "@radix-ui/react-icons";

export default function SettingsPage() {
  return (
    <div className="h-[100dvh] bg-neutral-50">
      <div className="w-full h-full px-5 flex gap-6 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto py-4">
          <Card padded={false} className="mb-5">
            <div className="px-5 py-4 border-b border-[#efefef] flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-neutral-900 text-white flex items-center justify-center">
                <GearIcon className="h-4 w-4" />
              </div>
              <div className="text-[15px] font-semibold">Settings</div>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-sm text-neutral-600">General application settings will go here.</div>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
}

