export const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"] as const;

export const ACTIVITY_LEVELS = [
  "sedentary",
  "light",
  "moderate",
  "active",
  "very_active",
] as const;

export const GOALS = ["lose", "maintain", "gain"] as const;

export const SEX_OPTIONS = ["male", "female", "other"] as const;

export const UNIT_SYSTEMS = ["metric", "imperial"] as const;

export const PET_TEMPLATE_IDS = [
  "sprout_fox",
  "miso_bunny",
  "mochi_cat",
  "ink_cat",
] as const;

export const PET_STAGES = ["baby", "kid", "teen", "adult"] as const;

export const PET_MOODS = [
  "curious",
  "happy",
  "sleepy",
  "excited",
  "calm",
] as const;

export const PET_INTERACTION_TYPES = [
  "greet",
  "pat",
  "feed",
  "play",
  "tap",
  "idle_tick",
] as const;

export const PET_ANIMATIONS = [
  "idle",
  "blink",
  "wave",
  "happy",
  "thinking",
  "sleep",
] as const;

export const PET_TEMPLATES = [
  {
    id: "sprout_fox",
    name: "Sprout",
    species: "Fox",
    personality: "Curious explorer",
    description: "Always sniffing around for something new.",
    primaryColor: "#f58d57",
    accentColor: "#ffe1bf",
    earStyle: "pointed",
    greetingLines: [
      "Hey, partner. What are we doing today?",
      "I found a cozy corner for us.",
      "You are back. I saved your spot.",
    ],
    emotes: {
      curious: "sniff sniff",
      happy: "tail swish",
      sleepy: "tiny yawn",
      excited: "zoom",
      calm: "warm stare",
    },
  },
  {
    id: "miso_bunny",
    name: "Miso",
    species: "Bunny",
    personality: "Gentle optimist",
    description: "Loves calm vibes and quiet moments.",
    primaryColor: "#d8c2ff",
    accentColor: "#fff2d8",
    earStyle: "long",
    greetingLines: [
      "Hi hi. I was waiting for you.",
      "Want to take it easy together?",
      "This place feels better with you here.",
    ],
    emotes: {
      curious: "nose twitch",
      happy: "happy hop",
      sleepy: "soft doze",
      excited: "double hop",
      calm: "slow blink",
    },
  },
  {
    id: "mochi_cat",
    name: "Mochi",
    species: "Cat",
    personality: "Mischievous sidekick",
    description: "Pretends to be aloof, secretly adores attention.",
    primaryColor: "#9cc5ff",
    accentColor: "#fff3d6",
    earStyle: "round",
    greetingLines: [
      "Oh, it is you. Nice timing.",
      "I was not waiting... probably.",
      "You are here. Let us stir up some fun.",
    ],
    emotes: {
      curious: "head tilt",
      happy: "purr",
      sleepy: "curl up",
      excited: "pounce pose",
      calm: "content hum",
    },
  },
  {
    id: "ink_cat",
    name: "Ink",
    species: "Cat",
    personality: "Tuxedo cuddle buddy",
    description: "A tuxedo cat with olive-green eyes and a soft white chin patch.",
    primaryColor: "#16191f",
    accentColor: "#f8f8f8",
    earStyle: "round",
    greetingLines: [
      "Mrrp. I claimed the coziest seat for us.",
      "Quiet paws, warm vibes.",
      "I am here. You are safe to take it slow.",
    ],
    emotes: {
      curious: "ear perk",
      happy: "purr purr",
      sleepy: "loaf mode",
      excited: "zoomies",
      calm: "soft blink",
    },
  },
] as const;
