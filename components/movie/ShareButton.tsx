'use client';

import * as React from 'react';
import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

import { shareContent } from '@/lib/utils';

interface ShareButtonProps {
  title: string;
  url?: string;
  variant?: 'primary' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function ShareButton({ title, url, variant = 'secondary', size = 'icon' }: ShareButtonProps) {
  const [copied, setCopied] = React.useState(false);

  async function handleShare() {
    const shareUrl = url || window.location.href;
    await shareContent(title, shareUrl, () => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <Button variant={variant} size={size} title={copied ? "Copied!" : "Share"} onClick={handleShare}>
      <Share2 size={20} />
    </Button>
  );
}
