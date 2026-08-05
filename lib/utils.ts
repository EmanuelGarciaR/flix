import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function shareContent(title: string, url: string, onCopiedFallback?: () => void) {
  const shareData = { title, text: title, url };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      await navigator.clipboard.writeText(url);
      if (onCopiedFallback) {
        onCopiedFallback();
      }
    }
  } catch (error) {
    if ((error as DOMException).name !== 'AbortError') {
      console.error('Error sharing title:', error);
    }
  }
}
