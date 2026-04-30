// src/audio/index.js

let dayAudio;
let nightAudio;
let rainAudio;

let currentMode = "day";
let audioStarted = false;
let rainSoundEnabled = false;

export function createAmbientAudio() {
  dayAudio = new Audio("/audio/day.mp3");
  nightAudio = new Audio("/audio/night.mp3");
  rainAudio = new Audio("/audio/rain.mp3");

  dayAudio.loop = true;
  nightAudio.loop = true;
  rainAudio.loop = true;

  dayAudio.volume = 0.45;
  nightAudio.volume = 0.45;
  rainAudio.volume = 0.5;
}

export function startAmbientAudio() {
  if (audioStarted) return;

  audioStarted = true;

  if (currentMode === "night") {
    nightAudio.play().catch(() => {});
  } else {
    dayAudio.play().catch(() => {});
  }

  if (rainSoundEnabled) {
    rainAudio.play().catch(() => {});
  }
}

export function setAmbientMode(mode) {
  currentMode = mode;

  if (!audioStarted) return;

  if (mode === "night") {
    dayAudio.pause();
    nightAudio.play().catch(() => {});
  } else {
    nightAudio.pause();
    dayAudio.play().catch(() => {});
  }
}

export function toggleRainAudio() {
  rainSoundEnabled = !rainSoundEnabled;

  if (!audioStarted) return rainSoundEnabled;

  if (rainSoundEnabled) {
    rainAudio.play().catch(() => {});
  } else {
    rainAudio.pause();
    rainAudio.currentTime = 0;
  }

  return rainSoundEnabled;
}