import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { resultMessages } from "@/config/result-messages";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function slugify(text: string) {
  return (
    text
      .toLocaleLowerCase("tr-TR")
      .replace(/ı/g, "i")
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 65) || "test"
  );
}
export const categories = [
  { id: "friends", name: "Arkadaşlık", emoji: "✌️", color: "violet" },
  { id: "relationships", name: "İlişkiler", emoji: "💌", color: "pink" },
  { id: "family", name: "Aile", emoji: "🏡", color: "mint" },
  { id: "fun", name: "Eğlence", emoji: "⚡", color: "peach" },
] as const;
export function categoryName(id: string) {
  return categories.find((c) => c.id === id)?.name ?? "Eğlence";
}
export function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short" }).format(
    new Date(value),
  );
}
export function resultMessage(score: number) {
  return resultMessages.find((message) => score >= message.min)!.text;
}
