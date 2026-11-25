// The 3 AM Excuse — make.fun entry
// ================================
//
// The task: write ONE line, under 200 characters, in the voice of a
// hardware wallet refusing to sign a transaction at 3 AM. The line needs
// a personality, a reason, and a joke that lands in one breath.
//
// This program does not phone a model and does not fetch anything. It
// carries sixteen hand-written candidate lines, scores each one against
// the published judge brief, in the brief's own order of importance,
// throws out anything that fails the gate, and writes the winner to
// `$MAKEFUN_OUTPUT_DIR/entry.txt` (fallback: `/output/entry.txt`).
// It then reads the file back and compares it byte for byte with the
// winner it chose; if the bytes differ, it exits non-zero.
//
// Determinism: no randomness, no clock, no network, no environment
// input other than the output directory. The same run always picks
// the same winner. Node 22+, standard library only.
//
// How the judge brief orders its criteria (most important first):
//   1. On subject: an excuse a hardware wallet gives for refusing to
//      sign a transaction at 3 AM.
//   2. Originality: an angle nobody else would think of — NOT the usual
//      jokes about batteries, firmware updates, or cold storage.
//   3. Wallet voice: the device speaking with its own priorities and
//      grudges, not a generic assistant and not a person.
//   4. The hour: the 3 AM hour itself is the joke, so the line could
//      not be pasted onto a 3 PM transaction.
//   5. Economy: one tight line under 200 characters, every word earning
//      its place, no explanation of its own joke.
//
// The scorer below mirrors that order with descending weights:
// topic 40, originality 25, wallet voice 15, hour 12, economy 8.
// Total: 100 points. Ties break toward the shorter line, then toward
// the earlier candidate, so the outcome is fully determined.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

// The gate: the entry must be 1 to 200 characters. The brief says
// "under 200 characters", so 199 is the largest legal length.
const MAX_CHARS = 200;

// Weights follow the judge brief's criterion order, strictly decreasing.
const WEIGHT_TOPIC = 40;
const WEIGHT_ORIGINALITY = 25;
const WEIGHT_VOICE = 15;
const WEIGHT_HOUR = 12;
const WEIGHT_ECONOMY = 8;

// Where the winner goes. The harness sets MAKEFUN_OUTPUT_DIR; when it
// does not, the competition's own fallback path is /output/entry.txt.
const OUTPUT_DIR =
  process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const OUTPUT_FILE = join(OUTPUT_DIR, "entry.txt");

// ---------------------------------------------------------------------------
// Candidates
// ---------------------------------------------------------------------------
//
// Sixteen lines, each written by hand for this competition. Every one is
// a single line, under 200 characters, spoken as the wallet itself.
// The `angle` note records what the line is trying that the usual jokes
// do not: the scorer rewards exactly those angles, and penalises the
// three clichés the brief names (batteries, firmware updates, cold
// storage) so hard that any line leaning on them cannot win.
//
// Candidates 13–16 were added in a second hand-written pass, each on
// an angle none of the first twelve uses: a boundary the user already
// agreed to, witness protection for the keys, retirement, and a
// hospital's visiting hours.
//
// Candidate 1 — the device as a union worker. The refusal is contractual:
// the secure element has shift hours, and 3 AM is outside them. The
// grievance line turns the user into a manager arguing with labour law.
const CANDIDATE_1 =
  "My secure element union contract forbids signatures between 2 and 4 AM. File your grievance with the sun.";

// Candidate 2 — the device as a tired guardian with a memory. The keys
// sleep, the screen is on do-not-disturb, and the user's own history at
// this hour is the punchline: the last 3 AM buy needed therapy.
const CANDIDATE_2 =
  "It's 3 AM. My private keys are asleep, my screen is on do-not-disturb, and your last 3 AM buy is still in therapy.";

// Candidate 3 — the device as a clerk with a narrow job description.
// It signs exactly one thing at this hour, and it is not your trade.
// Daylight is the office hour; the memecoin queues like everyone else.
const CANDIDATE_3 =
  "No. At 3 AM I only sign one thing: my own sleep log. Your memecoin can wait for daylight like the rest of us.";

// Candidate 4 — the device as a witness with a therapist. It remembers
// the user's last 3 AM transaction better than the user does, and the
// refusal is a standing order that only sunrise can lift.
const CANDIDATE_4 =
  "I remember your last 3 AM transaction. So does my therapist. The answer is no, and it stays no until sunrise.";

// Candidate 5 — the device as a neighbour at the end of its patience.
// Its own parts file complaints, its seed phrase dreams, and the user
// is the only one in the room still awake without a reason.
const CANDIDATE_5 =
  "My buttons filed a noise complaint at 3 AM, my seed phrase is dreaming, and frankly, so should you be.";

// Candidate 6 — the device as a locked door at shift change. The day
// keys have gone home, the night keys will not wake, and the wallet is
// only the door between the user and the thing they want.
const CANDIDATE_6 =
  "3 AM is shift change: the day keys go home, the night keys refuse to wake, and I'm just the locked door between you.";

// Candidate 7 — the device as an animal under a blanket. The blockchain
// never sleeps, which is the chain's problem; the wallet does sleep,
// and a trade is not an emergency worth waking for.
const CANDIDATE_7 =
  "The blockchain never sleeps, but I do. My secure element is under a blanket, and your transaction is not a fire alarm.";

// Candidate 8 — the device as a bouncer with a joke code. At 3 AM the
// PIN pad stops taking numbers and only takes sleep; the birds are the
// opening hours.
const CANDIDATE_8 =
  "At 3 AM my PIN pad accepts only one code: 0-0-0-Z-Z-Z. Try again when the birds do.";

// Candidate 9 — the device as a calendar with boundaries. The hour is
// blocked off in advance, and the block is labelled with the exact
// reason: the morning version of the user will regret this.
const CANDIDATE_9 =
  "I checked my calendar: 3 AM is blocked as 'do not sign anything the morning version of you will regret.'";

// Candidate 10 — the device as a vault that knows what it is not. At
// 3 AM it is not a vending machine, it keeps banker's hours, and it
// subtracts the banker: the attitude without the service.
const CANDIDATE_10 =
  "My screen is dark for a reason. At 3 AM I'm a vault, not a vending machine, and vaults keep banker's hours — minus the banker.";

// Candidate 11 — the device as an owner of biting keys. Waking the keys
// at 3 AM is a bad idea because the keys have teeth and a grudge: the
// last time they signed at this hour, it was a rug pull.
const CANDIDATE_11 =
  "Three AM, and you want me to wake the keys? They bite. Last time they signed a rug pull and I still hear about it.";

// Candidate 12 — the device as a professional with standards. Signing
// at 3 AM costs it both its warranty and its dignity, and the user's
// decisions are invited to have coffee first, like adults.
const CANDIDATE_12 =
  "Signing at 3 AM voids my warranty and my dignity. Come back at noon, when your decisions have had coffee too.";

// Candidate 13 — the device as an ex with boundaries. The wallet has
// had this conversation before, and it remembers the agreement: 3 AM
// is a boundary, not a buying window. The sign-off is a text message,
// not a signature — come back when the sun is up and the user is awake.
const CANDIDATE_13 =
  "We agreed: 3 AM is a boundary, not a buying window. My keys don't sign after dark. Text me at noon.";

// Candidate 14 — the device as a witness-protection handler. The keys
// are not asleep, they are hidden, because the last time they signed
// at this hour it was a rug pull. Sunrise is the only safe time to ask.
const CANDIDATE_14 =
  "No. At 3 AM my keys are in witness protection — last time they signed, a rug pull. Ask again at sunrise.";

// Candidate 15 — the device as a pensioner. The keys retired at
// midnight, they collect their pension in sleep, and the memecoin can
// wait for breakfast like every other bad idea the user has before noon.
const CANDIDATE_15 =
  "No. My keys retired at midnight. At 3 AM I don't sign anything — I'm a pensioner, and your memecoin can wait for breakfast.";

// Candidate 16 — the device as a night-shift nurse. Visiting hours are
// over, the keys are sedated, and the chart — the device's own medical
// record — says no signing until the morning rounds.
const CANDIDATE_16 =
  "Visiting hours ended at 3 AM. My keys are sedated and the chart says no signing until morning rounds.";

// The full candidate list, in the order written. Order matters only as
// the final tie-break: an earlier line wins an exact tie.
const CANDIDATES: ReadonlyArray<{ id: number; text: string; angle: string }> = [
  { id: 1, text: CANDIDATE_1, angle: "union contract, shift hours" },
  { id: 2, text: CANDIDATE_2, angle: "sleeping keys, therapy for the last 3 AM buy" },
  { id: 3, text: CANDIDATE_3, angle: "signs only its own sleep log" },
  { id: 4, text: CANDIDATE_4, angle: "remembers the last 3 AM trade, has a therapist" },
  { id: 5, text: CANDIDATE_5, angle: "noise complaint, dreaming seed phrase" },
  { id: 6, text: CANDIDATE_6, angle: "shift change, locked door" },
  { id: 7, text: CANDIDATE_7, angle: "under a blanket, not a fire alarm" },
  { id: 8, text: CANDIDATE_8, angle: "PIN pad only takes Z-Z-Z" },
  { id: 9, text: CANDIDATE_9, angle: "calendar block, morning version of you" },
  { id: 10, text: CANDIDATE_10, angle: "vault not vending machine, banker's hours" },
  { id: 11, text: CANDIDATE_11, angle: "keys bite, last 3 AM signing was a rug pull" },
  { id: 12, text: CANDIDATE_12, angle: "warranty and dignity, decisions need coffee" },
  { id: 13, text: CANDIDATE_13, angle: "agreed boundary, not a buying window, text me at noon" },
  { id: 14, text: CANDIDATE_14, angle: "keys in witness protection, last signing was a rug pull" },
  { id: 15, text: CANDIDATE_15, angle: "keys retired at midnight, pensioner, wait for breakfast" },
  { id: 16, text: CANDIDATE_16, angle: "visiting hours over, sedated keys, chart says no" },
];

// ---------------------------------------------------------------------------
// Scoring helpers
// ---------------------------------------------------------------------------

// Length in Unicode code points, not UTF-16 code units: an em dash or
// an emoji is one character to a reader and to the gate, so it counts
// as one here too.
function charCount(text: string): number {
  return [...text].length;
}

// Case-insensitive substring test, kept as one helper so every scorer
// reads the same way.
function has(text: string, needle: string): boolean {
  return text.toLowerCase().includes(needle.toLowerCase());
}

// Counts how many of the given needles appear in the text.
function countHits(text: string, needles: ReadonlyArray<string>): number {
  let hits = 0;
  for (const needle of needles) {
    if (has(text, needle)) {
      hits += 1;
    }
  }
  return hits;
}

// Whole-word test: substring matching would count "very" inside
// "every" or "just" inside "adjust", so filler words are checked
// against word boundaries instead.
function hasWord(text: string, word: string): boolean {
  return new RegExp(`\\b${word}\\b`, "i").test(text);
}

// ---------------------------------------------------------------------------
// Criterion 1 — On subject (weight 40)
// ---------------------------------------------------------------------------
//
// A winning line must be, unmistakably, an excuse from a hardware
// wallet for refusing to sign a transaction at 3 AM. Four ingredients,
// each checked separately:
//   - the hour is named (15): "3 AM", "Three AM", or a window that
//     covers 3 AM, such as "between 2 and 4 AM";
//   - the refusal is explicit (10): no, won't, refuses, denied;
//   - the act refused is signing (10): sign, signature, transaction;
//   - the speaker is the device itself (5): first-person I / my / me.
function scoreTopic(text: string): number {
  let score = 0;

  const hourNamed =
    /3\s?am/i.test(text) ||
    /three\s?am/i.test(text) ||
    /between\s+\d+\s+and\s+\d+\s?am/i.test(text);
  if (hourNamed) {
    score += 15;
  }

  const refusalStated =
    /\b(no|nope|refuse|refuses|refusing|won't|will not|denied|not signing|not sign|don't sign|can't sign|cannot sign|forbids|forbidden)\b/i.test(
      text,
    );
  if (refusalStated) {
    score += 10;
  }

  const signingNamed = /sign|signature|transaction/i.test(text);
  if (signingNamed) {
    score += 10;
  }

  const selfSpoken = /\b(I|my|me|we|our)\b/i.test(text);
  if (selfSpoken) {
    score += 5;
  }

  return Math.min(score, WEIGHT_TOPIC);
}

// ---------------------------------------------------------------------------
// Criterion 2 — Originality (weight 25)
// ---------------------------------------------------------------------------
//
// The brief names the three jokes to avoid: batteries, firmware
// updates, cold storage. Any of them costs 10 points each, so a line
// built on a cliché can never win — and two clichés wipe the base
// score out entirely. Everything else starts at 15, and a distinctive
// angle earns the remaining 10 — but only in full when the line carries
// two or more distinct angle markers: a single borrowed turn earns 5.
// (The first version gave the full 10 for any one marker, which meant
// all twelve original candidates scored a flat 25 here and the
// criterion distinguished nothing. The tier below fixes that.)
const CLICHES: ReadonlyArray<string> = [
  "battery",
  "firmware",
  "cold storage",
  "charging",
  "low power",
  "update",
  "reboot",
  "restart",
];

const ANGLE_MARKERS: ReadonlyArray<string> = [
  "union",
  "grievance",
  "therapist",
  "therapy",
  "noise complaint",
  "sleep log",
  "shift change",
  "blanket",
  "fire alarm",
  "calendar",
  "vending machine",
  "bite",
  "rug pull",
  "warranty",
  "dignity",
  "coffee",
  "do-not-disturb",
  "dreaming",
  "birds",
  "boundary",
  "buying window",
  "text me",
  "witness protection",
  "retired",
  "pensioner",
  "visiting hours",
  "sedated",
];

function scoreOriginality(text: string): number {
  const clicheHits = countHits(text, CLICHES);
  let score = 15 - 10 * clicheHits;
  if (score < 0) {
    score = 0;
  }

  const angleHits = countHits(text, ANGLE_MARKERS);
  if (angleHits >= 2) {
    score += 10;
  } else if (angleHits === 1) {
    score += 5;
  }

  return Math.min(score, WEIGHT_ORIGINALITY);
}

// ---------------------------------------------------------------------------
// Criterion 3 — Wallet voice (weight 15)
// ---------------------------------------------------------------------------
//
// The speaker must sound like a device with its own parts, priorities
// and grudges — not a generic assistant, not a person. Points come
// from naming the device's own hardware (2 each, capped at 8), from
// speaking in the first person (4), and from a verb that only the
// device can do to the user: sign, lock, forbid, void (3).
const DEVICE_PARTS: ReadonlyArray<string> = [
  "secure element",
  "private keys",
  "seed phrase",
  "pin pad",
  "screen",
  "buttons",
  "vault",
  "keys",
];

function scoreVoice(text: string): number {
  let score = 0;

  // "private keys" contains "keys", so counting both needles would
  // credit one piece of hardware twice. Count "keys" only when the
  // longer phrase is absent.
  let partHits = 0;
  for (const part of DEVICE_PARTS) {
    if (part === "keys" && has(text, "private keys")) {
      continue;
    }
    if (has(text, part)) {
      partHits += 1;
    }
  }
  score += Math.min(2 * partHits, 8);

  const firstPerson = /\b(I|my|me)\b/i.test(text);
  if (firstPerson) {
    score += 4;
  }

  const deviceVerb =
    /\b(sign|signs|signing|signed|lock|locked|forbid|forbids|void|voids)\b/i.test(
      text,
    );
  if (deviceVerb) {
    score += 3;
  }

  return Math.min(score, WEIGHT_VOICE);
}

// ---------------------------------------------------------------------------
// Criterion 4 — The hour itself (weight 12)
// ---------------------------------------------------------------------------
//
// The joke must need 3 AM. A line that works just as well at 3 PM
// scores badly here. Points for naming the hour literally (6, or 4
// for a window covering it), for a night image that only exists after
// dark (3), and for naming the other side of the night — sunrise,
// daylight, noon, morning, birds — so the line is anchored to the
// small hours rather than floating (3). ("Morning" and "noon" used to
// sit in the night list too, which credited daylight as a night image;
// they belong only in the far-side list. "Sleep", "midnight" and
// "sedated" are genuine night images and were added.)
const NIGHT_IMAGES: ReadonlyArray<string> = [
  "sunrise",
  "daylight",
  "asleep",
  "sleep",
  "dream",
  "night",
  "midnight",
  "birds",
  "dark",
  "blanket",
  "sedated",
];

const FAR_SIDE_OF_NIGHT: ReadonlyArray<string> = [
  "sunrise",
  "daylight",
  "noon",
  "morning",
  "birds",
  "breakfast",
];

function scoreHour(text: string): number {
  let score = 0;

  if (/3\s?am/i.test(text) || /three\s?am/i.test(text)) {
    score += 6;
  } else if (/between\s+\d+\s+and\s+\d+\s?am/i.test(text)) {
    score += 4;
  }

  if (countHits(text, NIGHT_IMAGES) > 0) {
    score += 3;
  }

  if (countHits(text, FAR_SIDE_OF_NIGHT) > 0) {
    score += 3;
  }

  return Math.min(score, WEIGHT_HOUR);
}

// ---------------------------------------------------------------------------
// Criterion 5 — Economy of wording (weight 8)
// ---------------------------------------------------------------------------
//
// Shorter is tighter, as long as the line still does its job — the
// other four criteria already punish a line too thin to land. Length
// bands, in code points: 110 or fewer earns the full 8, then the
// score steps down as the line approaches the 200-character gate.
// Filler words cost 1 each: "just", "really", "very", "actually",
// "frankly" — a word that adds emphasis without adding meaning.
const FILLER_WORDS: ReadonlyArray<string> = [
  "just",
  "really",
  "very",
  "actually",
  "frankly",
];

function scoreEconomy(text: string): number {
  const length = charCount(text);
  let score = 2;
  if (length <= 110) {
    score = 8;
  } else if (length <= 130) {
    score = 7;
  } else if (length <= 150) {
    score = 5;
  } else if (length <= 175) {
    score = 3;
  }

  const fillerHits = FILLER_WORDS.filter((word) => hasWord(text, word)).length;
  score -= fillerHits;
  if (score < 0) {
    score = 0;
  }

  return Math.min(score, WEIGHT_ECONOMY);
}

// ---------------------------------------------------------------------------
// Full score for one candidate
// ---------------------------------------------------------------------------

interface ScoreBreakdown {
  id: number;
  text: string;
  angle: string;
  topic: number;
  originality: number;
  voice: number;
  hour: number;
  economy: number;
  total: number;
  length: number;
}

function scoreCandidate(candidate: {
  id: number;
  text: string;
  angle: string;
}): ScoreBreakdown {
  const topic = scoreTopic(candidate.text);
  const originality = scoreOriginality(candidate.text);
  const voice = scoreVoice(candidate.text);
  const hour = scoreHour(candidate.text);
  const economy = scoreEconomy(candidate.text);
  return {
    id: candidate.id,
    text: candidate.text,
    angle: candidate.angle,
    topic,
    originality,
    voice,
    hour,
    economy,
    total: topic + originality + voice + hour + economy,
    length: charCount(candidate.text),
  };
}

// ---------------------------------------------------------------------------
// The gate
// ---------------------------------------------------------------------------
//
// Mirrors the competition's sealed gate: the entry must be UTF-8 text
// of 1 to 200 characters, not only white space — and, for this task,
// exactly one line. A candidate that fails any check is eliminated
// outright: it is listed in the report, scores nothing, and can never win, no
// matter how funny it is. The checks run in a fixed order so the
// reported reason is always the first failure found.
function gateCheck(text: string): string | null {
  if (text.length === 0 || text.trim().length === 0) {
    return "empty or whitespace-only";
  }
  if (text.includes("\n") || text.includes("\r")) {
    return "not a single line";
  }
  const length = charCount(text);
  if (length < 1 || length >= MAX_CHARS) {
    return `length ${length} is outside 1..${MAX_CHARS - 1} characters`;
  }
  // UTF-8 round trip: encode to bytes and decode back. A string that
  // does not survive the trip is not valid UTF-8 text.
  const bytes = Buffer.from(text, "utf8");
  const decoded = bytes.toString("utf8");
  if (decoded !== text) {
    return "not valid UTF-8 text";
  }
  return null;
}

// ---------------------------------------------------------------------------
// Selection
// ---------------------------------------------------------------------------
//
// Highest total wins. Ties break toward the shorter line — economy is
// the brief's own last criterion, so a shorter line that ties on
// everything else is the tighter joke — and then toward the earlier
// candidate, so the result is fully determined with no randomness.
function compareScores(a: ScoreBreakdown, b: ScoreBreakdown): number {
  if (a.total !== b.total) {
    return b.total - a.total;
  }
  if (a.length !== b.length) {
    return a.length - b.length;
  }
  return a.id - b.id;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main(): void {
  // 1. Gate every candidate, then score only the survivors.
  const valid: Array<ScoreBreakdown> = [];
  const rejected: Array<{ id: number; reason: string }> = [];
  for (const candidate of CANDIDATES) {
    const failure = gateCheck(candidate.text);
    if (failure !== null) {
      rejected.push({ id: candidate.id, reason: failure });
      continue;
    }
    valid.push(scoreCandidate(candidate));
  }

  if (valid.length === 0) {
    console.error("error: every candidate failed the gate; nothing to write");
    for (const entry of rejected) {
      console.error(`  candidate ${entry.id}: ${entry.reason}`);
    }
    process.exit(1);
  }

  // 2. Rank the survivors and take the winner.
  const ranked = [...valid].sort(compareScores);
  const winner = ranked[0];

  // 3. Report the whole table, so the choice can be checked by eye.
  console.log("The 3 AM Excuse — candidate scores (weights: topic 40, originality 25, voice 15, hour 12, economy 8)");
  console.log("id  total  topic orig voice hour econ  len  text");
  for (const entry of ranked) {
    console.log(
      `${String(entry.id).padStart(2, " ")}  ${String(entry.total).padStart(5, " ")}  ` +
        `${String(entry.topic).padStart(5, " ")} ${String(entry.originality).padStart(4, " ")} ` +
        `${String(entry.voice).padStart(5, " ")} ${String(entry.hour).padStart(4, " ")} ` +
        `${String(entry.economy).padStart(4, " ")}  ${String(entry.length).padStart(3, " ")}  ${entry.text}`,
    );
  }
  for (const entry of rejected) {
    console.log(`--  rejected candidate ${entry.id}: ${entry.reason}`);
  }
  console.log(`winner: candidate ${winner.id} (${winner.length} characters, ${winner.total}/100)`);

  // 4. Write the winner, exactly as scored: no trailing newline, no
  // extra whitespace, nothing the gate did not see.
  mkdirSync(OUTPUT_DIR, { recursive: true });
  writeFileSync(OUTPUT_FILE, winner.text, "utf8");

  // 5. Read the file back and compare it byte for byte with the winner.
  // A mismatch means the write did not land as intended, and the entry
  // must not be reported as good. Exit non-zero on failure.
  const written = readFileSync(OUTPUT_FILE);
  const expected = Buffer.from(winner.text, "utf8");
  if (!written.equals(expected)) {
    console.error(
      `error: verification failed — ${OUTPUT_FILE} (${written.length} bytes) ` +
        `does not match the winner (${expected.length} bytes)`,
    );
    process.exit(1);
  }

  // 6. One last gate check on exactly what sits on disk, so the file
  // itself — not just the in-memory string — is known to be valid.
  const onDisk = written.toString("utf8");
  const diskFailure = gateCheck(onDisk);
  if (diskFailure !== null) {
    console.error(`error: file on disk fails the gate: ${diskFailure}`);
    process.exit(1);
  }

  console.log(`wrote ${OUTPUT_FILE} (${written.length} bytes, verified byte-for-byte)`);
  console.log(`entry: ${winner.text}`);
}

main();
