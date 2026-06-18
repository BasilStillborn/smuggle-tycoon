import type { Element } from '../data/elements';
import type { ReactionResult } from '../data/reactions';
import type { CSSProperties } from 'react';
import { useEffect } from 'react';
import { audioEngine } from '../core/audioEngine';

type ReactionCelebrationProps = {
  result: ReactionResult;
  selected: Element[];
  runId: number;
};

export function ReactionCelebration({ result, selected, runId }: ReactionCelebrationProps) {
  const isSuccess = result.products.length > 0 && result.reactionType !== 'inert' && !result.id.includes('waiting');
  if (!isSuccess) return null;

  useEffect(() => {
    audioEngine.reactionSuccess();
  }, []);

  const product = result.products[0];
  const ingredients = selected.map((element) => element.name).join(' + ');

  return (
    <div key={`${result.id}-${runId}`} className={`celebration celebration-${result.animation}`}>
      <span>Congratulations, chemist!</span>
      <strong>You created {product}</strong>
      <p>{ingredients} combined to make {result.title.toLowerCase()}. {result.summary}</p>
      <div className="celebration-sparkles" aria-hidden="true">
        {Array.from({ length: 18 }, (_, index) => <i key={index} style={{ '--s': index } as CSSProperties} />)}
      </div>
    </div>
  );
}
