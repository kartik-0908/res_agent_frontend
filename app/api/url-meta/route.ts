import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { url } = req.query;
  if (!url || typeof url !== 'string') return res.status(400).json({});

  try {
    const response = await fetch(url, { method: 'GET' });
    const html = await response.text();
    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1] : url;
    const faviconMatch = html.match(/<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']+)["'][^>]*>/i);
    let favicon = faviconMatch ? faviconMatch[1] : '';
    if (favicon && !favicon.startsWith('http')) {
      const u = new URL(url);
      favicon = u.origin + (favicon.startsWith('/') ? favicon : '/' + favicon);
    }
    res.status(200).json({ title, favicon });
  } catch (error) {
    console.error('Error fetching URL metadata:', error);
    res.status(200).json({ title: "", favicon: '' });
  }
}