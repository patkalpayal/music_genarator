/**
 * Lightweight MIDI File Encoder
 * Encodes pitch, start times, and durations into a standard MIDI Format 0 binary file (SMF).
 */

export interface MidiNote {
  pitch: number;     // MIDI note number (e.g. 60 for C4)
  time: number;      // Start time in beats (quarter notes)
  duration: number;  // Duration in beats
}

/**
 * Encodes an integer as a Variable Length Quantity (VLQ) used in MIDI
 */
function encodeVLQ(num: number): number[] {
  const bytes: number[] = [];
  bytes.push(num & 0x7f);
  while (num > 0x7f) {
    num >>>= 7;
    bytes.push((num & 0x7f) | 0x80);
  }
  return bytes.reverse();
}

/**
 * Creates a Standard MIDI File (SMF Format 0) from an array of notes.
 * @param notes Array of MidiNote objects
 * @returns Uint8Array containing the raw bytes of the MIDI file
 */
export function createMidiFile(notes: MidiNote[]): Uint8Array {
  // Ticks per quarter note (resolution)
  const ticksPerBeat = 128;

  // Create list of MIDI actions (Note On and Note Off)
  interface MidiAction {
    tick: number;
    type: "on" | "off";
    pitch: number;
    velocity: number;
  }

  const actions: MidiAction[] = [];
  for (const note of notes) {
    const startTick = Math.round(note.time * ticksPerBeat);
    const endTick = Math.round((note.time + note.duration) * ticksPerBeat);
    
    actions.push({
      tick: startTick,
      type: "on",
      pitch: note.pitch,
      velocity: 80, // Medium-loud velocity
    });

    actions.push({
      tick: endTick,
      type: "off",
      pitch: note.pitch,
      velocity: 0, // Note off velocity
    });
  }

  // Sort actions by tick, and then 'off' before 'on' if they occur at the same tick
  actions.sort((a, b) => {
    if (a.tick !== b.tick) {
      return a.tick - b.tick;
    }
    return a.type === "off" ? -1 : 1;
  });

  // Track event bytes
  const trackEvents: number[] = [];
  let lastTick = 0;

  // Set tempo meta event (500,000 microseconds per quarter note = 120 BPM)
  // Delta time 0
  trackEvents.push(0x00);
  // Meta event prefix, tempo type, length 3
  trackEvents.push(0xFF, 0x51, 0x03);
  // 500,000 in 3 bytes (0x07, 0xA1, 0x20)
  trackEvents.push(0x07, 0xA1, 0x20);

  // Serialize all note actions
  for (const action of actions) {
    const delta = action.tick - lastTick;
    lastTick = action.tick;

    // 1. Write variable length delta time
    const deltaBytes = encodeVLQ(delta);
    trackEvents.push(...deltaBytes);

    // 2. Write status byte and parameters
    const status = action.type === "on" ? 0x90 : 0x80; // Note On (channel 0) or Note Off (channel 0)
    trackEvents.push(status);
    trackEvents.push(action.pitch);
    trackEvents.push(action.velocity);
  }

  // End of Track meta event
  // Delta time 0
  trackEvents.push(0x00);
  // End of track bytes
  trackEvents.push(0xFF, 0x2F, 0x00);

  // Build final chunks
  const headerChunk = [
    0x4d, 0x54, 0x68, 0x64, // "MThd" Header signature
    0x00, 0x00, 0x00, 0x06, // Chunk length (always 6 bytes)
    0x00, 0x00,             // Format type: 0 (single multi-channel track)
    0x00, 0x01,             // Number of tracks: 1
    (ticksPerBeat >> 8) & 0xff,
    ticksPerBeat & 0xff     // Division: ticks per quarter note
  ];

  const trackLength = trackEvents.length;
  const trackChunkHeader = [
    0x4d, 0x54, 0x72, 0x6b, // "MTrk" Track signature
    (trackLength >> 24) & 0xff,
    (trackLength >> 16) & 0xff,
    (trackLength >> 8) & 0xff,
    trackLength & 0xff      // Track chunk length (32-bit integer)
  ];

  // Combine headers and data
  const finalFileBytes = new Uint8Array(
    headerChunk.length + trackChunkHeader.length + trackLength
  );

  finalFileBytes.set(headerChunk, 0);
  finalFileBytes.set(trackChunkHeader, headerChunk.length);
  finalFileBytes.set(trackEvents, headerChunk.length + trackChunkHeader.length);

  return finalFileBytes;
}

/**
 * Triggers a file download in the browser for the generated MIDI file
 * @param notes Array of notes to encode
 * @param filename Target file name (e.g. "output.mid")
 */
export function downloadMidi(notes: MidiNote[], filename: string = "output.mid") {
  const bytes = createMidiFile(notes);
  const blob = new Blob([bytes], { type: "audio/midi" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
