
  # Teen-Friendly Mobile Game Design

  This is a code bundle for Teen-Friendly Mobile Game Design. The original project is available at https://www.figma.com/design/GCEh0Xny2wZP5AW9nxjAHT/Teen-Friendly-Mobile-Game-Design.

## Running the code

Run `npm i` to install the dependencies.

Run `npm run dev` to start the development server.

## API integration

The game now attempts to load all data from a backend hosted at `https://sample.com`. The following endpoints are called:

- `POST /api/game/start` – begins a new playthrough and returns the initial `game_id`, day number, and absolute parameter values.
- `GET /api/game/{game_id}/day/{day_number}` – retrieves that day’s event payload (`status`, `event_message`, four options).
- `POST /api/game/{game_id}/choice` – sends `{ "choice_index": number }` and expects updated absolute `status` plus a `result_message`.
- `GET /api/game/{game_id}/status` – fetches the current absolute parameter values.

If any request fails (network error, non-2xx, or timeout) the UI transparently falls back to the local mock event generator so players can continue. When the fallback is active, a yellow notice appears in the game UI.

### Configuration

Two optional Vite environment variables control the integration:

| Variable | Description | Default |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Overrides the backend base URL. | `https://sample.com` |
| `VITE_USE_MOCK_API` | When set to `true`, forces the frontend to use the local mock data regardless of network availability. | `false` |

Set these in a `.env` file at the repo root when you need to point to a different environment or run fully offline.

### Testing the fallback

1. Start the dev server (`npm run dev`).
2. Disconnect from the network or point `VITE_API_BASE_URL` to an invalid host.
3. Reload the app. The UI will surface the “demo data” banner, confirming that the mock pipeline is running.

Re-enable networking (or supply a working backend URL) to switch back to live data—no restart required.
  