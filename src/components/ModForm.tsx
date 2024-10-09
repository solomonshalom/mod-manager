import React, { useState, useEffect } from 'react';
import { Mod } from '../db';
import SteamWorkshopImporter from './SteamWorkshopImporter';

interface ModFormProps {
  mod?: Mod;
  onSave: (mod: Omit<Mod, 'id'>) => void;
  onCancel: () => void;
}

// Extend the Mod interface to include Steam Workshop fields
interface ExtendedMod extends Mod {
  steamWorkshopId?: string;
  thumbnailUrl?: string;
  author?: string;
  lastUpdated?: string;
}

const categories = ['Gameplay', 'Graphics', 'Audio', 'UI', 'Cheats', 'Steam Workshop', 'Other'];

const ModForm: React.FC<ModFormProps> = ({ mod, onSave, onCancel }) => {
  const [name, setName] = useState(mod?.name || '');
  const [description, setDescription] = useState(mod?.description || '');
  const [content, setContent] = useState(mod?.content || '');
  const [category, setCategory] = useState(mod?.category || 'Other');
  const [showImporter, setShowImporter] = useState(false);
  const [steamWorkshopId, setSteamWorkshopId] = useState((mod as ExtendedMod)?.steamWorkshopId || '');
  const [thumbnailUrl, setThumbnailUrl] = useState((mod as ExtendedMod)?.thumbnailUrl || '');
  const [author, setAuthor] = useState((mod as ExtendedMod)?.author || '');

  useEffect(() => {
    if (mod) {
      setName(mod.name);
      setDescription(mod.description);
      setContent(mod.content);
      setCategory(mod.category);
      
      // Set Steam Workshop specific fields if they exist
      const extendedMod = mod as ExtendedMod;
      if (extendedMod.steamWorkshopId) {
        setSteamWorkshopId(extendedMod.steamWorkshopId);
        setThumbnailUrl(extendedMod.thumbnailUrl || '');
        setAuthor(extendedMod.author || '');
      }
    }
  }, [mod]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const modData: Omit<ExtendedMod, 'id'> = {
      name,
      description,
      content,
      category,
      createdAt: mod?.createdAt || new Date(),
      updatedAt: new Date(),
      steamWorkshopId,
      thumbnailUrl,
      author,
    };
    onSave(modData);
  };

  const handleImport = (importedMod: Omit<ExtendedMod, 'id'>) => {
    setName(importedMod.name);
    setDescription(importedMod.description);
    // Create a markdown content from the imported data
    const markdownContent = `
# ${importedMod.name}

${importedMod.description}

---
**Steam Workshop ID**: ${importedMod.steamWorkshopId}
**Author**: ${importedMod.author}
**Last Updated**: ${new Date(importedMod.lastUpdated || '').toLocaleDateString()}

![Mod Thumbnail](${importedMod.thumbnailUrl})
    `.trim();

    setContent(markdownContent);
    setCategory('Steam Workshop');
    setSteamWorkshopId(importedMod.steamWorkshopId || '');
    setThumbnailUrl(importedMod.thumbnailUrl || '');
    setAuthor(importedMod.author || '');
    setShowImporter(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <fieldset>
        <legend>{mod ? 'Edit Mod' : 'New Mod'}</legend>
        <div className="field-row">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="field-row">
          <label htmlFor="category">Category:</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="field-row">
          <label htmlFor="description">Description:</label>
          <input
            type="text"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="field-row">
          <label htmlFor="content">Content (Markdown):</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          ></textarea>
        </div>
        {!showImporter && (
          <div className="field-row">
            <button type="button" onClick={() => setShowImporter(true)}>
              Import from Steam Workshop
            </button>
          </div>
        )}
        {showImporter && (
          <SteamWorkshopImporter 
            onImport={handleImport} 
            onCancel={() => setShowImporter(false)} 
          />
        )}
      </fieldset>
      <div className="button-row">
        <button type="button" onClick={onCancel}>Cancel</button>
        <button type="submit">Save</button>
      </div>
    </form>
  );
};

export default ModForm;