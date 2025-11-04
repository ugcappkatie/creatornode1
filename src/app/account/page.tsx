"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { Card } from "@/components/ui/card";
import { PersonIcon, StarFilledIcon } from "@radix-ui/react-icons";

type UserProfile = {
  name: string;
  tier: string;
  avatarData?: string;
};

const loadProfile = (): UserProfile => {
  try {
    const raw = localStorage.getItem("cc_user");
    if (raw) return JSON.parse(raw);
  } catch {}
  return { name: "Megan Smith", tier: "Pro User" };
};

const saveProfile = (p: UserProfile) => {
  try {
    localStorage.setItem("cc_user", JSON.stringify(p));
  } catch {}
};

export default function AccountPage() {
  const [profile, setProfile] = useState<UserProfile>({ name: "", tier: "" });

  useEffect(() => {
    setProfile(loadProfile());
  }, []);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const next = { ...profile, avatarData: reader.result as string };
      setProfile(next);
      saveProfile(next);
    };
  };

  return (
    <div className="h-[100dvh] bg-neutral-50">
      <div className="w-full h-full px-5 flex gap-6 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto py-4">
          <div className="grid grid-cols-3 gap-4">
            <Card padded={false} className="col-span-2">
              <div className="px-5 py-4 border-b border-[#efefef] flex items-center gap-2">
                <div className="h-6 w-6 rounded bg-neutral-900 text-white flex items-center justify-center">
                  <PersonIcon className="h-4 w-4" />
                </div>
                <div className="text-[15px] font-semibold">Account</div>
              </div>
              <div className="p-6 space-y-5">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-neutral-200 overflow-hidden flex items-center justify-center">
                    {profile.avatarData ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={profile.avatarData} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      <PersonIcon className="h-7 w-7 text-neutral-600" />
                    )}
                  </div>
                  <div>
                    <div className="text-[18px] font-semibold">{profile.name || "Megan Smith"}</div>
                    <div className="text-sm text-amber-600">{profile.tier || "Pro User"}</div>
                  </div>
                </div>
                <div>
                  <label className="block text-[12px] text-neutral-600 mb-1">Update profile picture</label>
                  <input type="file" accept="image/*" className="text-[14px]" onChange={handleAvatarChange} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[12px] text-neutral-600 mb-1">Name</label>
                    <input
                      className="w-full rounded-[10px] border border-[#e5e5e5] bg-white px-3 py-2 text-[14px]"
                      value={profile.name}
                      onChange={(e) => {
                        const next = { ...profile, name: e.target.value };
                        setProfile(next);
                        saveProfile(next);
                      }}
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] text-neutral-600 mb-1">Plan</label>
                    <input
                      className="w-full rounded-[10px] border border-[#e5e5e5] bg-white px-3 py-2 text-[14px]"
                      value={profile.tier}
                      onChange={(e) => {
                        const next = { ...profile, tier: e.target.value };
                        setProfile(next);
                        saveProfile(next);
                      }}
                      placeholder="Pro User"
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card padded={false}>
              <div className="px-5 py-4 border-b border-[#efefef] flex items-center gap-2">
                <div className="h-6 w-6 rounded bg-amber-500 text-white flex items-center justify-center">
                  <StarFilledIcon className="h-4 w-4" />
                </div>
                <div className="text-[15px] font-semibold">Creator Rewards</div>
              </div>
              <div className="p-6 space-y-3 text-sm text-neutral-700">
                <div>• Points: 1,250</div>
                <div>• Next reward at 1,500 points</div>
                <div className="text-neutral-500">Rewards are placeholders for now.</div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}

