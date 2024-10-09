import React, { useState, useEffect } from 'react';
import { Mod } from '../db';
import SteamWorkshopImporter from './SteamWorkshopImporter';

interface ModFormProps {
  mod?: Mod;
  onSave: (mod: Omit<Mod, 'id'>) => void;
  onCancel: () => void;
}

const categories = ['Gameplay', 'Graphics', 'Audio', 'UI', 'Cheats', 'Steam Workshop', 'Other'];

const ModForm: React.FC<ModFormProps> = ({ mod, onSave, onCancel }) => {
  const [name, setName] = useState(mod?.name || '');
  const [description, setDescription] = useState(mod?.description || '');
  const [content, setContent] = useState(mod?.content || '');
  const [category, setCategory] = useState(mod?.category || 'Other');
  const [showImporter, setShowImporter] = useState(false);

  useEffect(() => {
    if (mod) {
      setName(mod.name);
      setDescription(mod.description);
      setContent(mod.content);
      setCategory(mod.category);
    }
  }, [mod]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      description,
      content,
      category,
      createdAt: mod?.createdAt || new Date(),
      updatedAt: new Date(),
    });
  };

  const handleImport = (importedMod: Omit<Mod, 'id'>) => {
    setName(importedMod.name);
    setDescription(importedMod.description);
    setContent(importedMod.content);
    setCategory(importedMod.category);
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
          <SteamWorkshopImporter onImport={handleImport} onCancel={() => setShowImporter(false)} />
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