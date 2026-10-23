// Optional Web Audio API Sound Engine (Default: Sound Off)
// Provides subtle acoustic cues for the 7 key events specified in Part VI Section 12.

export type SoundCue =
  | 'initial_signal'
  | 'network_connection'
  | 'fragmentation'
  | 'dark_to_light'
  | 'product_reveal'
  | 'execution_complete'
  | 'final_resolve';

class EkarvoSoundEngine {
  private ctx: AudioContext | null = null;
  private enabled = false;

  public isEnabled(): boolean {
    return this.enabled;
  }

  public setEnabled(next: boolean): boolean {
    this.enabled = next;
    if (next && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx && !this.ctx) {
        this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      this.play('initial_signal');
    }
    return this.enabled;
  }

  public play(cue: SoundCue): void {
    if (!this.enabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      switch (cue) {
        case 'initial_signal': {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(220, now);
          osc.frequency.exponentialRampToValueAtTime(440, now + 0.35);
          gain.gain.setValueAtTime(0.001, now);
          gain.gain.linearRampToValueAtTime(0.04, now + 0.08);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
          osc.start(now);
          osc.stop(now + 0.42);
          break;
        }
        case 'network_connection': {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(330, now);
          osc.frequency.exponentialRampToValueAtTime(495, now + 0.25);
          gain.gain.setValueAtTime(0.001, now);
          gain.gain.linearRampToValueAtTime(0.035, now + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
          osc.start(now);
          osc.stop(now + 0.32);
          break;
        }
        case 'fragmentation': {
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(110, now);
          osc.frequency.linearRampToValueAtTime(82.4, now + 0.45);
          gain.gain.setValueAtTime(0.001, now);
          gain.gain.linearRampToValueAtTime(0.025, now + 0.1);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
          osc.start(now);
          osc.stop(now + 0.52);
          break;
        }
        case 'dark_to_light': {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(261.63, now);
          osc.frequency.exponentialRampToValueAtTime(523.25, now + 0.65);
          gain.gain.setValueAtTime(0.001, now);
          gain.gain.linearRampToValueAtTime(0.045, now + 0.2);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);
          osc.start(now);
          osc.stop(now + 0.72);
          break;
        }
        case 'product_reveal': {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(392.0, now);
          osc.frequency.setValueAtTime(587.33, now + 0.12);
          gain.gain.setValueAtTime(0.001, now);
          gain.gain.linearRampToValueAtTime(0.04, now + 0.06);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
          osc.start(now);
          osc.stop(now + 0.48);
          break;
        }
        case 'execution_complete': {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(523.25, now);
          osc.frequency.setValueAtTime(659.25, now + 0.08);
          gain.gain.setValueAtTime(0.001, now);
          gain.gain.linearRampToValueAtTime(0.04, now + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
          osc.start(now);
          osc.stop(now + 0.3);
          break;
        }
        case 'final_resolve': {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.exponentialRampToValueAtTime(220, now + 0.6);
          gain.gain.setValueAtTime(0.001, now);
          gain.gain.linearRampToValueAtTime(0.035, now + 0.1);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);
          osc.start(now);
          osc.stop(now + 0.68);
          break;
        }
      }
    } catch {
      // Ignore Web Audio restriction errors if user hasn't interacted yet
    }
  }
}

export const soundEngine = new EkarvoSoundEngine();
