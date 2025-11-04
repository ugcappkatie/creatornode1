"use client";

import { Sidebar } from "@/components/sidebar/Sidebar";
import { Card } from "@/components/ui/card";

export default function CategoryIdeasPage({ params }: { params: { category: string } }) {
  const title = params.category.replace(/-/g, " ").replace(/^./, (s) => s.toUpperCase());

  return (
    <div className="h-[100dvh] bg-neutral-50">
      <div className="w-full h-full px-5 flex gap-6 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto py-4">
          <Card padded={false} className="mb-5">
            <div className="px-5 py-4 border-b border-[#efefef]">
              <div className="text-[15px] font-semibold">{title} Ideas</div>
              <div className="text-xs text-neutral-500">Placeholder feed for {title}</div>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-5 gap-4">
                {Array.from({ length: 25 }).map((_, i) => (
                  <div key={i} className="w-full aspect-[9/16] rounded-[12px] bg-neutral-200 flex items-center justify-center text-neutral-500 text-sm">
                    {`Video ${i + 1}`}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
}

