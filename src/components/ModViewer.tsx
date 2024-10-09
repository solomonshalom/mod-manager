import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Mod } from '../db';

interface ModViewerProps {
  mod: Mod;
  onEdit: () => void;
}

const ModViewer: React.FC<ModViewerProps> = ({ mod, onEdit }) => {
  return (
    <div>
      <fieldset>
        <legend>{mod.name}</legend>
        <p><strong>Category:</strong> {mod.category}</p>
        <p>{mod.description}</p>
        <div className="markdown-content">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{mod.content}</ReactMarkdown>
        </div>
        <div className="button-row">
          <button onClick={onEdit}>Edit</button>
        </div>
      </fieldset>
    </div>
  );
};

export default ModViewer;