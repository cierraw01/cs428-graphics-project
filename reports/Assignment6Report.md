# Assignment 6: Feature Complete

## Team
- Rudra Patel (Group Leader), Cierra Wickliff, Krupa Ray, Jasman Mangat

## Links
- **Live Build:** https://cs428-graphics-project.vercel.app/
- **Source Code:** https://github.com/cierraw01/cs428-graphics-project

---

## Feature Complete Release Notes

### Bug Fixes
- **Collision Detection** does not allow the camera to go through terrain or fly underground.
- **Shadow Camera Following**
- **Frustum Culling for Chunks**

### Loading Screen 


### Particle VFX
- Clicking the `r` key toggles the rain effect off and on.
- Dust particles around hero movement.
- Clouds.


### Audio Integration
- Ambient audio for day and night sounds.


---

## User Study Results

### Methodology

For each individual tester, we presented the.

### Subject Feedback

(UI confusion, difficulty curves, performance drops)
The players took more time reading x than expected. Although the prompts said y, they didn't seem to see it.
*What was the most confusing or frustrating part of the experience?*
*On a scale of 1-10, how intuitive were the controls?*
*Did you notice any visual glitches or lag? If so, when?*

### Action Items

1. 

2. 

3. 

---

## Build & Run Instructions

```sh
# Clone
git clone https://github.com/cierraw01/cs428-graphics-project.git
cd cs428-graphics-project/graphics-app

# Install dependencies
npm install

# Development server
npm run dev
# → http://localhost:5173

# Production build
npm run build

# Run tests
npm test
```

## Controls

| Key | Action |
|-----|--------|
| Click canvas | Lock pointer / enter fly mode |
| Mouse | Look around |
| W / S | Move forward / backward |
| A / D | Strafe left / right |
| Space | Ascend |
| Left Ctrl | Descend |
| Shift | Sprint (2.5× speed) |
| Esc | Release pointer lock |
