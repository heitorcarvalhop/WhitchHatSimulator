import { useRef, useState } from 'react';
import type { CustomSpell } from '@/types';
import { Button } from '@/components/common/Button';
import { sanitizeCustomSpell, validateCustomSpell } from '@/storage/validation';
import './import-export.css';

export interface ImportExportProps {
  spells: CustomSpell[];
  onImport: (spell: CustomSpell) => void;
}

export function ImportExport({ spells, onImport }: ImportExportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(spells, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'arcane-forge-custom-spells.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFile = async (file: File) => {
    setErrors([]);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const candidates = Array.isArray(parsed) ? parsed : [parsed];
      const collectedErrors: string[] = [];

      for (const candidate of candidates) {
        const result = validateCustomSpell(candidate);
        if (result.valid) {
          onImport(sanitizeCustomSpell(candidate));
        } else {
          collectedErrors.push(...result.errors.map((e) => `"${candidate?.name ?? '?'}": ${e}`));
        }
      }
      setErrors(collectedErrors);
    } catch {
      setErrors(['Não foi possível interpretar o arquivo JSON selecionado.']);
    }
  };

  return (
    <div className="import-export">
      <div className="import-export__actions">
        <Button
          icon="download"
          variant="ghost"
          size="sm"
          onClick={handleExport}
          disabled={spells.length === 0}
        >
          Exportar todos (JSON)
        </Button>
        <Button
          icon="upload"
          variant="ghost"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
        >
          Importar JSON
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="visually-hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
            e.target.value = '';
          }}
        />
      </div>
      {errors.length > 0 && (
        <ul className="import-export__errors">
          {errors.map((err, i) => (
            <li key={i}>{err}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
