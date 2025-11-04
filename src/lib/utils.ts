export function cn(...classes: Array<string | undefined | null | false>) {
  return classes.filter(Boolean).join(" ");
}

export function formatCurrency(amount: number) {
  const symbol = getCurrencySymbol();
  const rounded = Math.round(amount);
  return `${symbol}${rounded.toLocaleString()}`;
}

export function getCurrency() {
  if (typeof window === "undefined") return "GBP";
  try {
    return localStorage.getItem("cc_currency") || "GBP";
  } catch {
    return "GBP";
  }
}

export function getCurrencySymbol() {
  const currency = getCurrency();
  const symbols: Record<string, string> = {
    USD: "$",
    GBP: "£",
    EUR: "€",
    CAD: "C$",
    AUD: "A$",
    JPY: "¥",
  };
  return symbols[currency] || "£";
}


