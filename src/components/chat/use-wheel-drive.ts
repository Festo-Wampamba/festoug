"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

export function useWheelDrive(wheelRef: RefObject<HTMLElement | null>, isOpen: boolean) {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [soundLoading, setSoundLoading] = useState(false);
  const [soundError, setSoundError] = useState("");
  const audioRef = useRef<{ context: AudioContext; gain: GainNode; source: AudioBufferSourceNode | null } | null>(null);

  const toggleSound = async () => {
    if (soundLoading) return;
    if (soundEnabled) {
      audioRef.current?.gain.gain.setTargetAtTime(0, audioRef.current.context.currentTime, 0.03);
      setSoundEnabled(false);
      return;
    }
    if (!window.AudioContext) {
      setSoundError("Engine sound is unavailable in this browser.");
      return;
    }
    setSoundLoading(true);
    setSoundError("");
    try {
      if (!audioRef.current) {
        // Unlock audio during the tap; fetch the real recording only after opt-in.
        const context = new AudioContext();
        const gain = context.createGain();
        gain.gain.value = 0;
        gain.connect(context.destination);
        audioRef.current = { context, gain, source: null };
        await context.resume();
        const response = await fetch("/audio/engine-idle-loop.mp3", { cache: "force-cache" });
        if (!response.ok) throw new Error("Engine recording unavailable");
        const buffer = await context.decodeAudioData(await response.arrayBuffer());
        const source = context.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        source.playbackRate.value = 1;
        source.connect(gain);
        source.start();
        audioRef.current = { context, source, gain };
      }
      await audioRef.current.context.resume();
      setSoundEnabled(true);
    } catch {
      const audio = audioRef.current;
      audio?.source?.stop();
      if (audio) void audio.context.close();
      audioRef.current = null;
      setSoundEnabled(false);
      setSoundError("Engine sound couldn't load. Please try again.");
    } finally {
      setSoundLoading(false);
    }
  };

  useEffect(() => {
    const wheel = wheelRef.current;
    if (!wheel) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let previousY = window.scrollY;
    let previousTime = performance.now();
    let rotation = parseFloat(wheel.style.getPropertyValue("--tire-rotation")) || 0;
    let frame = 0;
    let stopTimer: ReturnType<typeof setTimeout> | undefined;
    const quiet = () => {
      wheel.dataset.rolling = "false";
      const audio = audioRef.current;
      if (audio) {
        const audible = soundEnabled && !document.hidden;
        audio.gain.gain.setTargetAtTime(audible ? 0.12 : 0, audio.context.currentTime, audible ? 0.18 : 0.03);
        audio.source?.playbackRate.setTargetAtTime(1, audio.context.currentTime, 0.35);
      }
    };
    const update = () => {
      frame = 0;
      const delta = window.scrollY - previousY;
      const now = performance.now();
      const speed = Math.abs(delta) / Math.max(16, now - previousTime);
      previousTime = now;
      previousY = window.scrollY;
      if (motion.matches || isOpen || document.hidden) { quiet(); return; }
      if (!delta) return;
      const diameter = wheel.querySelector(".assistant-launcher")?.getBoundingClientRect().width || 56;
      rotation += delta * 360 / (Math.PI * diameter);
      wheel.style.setProperty("--tire-rotation", `${rotation}deg`);
      wheel.dataset.rolling = "true";
      wheel.dataset.direction = delta > 0 ? "forward" : "reverse";
      const audio = audioRef.current;
      if (audio && soundEnabled) {
        audio.gain.gain.setTargetAtTime(Math.min(0.22 + speed * 0.08, 0.45), audio.context.currentTime, 0.06);
        audio.source?.playbackRate.setTargetAtTime(Math.min(1 + speed * 0.2, 1.65), audio.context.currentTime, 0.12);
      }
      clearTimeout(stopTimer);
      stopTimer = setTimeout(quiet, 150);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const preferenceChanged = () => { quiet(); wheel.style.setProperty("--tire-rotation", "0deg"); rotation = 0; };
    quiet();
    window.addEventListener("scroll", schedule, { passive: true });
    document.addEventListener("visibilitychange", quiet);
    motion.addEventListener("change", preferenceChanged);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(stopTimer);
      const audio = audioRef.current;
      if (audio) audio.gain.gain.setTargetAtTime(0, audio.context.currentTime, 0.03);
      window.removeEventListener("scroll", schedule);
      document.removeEventListener("visibilitychange", quiet);
      motion.removeEventListener("change", preferenceChanged);
    };
  }, [wheelRef, soundEnabled, isOpen]);

  useEffect(() => () => {
    const audio = audioRef.current;
    if (audio) { audio.source?.stop(); void audio.context.close(); }
  }, []);

  return { soundEnabled, soundLoading, soundError, toggleSound };
}
