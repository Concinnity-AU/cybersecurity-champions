# How-to: Update the embed

The challenge is embedded into the Squarespace page at `tims.org.au/cybersecurity`
via an iframe. The embed is a self-contained snippet in
[`embed/EMBED_SNIPPET.html`](../../embed/EMBED_SNIPPET.html).

## How the embed works

- A `<div id="cybersec-challenge">` plus a small inline `<script>` that injects
  an `<iframe>` pointing at `https://cybersecurity.tims.org.au/?embed=1`.
- The iframe is sandboxed (`allow-scripts allow-same-origin allow-forms
  allow-popups allow-popups-to-escape-sandbox`) and granted `clipboard-write;
  web-share`.
- The embedded app posts `cybersec:resize` messages as the user moves between
  screens; the snippet listens and resizes the iframe to match content height.
- The `message` listener **checks `e.origin`** against
  `https://cybersecurity.tims.org.au` and ignores anything else — this is the
  security boundary. See [Explanation: Security](../explanation/security.md).
- A re-init guard (`data-cybersec-initialised`) prevents double-injection if
  Squarespace runs the block twice.

## Install / re-install on Squarespace

1. In Squarespace, open the target page (`/cybersecurity`).
2. Add (or open) a **Code Block** where the challenge should appear.
3. Copy the **entire** contents of `embed/EMBED_SNIPPET.html` and paste it into
   the Code Block. Save.
4. Test in a fresh browser session — the iframe should appear and auto-resize as
   you progress through screens.

## Changing the snippet

If you edit `embed/EMBED_SNIPPET.html`, you must **re-paste it into the
Squarespace Code Block** — the snippet is copied into Squarespace, not loaded
from this repo at runtime.

Common edits:

| Want to… | Change |
|---|---|
| Point at a different host | `EMBED_ORIGIN` (and confirm CORS/CSP allow it). |
| Adjust starting height | `INITIAL_HEIGHT` / `MIN_HEIGHT`. |
| Tighten/loosen iframe permissions | the `sandbox` / `allow` attributes. |

> **Don't add padding to the height calculation** in the resize handler. The app
> sends its exact content height; adding to it on each round-trip causes a
> runaway resize loop. The snippet deliberately matches height exactly and only
> updates when the delta is >4px.

## The alternative drop-in script

`embed/embed.js` is an alternative installation (a hostable script) for contexts
where pasting the full snippet isn't ideal. For Squarespace, prefer
`EMBED_SNIPPET.html`.

## Troubleshooting

**Iframe doesn't resize** — open browser devtools and look for blocked
postMessage. The snippet only accepts messages from
`https://cybersecurity.tims.org.au`; make sure the iframe `src` matches that
origin exactly. More in [Troubleshooting](../troubleshooting.md).
