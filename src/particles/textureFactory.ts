import { Graphics, type Renderer, type Texture } from 'pixi.js';
import type { ParticleTextureShape } from '@/types';

const cache = new Map<ParticleTextureShape, Texture>();

function buildGraphics(shape: ParticleTextureShape): Graphics {
  const g = new Graphics();
  switch (shape) {
    case 'circle':
      g.circle(0, 0, 16).fill({ color: 0xffffff });
      break;
    case 'spark':
      g.moveTo(0, -18)
        .lineTo(4, -4)
        .lineTo(18, 0)
        .lineTo(4, 4)
        .lineTo(0, 18)
        .lineTo(-4, 4)
        .lineTo(-18, 0)
        .lineTo(-4, -4)
        .closePath()
        .fill({ color: 0xffffff });
      break;
    case 'triangle':
      g.moveTo(0, -16).lineTo(14, 12).lineTo(-14, 12).closePath().fill({ color: 0xffffff });
      break;
    case 'square':
      g.rect(-12, -12, 24, 24).fill({ color: 0xffffff });
      break;
    case 'leaf':
      g.moveTo(0, -16)
        .bezierCurveTo(14, -10, 14, 10, 0, 16)
        .bezierCurveTo(-14, 10, -14, -10, 0, -16)
        .fill({ color: 0xffffff });
      break;
    case 'star': {
      const spikes = 5;
      const outerR = 16;
      const innerR = 7;
      let rot = -Math.PI / 2;
      const step = Math.PI / spikes;
      g.moveTo(Math.cos(rot) * outerR, Math.sin(rot) * outerR);
      for (let i = 0; i < spikes; i++) {
        rot += step;
        g.lineTo(Math.cos(rot) * innerR, Math.sin(rot) * innerR);
        rot += step;
        g.lineTo(Math.cos(rot) * outerR, Math.sin(rot) * outerR);
      }
      g.closePath().fill({ color: 0xffffff });
      break;
    }
    case 'ring':
      g.circle(0, 0, 16).stroke({ width: 4, color: 0xffffff });
      break;
    case 'bolt':
      g.moveTo(-4, -18)
        .lineTo(6, -2)
        .lineTo(-2, -2)
        .lineTo(8, 18)
        .lineTo(-4, 2)
        .lineTo(2, 2)
        .closePath()
        .fill({ color: 0xffffff });
      break;
  }
  return g;
}

/** Procedurally builds and caches a white base texture per shape; color comes from sprite tint. */
export function getParticleTexture(renderer: Renderer, shape: ParticleTextureShape): Texture {
  const cached = cache.get(shape);
  if (cached) return cached;

  const graphics = buildGraphics(shape);
  const texture = renderer.generateTexture(graphics);
  graphics.destroy();
  cache.set(shape, texture);
  return texture;
}
