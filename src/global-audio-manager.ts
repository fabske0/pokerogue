import type { AudioManager as GlobalAudioManager } from "#audio/audio-manager";

export let audioManager: GlobalAudioManager;

export async function initGlobalAudioManager() {
  // Doing it this way to avoid a crash when running the wiki scraper script due to phaser-rex2 being imported
  const { AudioManager } = await import("#audio/audio-manager");
  audioManager = new AudioManager();
}
