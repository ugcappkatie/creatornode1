"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { Card } from "@/components/ui/card";
import { GearIcon } from "@radix-ui/react-icons";
import { getCurrency } from "@/lib/utils";

type Currency = "USD" | "GBP" | "EUR" | "CAD" | "AUD" | "JPY";

const currencies: { code: Currency; label: string }[] = [
  { code: "USD", label: "USD - US Dollar" },
  { code: "GBP", label: "GBP - British Pound" },
  { code: "EUR", label: "EUR - Euro" },
  { code: "CAD", label: "CAD - Canadian Dollar" },
  { code: "AUD", label: "AUD - Australian Dollar" },
  { code: "JPY", label: "JPY - Japanese Yen" },
];

export default function SettingsPage() {
  const [currency, setCurrency] = useState<Currency>("GBP");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedCurrency = getCurrency() as Currency;
    if (savedCurrency && currencies.find((c) => c.code === savedCurrency)) {
      setCurrency(savedCurrency);
    }
  }, []);

  const handleCurrencyChange = (newCurrency: Currency) => {
    setCurrency(newCurrency);
    localStorage.setItem("cc_currency", newCurrency);
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent("currencyUpdated"));
  };

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
              <div className="space-y-2">
                <label htmlFor="currency" className="block text-sm font-medium text-neutral-700 mb-2">
                  Currency
                </label>
                {mounted && (
                  <select
                    id="currency"
                    value={currency}
                    onChange={(e) => handleCurrencyChange(e.target.value as Currency)}
                    className="w-full max-w-xs px-3 py-2 rounded-lg border border-[#e5e5e5] bg-white text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  >
                    {currencies.map((curr) => (
                      <option key={curr.code} value={curr.code}>
                        {curr.label}
                      </option>
                    ))}
                  </select>
                )}
                <p className="text-xs text-neutral-500 mt-2">
                  This will update the currency displayed across the entire application.
                </p>
              </div>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
}

