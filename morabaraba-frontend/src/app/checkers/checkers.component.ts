import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CheckersService, CheckersBoard, CheckersSquare } from './checkers.service';

@Component({
  selector: 'app-checkers',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chess-page">
      <aside class="left-rail">
        <div class="logo">Checkers.com</div>
        <button class="rail-btn rail-active">Play</button>
        <button class="rail-btn">Puzzles</button>
        <button class="rail-btn">Learn</button>
        <button class="rail-btn">Watch</button>
        <button class="rail-btn">Community</button>
        <button class="rail-btn" (click)="goToLobby()">Back To Arcade</button>
        <div class="rail-spacer"></div>
        <button class="auth-btn signup" (click)="createNewGame()">New Game</button>
        <button class="auth-btn login" (click)="showInstructions = true">How To Play</button>
      </aside>

      <main class="center-stage" *ngIf="board">
        <div class="player-strip top-strip">Opponent</div>

        <div class="board-shell">
          <div class="ranks">
            <span *ngFor="let rank of ranks">{{ rank }}</span>
          </div>

          <div class="board-wrap">
            <div class="board-grid">
              <ng-container *ngFor="let row of rows">
                <div
                  *ngFor="let col of cols"
                  class="square"
                  [class.dark-sq]="isDark(row, col)"
                  [class.light-sq]="!isDark(row, col)"
                  [class.selected-sq]="selectedId === sq(row,col)?.id"
                  [class.valid-sq]="isValidDest(row, col)"
                  [class.jump-source]="isJumpSource(row, col)"
                  (click)="onSquareClick(row, col)"
                >
                  <ng-container *ngIf="sq(row,col) as s">
                    <div *ngIf="s.occupiedBy" class="piece"
                        [class.p1-piece]="s.occupiedBy === 'PLAYER_1'"
                        [class.p2-piece]="s.occupiedBy === 'PLAYER_2'"
                        [class.king-piece]="s.king">
                      <span class="crown" *ngIf="s.king">&#9813;</span>
                    </div>
                  </ng-container>
                </div>
              </ng-container>
            </div>
            <div class="files">
              <span *ngFor="let file of files">{{ file }}</span>
            </div>
          </div>
        </div>

        <div class="player-strip bottom-strip">You</div>
      </main>

      <aside class="right-rail" *ngIf="board">
        <h2 class="play-title">Play Checkers</h2>
        <div class="mode-card">
          <h3>Play Friend</h3>
          <p>Take turns on one board and practice lines.</p>
        </div>
        <div class="mode-card">
          <h3>Play Coach</h3>
          <p>Use move highlights to learn mandatory jumps.</p>
        </div>
        <div class="mode-card">
          <h3>Variants</h3>
          <p>Classic rules with king and multi-jump support.</p>
        </div>

        <div class="status-panel">
          <div class="turn-pill" [class.p1-turn]="board.gameState.currentPlayer === 'PLAYER_1'"
                                [class.p2-turn]="board.gameState.currentPlayer === 'PLAYER_2'">
            <span class="turn-dot"></span>
            {{ board.gameState.currentPlayer === 'PLAYER_1' ? 'Player 1' : 'Player 2' }} to move
          </div>
          <div class="captured-row">
            <span class="cap-label p1-cap">P1 captured: <strong>{{ board.gameState.capturedPieces['PLAYER_1'] }}</strong></span>
            <span class="cap-label p2-cap">P2 captured: <strong>{{ board.gameState.capturedPieces['PLAYER_2'] }}</strong></span>
          </div>
          <div class="jump-hint" *ngIf="board.gameState.mustJumpFrom">
            Forced sequence: continue jumping with the selected piece.
          </div>
          <p class="error-msg" *ngIf="errorMsg">{{ errorMsg }}</p>
        </div>
      </aside>

      <!-- Instructions overlay -->
      <div class="overlay" *ngIf="showInstructions" (click)="showInstructions = false">
        <div class="instructions-card" (click)="$event.stopPropagation()">
          <button class="close-btn" (click)="showInstructions = false">&#215;</button>
          <h2>How to Play Checkers</h2>
          <div class="instructions-body">
            <h3>Objective</h3>
            <p>Capture all of your opponent's pieces, or leave them with no valid moves to make.</p>

            <h3>Movement</h3>
            <p>Pieces move diagonally forward only, one square at a time, onto empty squares. Player 1 (Red) moves upward; Player 2 (Black) moves downward.</p>

            <h3>Capturing</h3>
            <p>Jump diagonally over an adjacent opponent's piece to capture it. The landing square must be empty. Captured pieces are removed from the board.</p>

            <h3>Mandatory Jumps</h3>
            <p>If a capture is available, you MUST take it. You cannot skip a jump to make a regular move.</p>

            <h3>Multi-Jumps</h3>
            <p>After capturing, if the same piece can jump again, you must continue jumping with that piece until no further jumps are possible.</p>

            <h3>Kings</h3>
            <p>When your piece reaches the far end of the board it becomes a King (&#9813;). Kings can move and capture in all four diagonal directions.</p>

            <h3>Winning</h3>
            <p>You win when your opponent has no pieces left or cannot make any valid move.</p>
          </div>
          <button class="popup-btn primary-btn" (click)="showInstructions = false">Got it!</button>
        </div>
      </div>

      <!-- Winner overlay -->
      <div class="overlay" *ngIf="board?.gameState?.winner">
        <div class="popup-card">
          <div class="trophy">&#127942;</div>
          <h2 class="popup-title">Game Over!</h2>
          <p class="popup-winner">
            {{ board?.gameState?.winner === 'PLAYER_1' ? 'Player 1' : 'Player 2' }} has won!
          </p>
          <p class="popup-sub">The opponent has no pieces or moves left.</p>
          <div class="popup-actions">
            <button class="popup-btn primary-btn" (click)="createNewGame()">Play Again</button>
            <button class="popup-btn ghost-btn" (click)="goToLobby()">Back to Arcade</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      --app-bg: #2a2927;
      --panel-bg: #1f1f1d;
      --panel-border: #3d3c39;
      --text-main: #f3f4f6;
      --text-soft: #b6b7b9;
      --board-light: #f0f1da;
      --board-dark: #739552;
      --accent: #7fa650;
    }

    .chess-page {
      min-height: 100vh;
      background: radial-gradient(circle at top, #35332f 0%, var(--app-bg) 55%, #232220 100%);
      display: grid;
      grid-template-columns: 180px minmax(520px, 760px) 380px;
      gap: 20px;
      padding: 14px;
      color: var(--text-main);
      box-sizing: border-box;
    }

    .left-rail,
    .right-rail {
      background: linear-gradient(180deg, #232220 0%, #1b1a19 100%);
      border: 1px solid var(--panel-border);
      border-radius: 10px;
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      box-shadow: 0 16px 32px rgba(0, 0, 0, 0.22);
    }

    .logo {
      font-size: 34px;
      font-weight: 800;
      margin-bottom: 8px;
      letter-spacing: -1px;
      color: #ffffff;
    }

    .rail-btn {
      width: 100%;
      border: 0;
      background: transparent;
      color: var(--text-soft);
      text-align: left;
      font-size: 21px;
      padding: 7px 10px;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.2s, color 0.2s;
    }

    .rail-btn:hover,
    .rail-active {
      background: #2c2c2a;
      color: #ffffff;
    }

    .rail-spacer { flex: 1; }

    .auth-btn {
      border: 0;
      border-radius: 8px;
      font-weight: 700;
      padding: 10px;
      font-size: 16px;
      cursor: pointer;
    }

    .signup {
      background: linear-gradient(180deg, #90bf57 0%, #6da544 100%);
      color: #ffffff;
    }

    .login {
      background: #2d2d2c;
      color: #f9fafb;
      border: 1px solid #4a4a47;
    }

    .center-stage {
      display: grid;
      gap: 8px;
      justify-content: center;
      align-content: start;
      padding-top: 2px;
    }

    .player-strip {
      width: 100%;
      max-width: 588px;
      background: #1f1f1d;
      border: 1px solid var(--panel-border);
      border-radius: 8px;
      padding: 8px 12px;
      font-size: 28px;
      font-weight: 700;
    }

    .top-strip { color: #d1d5db; }
    .bottom-strip { color: #f9fafb; }

    .board-shell {
      display: grid;
      grid-template-columns: 26px auto;
      align-items: stretch;
      gap: 8px;
      background: #1f1f1d;
      border: 1px solid var(--panel-border);
      border-radius: 8px;
      padding: 10px;
      width: fit-content;
    }

    .ranks {
      display: grid;
      grid-template-rows: repeat(8, 1fr);
      font-size: 18px;
      color: #c6c6c6;
      font-weight: 700;
      text-align: center;
      align-items: center;
      width: 24px;
    }

    .board-wrap { display: grid; gap: 4px; }

    .board-grid {
      display: grid;
      grid-template-columns: repeat(8, 70px);
      grid-template-rows: repeat(8, 70px);
      overflow: hidden;
      border-radius: 4px;
      box-shadow: 0 20px 32px rgba(0, 0, 0, 0.26);
    }

    .square {
      width: 70px;
      height: 70px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    .dark-sq {
      background: var(--board-dark);
      cursor: pointer;
      transition: filter 0.15s;
    }

    .light-sq {
      background: var(--board-light);
      cursor: default;
    }

    .dark-sq:hover { filter: brightness(1.06); }

    .valid-sq { cursor: pointer; }

    .valid-sq::after {
      content: '';
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: rgba(17, 24, 39, 0.2);
      border: 2px solid rgba(255, 255, 255, 0.7);
      pointer-events: none;
      position: absolute;
    }

    .selected-sq::before {
      content: '';
      position: absolute;
      inset: 0;
      border: 3px solid #f6c74a;
      z-index: 1;
      pointer-events: none;
    }

    .jump-source {
      outline: 3px solid #ffdd7d;
      outline-offset: -3px;
    }

    .piece {
      width: 54px;
      height: 54px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.1s;
      box-shadow: 0 7px 12px rgba(0, 0, 0, 0.32);
      z-index: 2;
      position: relative;
    }

    .dark-sq:hover .piece { transform: scale(1.03); }

    .p1-piece {
      background: radial-gradient(circle at 30% 25%, #ffffff 0%, #eef2f7 45%, #c8d0da 100%);
      border: 2px solid #a6b0bc;
    }

    .p2-piece {
      background: radial-gradient(circle at 35% 30%, #494f5b 0%, #23272f 55%, #121418 100%);
      border: 2px solid #171a1f;
    }

    .king-piece {
      box-shadow: 0 0 0 3px #f8cd61 inset, 0 7px 12px rgba(0, 0, 0, 0.32);
    }

    .crown {
      font-size: 24px;
      color: #c58a0c;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.45);
      line-height: 1;
    }

    .files {
      display: grid;
      grid-template-columns: repeat(8, 70px);
      color: #c6c6c6;
      font-size: 18px;
      font-weight: 700;
      text-align: center;
    }

    .play-title {
      margin: 0 0 8px;
      font-size: 50px;
      font-weight: 800;
      line-height: 0.98;
      letter-spacing: -1px;
    }

    .mode-card {
      background: #2a2a28;
      border: 1px solid #3f3f3b;
      border-radius: 12px;
      padding: 12px;
      margin-bottom: 8px;
    }

    .mode-card h3 {
      margin: 0 0 4px;
      font-size: 29px;
      color: #f8f9fb;
    }

    .mode-card p {
      margin: 0;
      color: #aeb0b4;
      font-size: 20px;
      line-height: 1.25;
    }

    .status-panel {
      margin-top: 8px;
      border-top: 1px solid #3f3f3b;
      padding-top: 12px;
      display: grid;
      gap: 8px;
    }

    .turn-pill {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 14px;
      border-radius: 999px;
      font-size: 20px;
      font-weight: 700;
    }

    .p1-turn {
      background: rgba(255, 255, 255, 0.12);
      color: #eef2f6;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .p2-turn {
      background: rgba(0, 0, 0, 0.42);
      color: #d1d5db;
      border: 1px solid rgba(255, 255, 255, 0.14);
    }

    .turn-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .p1-turn .turn-dot { background: #dce6f3; }
    .p2-turn .turn-dot { background: #171a1f; border: 1px solid #9098a3; }

    .captured-row {
      display: grid;
      grid-template-columns: 1fr;
      gap: 4px;
      font-size: 18px;
    }

    .cap-label { color: #c2c6cc; }
    .p1-cap strong { color: #f3f6fc; }
    .p2-cap strong { color: #9fa9b6; }

    .jump-hint {
      font-size: 16px;
      color: #f2c861;
      font-weight: 700;
      letter-spacing: 0.2px;
      animation: pulse 1s ease-in-out infinite alternate;
    }

    @keyframes pulse {
      from { opacity: 0.65; }
      to { opacity: 1; }
    }

    .error-msg {
      margin: 0;
      color: #ff8f8f;
      font-size: 15px;
      font-weight: 600;
    }

    /* ── Overlay ── */
    .overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.75);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.25s ease;
    }

    @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
    @keyframes popIn   { from { transform: scale(0.7); opacity: 0; } to { transform: scale(1); opacity: 1; } }

    .popup-card {
      background: #1b1a19;
      border: 1px solid #4a4a46;
      border-radius: 20px;
      padding: 48px 52px;
      text-align: center;
      box-shadow: 0 24px 64px rgba(0, 0, 0, 0.62);
      animation: popIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .trophy { font-size: 72px; line-height: 1; margin-bottom: 12px; }

    .popup-title {
      margin: 0 0 10px;
      font-size: 34px;
      color: #fff;
    }

    .popup-winner {
      margin: 0 0 6px;
      font-size: 30px;
      font-weight: 700;
      color: #f3f4f6;
    }

    .popup-sub { margin: 0 0 28px; color: #b3b5b9; font-size: 20px; }

    .popup-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

    .popup-btn {
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 16px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .primary-btn {
      background: linear-gradient(180deg, #90bf57 0%, #6da544 100%);
      color: #fff;
      border: none;
    }

    .primary-btn:hover { filter: brightness(1.05); }

    .ghost-btn {
      background: #2a2a28;
      border: 1px solid #4a4a46;
      color: #f3f4f6;
    }

    .ghost-btn:hover { background: #32322f; }

    @media (max-width: 1400px) {
      .chess-page {
        grid-template-columns: 140px minmax(460px, 1fr) 320px;
      }

      .board-grid {
        grid-template-columns: repeat(8, 58px);
        grid-template-rows: repeat(8, 58px);
      }

      .square {
        width: 58px;
        height: 58px;
      }

      .piece {
        width: 46px;
        height: 46px;
      }

      .files {
        grid-template-columns: repeat(8, 58px);
      }

      .logo,
      .play-title {
        font-size: 30px;
      }

      .mode-card h3,
      .turn-pill {
        font-size: 22px;
      }

      .mode-card p,
      .captured-row {
        font-size: 15px;
      }
    }

    @media (max-width: 1024px) {
      .chess-page {
        grid-template-columns: 1fr;
        padding: 10px;
      }

      .left-rail {
        order: 1;
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 8px;
      }

      .logo,
      .rail-spacer {
        grid-column: 1 / -1;
      }

      .center-stage {
        order: 2;
      }

      .right-rail {
        order: 3;
      }

      .board-shell {
        margin: 0 auto;
      }
    }

    @media (max-width: 640px) {
      .player-strip {
        font-size: 20px;
      }

      .board-grid {
        grid-template-columns: repeat(8, 40px);
        grid-template-rows: repeat(8, 40px);
      }

      .square {
        width: 40px;
        height: 40px;
      }

      .piece {
        width: 32px;
        height: 32px;
      }

      .files {
        grid-template-columns: repeat(8, 40px);
        font-size: 14px;
      }

      .ranks {
        font-size: 14px;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation: none !important;
        transition: none !important;
      }
    }
  `]
})
export class CheckersComponent implements OnInit {
  gameId: string | null = null;
  board: CheckersBoard | null = null;
  selectedId: string | null = null;
  validDests: Set<string> = new Set();
  errorMsg = '';
  showInstructions = false;

  rows = [0, 1, 2, 3, 4, 5, 6, 7];
  cols = [0, 1, 2, 3, 4, 5, 6, 7];
  ranks = [8, 7, 6, 5, 4, 3, 2, 1];
  files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

  private squareMap = new Map<string, CheckersSquare>();

  constructor(private checkersService: CheckersService, private router: Router) {}

  ngOnInit() {
    this.gameId = localStorage.getItem('checkers-game-id');
    if (this.gameId) this.loadGame();
    else this.createNewGame();
  }

  createNewGame() {
    this.errorMsg = '';
    this.checkersService.createGame().subscribe({
      next: (id) => {
        this.gameId = id;
        localStorage.setItem('checkers-game-id', id);
        this.selectedId = null;
        this.validDests.clear();
        this.loadGame();
      },
      error: () => { this.errorMsg = 'Failed to create game. Is the backend running?'; }
    });
  }

  loadGame() {
    if (!this.gameId) return;
    this.checkersService.getGame(this.gameId).subscribe({
      next: (b) => {
        this.board = b;
        this.squareMap.clear();
        b.squares.forEach(s => this.squareMap.set(s.id, s));

        // Snap selection to mustJumpFrom if multi-jump is active
        if (b.gameState.mustJumpFrom) {
          this.selectedId = b.gameState.mustJumpFrom;
          this.computeValidDests();
        } else {
          this.selectedId = null;
          this.validDests.clear();
        }
      },
      error: () => { this.errorMsg = 'Failed to load game.'; }
    });
  }

  onSquareClick(row: number, col: number) {
    if (!this.board || this.board.gameState.winner) return;
    if (!this.isDark(row, col)) return;

    const id = `${row}-${col}`;
    const square = this.squareMap.get(id);
    const current = this.board.gameState.currentPlayer;
    const mustJump = this.board.gameState.mustJumpFrom;

    // Clicking a valid destination → submit move
    if (this.selectedId && this.validDests.has(id)) {
      this.submitMove(this.selectedId, id);
      return;
    }

    // Multi-jump: only the locked piece can be (re-)selected
    if (mustJump) {
      if (id === mustJump) {
        this.selectedId = id;
        this.computeValidDests();
      }
      return;
    }

    // Select own piece
    if (square?.occupiedBy === current) {
      this.selectedId = id;
      this.computeValidDests();
      return;
    }

    // Deselect
    this.selectedId = null;
    this.validDests.clear();
  }

  private submitMove(from: string, to: string) {
    if (!this.gameId) return;
    this.errorMsg = '';
    this.checkersService.move(this.gameId, from, to).subscribe({
      next: () => {
        this.selectedId = null;
        this.validDests.clear();
        this.loadGame();
      },
      error: (err) => {
        this.errorMsg = err?.error?.error || 'Invalid move.';
      }
    });
  }

  private computeValidDests() {
    this.validDests.clear();
    if (!this.selectedId || !this.board) return;

    const sq = this.squareMap.get(this.selectedId);
    if (!sq || !sq.occupiedBy) return;

    const player = sq.occupiedBy;
    const dirs = this.getDirections(sq);

    // Check if any piece has a capture available
    const captureExists = this.anyCapturePossible(player);

    // Captures from this piece
    for (const [dr, dc] of dirs) {
      const mr = sq.row + dr, mc = sq.col + dc;
      const tr = sq.row + dr * 2, tc = sq.col + dc * 2;
      if (tr < 0 || tr > 7 || tc < 0 || tc > 7) continue;
      const mid = this.squareMap.get(`${mr}-${mc}`);
      const target = this.squareMap.get(`${tr}-${tc}`);
      if (mid?.occupiedBy && mid.occupiedBy !== player && target && !target.occupiedBy) {
        this.validDests.add(target.id);
      }
    }

    // Simple moves (only if no capture is mandatory)
    if (!captureExists) {
      for (const [dr, dc] of dirs) {
        const nr = sq.row + dr, nc = sq.col + dc;
        if (nr < 0 || nr > 7 || nc < 0 || nc > 7) continue;
        const target = this.squareMap.get(`${nr}-${nc}`);
        if (target && !target.occupiedBy) this.validDests.add(target.id);
      }
    }
  }

  private getDirections(sq: CheckersSquare): [number, number][] {
    if (sq.king) return [[-1,-1],[-1,1],[1,-1],[1,1]];
    if (sq.occupiedBy === 'PLAYER_1') return [[-1,-1],[-1,1]];
    return [[1,-1],[1,1]];
  }

  private anyCapturePossible(player: 'PLAYER_1' | 'PLAYER_2'): boolean {
    for (const sq of this.squareMap.values()) {
      if (sq.occupiedBy !== player) continue;
      for (const [dr, dc] of this.getDirections(sq)) {
        const mr = sq.row + dr, mc = sq.col + dc;
        const tr = sq.row + dr * 2, tc = sq.col + dc * 2;
        if (tr < 0 || tr > 7 || tc < 0 || tc > 7) continue;
        const mid = this.squareMap.get(`${mr}-${mc}`);
        const target = this.squareMap.get(`${tr}-${tc}`);
        if (mid?.occupiedBy && mid.occupiedBy !== player && target && !target.occupiedBy) return true;
      }
    }
    return false;
  }

  sq(row: number, col: number): CheckersSquare | undefined {
    return this.squareMap.get(`${row}-${col}`);
  }

  isDark(row: number, col: number): boolean { return (row + col) % 2 === 1; }

  isValidDest(row: number, col: number): boolean {
    return this.validDests.has(`${row}-${col}`);
  }

  isJumpSource(row: number, col: number): boolean {
    return `${row}-${col}` === this.board?.gameState?.mustJumpFrom;
  }

  goToLobby() { this.router.navigate(['/']); }
}
