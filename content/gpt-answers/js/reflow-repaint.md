**Reflow** (also called **layout**) is when the browser recalculates the **size and position** of elements; **repaint** is when it redraws pixels for **visual changes** that don't affect layout (like color). Reflow is more expensive because it usually triggers a repaint too, and can cascade to parents, children and siblings.

## The rendering pipeline

Each frame, the browser roughly does:

1. **Style**: compute which CSS rules apply to each element
2. **Layout (reflow)**: calculate geometry: width, height, position
3. **Paint (repaint)**: fill in pixels: text, colors, borders, shadows
4. **Composite**: combine painted layers on the GPU and show them

Changing a property re-runs the pipeline **from the stage it affects onward**:

| Change type | Example properties | Triggers |
|---|---|---|
| Geometry | `width`, `height`, `margin`, `padding`, `top`, `font-size`, `display` | Layout → Paint → Composite |
| Visual only | `color`, `background`, `box-shadow`, `visibility`, `outline` | Paint → Composite |
| Compositor only | `transform`, `opacity` (on promoted layers) | Composite only |

## What triggers reflow

- Adding, removing or moving DOM nodes
- Changing size, position, font, or content (text changes)
- Resizing the window, changing zoom
- Toggling classes that change layout
- **Reading layout properties** after a write: `offsetWidth`, `offsetHeight`, `clientTop`, `scrollTop`, `getBoundingClientRect()`, `getComputedStyle()`

That last one causes **forced synchronous layout**: the browser must flush pending changes immediately to give you an accurate answer.

## Layout thrashing

Alternating reads and writes in a loop forces a reflow on every iteration:

```js
const boxes = document.querySelectorAll('.box');

// Bad: read → write → read → write ... forces layout N times
boxes.forEach((box) => {
  const width = box.offsetWidth;        // read (forces layout)
  box.style.width = width * 2 + 'px';   // write (invalidates layout)
});

// Good: batch all reads, then all writes → one layout
const widths = [...boxes].map((box) => box.offsetWidth);   // reads
boxes.forEach((box, i) => {
  box.style.width = widths[i] * 2 + 'px';                 // writes
});
```

## Techniques to minimize reflow and repaint

```js
// 1. Change classes instead of many inline styles
el.classList.add('expanded');

// 2. Build DOM off-screen, then insert once
const frag = document.createDocumentFragment();
for (let i = 0; i < 1000; i++) {
  const li = document.createElement('li');
  li.textContent = `Item ${i}`;
  frag.append(li);
}
list.append(frag); // single reflow

// 3. Animate transform/opacity, not top/left/width
el.style.transform = 'translateX(100px)'; // compositor only
// el.style.left = '100px';               // reflow every frame

// 4. Schedule visual updates with requestAnimationFrame
requestAnimationFrame(() => {
  el.style.transform = `translateY(${window.scrollY / 2}px)`;
});
```

More tips:

- Use **`will-change: transform`** sparingly to promote elements that animate often to their own layer.
- Use **CSS `contain: layout paint`** or `content-visibility: auto` to limit how far reflow spreads.
- Take elements out of flow (`position: absolute/fixed`) for complex animations.
- Avoid table layouts for dynamic content; one change can reflow the whole table.
- Use DevTools **Performance** panel: purple "Layout" bars and "Forced reflow" warnings point to problems.

## Reflow vs repaint

| | Reflow (layout) | Repaint (paint) |
|---|---|---|
| What changes | Geometry / position | Appearance only |
| Cost | High, can cascade through the tree | Lower |
| Triggers the other? | Yes, always followed by repaint | No |
| Examples | `width`, adding nodes, `font-size` | `color`, `background-color` |

## Summary

- **Reflow** recalculates layout; **repaint** redraws pixels. Every reflow causes a repaint, not vice versa.
- Batch DOM reads and writes to avoid **layout thrashing**.
- Prefer animating `transform` and `opacity`, which can skip both and run on the compositor.
