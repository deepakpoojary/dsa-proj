`preventDefault()` **cancels the browser's default action** for an event (like following a link or submitting a form), while `stopPropagation()` **stops the event from travelling** to other elements in the capture/bubble path. They solve different problems and are completely independent of each other.

## `event.preventDefault()`

Tells the browser: "don't do what you'd normally do for this event." The event still propagates to ancestors.

```js
// Stop a form from reloading the page
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = new FormData(form);
  console.log('Submitting via fetch:', Object.fromEntries(data));
});

// Stop a link from navigating
link.addEventListener('click', (e) => {
  e.preventDefault();
  console.log('Handle navigation in the SPA router instead');
});
```

Common default actions you might prevent:

- Link navigation (`<a href>` click)
- Form submission
- Checkbox toggling
- Text selection, context menu (`contextmenu`)
- Keyboard shortcuts (`keydown`, e.g. Ctrl+S)
- Scrolling on `wheel`/`touchmove` (requires `{ passive: false }`)

## `event.stopPropagation()`

Stops the event from reaching further elements in the propagation path. The default action **still happens**.

```js
// HTML: <div class="card"><button class="like">Like</button></div>
card.addEventListener('click', () => console.log('open card details'));

likeBtn.addEventListener('click', (e) => {
  e.stopPropagation();          // card's click handler won't run
  console.log('liked');
});

// Clicking "Like" logs only: liked
```

### `stopImmediatePropagation()`

Like `stopPropagation()`, but **also** prevents any remaining listeners on the *same element* from running.

```js
btn.addEventListener('click', (e) => { console.log('first'); e.stopImmediatePropagation(); });
btn.addEventListener('click', () => console.log('second')); // never runs
```

## Side-by-side example

```js
// HTML: <div id="box"><a id="link" href="/page">Go</a></div>
box.addEventListener('click', () => console.log('box clicked'));

link.addEventListener('click', (e) => {
  e.preventDefault();   // no navigation
  // e.stopPropagation(); // uncomment to also hide the click from #box
  console.log('link clicked');
});

// Click with only preventDefault:      "link clicked", "box clicked", no navigation
// Click with both:                     "link clicked", no navigation
// Click with only stopPropagation:     "link clicked", then browser navigates to /page
```

## Comparison table

| | `preventDefault()` | `stopPropagation()` |
|---|---|---|
| Purpose | Cancel browser default behavior | Stop event from reaching other elements |
| Event keeps propagating? | Yes | No |
| Default action happens? | No | Yes |
| Check if called | `event.defaultPrevented` | No direct property |
| Requires `cancelable` event | Yes | No |
| Typical use | Forms, links, custom shortcuts | Nested clickable elements, modals |

## Common pitfalls

- **`return false`** in an `addEventListener` handler does nothing. (It only works in inline `onclick` attributes; in jQuery it does both.)
- **Passive listeners** can't call `preventDefault()`; browsers make `touchstart`/`wheel` on `window`/`document` passive by default.
- **Overusing `stopPropagation()`** breaks event delegation, analytics, and "click outside to close" logic further up the tree. Prefer checking `event.target` in the parent, or `event.defaultPrevented`, instead.
- Calling `preventDefault()` on a non-cancelable event (e.g. `scroll`) has no effect.

## Summary

- `preventDefault()` → "don't do the browser's default thing", event still bubbles.
- `stopPropagation()` → "don't tell other elements", default action still happens.
- Use both when you need to fully take over an event; use `stopPropagation()` sparingly.
