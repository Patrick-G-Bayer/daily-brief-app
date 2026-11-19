import { CHARACTERS } from '../art/characters';
import type { MicPermission, MicSupport } from '../audio/voices';
import { ArtSvg } from './ArtSvg';
import { CloseIcon, PlayIcon, TrashIcon } from './Icons';

const MIC_STATUS: Record<MicPermission, string> = {
  granted: 'Allowed ✓',
  prompt: 'Not asked yet. Tap the red microphone above a character to set it up.',
  unknown: 'Will be asked the first time you record.',
  denied: 'Blocked. To fix: tap the icon left of the web address → Permissions → Microphone → Allow. (Installed app: Chrome → ⋮ → Settings → Site settings → Microphone.)',
};

export function GrownUpPanel({
  voices,
  muted,
  micSupport,
  micPermission,
  canInstall,
  isFullscreen,
  onClose,
  onPlayVoice,
  onDeleteVoice,
  onDeleteAllVoices,
  onClearStage,
  onToggleMute,
  onFullscreen,
  onInstall,
}: {
  voices: Set<string>;
  muted: boolean;
  micSupport: MicSupport;
  micPermission: MicPermission;
  canInstall: boolean;
  isFullscreen: boolean;
  onClose: () => void;
  onPlayVoice: (id: string) => void;
  onDeleteVoice: (id: string) => void;
  onDeleteAllVoices: () => void;
  onClearStage: () => void;
  onToggleMute: () => void;
  onFullscreen: () => void;
  onInstall: () => void;
}) {
  const micText =
    micSupport === 'insecure'
      ? 'Unavailable: the page must be opened with https:// for the microphone to work.'
      : micSupport === 'unsupported'
        ? 'Unavailable: this browser can’t record audio. Try the latest Chrome.'
        : MIC_STATUS[micPermission];

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
          <h3>Character voices</h3>
          <div className="voice-grid">
            {CHARACTERS.map((c) => {
              const has = voices.has(c.id);
              return (
                <div key={c.id} className={`voice-cell ${has ? '' : 'is-empty'}`}>
                  <div className="voice-face">
                    <ArtSvg def={c} />
                  </div>
                  {has ? (
                    <div className="voice-actions">
                      <button type="button" className="mini-btn" aria-label={`Play ${c.label} voice`} onClick={() => onPlayVoice(c.id)}>
                        <PlayIcon />
                      </button>
                      <button type="button" className="mini-btn danger" aria-label={`Delete ${c.label} voice`} onClick={() => onDeleteVoice(c.id)}>
                        <TrashIcon />
                      </button>
                    </div>
                  ) : (
                    <span className="voice-none">No voice</span>
                  )}
                </div>
              );
            })}
          </div>
          <div className="row">
            <button type="button" className="text-btn danger" disabled={voices.size === 0} onClick={onDeleteAllVoices}>
              Delete all voices
            </button>
          </div>
        </section>

        <section>
          <h3>Story</h3>
          <div className="row">
            <button type="button" className="text-btn danger" onClick={onClearStage}>
              Clear the stage
            </button>
          </div>
        </section>

        <section>
          <h3>Settings</h3>
          <div className="row">
            <button type="button" className="text-btn" aria-pressed={!muted} onClick={onToggleMute}>
              Sound: {muted ? 'Off' : 'On'}
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

        <footer className="panel-foot">
          Stories and voices are saved only on this device. No accounts, ads, tracking or uploads. Works offline once loaded.
        </footer>
      </div>
    </div>
  );
}
