import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  BUILTIN_ACTORS,
  BUILTIN_SCENES,
  actorUid,
  getActorDef,
  getSceneDef,
  photoSceneId,
  registerPhoto,
  unregisterPhoto,
} from './art/registry';
import { micSupport as detectMicSupport, queryMicPermission, type MicPermission } from './audio/recorder';
import { ArtSvg } from './components/ArtSvg';
import { GrownUpPanel } from './components/GrownUpPanel';
import { RotateIcon } from './components/Icons';
import { Backdrop } from './components/StageView';
import { makeBackdrop, loadPhoto } from './photo';
import { Cutout } from './screens/Cutout';
import { Home } from './screens/Home';
import { Picker, type PickItem } from './screens/Picker';
import { Player } from './screens/Player';
import { Shows } from './screens/Shows';
import { StageScreen } from './screens/StageScreen';
import { deletePhoto, deleteShow, listPhotos, listShows, savePhoto, saveShow } from './state/db';
import {
  MAX_ACTORS,
  MAX_BACKDROPS,
  loadCurrentShow,
  loadSettings,
  newShow,
  saveCurrentShow,
  saveSettings,
  stageReducer,
} from './state/stage';
import type { ActorKind, CurrentShow, PhotoRec, SavedShow, StageAction } from './types';

type Screen =
  | { name: 'home' }
  | { name: 'cast' }
  | { name: 'backdrops' }
  | { name: 'stage' }
  | { name: 'shows' }
  | { name: 'player'; show: SavedShow; back: 'shows' | 'stage' }
  | { name: 'cutout'; file: File };

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
}

const newId = (prefix: string) => `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/** Splits a picker key like "character:dino" or "photo:abc" back into kind + type. */
const parseActorKey = (key: string) => {
  const i = key.indexOf(':');
  return { kind: key.slice(0, i) as ActorKind, type: key.slice(i + 1) };
};

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'home' });
  const [current, setCurrent] = useState<CurrentShow | null>(loadCurrentShow);
  const [castPick, setCastPick] = useState<string[]>([]);
  const [backdropPick, setBackdropPick] = useState<string[]>([]);
  const [photos, setPhotos] = useState<PhotoRec[]>([]);
  const [shows, setShows] = useState<SavedShow[]>([]);
  const [muted, setMuted] = useState(() => loadSettings().muted);
  const [micPerm, setMicPerm] = useState<MicPermission>('unknown');
  const [panelOpen, setPanelOpen] = useState(false);
  const [installEvt, setInstallEvt] = useState<InstallPromptEvent | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [rotateDismissed, setRotateDismissed] = useState(false);
  const [busy, setBusy] = useState(false);
  const micSupport = useMemo(detectMicSupport, []);

  /* ----------------------------- loading ----------------------------- */

  useEffect(() => {
    void listPhotos().then((ps) => {
      ps.forEach(registerPhoto);
      setPhotos(ps);
    });
    void listShows().then(setShows);
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => saveCurrentShow(current), 250);
    return () => window.clearTimeout(t);
  }, [current]);

  useEffect(() => {
    const save = () => saveCurrentShow(current);
    window.addEventListener('pagehide', save);
    return () => window.removeEventListener('pagehide', save);
  }, [current]);

  useEffect(() => saveSettings({ muted }), [muted]);

  useEffect(() => {
    let status: PermissionStatus | undefined;
    void queryMicPermission().then((r) => {
      setMicPerm(r.state);
      status = r.status;
      if (status) status.onchange = () => setMicPerm(status!.state as MicPermission);
    });
    const onInstall = (e: Event) => {
      e.preventDefault();
      setInstallEvt(e as InstallPromptEvent);
    };
    const onFs = () => setIsFullscreen(!!document.fullscreenElement);
    const noMenu = (e: Event) => e.preventDefault();
    window.addEventListener('beforeinstallprompt', onInstall);
    window.addEventListener('contextmenu', noMenu);
    document.addEventListener('fullscreenchange', onFs);
    return () => {
      if (status) status.onchange = null;
      window.removeEventListener('beforeinstallprompt', onInstall);
      window.removeEventListener('contextmenu', noMenu);
      document.removeEventListener('fullscreenchange', onFs);
    };
  }, []);

  /* ---------------------------- show flow ---------------------------- */

  const act = useCallback((a: StageAction) => setCurrent((c) => (c ? stageReducer(c, a) : c)), []);

  const startNewShow = () => {
    setCastPick([]);
    setBackdropPick([]);
    setScreen({ name: 'cast' });
  };

  const openStage = () => {
    const cast = castPick.map(parseActorKey);
    setCurrent(newShow(cast, backdropPick));
    setScreen({ name: 'stage' });
  };

  const toggle = (list: string[], key: string, max: number) =>
    list.includes(key) ? list.filter((k) => k !== key) : list.length < max ? [...list, key] : list;

  const actorItems: PickItem[] = useMemo(() => {
    const refs = [
      ...photos.filter((p) => p.kind === 'actor').map((p) => ({ kind: 'photo' as const, type: p.id })),
      ...BUILTIN_ACTORS,
    ];
    return refs.flatMap((r) => {
      const def = getActorDef(r.kind, r.type);
      if (!def) return [];
      return [{ key: actorUid(r.kind, r.type), label: def.label, render: () => <ArtSvg def={def} /> }];
    });
  }, [photos]);

  const backdropItems: PickItem[] = useMemo(
    () =>
      [...photos.filter((p) => p.kind === 'backdrop').map((p) => photoSceneId(p.id)), ...BUILTIN_SCENES].map((id) => ({
        key: id,
        label: getSceneDef(id)?.label ?? 'Backdrop',
        render: () => <Backdrop id={id} />,
      })),
    [photos],
  );

  const addPhoto = async (kind: PhotoRec['kind'], made: { src: string; w: number; h: number }) => {
    const rec: PhotoRec = { id: newId('ph-'), kind, ...made, createdAt: Date.now() };
    registerPhoto(rec);
    setPhotos((ps) => [...ps, rec]);
    await savePhoto(rec);
    return rec;
  };

  const onBackdropPhoto = async (file: File) => {
    setBusy(true);
    try {
      const rec = await addPhoto('backdrop', makeBackdrop(await loadPhoto(file)));
      setBackdropPick((l) => toggle(l, photoSceneId(rec.id), MAX_BACKDROPS));
    } catch {
      // Unreadable picture: nothing to add.
    } finally {
      setBusy(false);
    }
  };

  const onRecorded = (s: SavedShow) => {
    setShows((all) => [s, ...all]);
    void saveShow(s);
    setScreen({ name: 'player', show: s, back: 'stage' });
  };

  const playShow = (s: SavedShow) => {
    s.photos.forEach(registerPhoto);
    setScreen({ name: 'player', show: s, back: 'shows' });
  };

  /* --------------------------- grown-ups ---------------------------- */

  const removeShow = (id: string) => {
    setShows((all) => all.filter((s) => s.id !== id));
    void deleteShow(id);
  };

  const removeAllShows = () => {
    shows.forEach((s) => void deleteShow(s.id));
    setShows([]);
  };

  const removePhoto = (p: PhotoRec) => {
    unregisterPhoto(p);
    setPhotos((ps) => ps.filter((x) => x.id !== p.id));
    void deletePhoto(p.id);
    const sceneId = photoSceneId(p.id);
    setCastPick((l) => l.filter((k) => k !== actorUid('photo', p.id)));
    setBackdropPick((l) => l.filter((k) => k !== sceneId));
    // Take it out of the show in progress too.
    setCurrent((c) => {
      if (!c) return c;
      const items = c.items.filter((i) => !(i.kind === 'photo' && i.type === p.id));
      const backdrops = c.backdrops.filter((b) => b !== sceneId);
      if (!backdrops.length) return null;
      return { ...c, items, backdrops, scene: backdrops.includes(c.scene) ? c.scene : backdrops[0] };
    });
  };

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
        const o = window.screen as unknown as { orientation?: { lock?: (o: string) => Promise<void> } };
        await o.orientation?.lock?.('landscape').catch(() => {});
      }
    } catch {
      // Not allowed here; nothing else to do.
    }
  };

  const install = async () => {
    if (!installEvt) return;
    await installEvt.prompt().catch(() => {});
    setInstallEvt(null);
  };

  /* ----------------------------- render ------------------------------ */

  let body: ReactNode = null;
  switch (screen.name) {
    case 'home':
      body = (
        <Home
          current={current}
          shows={shows}
          onContinue={() => setScreen({ name: 'stage' })}
          onNew={startNewShow}
          onShows={() => setScreen({ name: 'shows' })}
          onGrownUps={() => setPanelOpen(true)}
        />
      );
      break;
    case 'cast':
      body = (
        <Picker
          variant="actors"
          items={actorItems}
          selected={castPick}
          max={MAX_ACTORS}
          onToggle={(k) => setCastPick((l) => toggle(l, k, MAX_ACTORS))}
          onBack={() => setScreen({ name: 'home' })}
          onNext={() => setScreen({ name: 'backdrops' })}
          onPhoto={(file) => setScreen({ name: 'cutout', file })}
        />
      );
      break;
    case 'backdrops':
      body = (
        <Picker
          variant="backdrops"
          items={backdropItems}
          selected={backdropPick}
          max={MAX_BACKDROPS}
          onToggle={(k) => setBackdropPick((l) => toggle(l, k, MAX_BACKDROPS))}
          onBack={() => setScreen({ name: 'cast' })}
          onNext={openStage}
          onPhoto={(file) => void onBackdropPhoto(file)}
        />
      );
      break;
    case 'cutout':
      body = (
        <Cutout
          file={screen.file}
          onCancel={() => setScreen({ name: 'cast' })}
          onDone={(cut) => {
            void addPhoto('actor', cut).then((rec) => setCastPick((l) => toggle(l, actorUid('photo', rec.id), MAX_ACTORS)));
            setScreen({ name: 'cast' });
          }}
        />
      );
      break;
    case 'stage':
      if (!current) {
        body = null;
        break;
      }
      body = (
        <StageScreen
          show={current}
          act={act}
          photos={photos}
          micSupport={micSupport}
          micPerm={micPerm}
          setMicPerm={setMicPerm}
          onHome={() => setScreen({ name: 'home' })}
          onGrownUps={() => setPanelOpen(true)}
          onRecorded={onRecorded}
        />
      );
      break;
    case 'shows':
      body = <Shows shows={shows} onBack={() => setScreen({ name: 'home' })} onPlay={playShow} onNew={startNewShow} />;
      break;
    case 'player':
      body = (
        <Player
          key={screen.show.id}
          show={screen.show}
          muted={muted}
          onExit={() => setScreen(screen.back === 'stage' && current ? { name: 'stage' } : { name: 'shows' })}
        />
      );
      break;
  }

  return (
    <>
      {body}

      {busy && <div className="busy" aria-label="Working" />}

      {panelOpen && (
        <GrownUpPanel
          shows={shows}
          photos={photos}
          muted={muted}
          micSupport={micSupport}
          micPermission={micPerm}
          canInstall={!!installEvt}
          isFullscreen={isFullscreen}
          onClose={() => setPanelOpen(false)}
          onDeleteShow={removeShow}
          onDeleteAllShows={removeAllShows}
          onDeletePhoto={removePhoto}
          onToggleMute={() => setMuted((m) => !m)}
          onFullscreen={() => void toggleFullscreen()}
          onInstall={() => void install()}
        />
      )}

      {!rotateDismissed && (
        <div className="rotate-hint" onPointerDown={() => setRotateDismissed(true)} aria-label="Turn the tablet sideways">
          <RotateIcon />
        </div>
      )}
    </>
  );
}
