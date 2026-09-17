# How-to: Update the embed

The challenge is embedded into the Squarespace page at `tims.org.au/cybersecurity`
via an iframe. The embed is a self-contained snippet in
[`embed/EMBED_SNIPPET.html`](../../embed/EMBED_SNIPPET.html).

## How the embed works

- A `<div id="cybersec-challenge">` plus a small inline `<script>` that injects
  an `<iframe>` pointing at `https://cybersecurity.tims.org.au/?embed=1`, with
  campaign attribution appended (see below).
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

## Campaign attribution forwarding

The iframe can't see the Squarespace page's URL or referrer, so the snippet
copies them onto the iframe `src`:

- any `utm_source`, `utm_medium`, `utm_campaign`, `utm_content` on the TIMS page
  URL (each truncated to 120 chars), and
- `ref` — the **hostname** of the site that referred the visitor to the TIMS page
  (omitted when it's the TIMS site itself).

For example, a visitor arriving from Facebook at
`https://tims.org.au/cybersecurity?utm_source=tims&utm_medium=facebook&utm_campaign=sept-course&utm_content=abc123`
gets an iframe at
`https://cybersecurity.tims.org.au/?embed=1&utm_source=tims&utm_medium=facebook&utm_campaign=sept-course&utm_content=abc123&ref=l.facebook.com`.
The app (`frontend/src/lib/attribution.ts`) reads those and records them with
the session (`/api/start`) and any sign-up (`/api/lead`).

Campaign links should therefore point at the TIMS page (or the standalone quiz
URL, `https://cybersecurity.tims.org.au/`) with UTMs, e.g.
`?utm_source=tims&utm_medium=facebook&utm_campaign=sept-course&utm_content=<publer creative id>`.

> **Re-paste required.** Snippets pasted before attribution forwarding was added
> load a bare `/?embed=1`, so embedded traffic arrives with **no** UTMs and can't
> be attributed to a campaign. Re-paste the current `EMBED_SNIPPET.html` (steps
> below) for embedded campaigns to be tracked.

## Install / re-install on Squarespace

1. In Squarespace, open the target page (`/cybersecurity`).
2. Add (or open) a **Code Block** where the challenge should appear.
3. Copy the **entire** contents of `embed/EMBED_SNIPPET.html` and paste it into
   the Code Block. Save.
4. Test in a fresh browser session — the iframe should appear and auto-resize as
   you progress through screens.

### Test attribution

1. Open the live page with test UTMs in a private window, e.g.
   `https://tims.org.au/cybersecurity?utm_source=test&utm_medium=manual&utm_campaign=embed-check`.
2. In devtools, inspect the iframe — its `src` should include the same `utm_*`
   parameters.
3. Start the challenge. In the Network tab, the `POST /api/start` request body
   should carry `"utm_source": "test"` and the rest.
4. Confirm the row landed, then remove it:

   ```sh
   cd frontend
   npx wrangler d1 execute cybersecurity-champions-db --remote \
     --command="SELECT * FROM sessions WHERE utm_source='test' ORDER BY started_at DESC LIMIT 5;"
   npx wrangler d1 execute cybersecurity-champions-db --remote \
     --command="DELETE FROM events WHERE session_id IN (SELECT session_id FROM sessions WHERE utm_source='test'); DELETE FROM sessions WHERE utm_source='test';"
   ```

   If you also finished the challenge or signed up, remove those test
   completion/lead rows too (see
   [How-to: Export and manage leads](export-and-manage-leads.md)).

Attribution is cached per browser tab, so use a new tab (or private window) for
each test — or use a URL with fresh UTMs, which replace the cached values.

## Changing the snippet

If you edit `embed/EMBED_SNIPPET.html`, you must **re-paste it into the
Squarespace Code Block** — the snippet is copied into Squarespace, not loaded
from this repo at runtime.

Common edits:

| Want to… | Change |
|---|---|
| Point at a different host | `EMBED_ORIGIN` (and confirm CORS/CSP allow it). |
| Adjust starting height | `INITIAL_HEIGHT` / `MIN_HEIGHT`. |
| Change which query params are forwarded | `UTM_KEYS` (keep in step with `frontend/src/lib/attribution.ts`). |
| Tighten/loosen iframe permissions | the `sandbox` / `allow` attributes. |

> **Don't add padding to the height calculation** in the resize handler. The app
> sends its exact content height; adding to it on each round-trip causes a
> runaway resize loop. The snippet deliberately matches height exactly and only
> updates when the delta is >4px.

## The alternative drop-in script

`embed/embed.js` is an alternative installation (a hostable script) for contexts
where pasting the full snippet isn't ideal. It forwards attribution the same way;
keep the two files in step. For Squarespace, prefer `EMBED_SNIPPET.html`.

## Troubleshooting

**Iframe doesn't resize** — open browser devtools and look for blocked
postMessage. The snippet only accepts messages from
`https://cybersecurity.tims.org.au`; make sure the iframe `src` matches that
origin exactly. More in [Troubleshooting](../troubleshooting.md).

**Embedded visits show no campaign** — check the iframe `src` includes `utm_*`.
If it's just `/?embed=1`, the Code Block holds an old snippet; re-paste it. If
the TIMS page URL itself has no UTMs (e.g. the campaign link pointed somewhere
else, or a redirect dropped them), there's nothing to forward.
