import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, Mod } from './db';
import ModList from './components/ModList';
import ModForm from './components/ModForm';
import ModViewer from './components/ModViewer';

function App() {
  const [selectedMod, setSelectedMod] = useState<Mod | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [serverStatus, setServerStatus] = useState<string>('Checking...');

  const mods = useLiveQuery(() => db.mods.toArray());

  useEffect(() => {
    fetch('/api/health')
      .then(response => response.json())
      .then(data => setServerStatus(data.message))
      .catch(error => setServerStatus('Server error: ' + error.message));
  }, []);

  const handleSave = async (modData: Omit<Mod, 'id'>) => {
    if (selectedMod && selectedMod.id) {
      await db.mods.update(selectedMod.id, modData);
    } else {
      await db.mods.add(modData);
    }
    setSelectedMod(null);
    setIsEditing(false);
  };

  const handleDelete = async (id: number) => {
    await db.mods.delete(id);
    if (selectedMod && selectedMod.id === id) {
      setSelectedMod(null);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  return (
    <div className="window" style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
      <div className="title-bar">
        <div className="title-bar-text">Retro Game Mod Manager</div>
        <div className="title-bar-controls">
          <button aria-label="Minimize"></button>
          <button aria-label="Maximize"></button>
          <button aria-label="Close"></button>
        </div>
      </div>
      <div className="window-body">
        <p>Server Status: {serverStatus}</p>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ width: '40%' }}>
            <fieldset>
              <legend>Mods</legend>
              <ModList
                mods={mods || []}
                selectedMod={selectedMod}
                onSelect={setSelectedMod}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </fieldset>
            <div className="field-row">
              <button onClick={() => { setSelectedMod(null); setIsEditing(true); }}>New Mod</button>
            </div>
          </div>
          <div style={{ width: '60%' }}>
            {isEditing ? (
              <ModForm
                mod={selectedMod || undefined}
                onSave={handleSave}
                onCancel={() => {
                  setSelectedMod(null);
                  setIsEditing(false);
                }}
              />
            ) : selectedMod ? (
              <ModViewer mod={selectedMod} onEdit={handleEdit} />
            ) : (
              <div className="markdown-content">
                <p>Select a mod to view or create a new one.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;