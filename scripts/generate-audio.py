#!/usr/bin/env python3
"""
Generates a soft, royalty-free instrumental piano backing track
for public/audio/romantic-piano.mp3.

Every note is synthesised additively (sine partials + piano envelope), given a
touch of simple reverb, then encoded to a 96 kbps mono MP3 so the file stays
small (< 3 MB, per AGENTS.md) and still sounds pleasant as background music.

Run:  python3 scripts/generate-audio.py
"""

from __future__ import annotations

import math
import subprocess
import wave
from pathlib import Path

import numpy as np

SR = 32000

# Gentle progression: C - G/B - Am - F  (I - V - vi - IV) with variations.
CHORDS = [
    # (bass, [arpeggio notes])
    (130.81, [261.63, 329.63, 392.00, 523.25]),  # C
    (123.47, [246.94, 293.66, 392.00, 493.88]),  # B/G
    (110.00, [220.00, 329.63, 440.00, 523.25]),  # Am
    (87.31, [349.23, 440.00, 523.25, 698.46]),   # F
    (130.81, [261.63, 329.63, 523.25, 659.25]),  # C (atas)
    (98.00, [293.66, 392.00, 493.88, 587.33]),   # G
    (110.00, [261.63, 329.63, 440.00, 523.25]),  # Am
    (87.31, [349.23, 440.00, 523.25, 698.46]),   # F
]


def piano_note(freq: float, dur: float, amp: float = 1.0) -> np.ndarray:
    """A single piano note: partials 1..6, with faster decay on higher partials."""
    n = int(SR * dur)
    if n <= 0:
        return np.zeros(0, dtype=np.float32)

    t = np.arange(n, dtype=np.float32) / SR
    out = np.zeros(n, dtype=np.float32)

    partials = [
        (1, 1.00, 1.0),
        (2, 0.42, 0.75),
        (3, 0.22, 0.55),
        (4, 0.11, 0.42),
        (5, 0.06, 0.32),
        (6, 0.03, 0.26),
    ]

    for mult, level, decay_scale in partials:
        f = freq * mult
        if f > SR / 2.2:
            continue
        # Slight detune for warmth (natural chorus)
        detune = 1.0 + 0.0007 * mult
        wave_a = np.sin(2 * np.pi * f * detune * t)
        wave_b = np.sin(2 * np.pi * f * (2 - detune) * t)
        tone = (wave_a * 0.65 + wave_b * 0.35) * level
        env = np.exp(-t * (2.4 + 0.9 * mult) * decay_scale)
        out += (tone * env).astype(np.float32)

    # Very short attack (piano hammer) + a final release to avoid clicks
    attack = int(SR * 0.006)
    if attack > 1:
        out[:attack] *= np.linspace(0.0, 1.0, attack, dtype=np.float32)
    release = int(SR * 0.05)
    if release > 1 and release < n:
        out[-release:] *= np.linspace(1.0, 0.0, release, dtype=np.float32)

    return out * amp


def add_reverb(signal: np.ndarray, mix: float = 0.22) -> np.ndarray:
    """Light reverb: a few damped delays (simplified Schroeder)."""
    out = signal.copy()
    for delay_ms, gain in ((83, 0.32), (127, 0.22), (191, 0.14), (263, 0.09)):
        d = int(SR * delay_ms / 1000)
        if d >= len(signal):
            continue
        delayed = np.zeros_like(signal)
        delayed[d:] = signal[:-d] * gain
        # Simple low-pass (moving average) so it does not sound too bright
        kernel = np.ones(9, dtype=np.float32) / 9.0
        delayed = np.convolve(delayed, kernel, mode="same").astype(np.float32)
        out += delayed * mix
    return out


def build_track() -> np.ndarray:
    beat = 0.58  # ~103 BPM, tempo tenang
    chord_len = beat * 4
    # Progression repeated twice at different octaves for a ~45s seamless loop.
    progression = CHORDS + CHORDS
    total = int(SR * chord_len * len(progression)) + SR * 4
    track = np.zeros(total, dtype=np.float32)

    for index, (bass_freq, notes) in enumerate(progression):
        start = index * chord_len
        # The second half is played an octave higher and softer.
        upper = index >= len(CHORDS)
        if upper:
            notes = [n * 2 for n in notes]

        # Soft bass at the start of each bar
        bass = piano_note(bass_freq, 3.4, amp=0.5)
        pos = int(SR * start)
        track[pos : pos + len(bass)] += bass

        # 4-note arpeggio + 2 grace notes
        pattern = [0, 1, 2, 3, 2, 1, 3, 2]
        for step, note_index in enumerate(pattern):
            freq = notes[note_index % len(notes)]
            # Occasional octave-up note for sparkle
            if step in (3, 7):
                freq *= 2
            amp = (0.34 if step % 2 == 0 else 0.24) * (0.85 if upper else 1.0)
            note = piano_note(freq, 2.6, amp=amp)
            pos = int(SR * (start + step * beat * 0.5))
            track[pos : pos + len(note)] += note

    track = add_reverb(track, mix=0.2)

    # Gentle normalisation. No global fade at the end so the loop is seamless —
    # the audio fade-in is handled by the player (volume ramp in page.tsx).
    peak = float(np.max(np.abs(track))) or 1.0
    track = (track / peak) * 0.72

    # Very short fade-in only to avoid a click at the start of the file.
    fade_in = int(SR * 0.05)
    track[:fade_in] *= np.linspace(0.0, 1.0, fade_in, dtype=np.float32)

    return track


def main() -> None:
    root = Path(__file__).resolve().parent.parent
    audio_dir = root / "public" / "audio"
    audio_dir.mkdir(parents=True, exist_ok=True)

    track = build_track()
    wav_path = audio_dir / "_romantic-piano.wav"
    mp3_path = audio_dir / "romantic-piano.mp3"

    samples = np.clip(track, -1.0, 1.0)
    pcm = (samples * 32767).astype("<i2")

    with wave.open(str(wav_path), "wb") as handle:
        handle.setnchannels(1)
        handle.setsampwidth(2)
        handle.setframerate(SR)
        handle.writeframes(pcm.tobytes())

    subprocess.run(
        [
            "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
            "-i", str(wav_path),
            "-codec:a", "libmp3lame",
            "-b:a", "96k",
            "-ac", "1",
            "-ar", "32000",
            "-metadata", "title=Romantic Piano (instrumental)",
            str(mp3_path),
        ],
        check=True,
    )
    wav_path.unlink(missing_ok=True)

    size_kb = mp3_path.stat().st_size / 1024
    print(f"OK  {mp3_path}  ({size_kb:.0f} KB, {len(track) / SR:.1f}s)")


if __name__ == "__main__":
    main()
