"use client";

import Link from "next/link";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { Card } from "@/components/ui/card";

const categories = ["Fashion", "Lifestyle", "Travel", "Tech", "Beauty", "Fitness"] as const;

function PlaceholderVideo({ idx }: { idx: number }) {
  return (
    <div className="w-[180px] h-[320px] rounded-[12px] bg-neutral-200 flex items-center justify-center text-neutral-500 text-sm shrink-0">
      {`Video ${idx}`}
    </div>
  );
}

export default function IdeasPage() {
  return (
    <div className="h-[100dvh] bg-neutral-50">
      <div className="w-full h-full px-5 flex gap-6 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto py-4">
          <Card padded={false} className="mb-5">
            <div className="px-5 py-4 border-b border-[#efefef] flex items-center justify-between">
              <div>
                <div className="text-[15px] font-semibold">Content Ideas</div>
                <div className="text-xs text-neutral-500">Browse inspiration by category</div>
              </div>
            </div>
            <div className="p-5 space-y-8">
              {categories.map((c) => (
                <div key={c} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-[14px] font-semibold">{c}</div>
                    <Link href={`/ideas/${c.toLowerCase()}`} className="text-[12px] text-neutral-600 hover:text-black">View all</Link>
                  </div>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <PlaceholderVideo key={i} idx={i + 1} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
}

