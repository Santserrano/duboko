import { Youtube, Github, Twitter, LinkIcon } from 'lucide-react';

export function getSiteIcon(url: string) {
  const domain = url.toLowerCase();

  if (domain.includes('youtube.com') || domain.includes('youtu.be')) {
    return Youtube;
  }
  if (domain.includes('github.com')) {
    return Github;
  }
  if (domain.includes('twitter.com') || domain.includes('x.com')) {
    return Twitter;
  }

  return LinkIcon;
}
