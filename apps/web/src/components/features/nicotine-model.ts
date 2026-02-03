import type { DeviceType } from "./DeviceSelector";

export interface GraphEntry {
  time: Date;
  amount: number;
  type: DeviceType;
}

export interface SimulatedEntry {
  type: DeviceType;
  time: Date;
  amount?: number;
}

export const HALF_LIFE_HOURS = 2;
const DECAY_CONSTANT = Math.log(2) / HALF_LIFE_HOURS;

export const ABSORPTION_PROFILES: Record<
  DeviceType,
  { peakTime: number; peakFactor: number; mg: number }
> = {
  vape: { peakTime: 0.1, peakFactor: 0.9, mg: 1.5 },
  zyn: { peakTime: 0.5, peakFactor: 0.7, mg: 4 },
  cigarette: { peakTime: 0.15, peakFactor: 0.85, mg: 1.2 },
  iqos: { peakTime: 0.12, peakFactor: 0.8, mg: 1.0 },
};

export function calculateConcentration(
  entries: GraphEntry[],
  timePoint: Date,
  simulatedEntry?: SimulatedEntry | null
): { actual: number; simulated: number } {
  let actual = 0;

  for (const entry of entries) {
    const hoursElapsed =
      (timePoint.getTime() - entry.time.getTime()) / (1000 * 60 * 60);
    if (hoursElapsed < 0) continue;

    const profile = ABSORPTION_PROFILES[entry.type];
    const peakConcentration = entry.amount * profile.peakFactor;

    if (hoursElapsed >= profile.peakTime) {
      const decayTime = hoursElapsed - profile.peakTime;
      actual += peakConcentration * Math.exp(-DECAY_CONSTANT * decayTime);
    } else {
      const riseProgress = hoursElapsed / profile.peakTime;
      actual += peakConcentration * riseProgress;
    }
  }

  let simulated = actual;

  if (simulatedEntry) {
    const hoursElapsed =
      (timePoint.getTime() - simulatedEntry.time.getTime()) /
      (1000 * 60 * 60);
    if (hoursElapsed >= 0) {
      const profile = ABSORPTION_PROFILES[simulatedEntry.type];
      const peakConcentration =
        (simulatedEntry.amount ?? profile.mg) * profile.peakFactor;

      if (hoursElapsed >= profile.peakTime) {
        const decayTime = hoursElapsed - profile.peakTime;
        simulated += peakConcentration * Math.exp(-DECAY_CONSTANT * decayTime);
      } else {
        const riseProgress = hoursElapsed / profile.peakTime;
        simulated += peakConcentration * riseProgress;
      }
    }
  }

  return { actual, simulated };
}
