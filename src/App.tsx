import { useEffect, useMemo, useState } from 'react';
import { PeriodicTable } from './components/PeriodicTable';
import { ReactionChamber } from './components/ReactionChamber';
import { LearningPanel } from './components/LearningPanel';
import { DiscoveryShelf } from './components/DiscoveryShelf';
import { StarterExperiments } from './components/StarterExperiments';
import { ReactionCelebration } from './components/ReactionCelebration';
import { ElementCard } from './components/ElementCard';
import type { Element } from './data/elements';
import { getElement } from './data/elements';
import type { Environment, ReactionResult } from './data/reactions';
import { starterExperiments, type StarterExperiment } from './data/starterExperiments';
import { simulateReaction } from './core/reactionEngine';
import { defaultPreferences, pressureToAirDensity, type UserPreferences } from './core/units';
import { audioEngine } from './core/audioEngine';

const initialEnvironment: Environment = {
  temperature: 295,
  pressureAtm: 1,
};

function loadDiscoveries(): ReactionResult[] {
  try {
    const raw = localStorage.getItem('elementary_discoveries');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function loadPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem('elementary_preferences');
    return raw ? { ...defaultPreferences, ...JSON.parse(raw) } : defaultPreferences;
  } catch {
    return defaultPreferences;
  }
}

function getBeginnerHint(selected: Element[], environment: Environment, result: ReactionResult) {
  const symbols = selected.map((element) => element.symbol);
  if (selected.length === 0) return 'Start with a classic mission below, or try Hydrogen + Oxygen with high heat.';
  if (result.id.includes('waiting') && environment.temperature < 420) return 'Good ingredients. This one is waiting for activation energy, so raise the temperature.';
  if (result.id.includes('waiting') && pressureToAirDensity(environment.pressureAtm) < 35) return 'The ingredients are right, but the chamber needs more pressure or oxygen-rich air.';
  if (symbols.some((symbol) => ['He', 'Ne', 'Ar'].includes(symbol)) && selected.length < 3) return 'Noble gases are calm. Add a reactive partner like oxygen, sodium, or chlorine.';
  if (result.reactionType === 'inert') return 'No big reaction yet. Try adding heat, pressure, oxygen, or a halogen partner.';
  return 'Looks promising. Load into the chamber and see what happens!';
}

function App() {
  const [staged, setStaged] = useState<Element[]>([]);
  const [chamberElements, setChamberElements] = useState<Element[]>([]);
  const [environment, setEnvironment] = useState<Environment>(initialEnvironment);
  const [query, setQuery] = useState('');
  const [runId, setRunId] = useState(0);
  const [discoveries, setDiscoveries] = useState<ReactionResult[]>(loadDiscoveries);
  const [preferences, setPreferences] = useState<UserPreferences>(loadPreferences);
  const [productsInChamber, setProductsInChamber] = useState<string[]>([]);
  const [muted, setMuted] = useState(false);

  const chamberResult = useMemo(() => simulateReaction(chamberElements, environment), [chamberElements, environment, runId]);
  const stagingResult = useMemo(() => simulateReaction(staged, environment), [staged, environment]);
  const beginnerHint = useMemo(() => getBeginnerHint(staged, environment, stagingResult), [staged, environment, stagingResult]);

  useEffect(() => {
    audioEngine.init();
    document.addEventListener('click', () => audioEngine.resume(), { once: true });
  }, []);

  useEffect(() => {
    audioEngine.setMuted(muted);
  }, [muted]);

  useEffect(() => {
    audioEngine.updateEnvironment(environment.temperature, environment.pressureAtm);
  }, [environment]);

  useEffect(() => {
    localStorage.setItem('elementary_discoveries', JSON.stringify(discoveries));
  }, [discoveries]);

  useEffect(() => {
    localStorage.setItem('elementary_preferences', JSON.stringify(preferences));
  }, [preferences]);

  function toggleElement(element: Element) {
    setStaged((current) => {
      if (current.some((item) => item.symbol === element.symbol)) {
        return current.filter((item) => item.symbol !== element.symbol);
      }
      if (current.length >= 3) return current;
      return [...current, element];
    });
  }

  function loadIntoChamber() {
    if (staged.length === 0) return;
    const next = simulateReaction(staged, environment);
    setChamberElements(staged);
    setStaged([]);
    setRunId((current) => current + 1);
    if (next.id !== 'empty-chamber' && !next.id.includes('waiting')) {
      setDiscoveries((current) => [next, ...current.filter((item) => item.id !== next.id)]);
      if (next.products.length > 0 && next.reactionType !== 'inert') {
        setProductsInChamber((current) => [...new Set([...next.products, ...current])].slice(0, 4));
      }
    }
  }

  function reset() {
    setStaged([]);
    setChamberElements([]);
    setEnvironment(initialEnvironment);
    setProductsInChamber([]);
    setQuery('');
    setRunId((current) => current + 1);
  }

  function loadExperiment(experiment: StarterExperiment) {
    const loaded = experiment.symbols.map((symbol) => getElement(symbol)).filter((element): element is Element => Boolean(element));
    setStaged(loaded);
    setChamberElements([]);
    setEnvironment(experiment.environment);
    setProductsInChamber([]);
    setRunId((current) => current + 1);
  }

  return (
    <main className="app-shell">
      <header className="top-bar">
        <div className="top-bar-atom" aria-hidden="true">
          <svg viewBox="0 0 56 56">
            <ellipse className="atom-orbit" cx="28" cy="28" rx="24" ry="7" />
            <ellipse className="atom-orbit" cx="28" cy="28" rx="7" ry="24" />
            <ellipse className="atom-orbit" cx="28" cy="28" rx="18" ry="18" />
            <g className="atom-orbit-group-1">
              <ellipse className="atom-orbit" cx="28" cy="28" rx="24" ry="7" />
              <circle className="atom-electron" cx="52" cy="28" r="3.5" />
            </g>
            <g className="atom-orbit-group-2">
              <ellipse className="atom-orbit" cx="28" cy="28" rx="7" ry="24" />
              <circle className="atom-electron" cx="28" cy="4" r="3.5" />
            </g>
            <g className="atom-orbit-group-3">
              <ellipse className="atom-orbit" cx="28" cy="28" rx="18" ry="18" />
              <circle className="atom-electron" cx="10" cy="10" r="3.5" />
            </g>
            <circle className="atom-nucleus" cx="28" cy="28" r="6" />
            <circle className="atom-nucleus" cx="24" cy="25" r="3.5" opacity="0.7" />
            <circle className="atom-nucleus" cx="32" cy="26" r="3" opacity="0.6" />
            <circle className="atom-nucleus" cx="27" cy="32" r="2.5" opacity="0.5" />
          </svg>
        </div>
        <div>
          <p className="eyebrow">desktop lab</p>
          <h1>elementary</h1>
          <p className="tagline">Mix elements. Discover reactions. Learn chemistry.</p>
        </div>
        <div className="status-pill">
          <span>{staged.length}/3 staged</span>
          <strong>{window.elementaryDesktop ? `Desktop ${window.elementaryDesktop.platform}` : 'Browser preview'}</strong>
        </div>
        <button
          className="mute-toggle"
          onClick={() => setMuted(!muted)}
          aria-label={muted ? 'Unmute' : 'Mute'}
          title={muted ? 'Unmute' : 'Mute'}
        >
          {muted ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <line x1="23" y1="9" x2="17" y2="15"></line>
              <line x1="17" y1="9" x2="23" y2="15"></line>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            </svg>
          )}
        </button>
      </header>

      <div className="workspace">
        {/* Step 1: Pick Elements */}
        <section className={`step-section step-pick ${staged.length < 3 ? 'step-active' : ''}`}>
          <div className="step-header">
            <span className="step-badge">1</span>
            <div>
              <h2 className="step-title">Pick Elements</h2>
              <p className="step-desc">Click elements on the periodic table to add them to your tray</p>
            </div>
          </div>
          <PeriodicTable selected={staged} query={query} onQueryChange={setQuery} onToggleElement={toggleElement} />
        </section>

        {/* Step 2: Staging Tray */}
        <section className={`step-section ${staged.length > 0 ? 'step-active' : ''}`}>
          <div className="step-header">
            <span className="step-badge">2</span>
            <div>
              <h2 className="step-title">Staging Tray</h2>
              <p className="step-desc">Review your selection, then load into the chamber</p>
            </div>
          </div>

          <div className="staging-area">
            <div className="staging-slots">
              {staged.map((element) => (
                <ElementCard key={element.symbol} element={element} selected disabled={false} compact onClick={toggleElement} />
              ))}
              {Array.from({ length: 3 - staged.length }, (_, index) => (
                <div key={index} className="staging-slot-empty">
                  <span>+</span>
                </div>
              ))}
            </div>

            <div className="staging-actions">
              <button type="button" className="react-button staging-load-btn" onClick={loadIntoChamber} disabled={staged.length === 0}>
                Load into Chamber &rarr;
              </button>
              <button type="button" className="ghost-button staging-reset-btn" onClick={reset}>Reset</button>
            </div>
          </div>

          {staged.length > 0 && (
            <div className="staging-hint">
              <strong>Lab hint</strong>
              <span>{beginnerHint}</span>
            </div>
          )}
        </section>

        {/* Step 3: Reaction Chamber */}
        <section className={`step-section step-chamber ${chamberElements.length > 0 ? 'step-active' : ''}`}>
          <div className="step-header">
            <span className="step-badge">3</span>
            <div>
              <h2 className="step-title">Reaction Chamber</h2>
              <p className="step-desc">Adjust temperature &amp; pressure and watch the reaction</p>
            </div>
            {staged.length > 0 && (
              <button type="button" className="react-button chamber-quick-load" onClick={loadIntoChamber}>
                Load &rarr;
              </button>
            )}
          </div>

          <ReactionChamber
            staged={staged}
            loaded={chamberElements}
            products={productsInChamber}
            result={chamberResult}
            environment={environment}
            preferences={preferences}
            onEnvironmentChange={setEnvironment}
            onPreferencesChange={setPreferences}
            onLoadIntoChamber={loadIntoChamber}
            runId={runId}
          />

          <ReactionCelebration result={chamberResult} selected={chamberElements} runId={runId} />
        </section>

        {/* Step 4: Discoveries */}
        <section className="step-section step-results">
          <div className="step-header">
            <span className="step-badge">4</span>
            <div>
              <h2 className="step-title">Discoveries &amp; Lab Notes</h2>
              <p className="step-desc">Your created compounds, upcoming experiments, and references</p>
            </div>
          </div>

          <div className="results-grid">
            {discoveries.length > 0 && (
              <div className="results-main">
                <LearningPanel result={chamberResult} />
                <DiscoveryShelf discoveries={discoveries} />
              </div>
            )}
            <div className="results-sidebar">
              <StarterExperiments experiments={starterExperiments} preferences={preferences} onLoad={loadExperiment} />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default App;
