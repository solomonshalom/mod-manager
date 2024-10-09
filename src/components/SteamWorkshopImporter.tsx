import React, { useState } from 'react';
import axios from 'axios';
import { Mod } from '../db';
import * as cheerio from 'cheerio';

interface SteamWorkshopImporterProps {
  onImport: (mod: Omit<Mod, 'id'>) => void;
  onCancel: () => void;
}

const SteamWorkshopImporter: React.FC<SteamWorkshopImporterProps> = ({ onImport, onCancel }) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const scrapeWorkshopData = async (url: string) => {
    try {
      const corsProxy = 'https://api.allorigins.win/get?url=';
      const encodedUrl = encodeURIComponent(url);
      const response = await axios.get(`${corsProxy}${encodedUrl}`);
      
      const html = response.data.contents;
      const $ = cheerio.load(html);

      const workshopId = url.match(/\?id=(\d+)/)?.[1];
      if (!workshopId) throw new Error('Invalid workshop URL');

      const title = $('.workshopItemTitle').text().trim();
      const description = $('.workshopItemDescription').text().trim();
      const thumbnailUrl = $('.workshopItemPreviewImage').attr('src') || '';
      const author = $('.workshopItemAuthorName a').text().trim();
      const lastUpdated = $('.detailsStatRight:contains("Updated")').next().text().trim();

      if (!title) {
        throw new Error('Could not find mod information');
      }

      return {
        name: title,
        description,
        steamWorkshopId: workshopId,
        thumbnailUrl,
        author,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error('Failed to fetch workshop data. Make sure the URL is correct and try again.');
    }
  };

  const handleImport = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Basic URL validation
      if (!url.includes('steamcommunity.com/sharedfiles/filedetails/?id=')) {
        throw new Error('Invalid Steam Workshop URL');
      }

      const modData = await scrapeWorkshopData(url);
      onImport(modData);
    } catch (err) {
      console.error('Import error:', err);
      setError(err instanceof Error ? err.message : 'Failed to import mod');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="steam-workshop-importer">
      <div className="field-row">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter Steam Workshop URL"
        />
      </div>
      <div className="field-row">
        <button type="button" onClick={handleImport} disabled={isLoading || !url}>
          {isLoading ? 'Importing...' : 'Import'}
        </button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default SteamWorkshopImporter;