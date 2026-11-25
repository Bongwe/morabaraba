# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Backend (Spring Boot — run from repo root)
```bash
# Run dev server (uses H2 in-memory DB on port 8080)
JAVA_HOME="/c/Program Files/Eclipse Adoptium/jdk-17.0.17.10-hotspot" ./mvnw spring-boot:run

# Build JAR
./mvnw clean package -DskipTests

# Run all backend tests
./mvnw test

# Run a single test class
./mvnw test -Dtest=GameServiceTest
```

### Frontend (Angular — run from `morabaraba-frontend/`)
```bash
cd morabaraba-frontend

npm install          # first-time setup
npm start            # dev server on port 4200 (proxies /api → localhost:8080)
npm run build        # production build → dist/morabaraba-frontend
npm test             # Karma/Jasmine test runner
```

### Docker (full stack)
```bash
docker compose up --build   # starts backend (8080) and frontend (80)
```

## Architecture

### Backend (`src/main/java/za/co/obomvu/interactive/Morabaraba/`)

Standard Spring Boot layered architecture:
- **controller/** — REST endpoints under `/api/games` and `/api/players`
- **service/** — all game logic lives in `GameService`; `PlayerService` is thin
- **domain/** — JPA entities (`GameEntity`) and game model classes (`Board`, `Node`, `GameState`, `Phase`, `Player`)
- **dto/** — `PlaceRequest`, `MoveRequest`, `RemoveRequest` for incoming moves
- **repository/** — Spring Data JPA (`GameRepository`, `PlayerRepository`)
- **config/** — Spring configuration (CORS, etc.)

`GameEntity` persists the entire `GameState` as a JSON blob in H2. The database uses `create-drop`, so all state is lost on restart. H2 console is available at `http://localhost:8080/h2-console` in dev.

Swagger UI is available at `http://localhost:8080/swagger-ui.html` (SpringDoc OpenAPI 3).

### Game Logic (`GameService`)

Morabaraba is a 24-node board game with three concentric squares connected by lines. Key constants in `GameService`:
- **24 nodes** identified by index, laid out in three rings
- **20 mill patterns** — sets of 3 node indices that form a winning "mill" (three in a row)
- **32 movement edges** — the adjacency graph defining legal moves; notably includes diagonal corner connections (a Morabaraba-specific rule distinguishing it from standard Nine Men's Morris)
- **Three game phases**: `PLACEMENT` (each player places 9 pieces), `MOVEMENT` (slide to adjacent node), `FLYING` (player with ≤3 pieces can jump anywhere)

When a mill is formed, the forming player must remove one opponent piece (`RemoveRequest`). The backend enforces this as a required follow-up action before the turn advances.

### Frontend (`morabaraba-frontend/src/app/`)

Angular 17 standalone-components app with Angular Material UI.

Routes (`app.routes.ts`):
- `/` → `LobbyComponent` — create or join a game
- `/morabaraba` → `GameComponent` — active Morabaraba game (creates new game)
- `/morabaraba/:gameId` → `GameComponent` — join existing game via shared link
- `/checkers` → `CheckersComponent` — separate Checkers variant

`GameService` (Angular) handles all HTTP calls to the backend. `game.component.ts` drives the board UI, turn indicator, and the invite-link flow for Player 2 to join.

`proxy.conf.json` rewrites `/api/*` to `http://localhost:8080` during `ng serve`, so no CORS issues in local development.

### CI/CD

GitHub Actions (`/.github/workflows/deploy.yml`) triggers on push to the `checkers-game` branch (the active development branch — `main` is not the deploy target). It builds Docker images, pushes to GitHub Container Registry, and deploys to a DigitalOcean droplet over SSH.
