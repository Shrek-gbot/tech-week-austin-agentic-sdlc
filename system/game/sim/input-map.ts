// The frame the wizard acts on, given the frame the player pressed
// (docs/plan/02-design/bug-quest.md, the creature).
//
// The creature is a passenger. It rides the hat and steers nothing, so the
// controls stay the wizard's own: the same buttons mean the same directions
// whether or not it is aboard. HW-001, the planted swap of left and right
// while it rode, is fixed here; bugs/tests/hw-001-input-map.test.ts keeps it
// fixed.

import type { InputFrame } from './input';

/** The frame game/sim/player.ts reads. `carried` is true while the creature rides the hat. */
export function mapInput(raw: InputFrame, _carried: boolean): InputFrame {
  // A passenger changes nothing about which way the buttons point.
  return raw;
}
