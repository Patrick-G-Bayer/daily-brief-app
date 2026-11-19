import { BackIcon, FilmIcon, NewShowIcon, PlayIcon } from '../components/Icons';
import { StageView } from '../components/StageView';
import type { SavedShow } from '../types';

/** All saved shows as big picture thumbnails. Tap one to watch it. */
export function Shows({
  shows,
  onBack,
  onPlay,
  onNew,
}: {
  shows: SavedShow[];
  onBack: () => void;
  onPlay: (s: SavedShow) => void;
  onNew: () => void;
}) {
  return (
    <div className="shows-screen">
      <header className="picker-bar">
        <button type="button" className="round-btn back-btn" aria-label="Back" onClick={onBack}>
          <BackIcon />
        </button>
        <div className="shows-title" aria-hidden="true">
          <FilmIcon />
        </div>
        <span className="bar-spacer" />
      </header>
      {shows.length === 0 ? (
        <div className="shows-empty">
          <button type="button" className="home-btn new-btn" aria-label="Start a new show" onClick={onNew}>
            <NewShowIcon />
          </button>
        </div>
      ) : (
        <div className="shows-grid">
          {shows.map((s) => (
            <button key={s.id} type="button" className="show-tile" aria-label="Watch this show" onClick={() => onPlay(s)}>
              <StageView state={s.poster} className="mini" />
              <span className="home-badge play-badge small">
                <PlayIcon />
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
