**Event delegation** is a technique where you attach a **single event listener to a common parent element** instead of attaching listeners to many child elements. Thanks to **event bubbling**, events fired on children travel up to the parent, where you inspect `event.target` to figure out which child was actually interacted with.

## How it works

1. A user clicks a child element (e.g. an `<li>`).
2. The `click` event **bubbles** up through its ancestors: `li` → `ul` → `body` → `html` → `document`.
3. A listener on the `ul` receives the event.
4. Inside the handler, you check `event.target` (or use `closest()`) to decide what to do.

## Example

```js
// HTML: <ul id="todo-list"> <li data-id="1">Buy milk <button class="delete">x</button></li> ... </ul>

const list = document.querySelector('#todo-list');

list.addEventListener('click', (event) => {
  // closest() handles clicks on nested elements (icons, spans inside the button)
  const deleteBtn = event.target.closest('.delete');

  // Ignore clicks that are not on a delete button, or that come from outside this list
  if (!deleteBtn || !list.contains(deleteBtn)) return;

  const item = deleteBtn.closest('li');
  console.log('Deleting item', item.dataset.id); // "Deleting item 1"
  item.remove();
});

// Items added later work automatically, no new listeners needed:
const li = document.createElement('li');
li.dataset.id = '42';
li.innerHTML = 'New task <button class="delete">x</button>';
list.append(li);
```

### Without delegation (for comparison)

```js
// One listener per button, and new buttons need to be wired up manually
document.querySelectorAll('#todo-list .delete').forEach((btn) => {
  btn.addEventListener('click', () => btn.closest('li').remove());
});
```

## Benefits

- **Fewer listeners → less memory**: one handler instead of hundreds or thousands.
- **Dynamic content just works**: elements added later (via `innerHTML`, `append`, frameworks, infinite scroll) are covered automatically.
- **Simpler cleanup**: remove one listener instead of tracking many; fewer leaks from forgotten handlers on removed nodes.
- **Centralised logic**: one place to handle all actions, often routed via `data-*` attributes.

```js
// Routing multiple actions through one listener
toolbar.addEventListener('click', (e) => {
  const action = e.target.closest('[data-action]')?.dataset.action;
  if (!action) return;
  const handlers = {
    save: () => console.log('saving'),
    undo: () => console.log('undo'),
  };
  handlers[action]?.();
});
```

## `event.target` vs `event.currentTarget`

| Property | Refers to |
|---|---|
| `event.target` | The deepest element that was actually clicked (could be an icon inside a button) |
| `event.currentTarget` | The element the listener is attached to (the parent) |

This is why `closest()` is preferred over checking `event.target.matches(...)` directly: the target is often a nested child.

## Limitations and pitfalls

- **Events that don't bubble** can't be delegated the usual way: `focus`, `blur`, `mouseenter`, `mouseleave`, `load`, `scroll` (on elements). Use their bubbling counterparts `focusin` / `focusout` / `mouseover` / `mouseout`, or a capturing listener.
- If a child calls `event.stopPropagation()`, the parent never sees the event.
- Very high-frequency events (`mousemove`) on a big container fire the handler a lot; keep the handler cheap.
- Delegating everything to `document` makes logic harder to follow; delegate to the **nearest stable container**.

> React uses delegation internally: it attaches listeners at the root container and dispatches synthetic events to your components.

## Summary

- Event delegation = one listener on a parent + bubbling + `event.target`/`closest()` to identify the child.
- It saves memory, handles dynamically added elements, and simplifies cleanup.
- Watch out for non-bubbling events and `stopPropagation()`.
