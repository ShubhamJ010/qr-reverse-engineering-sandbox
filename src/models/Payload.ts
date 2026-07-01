export interface Payload {
  referenceId: string;
  timestamp: string;
  description: string;
  itemId: string;
}

export interface PayloadWithRaw extends Payload {
  raw: string;
}

export interface Settings {
  darkMode: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  darkMode: false,
};

export const REFRESH_INTERVAL = 5;

export const EXAMPLE_PAYLOAD =
  'G10B5243Z26630202911993#2026-06-30 15:31:19#1 x Today\'s Special Dinner#463';
