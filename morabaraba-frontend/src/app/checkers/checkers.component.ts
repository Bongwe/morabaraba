import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CheckersService, CheckersBoard, CheckersSquare } from './checkers.service';

@Component({
  selector: 'app-checkers',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <!-- Header -->
      <div class="header">
        <div class="header-brand">
          <span class="brand-label">OBOMVU ARCADE</span>
          <h1 class="title">CHECKERS</h1>
        </div>
        <div class="header-actions">
          <button class="back-btn" (click)="goToLobby()">&#8592; Arcade</button>
          <button class="new-btn" (click)="createNewGame()">New Game</button>
        </div>
      </div>

      <div class="game-area" *ngIf="board">
        <!-- Status bar -->
        <div class="status-bar">
          <div class="turn-pill" [class.p1-turn]="board.gameState.currentPlayer === 'PLAYER_1'"
                                 [class.p2-turn]="board.gameState.currentPlayer === 'PLAYER_2'">
            <span class="turn-dot"></span>
            {{ board.gameState.currentPlayer === 'PLAYER_1' ? 'Player 1' : 'Player 2' }}'s Turn
          </div>
          <div class="captured-row">
            <span class="cap-label p1-cap">
              &#9632; P1 captured: <strong>{{ board.gameState.capturedPieces['PLAYER_1'] }}</strong>
            </span>
            <span class="cap-label p2-cap">
              &#9632; P2 captured: <strong>{{ board.gameState.capturedPieces['PLAYER_2'] }}</strong>
            </span>
          </div>
          <div class="jump-hint" *ngIf="board.gameState.mustJumpFrom">
            Multi-jump! Continue jumping with the selected piece.
          </div>
          <p class="error-msg" *ngIf="errorMsg">{{ errorMsg }}</p>
        </div>

        <!-- Board -->
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

          <!-- Column labels -->
          <div class="col-labels">
            <span *ngFor="let c of cols">{{ c }}</span>
          </div>
        </div>

        <!-- Legend -->
        <div class="legend">
          <div><span class="dot p1-dot"></span> Player 1 (Red)</div>
          <div><span class="dot p2-dot"></span> Player 2 (Black)</div>
          <div><span class="dot king-dot">&#9813;</span> King</div>
          <div><span class="dot valid-dot"></span> Valid move</div>
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
    .page {
      max-width: 900px;
      margin: 0 auto;
      padding: 20px;
      display: grid;
      gap: 16px;
    }

    /* ── Header ── */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 24px;
      background: linear-gradient(135deg, #0d0020 0%, #1a0038 100%);
      border-radius: 12px;
      border: 1px solid #3b1f6a;
      box-shadow: 0 0 20px rgba(124, 58, 237, 0.2);
    }

    .header-brand { display: flex; flex-direction: column; gap: 4px; }

    .brand-label {
      font-family: 'Press Start 2P', 'Courier New', monospace;
      font-size: 9px;
      color: rgba(192, 132, 252, 0.55);
      letter-spacing: 3px;
    }

    .title {
      margin: 0;
      font-family: 'Press Start 2P', 'Courier New', monospace;
      font-size: clamp(14px, 2.5vw, 22px);
      color: #fff;
      letter-spacing: 3px;
      text-shadow: 0 0 12px #c084fc, 0 0 30px #7c3aed;
    }

    .header-actions { display: flex; align-items: center; gap: 10px; }

    .back-btn, .new-btn {
      padding: 8px 14px;
      border-radius: 6px;
      font-family: 'Press Start 2P', 'Courier New', monospace;
      font-size: 10px;
      cursor: pointer;
      letter-spacing: 1px;
      transition: all 0.2s;
    }

    .back-btn {
      border: 1px solid rgba(168, 85, 247, 0.4);
      background: transparent;
      color: #c084fc;
    }

    .back-btn:hover { background: rgba(168, 85, 247, 0.15); color: #fff; }

    .new-btn {
      border: none;
      background: linear-gradient(135deg, #6d28d9, #a855f7);
      color: #fff;
    }

    .new-btn:hover { box-shadow: 0 0 14px rgba(168, 85, 247, 0.5); opacity: 0.9; }

    /* ── Game area ── */
    .game-area { display: flex; flex-direction: column; align-items: center; gap: 16px; }

    /* ── Status bar ── */
    .status-bar {
      width: 100%;
      max-width: 520px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    .turn-pill {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 20px;
      border-radius: 999px;
      font-weight: 700;
      font-size: 14px;
    }

    .p1-turn { background: rgba(220, 38, 38, 0.2); color: #fca5a5; border: 1px solid rgba(220,38,38,0.4); }
    .p2-turn { background: rgba(50, 50, 50, 0.6); color: #d1d5db; border: 1px solid rgba(100,100,100,0.4); }

    .turn-dot {
      width: 12px; height: 12px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .p1-turn .turn-dot { background: #dc2626; }
    .p2-turn .turn-dot { background: #6b7280; }

    .captured-row { display: flex; gap: 20px; font-size: 13px; }
    .cap-label { color: #9ca3af; }
    .p1-cap strong { color: #fca5a5; }
    .p2-cap strong { color: #d1d5db; }

    .jump-hint {
      font-size: 12px;
      color: #fbbf24;
      font-weight: 600;
      letter-spacing: 0.5px;
      animation: pulse 1s ease-in-out infinite alternate;
    }

    @keyframes pulse { from { opacity: 0.6; } to { opacity: 1; } }

    .error-msg { color: #f87171; font-size: 13px; margin: 0; }

    /* ── Board ── */
    .board-wrap { display: flex; flex-direction: column; align-items: center; gap: 4px; }

    .board-grid {
      display: grid;
      grid-template-columns: repeat(8, 60px);
      grid-template-rows: repeat(8, 60px);
      border: 3px solid #4c1d95;
      box-shadow: 0 0 30px rgba(124, 58, 237, 0.4), 0 0 60px rgba(124,58,237,0.15);
      border-radius: 4px;
      overflow: hidden;
    }

    .square {
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    .dark-sq  { background: #2d1b00; cursor: pointer; transition: background 0.15s; }
    .light-sq { background: #f5deb3; cursor: default; }

    .dark-sq:hover { background: #3d2b00; }

    .selected-sq { }
    .valid-sq    { cursor: pointer; }
    .valid-sq::after {
      content: '';
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: rgba(192, 132, 252, 0.45);
      border: 2px solid rgba(192, 132, 252, 0.75);
      display: block;
      pointer-events: none;
    }
    .jump-source { outline: 2px solid #fbbf24; outline-offset: -2px; }

    /* ── Pieces ── */
    .piece {
      width: 46px;
      height: 46px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 3px 6px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.15);
      transition: transform 0.1s;
      position: relative;
    }

    .dark-sq:hover .piece { transform: scale(1.05); }

    .p1-piece {
      background: radial-gradient(circle at 35% 35%, #f87171, #991b1b);
      border: 3px solid #7f1d1d;
    }

    .p2-piece {
      background: radial-gradient(circle at 35% 35%, #6b7280, #111827);
      border: 3px solid #030712;
    }

    .king-piece { box-shadow: 0 0 12px rgba(251, 191, 36, 0.7), 0 3px 6px rgba(0,0,0,0.5); }

    .crown {
      font-size: 20px;
      color: #fbbf24;
      text-shadow: 0 0 6px rgba(251,191,36,0.8);
      line-height: 1;
    }

    /* ── Column labels ── */
    .col-labels {
      display: grid;
      grid-template-columns: repeat(8, 60px);
      color: #6b7280;
      font-size: 11px;
      text-align: center;
    }

    /* ── Legend ── */
    .legend {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
      justify-content: center;
      font-size: 13px;
      color: #9ca3af;
    }

    .dot {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      margin-right: 6px;
      vertical-align: middle;
    }

    .p1-dot  { background: #991b1b; border: 1px solid #7f1d1d; }
    .p2-dot  { background: #374151; border: 1px solid #030712; }
    .king-dot { background: none; font-size: 14px; color: #fbbf24; }
    .valid-dot { background: rgba(192,132,252,0.45); border: 2px solid rgba(192,132,252,0.75); }

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
      background: #0e0e20;
      border: 1px solid #4c1d95;
      border-radius: 20px;
      padding: 48px 52px;
      text-align: center;
      box-shadow: 0 0 40px rgba(124,58,237,0.4), 0 24px 64px rgba(0,0,0,0.6);
      animation: popIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .trophy { font-size: 72px; line-height: 1; margin-bottom: 12px; }

    .popup-title {
      margin: 0 0 10px;
      font-family: 'Press Start 2P', 'Courier New', monospace;
      font-size: 20px;
      color: #fff;
      text-shadow: 0 0 12px #c084fc;
    }

    .popup-winner {
      margin: 0 0 6px;
      font-size: 20px;
      font-weight: 700;
      color: #c084fc;
    }

    .popup-sub { margin: 0 0 28px; color: #6b7280; font-size: 13px; }

    .popup-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

    .popup-btn {
      padding: 12px 24px;
      border-radius: 8px;
      font-family: 'Press Start 2P', 'Courier New', monospace;
      font-size: 10px;
      cursor: pointer;
      letter-spacing: 1px;
      transition: all 0.2s;
    }

    .primary-btn {
      background: linear-gradient(135deg, #6d28d9, #a855f7);
      color: #fff;
      border: none;
    }

    .primary-btn:hover { box-shadow: 0 0 20px rgba(168, 85, 247, 0.5); }

    .ghost-btn {
      background: transparent;
      border: 1px solid rgba(168, 85, 247, 0.4);
      color: #c084fc;
    }

    .ghost-btn:hover { background: rgba(168, 85, 247, 0.15); }

    @media (max-width: 560px) {
      .board-grid { grid-template-columns: repeat(8, 40px); grid-template-rows: repeat(8, 40px); }
      .square, .piece { width: 40px; height: 40px; }
      .piece { width: 32px; height: 32px; }
      .col-labels { grid-template-columns: repeat(8, 40px); }
    }
  `]
})
export class CheckersComponent implements OnInit {
  gameId: string | null = null;
  board: CheckersBoard | null = null;
  selectedId: string | null = null;
  validDests: Set<string> = new Set();
  errorMsg = '';

  rows = [0, 1, 2, 3, 4, 5, 6, 7];
  cols = [0, 1, 2, 3, 4, 5, 6, 7];

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
