import type { Element } from '../data/elements';
import { categoryLabels, elements, type ElementCategory } from '../data/elements';
import { ElementCard } from './ElementCard';
import type { CSSProperties, MouseEvent } from 'react';
import { useState } from 'react';

type PeriodicTableProps = {
  selected: Element[];
  query: string;
  onQueryChange: (query: string) => void;
  onToggleElement: (element: Element) => void;
};

const legendOrder: ElementCategory[] = [
  'alkali-metal',
  'alkaline-earth-metal',
  'transition-metal',
  'post-transition-metal',
  'metalloid',
  'reactive-nonmetal',
  'halogen',
  'noble-gas',
  'lanthanide',
  'actinide',
  'unknown',
];

export function PeriodicTable({ selected, query, onQueryChange, onToggleElement }: PeriodicTableProps) {
  const [inspectedElement, setInspectedElement] = useState<Element | null>(null);
  const [popoverPosition, setPopoverPosition] = useState({ x: 280, y: 120 });
  const selectedSymbols = new Set(selected.map((element) => element.symbol));
  const normalisedQuery = query.trim().toLowerCase();
  const filtered = normalisedQuery
    ? elements.filter((element) =>
        element.name.toLowerCase().includes(normalisedQuery) ||
        element.symbol.toLowerCase().includes(normalisedQuery) ||
        String(element.atomicNumber) === normalisedQuery
      )
    : elements;

  function updatePopoverPosition(clientX: number, clientY: number) {
    const width = 340;
    const height = 320;
    const margin = 18;
    const x = clientX + width + margin > window.innerWidth ? clientX - width - margin : clientX + margin;
    const y = clientY + height + margin > window.innerHeight ? window.innerHeight - height - margin : clientY + margin;
    setPopoverPosition({ x: Math.max(margin, x), y: Math.max(margin, y) });
  }

  function inspectElement(element: Element | null, event?: MouseEvent<HTMLButtonElement>) {
    setInspectedElement(element);
    if (event) updatePopoverPosition(event.clientX, event.clientY);
  }

  return (
    <section className="panel periodic-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Choose ingredients</p>
          <h2>Periodic table</h2>
        </div>
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search H, oxygen, 26..."
          aria-label="Search elements"
        />
      </div>

      <div className="periodic-table" aria-label="Periodic table">
        {elements.map((element) => {
          const visible = filtered.includes(element);
          const selectedElement = selectedSymbols.has(element.symbol);
          return (
            <div key={element.symbol} style={{ gridColumn: element.x, gridRow: element.y }} className={visible ? '' : 'filtered-out'}>
              <ElementCard
                element={element}
                selected={selectedElement}
                disabled={selected.length >= 3 && !selectedElement}
                onClick={onToggleElement}
                onHover={inspectElement}
                onMove={(event) => updatePopoverPosition(event.clientX, event.clientY)}
                onFocusElement={setInspectedElement}
              />
            </div>
          );
        })}
      </div>

      {inspectedElement ? (
        <aside
          className="element-popover"
          style={{
            '--tone': inspectedElement.tone,
            left: popoverPosition.x,
            top: popoverPosition.y,
          } as CSSProperties}
        >
          <div className="popover-topline">
            <span>{inspectedElement.atomicNumber}</span>
            <strong>{categoryLabels[inspectedElement.category]}</strong>
          </div>
          <div className="popover-title">
            <b>{inspectedElement.symbol}</b>
            <div>
              <h3>{inspectedElement.name}</h3>
              <p>{inspectedElement.state} at room conditions</p>
            </div>
          </div>
          <dl>
            <div>
              <dt>Discovered</dt>
              <dd>{inspectedElement.discovered}</dd>
            </div>
            <div>
              <dt>Where</dt>
              <dd>{inspectedElement.discoveredAt}</dd>
            </div>
            <div>
              <dt>By</dt>
              <dd>{inspectedElement.discoveredBy}</dd>
            </div>
          </dl>
          <p className="popover-fact">{inspectedElement.funFact}</p>
          {inspectedElement.tryWith.length ? (
            <div className="try-with-row">
              <span>Try with</span>
              <div>
                {inspectedElement.tryWith.map((symbol) => <b key={symbol}>{symbol}</b>)}
              </div>
            </div>
          ) : null}
        </aside>
      ) : null}

      <div className="legend">
        {legendOrder.map((category) => {
          const sample = elements.find((element) => element.category === category);
          return (
            <span key={category} style={{ '--tone': sample?.tone ?? '#94a3b8' } as CSSProperties}>
              {categoryLabels[category]}
            </span>
          );
        })}
      </div>
    </section>
  );
}
