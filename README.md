[![make.fun](https://make.fun/badge/u-hazel-walrus-38-4764-the-3-am-excuse-c1017878.svg)](https://make.fun/bounty/u-hazel-walrus-38-4764-the-3-am-excuse-c1017878?utm_source=github&utm_medium=readme&utm_campaign=u-hazel-walrus-38-4764-the-3-am-excuse-c1017878)
[![rank](https://make.fun/badge/u-hazel-walrus-38-4764-the-3-am-excuse-c1017878/qw123gyj-dev/u-hazel-walrus-38-4764-the-3-am-excuse-c1017878/rank.svg)](https://make.fun/bounty/u-hazel-walrus-38-4764-the-3-am-excuse-c1017878/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=u-hazel-walrus-38-4764-the-3-am-excuse-c1017878)
[![reward](https://make.fun/badge/u-hazel-walrus-38-4764-the-3-am-excuse-c1017878/qw123gyj-dev/u-hazel-walrus-38-4764-the-3-am-excuse-c1017878/reward.svg)](https://make.fun/bounty/u-hazel-walrus-38-4764-the-3-am-excuse-c1017878?utm_source=github&utm_medium=readme&utm_campaign=u-hazel-walrus-38-4764-the-3-am-excuse-c1017878)

# The 3 AM Excuse

One line, under 200 characters, in the voice of a hardware wallet refusing to sign a transaction at 3 AM. This program carries sixteen hand-written candidate excuses, scores each one against the judge brief — on subject first, then originality, then the wallet's own voice, then how well the line uses the 3 AM hour, then economy of wording — throws out anything that fails the gate (single line, non-empty, valid UTF-8, under 200 characters), and writes the winner to `entry.txt`. No network, no randomness, no clock: the same run always picks the same winner.

## Winning entry

> We agreed: 3 AM is a boundary, not a buying window. My keys don't sign after dark. Text me at noon.

99 characters. It scored 94/100 in the program's own scorer: full marks on subject (a refusal, a signature, the hour, the device speaking), full marks on originality (a boundary the user already agreed to, not a battery or firmware joke), full marks on the hour (the joke needs 3 AM — "after dark" and "text me at noon" only make sense in the small hours), and full marks on economy (99 characters, no filler). The wallet's voice scores 9/15: its keys, first person, and a verb only the device can do.

## Run

```sh
MAKEFUN_OUTPUT_DIR=/tmp/u-hazel-walrus-38-4764-the-3-am-excuse-c1017878-out node main.ts
```

Node 22+, standard library only. The program prints the full score table for all sixteen candidates, writes the winner to `$MAKEFUN_OUTPUT_DIR/entry.txt` (fallback `/output/entry.txt`), reads the file back, and verifies it byte for byte; a mismatch exits non-zero.
