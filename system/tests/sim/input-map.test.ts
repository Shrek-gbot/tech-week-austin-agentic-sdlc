// The input map: the frame the player pressed becoming the frame the wizard
// acts on (docs/plan/02-design/bug-quest.md, the creature). It is driven
// through tick() like every replay test, so game/sim/input-map.ts stays inside
// the simulation.
//
// HW-001 was planted here and is fixed: a rider changes nothing about which
// way the buttons point, and the tests below say so for both directions.

import { describe, expect, it } from 'vitest';
import type { InputFrame, WorldState } from '../../game/sim/index';
import { NO_INPUT } from '../../game/sim/index';
import { hold, run, worldFrom } from './helpers';

/** A bush to walk into, and floor the whole way, so only the input moves him. */
const ROOM = `

  P  B
  #################
`;

/** Ticks of walking right; enough to reach the bush, short of the far wall. */
const WALK = 30;

const RIGHT: InputFrame = { ...NO_INPUT, right: true };
const LEFT: InputFrame = { ...NO_INPUT, left: true };
const JUMP: InputFrame = { ...NO_INPUT, jump: true };
const CHARGE: InputFrame = { ...NO_INPUT, charge: true };

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

    run(world, [JUMP]);

    expect(world.player.onGround).toBe(false);
    expect(world.player.state).toBe('jump');
  });

  it('walks right on right while the creature rides', () => {
    const world = run(worldFrom(ROOM, { creature: true }), hold({ right: true }, WALK));

    expect(carriedSince(world), 'the creature never climbed on').toBeGreaterThanOrEqual(0);

    const from = world.player.x;

    run(world, hold({ right: true }, 20));

    expect(world.player.x).toBeGreaterThan(from);
  });

  it('walks left on left while the creature rides', () => {
    const world = run(worldFrom(ROOM, { creature: true }), hold({ right: true }, WALK));

    expect(carriedSince(world), 'the creature never climbed on').toBeGreaterThanOrEqual(0);

    const from = world.player.x;

    run(world, hold({ left: true }, 20));

    expect(world.player.x).toBeLessThan(from);
  });

  it('jumps the same with or without the creature', () => {
    const plain = run(worldFrom(ROOM), hold({}, 1));
    const riding = run(worldFrom(ROOM, { creature: true }), hold({ right: true }, WALK));

    expect(carriedSince(riding), 'the creature never climbed on').toBeGreaterThanOrEqual(0);
    expect(plain.player.onGround).toBe(true);
    expect(riding.player.onGround).toBe(true);

    run(plain, [JUMP]);
    run(riding, [JUMP]);

    expect(riding.player.state).toBe(plain.player.state);
    expect(riding.player.vy).toBe(plain.player.vy);
    expect(riding.player.onGround).toBe(plain.player.onGround);
  });

  it('charges the same with or without the creature', () => {
    const plain = run(worldFrom(ROOM), hold({}, 1));
    const riding = run(worldFrom(ROOM, { creature: true }), hold({ right: true }, WALK));

    expect(carriedSince(riding), 'the creature never climbed on').toBeGreaterThanOrEqual(0);

    run(plain, [CHARGE]);
    run(riding, [CHARGE]);

    expect(riding.player.state).toBe(plain.player.state);
    expect(riding.player.vx).toBe(plain.player.vx);
    expect(riding.player.vy).toBe(plain.player.vy);
  });

  it('exports button frames that still point left and right as named', () => {
    expect(RIGHT.right).toBe(true);
    expect(RIGHT.left).toBe(false);
    expect(LEFT.left).toBe(true);
    expect(LEFT.right).toBe(false);
  });
});
