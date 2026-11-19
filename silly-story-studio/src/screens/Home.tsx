import { HoldButton } from '../components/HoldButton';
import { FilmIcon, LockIcon, NewShowIcon, PlayIcon } from '../components/Icons';
import { StageView } from '../components/StageView';
import type { CurrentShow, SavedShow } from '../types';

export function Home({
  current,
  shows,
  onContinue,
  onNew,
  onShows,
  onGrownUps,
}: {
  current: CurrentShow | null;
  shows: SavedShow[];
  onContinue: () => void;
  onNew: () => void;
  onShows: () => void;
  onGrownUps: () => void;
}) {
  return (
    <div className="home">
      <img className="home-logo" src="favicon.svg" alt="Silly Story Studio" draggable={false} />
      <div className="home-buttons">
        {current && (
          <button type="button" className="home-btn continue-btn" aria-label="Keep playing the current show" onClick={onContinue}>
            <StageView state={current} className="mini" />
            <span className="home-badge play-badge">
              <PlayIcon />
            </span>
          </button>
        )}
        <button type="button" className="home-btn new-btn" aria-label="Start a new show" onClick={onNew}>
          <NewShowIcon />
        </button>
        <button type="button" className="home-btn shows-btn" aria-label="Watch saved shows" onClick={onShows}>
          <FilmIcon />
          {shows.length > 0 && (
            <span className="home-posters" aria-hidden="true">
              {shows.slice(0, 3).map((s) => (
                <StageView key={s.id} state={s.poster} className="mini" />
              ))}
            </span>
          )}
        </button>
      </div>
      <HoldButton ms={2000} label="Grown-up corner (press and hold)" className="grownup-btn corner" onDone={onGrownUps}>
        <LockIcon />
      </HoldButton>
    </div>
  );
}
