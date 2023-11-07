import { Howl } from "howler";

export const soundEffects = new Howl({
  src: ["myAudioSpriteFinalFile.webm", "myAudioSpriteFinalFile.mp3"],
  sprite: {
    "game-over-sound": [0, 2310],
    "merging-sound": [4000, 1286.0997732426308],
    "move-sound": [7000, 1126.8027210884347],
    "win-sound": [10000, 2980.0000000000005],
  },
});
