"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as Tone from "tone";

const SCENES = [
  // start and end in seconds
  { start: 0, end: 2, text: "Every journey is different?", caption: "Hook", key: "hook" },
  { start: 2, end: 4, text: "But some journeys test every bit of your strength.", caption: "Setup", key: "setup" },
  { start: 4, end: 7, text: "Sleepless nights. Fear. Prayers.", caption: "Conflict", key: "conflict" },
  { start: 7, end: 9, text: "Yet? they never gave up.", caption: "Rising moment", key: "rising" },
  { start: 9, end: 12, text: "Because this little life is their whole world.", caption: "Climax", key: "climax" },
  { start: 12, end: 15, text: "Strong parents raise strong miracles.", caption: "Resolution", key: "resolution" },
  { start: 15, end: 17, text: "", caption: "", key: "cta" },
];

const TOTAL_DURATION = 17; // seconds

export default function ScenePlayer() {
  const [started, setStarted] = useState(false);
  const [time, setTime] = useState(0);
  const rafRef = useRef(null);
  const startedAtRef = useRef(null);
  const synthRef = useRef(null);
  const reverbRef = useRef(null);
  const volumeRef = useRef(null);

  const currentScene = useMemo(() => SCENES.find(s => time >= s.start && time < s.end) ?? SCENES[SCENES.length - 1], [time]);
  const progressPct = Math.min(100, (time / TOTAL_DURATION) * 100);

  const setupAudio = useCallback(async () => {
    await Tone.start();

    // Soft lullaby instrument chain
    const volume = new Tone.Volume(-16);
    const reverb = new Tone.Reverb({ decay: 4, wet: 0.35 });
    const chorus = new Tone.Chorus(3, 2.5, 0.2).start();
    const synth = new Tone.PolySynth(Tone.AMSynth, {
      volume: -8,
      envelope: { attack: 0.02, decay: 0.6, sustain: 0.3, release: 1.2 },
      oscillator: { type: "sine" }
    });

    synth.chain(chorus, reverb, volume, Tone.Destination);

    volumeRef.current = volume;
    reverbRef.current = reverb;
    synthRef.current = synth;

    // Schedule a simple lullaby line across 16s (Twinkle-like motif)
    const part = new Tone.Part((time, note) => {
      synth.triggerAttackRelease(note.pitch, note.len, time, note.vel ?? 0.9);
    }, [
      // bars ~0-4 (approx 16s), 4/4 @ 90bpm
      { time: 0, pitch: "C4", len: "8n" },
      { time: 0.5, pitch: "C4", len: "8n" },
      { time: 1, pitch: "G4", len: "8n" },
      { time: 1.5, pitch: "G4", len: "8n" },
      { time: 2, pitch: "A4", len: "8n" },
      { time: 2.5, pitch: "A4", len: "8n" },
      { time: 3, pitch: "G4", len: "2n" },

      { time: 4, pitch: "F4", len: "8n" },
      { time: 4.5, pitch: "F4", len: "8n" },
      { time: 5, pitch: "E4", len: "8n" },
      { time: 5.5, pitch: "E4", len: "8n" },
      { time: 6, pitch: "D4", len: "8n" },
      { time: 6.5, pitch: "D4", len: "8n" },
      { time: 7, pitch: "C4", len: "2n" },

      { time: 8, pitch: "G4", len: "8n" },
      { time: 8.5, pitch: "G4", len: "8n" },
      { time: 9, pitch: "F4", len: "8n" },
      { time: 9.5, pitch: "F4", len: "8n" },
      { time: 10, pitch: "E4", len: "8n" },
      { time: 10.5, pitch: "E4", len: "8n" },
      { time: 11, pitch: "D4", len: "2n" },

      { time: 12, pitch: "G4", len: "8n" },
      { time: 12.5, pitch: "G4", len: "8n" },
      { time: 13, pitch: "F4", len: "8n" },
      { time: 13.5, pitch: "F4", len: "8n" },
      { time: 14, pitch: "E4", len: "8n" },
      { time: 14.5, pitch: "E4", len: "8n" },
      { time: 15, pitch: "D4", len: "2n" },
    ]);

    part.start(0);
    part.loop = false;

    Tone.Transport.bpm.value = 90;
    Tone.Transport.start('+0.05');
  }, []);

  const startPlayback = useCallback(async () => {
    if (started) return;
    await setupAudio();
    setStarted(true);
    startedAtRef.current = performance.now();

    const loop = () => {
      const now = performance.now();
      const elapsed = (now - startedAtRef.current) / 1000;
      const clamped = Math.min(elapsed, TOTAL_DURATION);
      setTime(clamped);
      if (clamped < TOTAL_DURATION) {
        rafRef.current = requestAnimationFrame(loop);
      }
    };
    rafRef.current = requestAnimationFrame(loop);
  }, [setupAudio, started]);

  useEffect(() => () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    // dispose audio on unmount
    try {
      synthRef.current?.disconnect();
      reverbRef.current?.disconnect();
      volumeRef.current?.disconnect();
    } catch {}
  }, []);

  const showCTA = time >= 15;

  return (
    <main className="fullscreen">
      <div className="kb" />
      <div className="haze" />

      <div className="content">
        {!started && (
          <div className="fade" style={{ display: "grid", gap: "1rem", justifyItems: "center" }}>
            <h1 className="sceneText">Every journey is different?</h1>
            <p className="caption">Tap to begin ? sound on</p>
            <button className="button" onClick={startPlayback}>Play 17s Story</button>
          </div>
        )}

        {started && (
          <div className="fade">
            <h2 className="sceneText" aria-live="polite">{currentScene.text}</h2>
            {currentScene.caption && (
              <p className="caption">{currentScene.caption}</p>
            )}
          </div>
        )}

        {showCTA && (
          <div className="fade" style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", pointerEvents: "none" }}>
            <p className="caption" style={{ opacity: 0.9 }}>Fade out with baby in the crib</p>
          </div>
        )}
      </div>

      <div className="progress" aria-hidden>
        <span style={{ width: `${progressPct}%` }} />
      </div>
    </main>
  );
}
