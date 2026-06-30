import { useState, useCallback } from 'react';

interface UseClipboardReturn {
  copied: boolean;
  copy: (text: string) => Promise<boolean>;
}

export function useClipboard(timeout: number = 2000): UseClipboardReturn {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), timeout);
        return true;
      } catch {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(textarea);
        setCopied(ok);
        if (ok) setTimeout(() => setCopied(false), timeout);
        return ok;
      }
    },
    [timeout]
  );

  return { copied, copy };
}
