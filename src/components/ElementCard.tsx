import type { Element } from '../data/elements';
import { categoryLabels } from '../data/elements';
import type { CSSProperties, MouseEvent } from 'react';
import { audioEngine } from '../core/audioEngine';

type ElementCardProps = {
  element: Element;
  selected: boolean;
  disabled: boolean;
  compact?: boolean;
  onClick: (element: Element) => void;
  onHover?: (element: Element | null, event?: MouseEvent<HTMLButtonElement>) => void;
  onMove?: (event: MouseEvent<HTMLButtonElement>) => void;
  onFocusElement?: (element: Element | null) => void;
};

export function ElementCard({ element, selected, disabled, compact = false, onClick, onHover, onMove, onFocusElement }: ElementCardProps) {
  const handleClick = (el: Element) => {
    if (!selected) {
      audioEngine.elementSelect(el.category);
    } else {
      audioEngine.elementDeselect();
    }
    onClick(el);
  };

  return (
    <button
      type="button"
      className={`element-card ${selected ? 'selected' : ''} ${disabled ? 'disabled' : ''} ${compact ? 'compact' : ''}`}
      style={{ '--tone': element.tone } as CSSProperties}
      onClick={() => handleClick(element)}
      onMouseEnter={(event) => onHover?.(element, event)}
      onMouseMove={onMove}
      onMouseLeave={() => onHover?.(null)}
      onFocus={() => onFocusElement?.(element)}
      onBlur={() => onFocusElement?.(null)}
      disabled={disabled && !selected}
      aria-label={`${element.name}, ${categoryLabels[element.category]}`}
    >
      <span className="atomic-number">{element.atomicNumber}</span>
      <strong>{element.symbol}</strong>
      <span>{element.name}</span>
    </button>
  );
}