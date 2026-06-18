import type { ReactionResult } from '../data/reactions';

type LearningPanelProps = {
  result: ReactionResult;
};

export function LearningPanel({ result }: LearningPanelProps) {
  return (
    <section className="panel learning-panel">
      <p className="eyebrow">What happened?</p>
      <h2>{result.summary}</h2>
      <p>{result.explanation}</p>

      <div className="product-row">
        {result.products.length ? result.products.map((product) => <span key={product}>{product}</span>) : <span>No products yet</span>}
      </div>

      {result.safetyNote ? <div className="safety-note">Safety note: {result.safetyNote}</div> : null}

      <div className="try-next">
        <strong>Try next</strong>
        <span>{result.prompt}</span>
      </div>
    </section>
  );
}
