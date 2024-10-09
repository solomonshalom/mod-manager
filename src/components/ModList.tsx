import React from 'react';
import { Mod } from '../db';
import { Trash2 } from 'lucide-react';

interface ModListProps {
  mods: Mod[];
  selectedMod: Mod | null;
  onSelect: (mod: Mod) => void;
  onEdit: () => void;
  onDelete: (id: number) => void;
}

const ModList: React.FC<ModListProps> = ({ mods, selectedMod, onSelect, onEdit, onDelete }) => {
  const groupedMods = mods.reduce((acc, mod) => {
    if (!acc[mod.category]) {
      acc[mod.category] = [];
    }
    acc[mod.category].push(mod);
    return acc;
  }, {} as Record<string, Mod[]>);

  return (
    <div className="mod-list">
      {Object.entries(groupedMods).map(([category, categoryMods]) => (
        <div key={category}>
          <div className="category-header">{category}</div>
          {categoryMods.map((mod) => (
            <div
              key={mod.id}
              className={`mod-item ${selectedMod?.id === mod.id ? 'selected' : ''}`}
            >
              <span onClick={() => onSelect(mod)}>{mod.name}</span>
              <button
                className="delete-button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm(`Are you sure you want to delete "${mod.name}"?`)) {
                    onDelete(mod.id!);
                  }
                }}
                title="Delete mod"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default ModList;