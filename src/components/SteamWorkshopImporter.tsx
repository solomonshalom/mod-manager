import React, { useState } from 'react';
import axios from 'axios';
import { Mod } from '../db';

interface SteamWorkshopImporterProps {
  onImport: (mod: Omit<Mod, 'id'>) => void;
  onCancel: () => void;
}

const SteamWorkshopImporter: React.FC<SteamWorkshopImporterProps> = ({ onImport, onCancel }) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImport = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/scrape-workshop', { url });
      const scrapedMods = response.data;
      if (scrapedMods.length === 0) {
        throw new Error('No mods found on the page');
      }
      onImport(scrapedMods[0]); // Import the first mod if multiple are found
    } catch (err) {
      console.error('Import error:', err);
      setError(`Failed to import mod: ${err.response?.data?.details || err.message}`);
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