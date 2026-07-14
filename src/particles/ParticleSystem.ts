import { Application, Sprite, type ColorSource } from 'pixi.js';
import type { EmitterOrigin, ParticlePreset } from '@/types';
import { randomBetween } from '@/utils/math';
import { getParticleTexture } from './textureFactory';

interface ParticleInstance {
  sprite: Sprite;
  active: boolean;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  rotationSpeed: number;
  scaleStart: number;
  scaleEnd: number;
  opacityStart: number;
  opacityEnd: number;
  gravity: number;
  acceleration: number;
  turbulence: number;
  turbulencePhase: number;
}

export interface EmitOptions {
  countMultiplier?: number;
  scaleMultiplier?: number;
  colorOverride?: string[];
}

/** Sprites are created once up to `maxParticles` and recycled forever after — emitting never allocates once the pool has warmed up. */
export class ParticleSystem {
  private app: Application | null = null;
  private pool: ParticleInstance[] = [];
  private maxParticles: number;
  private initialized = false;
  private initPromise: Promise<void> | null = null;

  constructor(maxParticles = 600) {
    this.maxParticles = maxParticles;
  }

  async mount(container: HTMLElement): Promise<void> {
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      const app = new Application();
      await app.init({
        resizeTo: container,
        backgroundAlpha: 0,
        antialias: true,
        preference: 'webgl',
      });
      container.appendChild(app.canvas);
      app.canvas.style.position = 'absolute';
      app.canvas.style.inset = '0';
      app.canvas.style.pointerEvents = 'none';

      this.app = app;
      this.warmPool();
      app.ticker.add((ticker) => this.update(ticker.deltaMS));
      this.initialized = true;
    })();

    return this.initPromise;
  }

  setMaxParticles(value: number): void {
    this.maxParticles = value;
    if (this.initialized) {
      if (this.pool.length < value) {
        this.warmPool();
      } else if (this.pool.length > value) {
        const excess = this.pool.splice(value);
        for (const p of excess) {
          p.sprite.destroy();
        }
      }
    }
  }

  private warmPool(): void {
    if (!this.app) return;
    while (this.pool.length < this.maxParticles) {
      const sprite = new Sprite();
      sprite.anchor.set(0.5);
      sprite.visible = false;
      this.app.stage.addChild(sprite);
      this.pool.push({
        sprite,
        active: false,
        vx: 0,
        vy: 0,
        life: 0,
        maxLife: 1,
        rotationSpeed: 0,
        scaleStart: 1,
        scaleEnd: 1,
        opacityStart: 1,
        opacityEnd: 0,
        gravity: 0,
        acceleration: 0,
        turbulence: 0,
        turbulencePhase: 0,
      });
    }
  }

  private acquire(): ParticleInstance | null {
    for (const particle of this.pool) {
      if (!particle.active) return particle;
    }
    return null;
  }

  emit(preset: ParticlePreset, origin: EmitterOrigin, options: EmitOptions = {}): void {
    if (!this.app) return;
    const renderer = this.app.renderer;
    const texture = getParticleTexture(renderer, preset.textureShape);
    const count = Math.round(preset.quantity * (options.countMultiplier ?? 1));
    const colors = options.colorOverride ?? preset.colors;

    for (let i = 0; i < count; i++) {
      const particle = this.acquire();
      if (!particle) break;

      const angleDeg =
        randomBetween(preset.direction.min, preset.direction.max) +
        randomBetween(-preset.spread, preset.spread) / 2;
      const angleRad = (angleDeg * Math.PI) / 180;
      const speed = randomBetween(preset.speed.min, preset.speed.max);
      const radiusOffset = randomBetween(0, preset.emissionRadius);
      const offsetAngle = randomBetween(0, Math.PI * 2);

      particle.sprite.texture = texture;
      particle.sprite.visible = true;
      particle.sprite.x = origin.x + Math.cos(offsetAngle) * radiusOffset;
      particle.sprite.y = origin.y + Math.sin(offsetAngle) * radiusOffset;
      particle.sprite.rotation = randomBetween(0, Math.PI * 2);
      particle.sprite.blendMode = preset.blendMode;
      particle.sprite.tint = (colors[Math.floor(Math.random() * colors.length)] ??
        '#ffffff') as ColorSource;
      particle.sprite.alpha = preset.opacity.start;

      const scaleMultiplier = options.scaleMultiplier ?? 1;
      const scaleVariance = 1 + randomBetween(-preset.scale.variance, preset.scale.variance);
      particle.scaleStart = preset.scale.start * scaleMultiplier * scaleVariance;
      particle.scaleEnd = preset.scale.end * scaleMultiplier * scaleVariance;
      particle.sprite.scale.set(particle.scaleStart / 32);

      particle.vx = Math.cos(angleRad) * speed;
      particle.vy = Math.sin(angleRad) * speed;
      particle.gravity = preset.gravity;
      particle.acceleration = preset.acceleration;
      particle.turbulence = preset.turbulence;
      particle.turbulencePhase = Math.random() * Math.PI * 2;
      particle.rotationSpeed = randomBetween(preset.rotationSpeed.min, preset.rotationSpeed.max);
      particle.opacityStart = preset.opacity.start;
      particle.opacityEnd = preset.opacity.end;
      particle.maxLife = randomBetween(preset.lifetime.min, preset.lifetime.max);
      particle.life = particle.maxLife;
      particle.active = true;
    }
  }

  private update(deltaMS: number): void {
    const dt = deltaMS / 16.6667;
    for (const particle of this.pool) {
      if (!particle.active) continue;

      particle.life -= deltaMS;
      if (particle.life <= 0) {
        particle.active = false;
        particle.sprite.visible = false;
        continue;
      }

      const t = 1 - particle.life / particle.maxLife;
      particle.turbulencePhase += 0.15 * dt;
      const turbulenceX = Math.sin(particle.turbulencePhase * 1.7) * particle.turbulence;
      const turbulenceY = Math.cos(particle.turbulencePhase) * particle.turbulence;

      particle.vy += particle.gravity * dt * 0.1;
      const speed = Math.hypot(particle.vx, particle.vy) || 1;
      particle.vx += (particle.vx / speed) * particle.acceleration * dt * 0.05;
      particle.vy += (particle.vy / speed) * particle.acceleration * dt * 0.05;

      particle.sprite.x += (particle.vx + turbulenceX) * dt;
      particle.sprite.y += (particle.vy + turbulenceY) * dt;
      particle.sprite.rotation += particle.rotationSpeed * dt * 0.05;

      const scale = particle.scaleStart + (particle.scaleEnd - particle.scaleStart) * t;
      particle.sprite.scale.set(scale / 32);
      particle.sprite.alpha =
        particle.opacityStart + (particle.opacityEnd - particle.opacityStart) * t;
    }
  }

  get activeCount(): number {
    return this.pool.reduce((sum, p) => (p.active ? sum + 1 : sum), 0);
  }

  clear(): void {
    for (const particle of this.pool) {
      particle.active = false;
      particle.sprite.visible = false;
    }
  }

  destroy(): void {
    this.clear();
    this.app?.destroy(true, { children: true });
    this.app = null;
    this.pool = [];
    this.initialized = false;
    this.initPromise = null;
  }
}
