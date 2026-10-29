// The input map: the frame the player pressed becoming the frame the wizard
// acts on (docs/plan/02-design/bug-quest.md, the creature). It is driven
// through tick() like every replay test, so game/sim/input-map.ts stays inside
// the simulation.
//
// HW-001 was planted here and is fixed: a rider changes nothing about which
// way the buttons point, and the tests below say so for both directions.

import { describe, expect, it } from 'vitest';
import type { WorldState } from '../../game/sim/index';
import { hold, run, worldFrom } from './helpers';

/** A bush to walk into, and floor the whole way, so only the input moves him. */
const ROOM = `

  P  B
  #################
`;

/** Ticks of walking right; enough to reach the bush, short of the far wall. */
const WALK = 30;

/** The creature's ride, or -1 while it is anywhere else. */
function carriedSince(world: WorldState): number {
  return world.creature?.carriedSince ?? -1;
}

describe('the input map', () => {
  it('walks the wizard right on right while the creature is still hiding', () => {
    const world = worldFrom(ROOM, { creature: true });
    const from = world.player.x;

    run(world, hold({ right: true }, 1));

    expect(carriedSince(world)).toBe(-1);
    expect(world.player.x).toBeGreaterThan(from);
  });

  it('leaves the jump to the wizard while the creature rides', () => {
    const world = run(worldFrom(ROOM, { creature: true }), hold({ right: true }, WALK));

    expect(carriedSince(world), 'the creature never climbed on').toBeGreaterThanOrEqual(0);
    expect(world.player.onGround).toBe(true);

    run(world, hold({ jump: true }, 1));

    expect(world.player.onGround).toBe(false);
    expect(world.player.state).toBe('jump');
  });

  it.each([
    ['right', { right: true }, 1],
    ['left', { left: true }, -1],
  ] as const)('walks the wizard %s on %s while the creature rides', (_name, press, sign) => {
    const world = run(worldFrom(ROOM, { creature: true }), hold({ right: true }, WALK));

    expect(carriedSince(world), 'the creature never climbed on').toBeGreaterThanOrEqual(0);

    const from = world.player.x;

    run(world, hold(press, 20));

    expect(Math.sign(world.player.x - from)).toBe(sign);
  });
});
