import { NO_INPUT, createWorld, tick } from '../../game/sim/index';
import { describe, expect, it } from 'vitest';
import { worldFrom } from './helpers';

const ROOM = `

  P  B        
  ############
`;

function worldWithCreatureOnHat() {
  const world = worldFrom(ROOM, { creature: true });

  for (let step = 0; step < 240; step += 1) {
    tick(world, { ...NO_INPUT, right: true });

    if (world.creature?.carriedSince !== -1) {
      return world;
    }
  }

  throw new Error('the creature never climbed on the hat');
}

describe('input mapping with the creature riding', () => {
  it('keeps right moving the wizard right and left moving him left', () => {
    const rightWorld = worldWithCreatureOnHat();
    const startX = rightWorld.player.x;

    tick(rightWorld, { ...NO_INPUT, right: true });

    expect(rightWorld.player.x).toBeGreaterThan(startX);
    expect(rightWorld.player.facing).toBe(1);

    const leftWorld = worldWithCreatureOnHat();
    tick(leftWorld, { ...NO_INPUT, left: true });

    expect(leftWorld.player.x).toBeLessThan(leftWorld.props[0]!.x);
    expect(leftWorld.player.facing).toBe(-1);
  });

  it('leaves jump and charge unchanged while the creature rides', () => {
    const plainJump = createWorld('P\n#');
    const carriedJump = worldWithCreatureOnHat();

    tick(plainJump, { ...NO_INPUT, jump: true });
    tick(carriedJump, { ...NO_INPUT, jump: true });

    expect(carriedJump.player.state).toBe(plainJump.player.state);
    expect(carriedJump.player.vy).toBe(plainJump.player.vy);

    const plainCharge = createWorld('P\n#');
    const carriedCharge = worldWithCreatureOnHat();

    tick(plainCharge, { ...NO_INPUT, charge: true });
    tick(carriedCharge, { ...NO_INPUT, charge: true });

    expect(carriedCharge.player.state).toBe(plainCharge.player.state);
    expect(carriedCharge.player.stateTimer).toBe(plainCharge.player.stateTimer);
    expect(carriedCharge.player.facing).toBe(plainCharge.player.facing);
  });
});
