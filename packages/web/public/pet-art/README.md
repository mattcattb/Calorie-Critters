# Custom Pet Art

Drop your own pet model renders here to replace the built-in fallback avatar.

## Folder structure

Create one folder per template ID:

- `public/pet-art/sprout_fox/`
- `public/pet-art/miso_bunny/`
- `public/pet-art/mochi_cat/`
- `public/pet-art/ink_cat/`

## Supported file names (highest priority first)

1. `/{templateId}/{mood}-{animation}.png`
2. `/{templateId}/{mood}.png`
3. `/{templateId}/default.png`
4. `/{templateId}.png`

Examples:

- `public/pet-art/ink_cat/happy-happy.png`
- `public/pet-art/ink_cat/happy.png`
- `public/pet-art/ink_cat/default.png`

## Recommended export settings

- Transparent PNG
- Square canvas
- 512x512 or 1024x1024
- Keep pet centered with breathing room around edges

## Mood values

- `curious`
- `happy`
- `sleepy`
- `excited`
- `calm`

## Animation values

- `idle`
- `blink`
- `wave`
- `happy`
- `thinking`
- `sleep`
