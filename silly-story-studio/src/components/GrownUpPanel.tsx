import { getActorDef } from '../art/registry';
import type { MicPermission, MicSupport } from '../audio/recorder';
import type { PhotoRec, SavedShow } from '../types';
import { ArtSvg } from './ArtSvg';
import { CloseIcon, TrashIcon } from './Icons';
import { StageView } from './StageView';

const MIC_STATUS: Record<MicPermission, string> = {
  granted: 'Allowed ✓',
  prompt: 'Not asked yet. You’ll be asked the first time you press the red record button.',
  unknown: 'You’ll be asked the first time you press the red record button.',
  denied:
    'Blocked. To fix: tap the icon left of the web address → Permissions → Microphone → Allow. (Installed app: Chrome → ⋮ → Settings → Site settings → Microphone.)',
};

export function GrownUpPanel({
  shows,
  photos,
  muted,
  micSupport,
  micPermission,
  canInstall,
  isFullscreen,
  onClose,
  onDeleteShow,
  onDeleteAllShows,
  onDeletePhoto,
  onToggleMute,
  onFullscreen,
  onInstall,
}: {
  shows: SavedShow[];
  photos: PhotoRec[];
  muted: boolean;
  micSupport: MicSupport;
  micPermission: MicPermission;
  canInstall: boolean;
  isFullscreen: boolean;
  onClose: () => void;
  onDeleteShow: (id: string) => void;
  onDeleteAllShows: () => void;
  onDeletePhoto: (p: PhotoRec) => void;
  onToggleMute: () => void;
  onFullscreen: () => void;
  onInstall: () => void;
}) {
  const micText =
    micSupport === 'insecure'
      ? 'Unavailable: the page must be opened with https:// for the microphone to work. Shows still record moves without sound.'
      : micSupport === 'unsupported'
        ? 'Unavailable: this browser can’t record audio. Try the latest Chrome. Shows still record moves without sound.'
        : MIC_STATUS[micPermission];
  const minutes = (ms: number) => {
    const s = Math.round(ms / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  };

  return (
    <div className="overlay" onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="panel" role="dialog" aria-modal="true" aria-labelledby="grownup-title">
        <header className="panel-head">
          <h2 id="grownup-title">Grown-up corner</h2>
          <button type="button" className="round-btn close-btn small" aria-label="Close" onClick={onClose}>
            <CloseIcon />
          </button>
        </header>

        <section>
          <h3>Saved shows</h3>
          {shows.length === 0 ? (
            <p className="muted">No saved shows yet. Press the red record button on the stage to make one.</p>
          ) : (
            <>
              <div className="thumb-grid">
                {shows.map((s) => (
                  <div key={s.id} className="thumb-cell">
                    <StageView state={s.poster} className="mini" />
                    <div className="thumb-meta">
                      <span>
                        {new Date(s.createdAt).toLocaleDateString()} · {minutes(s.duration)}
                      </span>
                      <button type="button" className="mini-btn danger" aria-label="Delete this show" onClick={() => onDeleteShow(s.id)}>
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="row">
                <button type="button" className="text-btn danger" onClick={onDeleteAllShows}>
                  Delete all shows
                </button>
              </div>
            </>
          )}
        </section>

        <section>
          <h3>Photo puppets &amp; backdrops</h3>
          {photos.length === 0 ? (
            <p className="muted">None yet. Tap the camera when choosing actors or backdrops to make one.</p>
          ) : (
            <div className="photo-grid">
              {photos.map((p) => {
                const def = p.kind === 'actor' ? getActorDef('photo', p.id) : undefined;
                return (
                  <div key={p.id} className={`photo-cell ${p.kind}`}>
                    {def ? <ArtSvg def={def} /> : <img src={p.src} alt="" draggable={false} />}
                    <button type="button" className="mini-btn danger" aria-label="Delete this photo" onClick={() => onDeletePhoto(p)}>
                      <TrashIcon />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          <p className="muted">Saved shows keep their own copy, so they still play after a photo is deleted.</p>
        </section>

        <section>
          <h3>Settings</h3>
          <div className="row">
            <button type="button" className="text-btn" aria-pressed={!muted} onClick={onToggleMute}>
              Show sound: {muted ? 'Off' : 'On'}
            </button>
            <button type="button" className="text-btn" onClick={onFullscreen}>
              {isFullscreen ? 'Exit full screen' : 'Full screen'}
            </button>
            {canInstall && (
              <button type="button" className="text-btn" onClick={onInstall}>
                Install app
              </button>
            )}
          </div>
          <p className="muted">
            <strong>Microphone:</strong> {micText}
          </p>
        </section>

        <section>
          <h3>How to play</h3>
          <ul className="howto">
            <li>Drag actors from the bottom onto the stage. Drag them off the edge (or back to the bottom) to leave.</li>
            <li>Two fingers on an actor make it bigger, smaller or turn it. Double-tap to flip it around.</li>
            <li>Tap a backdrop on the left to change the scene, even while recording.</li>
            <li>Red button records the show (moves + voices). Pause to set up the next scene, square to finish.</li>
          </ul>
        </section>

        <footer className="panel-foot">
          Shows, photos and voices are saved only on this device. No accounts, ads, tracking or uploads. Works offline once loaded.
        </footer>
      </div>
    </div>
  );
}
