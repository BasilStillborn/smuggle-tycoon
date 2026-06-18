import type { Element } from '../data/elements';
import { ElementCard } from './ElementCard';
import { audioEngine } from '../core/audioEngine';

type ControlPanelProps = {
  selected: Element[];
  onToggleElement: (element: Element) => void;
  onLoadIntoChamber: () => void;
  onReset: () => void;
  hint: string;
};

export function ControlPanel({
  selected,
  onToggleElement,
  onLoadIntoChamber,
  onReset,
  hint,
}: ControlPanelProps) {
  const handleLoad = () => {
    audioEngine.buttonClick();
    onLoadIntoChamber();
  };

  const handleReset = () => {
    audioEngine.buttonClick();
    onReset();
  };
  return (
    <section className="panel controls-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Staging tray</p>
          <h2>{selected.length}/3 selected</h2>
        </div>
        <button type="button" className="ghost-button" onClick={handleReset}>Reset</button>
      </div>

      <div className="selected-tray">
        {selected.map((element) => (
          <ElementCard key={element.symbol} element={element} selected disabled={false} compact onClick={onToggleElement} />
        ))}
        {Array.from({ length: 3 - selected.length }, (_, index) => (
          <div key={index} className="empty-slot">empty slot</div>
        ))}
      </div>

      <div className="lab-hint">
        <strong>Lab hint</strong>
        <span>{hint}</span>
      </div>

      <button type="button" className="react-button" onClick={handleLoad} disabled={selected.length === 0}>
        Load into Chamber
      </button>
    </section>
  );
}
