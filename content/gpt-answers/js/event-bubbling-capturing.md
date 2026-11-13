**Event bubbling** and **event capturing** describe the order in which a DOM event travels through the element tree. In capturing, the event goes **down** from `window` to the target; in bubbling, it goes back **up** from the target to `window`. By default, listeners run during the bubbling phase.

## The three phases of event propagation

When you click a `<button>` inside a `<div>`, the event travels in three phases:

1. **Capturing phase**: `window` → `document` → `html` → `body` → `div` → (stops before the target)
2. **Target phase**: the event reaches the `button` itself
3. **Bubbling phase**: `button` → `div` → `body` → `html` → `document` → `window`

```
window
  └─ document            ↓ capture        ↑ bubble
       └─ html           ↓                ↑
            └─ body      ↓                ↑
                 └─ div  ↓                ↑
                      └─ button  (target phase)
```

## Example

```js
// HTML: <div id="parent"><button id="child">Click</button></div>
const parent = document.getElementById('parent');
const child = document.getElementById('child');

// Capturing listener (third argument true, or { capture: true })
parent.addEventListener('click', () => console.log('parent - capture'), true);

// Bubbling listeners (default)
parent.addEventListener('click', () => console.log('parent - bubble'));
child.addEventListener('click', () => console.log('child - target'));

// Clicking the button logs:
// parent - capture
// child - target
// parent - bubble
```

## Controlling the phase

```js
el.addEventListener('click', handler);                     // bubbling (default)
el.addEventListener('click', handler, true);               // capturing
el.addEventListener('click', handler, { capture: true });  // capturing (options form)

// To remove a capturing listener you must pass the same capture flag:
el.removeEventListener('click', handler, { capture: true });
```

You can check where you are with `event.eventPhase`: `1` = capturing, `2` = at target, `3` = bubbling.

## Stopping propagation

```js
child.addEventListener('click', (e) => {
  e.stopPropagation(); // parent bubble listeners will NOT run
  console.log('child only');
});

// stopImmediatePropagation() also prevents other listeners on the SAME element
child.addEventListener('click', (e) => e.stopImmediatePropagation());
```

Note: stopping propagation does **not** cancel the browser's default action (use `preventDefault()` for that).

## Bubbling vs capturing

| | Capturing | Bubbling |
|---|---|---|
| Direction | Top → down to target | Target → up to root |
| Default? | No, opt in with `capture: true` | Yes |
| Common use | Intercepting events early (e.g. global click-outside, analytics, blocking interactions) | Event delegation, most UI handlers |
| Order on ancestors | Outermost first | Innermost first |

## Events that don't bubble

Some events skip the bubbling phase, though they still have a capture phase:

- `focus` / `blur` (use `focusin` / `focusout` instead)
- `mouseenter` / `mouseleave` (use `mouseover` / `mouseout`)
- `load`, `unload`, `scroll` on elements, media events like `play`

You can check with `event.bubbles`.

## Why it matters

- **Event delegation** depends on bubbling: one listener on a parent handles events from all children.
- **Capturing** lets a parent react *before* the child, useful for "click outside to close" logic or disabling interactions.
- Understanding order helps debug why a handler fires twice or not at all.

## Summary

- Events travel **capture (down) → target → bubble (up)**.
- `addEventListener` uses bubbling by default; pass `{ capture: true }` for capturing.
- `stopPropagation()` halts the journey; `preventDefault()` cancels the default action.
- Bubbling is what makes event delegation possible.
