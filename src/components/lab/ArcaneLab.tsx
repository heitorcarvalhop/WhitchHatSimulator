import { useMemo, useState } from 'react';
import type { CustomSpell, SpellDifficulty, SpellElement, SpellTemplate } from '@/types';
import { useAppState } from '@/app/useAppState';
import { Button } from '@/components/common/Button';
import { Icon } from '@/components/common/Icon';
import { SpellSymbolPreview } from '@/components/common/SpellSymbolPreview';
import { PARTICLE_PRESETS } from '@/particles/presets';
import { validateCustomSpell } from '@/storage/validation';
import { createId } from '@/utils/id';
import { DIFFICULTY_LABELS, ELEMENT_LABELS } from '@/utils/formatters';
import { SymbolEditor } from './SymbolEditor';
import { SpellTester } from './SpellTester';
import { ImportExport } from './ImportExport';
import './arcane-lab.css';

interface Draft {
  id: string | null;
  name: string;
  element: SpellElement;
  difficulty: SpellDifficulty;
  description: string;
  lore: string;
  energyCost: number;
  color: string;
  particlePresetId: string;
  soundId: SpellElement;
  unlockLevel: number;
  template: SpellTemplate | null;
}

const ELEMENTS = Object.keys(ELEMENT_LABELS) as SpellElement[];
const DIFFICULTIES = Object.keys(DIFFICULTY_LABELS) as SpellDifficulty[];
const PRESET_IDS = Object.keys(PARTICLE_PRESETS);

function emptyDraft(): Draft {
  return {
    id: null,
    name: '',
    element: 'arcane',
    difficulty: 'adept',
    description: '',
    lore: '',
    energyCost: 22,
    color: '#c9a8ff',
    particlePresetId: 'energy',
    soundId: 'arcane',
    unlockLevel: 0,
    template: null,
  };
}

export function ArcaneLab() {
  const { customSpells, saveCustomSpell, deleteCustomSpell, duplicateCustomSpell } = useAppState();
  const [draft, setDraft] = useState<Draft>(emptyDraft());
  const [errors, setErrors] = useState<string[]>([]);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const isEditing = draft.id !== null;

  const candidatePayload = useMemo(
    () => ({
      id: draft.id ?? createId('custom-spell'),
      name: draft.name,
      element: draft.element,
      difficulty: draft.difficulty,
      description: draft.description,
      lore: draft.lore,
      energyCost: draft.energyCost,
      color: draft.color,
      template: draft.template,
      particlePresetId: draft.particlePresetId,
      soundId: draft.soundId,
      unlockLevel: draft.unlockLevel,
    }),
    [draft],
  );

  const handleSave = () => {
    const result = validateCustomSpell(candidatePayload);
    if (!result.valid || !draft.template) {
      setErrors(
        draft.template
          ? result.errors
          : [...result.errors, 'Desenhe o símbolo do feitiço antes de salvar.'],
      );
      setSavedMessage(null);
      return;
    }
    setErrors([]);
    saveCustomSpell({ ...candidatePayload, template: draft.template });
    setSavedMessage(`"${draft.name}" foi salvo no seu grimório.`);
    setDraft(emptyDraft());
  };

  const handleEdit = (spell: CustomSpell) => {
    setDraft({
      id: spell.id,
      name: spell.name,
      element: spell.element,
      difficulty: spell.difficulty,
      description: spell.description,
      lore: spell.lore,
      energyCost: spell.energyCost,
      color: spell.color,
      particlePresetId: spell.particlePresetId,
      soundId: (spell.soundId as SpellElement) ?? spell.element,
      unlockLevel: spell.unlockLevel,
      template: spell.template,
    });
    setSavedMessage(null);
    setErrors([]);
  };

  return (
    <div className="arcane-lab">
      <header className="arcane-lab__header">
        <h1>
          <Icon name="flask" size={22} /> Laboratório Arcano
        </h1>
        <p>
          Desenhe um novo símbolo, configure seus atributos e adicione feitiços personalizados ao
          seu grimório.
        </p>
      </header>

      <div className="arcane-lab__layout">
        <section className="arcane-lab__editor glass-panel">
          <h2>{isEditing ? `Editando: ${draft.name || 'sem nome'}` : 'Novo feitiço'}</h2>

          <SymbolEditor
            color={draft.color}
            orderMatters={draft.template?.orderMatters ?? true}
            onOrderMattersChange={(orderMatters) =>
              setDraft((d) =>
                d.template ? { ...d, template: { ...d.template, orderMatters } } : d,
              )
            }
            onTemplateChange={(template) => setDraft((d) => ({ ...d, template }))}
          />

          <div className="arcane-lab__form">
            <label>
              Nome
              <input
                value={draft.name}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                maxLength={40}
              />
            </label>

            <label>
              Elemento
              <select
                value={draft.element}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, element: e.target.value as SpellElement }))
                }
              >
                {ELEMENTS.map((el) => (
                  <option key={el} value={el}>
                    {ELEMENT_LABELS[el]}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Dificuldade
              <select
                value={draft.difficulty}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, difficulty: e.target.value as SpellDifficulty }))
                }
              >
                {DIFFICULTIES.map((diff) => (
                  <option key={diff} value={diff}>
                    {DIFFICULTY_LABELS[diff]}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Custo de energia ({draft.energyCost})
              <input
                type="range"
                min={5}
                max={60}
                value={draft.energyCost}
                onChange={(e) => setDraft((d) => ({ ...d, energyCost: Number(e.target.value) }))}
              />
            </label>

            <label>
              Nível necessário ({draft.unlockLevel})
              <input
                type="range"
                min={0}
                max={20}
                value={draft.unlockLevel}
                onChange={(e) => setDraft((d) => ({ ...d, unlockLevel: Number(e.target.value) }))}
              />
            </label>

            <label>
              Preset de partículas
              <select
                value={draft.particlePresetId}
                onChange={(e) => setDraft((d) => ({ ...d, particlePresetId: e.target.value }))}
              >
                {PRESET_IDS.map((id) => (
                  <option key={id} value={id}>
                    {PARTICLE_PRESETS[id]?.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Perfil sonoro
              <select
                value={draft.soundId}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, soundId: e.target.value as SpellElement }))
                }
              >
                {ELEMENTS.map((el) => (
                  <option key={el} value={el}>
                    {ELEMENT_LABELS[el]}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Cor
              <input
                type="color"
                value={draft.color}
                onChange={(e) => setDraft((d) => ({ ...d, color: e.target.value }))}
              />
            </label>

            <label className="arcane-lab__wide">
              Descrição
              <textarea
                value={draft.description}
                onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                rows={2}
                maxLength={400}
              />
            </label>

            <label className="arcane-lab__wide">
              História (lore)
              <textarea
                value={draft.lore}
                onChange={(e) => setDraft((d) => ({ ...d, lore: e.target.value }))}
                rows={2}
                maxLength={800}
              />
            </label>
          </div>

          {errors.length > 0 && (
            <ul className="arcane-lab__errors">
              {errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          )}
          {savedMessage && <p className="arcane-lab__saved">{savedMessage}</p>}

          <div className="arcane-lab__form-actions">
            <Button icon="check" variant="primary" onClick={handleSave}>
              {isEditing ? 'Salvar alterações' : 'Salvar feitiço'}
            </Button>
            {isEditing && (
              <Button variant="ghost" onClick={() => setDraft(emptyDraft())}>
                Cancelar edição
              </Button>
            )}
          </div>
        </section>

        <section className="arcane-lab__tester glass-panel">
          <h2>Testar</h2>
          <SpellTester template={draft.template} color={draft.color} />
        </section>

        <section className="arcane-lab__list glass-panel">
          <h2>Feitiços personalizados</h2>
          <ImportExport spells={customSpells} onImport={(spell) => saveCustomSpell(spell)} />
          <ul>
            {customSpells.map((spell) => (
              <li key={spell.id} className="arcane-lab__list-item">
                <SpellSymbolPreview template={spell.template} color={spell.color} size={32} />
                <span className="arcane-lab__list-name">{spell.name}</span>
                <div className="arcane-lab__list-actions">
                  <button
                    onClick={() => handleEdit(spell)}
                    aria-label={`Editar ${spell.name}`}
                    title="Editar"
                  >
                    <Icon name="edit" size={15} />
                  </button>
                  <button
                    onClick={() => duplicateCustomSpell(spell.id)}
                    aria-label={`Duplicar ${spell.name}`}
                    title="Duplicar"
                  >
                    <Icon name="copy" size={15} />
                  </button>
                  <button
                    onClick={() => deleteCustomSpell(spell.id)}
                    aria-label={`Excluir ${spell.name}`}
                    title="Excluir"
                    className="is-danger"
                  >
                    <Icon name="trash" size={15} />
                  </button>
                </div>
              </li>
            ))}
            {customSpells.length === 0 && (
              <li className="arcane-lab__empty">Nenhum feitiço personalizado ainda.</li>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
