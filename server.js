import express from 'express';
import { createServer as createViteServer } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import cors from 'cors';
import puppeteer from 'puppeteer';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function createServer() {
  const app = express();
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });

  app.use(vite.middlewares);
  app.use(cors());
  app.use(express.json());

  app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
  });

  app.post('/api/scrape-workshop', async (req, res) => {
    try {
      const { url } = req.body;
      console.log('Scraping URL:', url);

      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'networkidle0' });

      const mods = await page.evaluate(() => {
        const isCollection = document.querySelector('.collectionItem') !== null;
        let modsData = [];

        if (isCollection) {
          const items = document.querySelectorAll('.collectionItem');
          items.forEach((item) => {
            const name = item.querySelector('.workshopItemTitle')?.textContent?.trim() || '';
            const description = item.querySelector('.workshopItemDescription')?.textContent?.trim() || '';
            modsData.push({ name, description });
          });
        } else {
          const name = document.querySelector('.workshopItemTitle')?.textContent?.trim() || '';
          const description = document.querySelector('.workshopItemDescription')?.textContent?.trim() || '';
          modsData.push({ name, description });
        }

        return modsData;
      });

      await browser.close();

      console.log('Scraped mods:', mods);

      if (mods.length === 0) {
        throw new Error('No mods found on the page');
      }

      const formattedMods = mods.map(mod => ({
        name: mod.name,
        description: mod.description,
        category: 'Steam Workshop',
        content: `Imported from Steam Workshop: ${url}\n\nDescription: ${mod.description}`,
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      res.json(formattedMods);
    } catch (error) {
      console.error('Error scraping Steam Workshop:', error);
      res.status(500).json({ error: 'Failed to scrape Steam Workshop', details: error.message });
    }
  });

  app.use('*', async (req, res, next) => {
    const url = req.originalUrl;

    try {
      let template = await vite.transformIndexHtml(url, '');
      res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

createServer();