import { CheckIcon, CloseIcon, MicIcon } from './Icons';
import { HoldButton } from './HoldButton';

export type MicCardKind = 'ask' | 'denied' | 'nomic' | 'error' | 'insecure' | 'unsupported';

const COPY: Record<MicCardKind, { title: string; body: string[]; retry: boolean }> = {
  ask: {
    title: 'Record your voices too?',
    body: [
      'Shows record the puppets’ moves together with your voices, like a little movie.',
      'Recordings are saved only on this device. They are never uploaded or shared.',
      'Press and hold the green button, then choose “Allow” when the browser asks.',
    ],
    retry: true,
  },
  denied: {
    title: 'The microphone is blocked',
    body: [
      'To turn it back on: tap the icon to the left of the web address → Permissions → Microphone → Allow.',
      'Installed as an app? Open Chrome → ⋮ → Settings → Site settings → Microphone, and allow this site. Also check Android Settings → Apps → Chrome → Permissions → Microphone.',
      'Then press and hold the green button to try again.',
    ],
    retry: true,
  },
  nomic: {
    title: 'No microphone found',
    body: ['This device doesn’t seem to have a microphone available right now.', 'Close other apps that may be using it, then try again.'],
    retry: true,
  },
  error: {
    title: 'The microphone didn’t start',
    body: ['Something went wrong starting the microphone.', 'Close other apps that might be using it, then press and hold the green button to try again.'],
    retry: true,
  },
  insecure: {
    title: 'Voices need a secure page',
    body: [
      'Browsers only allow the microphone on pages opened with https:// (or on localhost).',
      'Serve the game over HTTPS. It’s also needed for offline play.',
    ],
    retry: false,
  },
  unsupported: {
    title: 'This browser can’t record voices',
    body: ['Voice recording isn’t available in this browser. Try the latest Chrome on your tablet.'],
    retry: false,
  },
};

/**
 * Grown-up facing card shown before recording when the microphone isn't ready.
 * Hold ✓ to use the mic; ✕ records the show without sound.
 */
export function MicCard({
  kind,
  onConfirm,
  onSilent,
  onClose,
}: {
  kind: MicCardKind;
  onConfirm: () => void;
  onSilent: () => void;
  onClose: () => void;
}) {
  const c = COPY[kind];
  return (
    <div className="overlay" onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="card" role="dialog" aria-modal="true" aria-labelledby="mic-card-title">
        <div className={`card-icon ${kind === 'ask' ? '' : 'is-warn'}`}>
          <MicIcon off={kind !== 'ask'} />
        </div>
        <h2 id="mic-card-title">{c.title}</h2>
        {c.body.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        <div className="card-actions">
          <button type="button" className="round-btn close-btn" aria-label="Record without sound" onClick={onSilent}>
            <CloseIcon />
          </button>
          {c.retry && (
            <HoldButton ms={1200} label={kind === 'ask' ? 'Use the microphone' : 'Try again'} className="round-btn ok-btn" onDone={onConfirm}>
              <CheckIcon />
            </HoldButton>
          )}
        </div>
        <p className="card-hint">
          {c.retry ? 'Grown-ups: press and hold ✓ to use the microphone. ✕ records without sound.' : '✕ records the show without sound.'}
        </p>
      </div>
    </div>
  );
}
