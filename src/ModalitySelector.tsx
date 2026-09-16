import { motion, useReducedMotion } from 'motion/react';

export const modalities = [
  { name: 'Muay Thai', description: 'Golpes, combinações e movimentação. Conheça o Muay Thai com o Shark.' },
  { name: 'MMA', description: 'A luta em pé e no solo. Conheça o MMA com o Shark.' },
  { name: 'Boxe', description: 'Guarda, golpes e jogo de pernas. Conheça o Boxe com o Shark.' },
];

export default function ModalitySelector({ selected, onSelect }: { selected: number; onSelect: (index: number) => void }) {
  const reducedMotion = useReducedMotion();
  return (
    <div className="modality-selector">
      <p className="modality-label">AULAS PARTICULARES DE</p>
      <div className="modality-options" role="group" aria-label="Escolha a modalidade de interesse">
        {modalities.map((modality, index) => (
          <button key={modality.name} type="button" aria-pressed={selected === index} onClick={() => onSelect(index)}>{modality.name}</button>
        ))}
      </div>
      <div className="modality-description" aria-live="polite" aria-atomic="true">
        <motion.p key={selected} initial={{ opacity: reducedMotion ? 1 : .3, y: reducedMotion ? 0 : 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .2 }}>
          {modalities[selected].description}
        </motion.p>
      </div>
    </div>
  );
}
