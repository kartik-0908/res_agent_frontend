import puppeteer from "puppeteer";


export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
        return new Response('URL is required', { status: 400 });
    }

    try {
        const response = await getUrlMeta(url);
        return new Response(JSON.stringify({url: url, title: response.title, favicon: response.favicon}));
    } catch (error) {
        return new Response('Error fetching URL', { status: 500 });
    }
}



async function getUrlMeta(url: string) {
    console.log('Fetching URL meta for:', url);
    try {
        const title = await fetchTitle(url);
        const favicon = new URL(url).origin + '/favicon.ico';
        console.log('Title:', title);
        return { title, favicon };
    } catch (e) {
        const urlMeta = new URL(url);
        console.log('getting error so hostname:', urlMeta.hostname);
        return { title: urlMeta.hostname, favicon: urlMeta.origin + '/favicon.ico' };
    }
}



async function fetchTitle(url: string) {
    // 1) Launch a headless browser
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
        ]
    });
    const page = await browser.newPage();
    await page.setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) ' +
        'AppleWebKit/537.36 (KHTML, like Gecko) ' +
        'Chrome/114.0.0.0 Safari/537.36'
    );
    await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9'
    });

    // 2) Navigate to the URL
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    // === Option A: Use Puppeteer’s built‐in title() helper ===
    const titleA = await page.title();
    console.log('Title (via page.title()):', titleA);

    // === Option B: Evaluate document.title in page context ===
    const titleB = await page.evaluate(() => document.title);
    console.log('Title (via evaluate):', titleB);

    await browser.close();
    return titleA;
}