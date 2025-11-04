"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const items = [1, 2, 3, 4, 5];

export function Inspo() {
  return (
    <Card className="col-span-2">
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Get Inspired</CardTitle>
        <button className="text-xs rounded-full bg-black text-white px-3 py-1">View more</button>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3 overflow-x-auto">
          {items.map((i) => (
            <div key={i} className="h-[180px] w-[140px] rounded-[12px] bg-neutral-200 shrink-0" />)
          )}
        </div>
      </CardContent>
    </Card>
  );
}


