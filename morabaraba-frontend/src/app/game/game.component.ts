import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Router, ActivatedRoute } from '@angular/router';
import { GameService, Board, Node, PlaceRequest, MoveRequest, RemoveRequest, GameStatusResponse } from './game.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule],
  template: `
    <div class="chess-page">
      <aside class="left-rail">
        <div class="logo">Morabaraba</div>
        <button class="rail-btn rail-active">Play</button>
        <button class="rail-btn" (click)="goToLobby()">Back To Arcade</button>
        <div class="rail-spacer"></div>
        <button class="auth-btn signup" (click)="createNewGame()">New Game</button>
        <button class="auth-btn login" (click)="showInstructions = true">How To Play</button>
      </aside>

      <main class="center-stage" *ngIf="board as b">
        <div class="player-strip top-strip">
          {{ b.gameState.currentPlayer === 'PLAYER_1' ? 'Player 1' : 'Player 2' }} to move
        </div>

        <div class="board-shell">
          <div class="board-wrapper">
            <svg class="game-board" viewBox="0 0 700 700" preserveAspectRatio="xMidYMid meet">
              <line
                *ngFor="let edge of b.edges"
                [attr.x1]="boardXById(edge[0])"
                [attr.y1]="boardYById(edge[0])"
                [attr.x2]="boardXById(edge[1])"
                [attr.y2]="boardYById(edge[1])"
                class="board-edge">
              </line>
              <g *ngFor="let node of b.nodes" (click)="onNodeClick(node)" class="node-group">
                <circle [attr.cx]="boardX(node)" [attr.cy]="boardY(node)" r="14" [ngClass]="getNodeClass(node)"></circle>
              </g>
            </svg>
          </div>

          <div class="legend">
            <div><span class="dot p1"></span> Player 1</div>
            <div><span class="dot p2"></span> Player 2</div>
            <div><span class="dot empty"></span> Empty</div>
            <div><span class="dot selected"></span> Selected</div>
            <div><span class="dot target"></span> Target</div>
          </div>
        </div>

        <div class="player-strip bottom-strip">
          {{ myPlayer === 'PLAYER_1' ? 'You are Player 1' : (myPlayer === 'PLAYER_2' ? 'You are Player 2' : 'Spectating') }}
        </div>
      </main>

      <aside class="right-rail" *ngIf="board as b">
        <h2 class="play-title">Play Morabaraba</h2>

        <div class="mode-card" *ngIf="!soloMode && myPlayer === 'PLAYER_1' && !player2Joined">
          <h3>Invite Player 2</h3>
          <p class="invite-text">Share this game link:</p>
          <code class="invite-link">{{ inviteUrl }}</code>
          <button class="copy-btn" (click)="copyInviteLink()">{{ inviteLinkCopied ? '✓ Copied!' : 'Copy link' }}</button>
        </div>

        <div class="mode-card">
          <h3>Phase</h3>
          <p>{{ b.gameState.phase }}</p>
        </div>

        <div class="mode-card">
          <h3>Pieces In Hand</h3>
          <p>P1: {{ b.gameState.piecesInHand['PLAYER_1'] }} | P2: {{ b.gameState.piecesInHand['PLAYER_2'] }}</p>
        </div>

        <div class="status-panel">
          <div class="turn-pill" [class.p1-turn]="b.gameState.currentPlayer === 'PLAYER_1'"
                                [class.p2-turn]="b.gameState.currentPlayer === 'PLAYER_2'">
            <span class="turn-dot"></span>
            {{ b.gameState.currentPlayer === 'PLAYER_1' ? 'Player 1' : 'Player 2' }} to move
          </div>

          <div class="my-player-label" *ngIf="myPlayer">
            You are: <strong>{{ myPlayer === 'PLAYER_1' ? 'Player 1' : 'Player 2' }}</strong>
          </div>

          <div class="waiting-turn" *ngIf="!soloMode && !isMyTurn && player2Joined && !b.gameState.winner">
            Waiting for opponent...
          </div>

          <div class="selection" *ngIf="selectedNode || targetNode">
            <p *ngIf="selectedNode"><strong>Selected:</strong> {{ selectedNode.id }}</p>
            <p *ngIf="targetNode"><strong>Target:</strong> {{ targetNode.id }}</p>
          </div>

          <div class="actions">
            <button mat-button (click)="clearSelection()">Clear</button>
          </div>

          <div class="hint-row" *ngIf="board?.gameState?.captureRequired">
            Capture is required. Select an opponent piece to remove.
          </div>

          <p class="error-msg" *ngIf="errorMessage">{{ errorMessage }}</p>
        </div>
      </aside>

      <!-- Waiting for Player 2 overlay -->
      <div class="overlay" *ngIf="!soloMode && myPlayer === 'PLAYER_1' && !player2Joined && gameStatus === 'WAITING'">
        <div class="waiting-card" (click)="$event.stopPropagation()">
          <div class="waiting-spinner"></div>
          <h2 class="waiting-title">Waiting for Player 2</h2>
          <p class="waiting-sub">Share this link with your friend:</p>
          <div class="waiting-link-row">
            <code class="waiting-invite-link">{{ inviteUrl }}</code>
            <button class="copy-btn" (click)="copyInviteLink()">{{ inviteLinkCopied ? '✓ Copied!' : 'Copy link' }}</button>
          </div>
        </div>
      </div>

      <!-- Winner popup -->
      <div class="overlay" *ngIf="board?.gameState?.winner">
        <div class="winner-card" (click)="$event.stopPropagation()">
          <div class="winner-trophy">🏆</div>
          <h2 class="winner-title">Game Over!</h2>
          <p class="winner-name">{{ board?.gameState?.winner === 'PLAYER_1' ? 'Player 1' : 'Player 2' }} wins!</p>
          <p class="winner-sub">The opponent was reduced to 2 pieces.</p>
          <button mat-raised-button color="primary" class="popup-btn" (click)="createNewGame()">Play Again</button>
        </div>
      </div>

      <!-- Instructions popup -->
      <div class="overlay" *ngIf="showInstructions" (click)="showInstructions = false">
        <div class="instructions-card" (click)="$event.stopPropagation()">
          <button class="close-btn" (click)="showInstructions = false">×</button>
          <h2>How to Play Morabaraba</h2>
          <div class="instructions-body">
            <h3>Objective</h3>
            <p>Reduce your opponent to 2 pieces, or block all their moves.</p>

            <h3>Phase 1 — Placement</h3>
            <p>Each player has 12 pieces. Take turns placing one piece on any empty node. Form a <strong>mill</strong> (3 in a row along an edge) to remove one of your opponent's pieces.</p>

            <h3>Phase 2 — Movement</h3>
            <p>Move a piece to an adjacent connected node each turn. Forming a mill still lets you capture an opponent's piece.</p>

            <h3>Phase 3 — Flying</h3>
            <p>When a player is down to 3 pieces they can move to any empty node on the board.</p>

            <h3>Winning</h3>
            <p>You win when your opponent is reduced to 2 pieces or cannot make any valid move.</p>
          </div>
          <button mat-raised-button color="primary" class="popup-btn" (click)="showInstructions = false">Got it!</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      --app-bg: #07071a;
      --panel-bg: #0d0020;
      --panel-border: #2a1a4a;
      --text-main: #f3f4f6;
      --text-soft: #a78bca;
      --accent: #7c3aed;
      --p1: #e4e9f0;
      --p2: #171a1f;
    }

    .chess-page {
      min-height: 100vh;
      background: radial-gradient(circle at top, #1a0038 0%, #07071a 55%, #0d0020 100%);
      display: grid;
      grid-template-columns: 160px 1fr 280px;
      gap: 16px;
      padding: 12px;
      color: var(--text-main);
      box-sizing: border-box;
      align-items: start;
    }

    .left-rail,
    .right-rail {
      background: linear-gradient(180deg, #0d0020 0%, #130030 100%);
      border: 1px solid #2a1a4a;
      border-radius: 10px;
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      box-shadow: 0 16px 32px rgba(0, 0, 0, 0.4);
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
      background: rgba(124, 58, 237, 0.2);
      color: #c084fc;
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
      background: linear-gradient(180deg, #9333ea 0%, #7c3aed 100%);
      color: #ffffff;
    }

    .login {
      background: #1a0038;
      color: #c084fc;
      border: 1px solid #4a1d8a;
    }

    .center-stage {
      display: flex;
      flex-direction: column;
      gap: 8px;
      align-items: stretch;
      width: 100%;
      padding-top: 2px;
      min-width: 0;
    }

    .player-strip {
      width: 100%;
      background: #0d0020;
      border: 1px solid #2a1a4a;
      border-radius: 8px;
      padding: 6px 12px;
      font-size: 16px;
      font-weight: 700;
    }

    .top-strip { color: #d1d5db; }
    .bottom-strip { color: #f9fafb; }

    .board-shell {
      background: #0d0020;
      border: 1px solid #2a1a4a;
      border-radius: 8px;
      padding: 10px;
      width: 100%;
      box-sizing: border-box;
      box-shadow: 0 0 32px rgba(124, 58, 237, 0.25);
    }

    .board-wrapper {
      background: transparent;
      width: 100%;
      box-sizing: border-box;
    }

    .game-board {
      width: 100%;
      max-width: calc(100vh - 180px);
      height: auto;
      display: block;
      background: #4865b7;
      border-radius: 8px;
      margin: 0 auto;
      border: px solid #4eb167;
    }

    .board-edge {
      stroke: #4eb167;
      stroke-width: 6;
    }

    .node-group { cursor: pointer; }

    .node-label {
      text-anchor: middle;
      font-size: 12px;
      font-weight: 700;
      fill: #2e341f;
      user-select: none;
    }

    .node {
      stroke: #000000;
      stroke-width: 4;
    }

    .node-empty {
      fill: #000000;
      stroke: #ce8a31;
    }

    .node-p1 {
      fill: #ff00cc;
      stroke: #ffe6f7;
    }

    .node-p2 {
      fill: #0052cc;
      stroke: #9bd0ff;
    }

    .node-selected {
      stroke: #f6c74a;
      stroke-width: 5;
    }

    .node-target {
      stroke: #ffdd7d;
      stroke-width: 5;
    }

    .legend {
      margin-top: 12px;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
      gap: 8px;
      font-size: 13px;
      color: #d4d6db;
    }

    .dot {
      display: inline-block;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      margin-right: 6px;
      border: 1px solid #222;
      vertical-align: middle;
    }

    .dot.p1 { background: #ff00cc; border-color: #ffe6f7; }
    .dot.p2 { background: #0052cc; border-color: #9bd0ff; }
    .dot.empty { background: #2a1a4a; border-color: #5b21b6; }
    .dot.selected { background: #f6c74a; }
    .dot.target { background: #ffdd7d; }

    .play-title {
      margin: 0 0 8px;
      font-size: 28px;
      font-weight: 800;
      line-height: 1.1;
      letter-spacing: -0.5px;
    }

    .mode-card {
      background: #130030;
      border: 1px solid #2a1a4a;
      border-radius: 12px;
      padding: 12px;
      margin-bottom: 8px;
      display: grid;
      gap: 8px;
    }

    .mode-card h3 {
      margin: 0;
      font-size: 15px;
      color: #f8f9fb;
    }

    .mode-card p {
      margin: 0;
      color: #aeb0b4;
      font-size: 13px;
      line-height: 1.25;
    }

    .invite-text {
      font-size: 15px !important;
    }

    .invite-link {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      background: #0d0020;
      color: #c084fc;
      padding: 8px 10px;
      border-radius: 6px;
      font-size: 13px;
      border: 1px solid #3b1f6a;
      display: block;
    }

    .copy-btn {
      justify-self: start;
      padding: 8px 14px;
      border-radius: 8px;
      border: 1px solid #7c3aed;
      background: #7c3aed;
      color: #fff;
      font-size: 13px;
      cursor: pointer;
      transition: background 0.2s;
    }

    .copy-btn:hover {
      background: #6d28d9;
    }

    .status-panel {
      margin-top: 8px;
      border-top: 1px solid #2a1a4a;
      padding-top: 12px;
      display: grid;
      gap: 8px;
    }

    .turn-pill {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 7px 12px;
      border-radius: 999px;
      font-size: 14px;
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
      background: currentColor;
    }

    .my-player-label {
      font-size: 14px;
      color: #c6c9cf;
    }

    .waiting-turn {
      font-size: 14px;
      color: #f2c861;
      font-style: italic;
    }

    .selection p {
      margin: 4px 0;
      font-size: 14px;
      color: #d5d9df;
    }

    .actions {
      margin-top: 6px;
      display: grid;
      gap: 10px;
    }

    .hint-row {
      font-size: 15px;
      color: #f2c861;
      font-weight: 700;
      letter-spacing: 0.2px;
      animation: pulse 1s ease-in-out infinite alternate;
    }

    .error-msg {
      margin: 0;
      color: #ff8f8f;
      font-size: 15px;
      font-weight: 600;
    }

    @keyframes pulse {
      from { opacity: 0.65; }
      to { opacity: 1; }
    }

    /* ── Shared overlay ── */
    .overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.65);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.25s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }

    @keyframes popIn {
      from { transform: scale(0.7); opacity: 0; }
      to   { transform: scale(1);   opacity: 1; }
    }

    /* ── Waiting card ── */
    .waiting-card {
      background: #1b1a19;
      border: 1px solid #4a4a46;
      border-radius: 20px;
      padding: 48px 56px;
      text-align: center;
      box-shadow: 0 24px 64px rgba(0,0,0,0.6);
      animation: popIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .waiting-title {
      margin: 16px 0 8px;
      font-size: 24px;
      font-weight: 700;
      color: #f3f4f6;
    }

    .waiting-sub { margin: 0 0 16px; color: #aeb0b4; font-size: 14px; }

    .waiting-link-row {
      display: flex;
      gap: 10px;
      align-items: center;
      flex-wrap: wrap;
      justify-content: center;
      margin-top: 4px;
    }

    .waiting-invite-link {
      background: #2a2a28;
      color: #dfe3e8;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 12px;
      border: 1px solid #4a4a46;
      max-width: 320px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      display: block;
    }

    .waiting-spinner {
      width: 48px;
      height: 48px;
      border: 4px solid #2a1a4a;
      border-top-color: #a855f7;
      border-radius: 50%;
      margin: 0 auto;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* ── Winner card ── */
    .winner-card {
      background: #1b1a19;
      border: 1px solid #4a4a46;
      border-radius: 20px;
      padding: 48px 56px;
      text-align: center;
      box-shadow: 0 24px 64px rgba(0,0,0,0.4);
      animation: popIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .winner-trophy { font-size: 72px; line-height: 1; margin-bottom: 12px; }

    .winner-title {
      margin: 0 0 8px;
      font-size: 32px;
      font-weight: 700;
      color: #fff;
    }

    .winner-name {
      margin: 0 0 6px;
      font-size: 22px;
      font-weight: 600;
      color: #f3f4f6;
    }

    .winner-sub { margin: 0 0 28px; color: #b3b5b9; font-size: 14px; }

    .popup-btn {
      min-width: 140px;
      font-size: 15px;
      background: linear-gradient(180deg, #9333ea 0%, #7c3aed 100%);
      color: #fff;
    }

    /* ── Instructions card ── */
    .instructions-card {
      position: relative;
      background: #1b1a19;
      border: 1px solid #4a4a46;
      border-radius: 16px;
      padding: 36px 40px 32px;
      max-width: 520px;
      width: 90%;
      max-height: 85vh;
      overflow-y: auto;
      box-shadow: 0 24px 64px rgba(0,0,0,0.4);
      animation: popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .instructions-card h2 {
      margin: 0 0 20px;
      font-size: 22px;
      color: #f3f4f6;
    }

    .instructions-body h3 {
      margin: 16px 0 4px;
      font-size: 14px;
      font-weight: 700;
      color: #f3f4f6;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .instructions-body p {
      margin: 0 0 8px;
      font-size: 14px;
      color: #c7c9ce;
      line-height: 1.6;
    }

    .instructions-body { margin-bottom: 24px; }

    .close-btn {
      position: absolute;
      top: 14px;
      right: 18px;
      background: none;
      border: none;
      font-size: 26px;
      line-height: 1;
      color: #b5b7bb;
      cursor: pointer;
      padding: 0;
    }

    .close-btn:hover { color: #fff; }

    @media (max-width: 1400px) {
      .chess-page {
        grid-template-columns: 130px 1fr 240px;
      }

      .logo,
      .play-title {
        font-size: 28px;
      }

      .mode-card h3,
      .turn-pill {
        font-size: 20px;
      }

      .mode-card p {
        font-size: 14px;
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
        font-size: 18px;
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
export class GameComponent implements OnInit, OnDestroy {
  gameId: string | null = null;
  board: Board | null = null;
  selectedNode: Node | null = null;
  targetNode: Node | null = null;
  errorMessage = '';
  showInstructions = false;

  myPlayer: string | null = null;
  gameStatus: 'WAITING' | 'ACTIVE' = 'WAITING';
  player2Joined = false;
  inviteLinkCopied = false;
  soloMode = environment.soloMode;

  private pollInterval: ReturnType<typeof setInterval> | null = null;

  constructor(
    private gameService: GameService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  goToLobby() {
    this.stopPolling();
    this.router.navigate(['/']);
  }

  ngOnInit() {
    if (this.soloMode) {
      this.initializeSoloGame();
      return;
    }

    const paramGameId = this.route.snapshot.paramMap.get('gameId');

    if (paramGameId) {
      this.gameId = paramGameId;
      const storedPlayer = localStorage.getItem(`morabaraba-player-${paramGameId}`);
      if (storedPlayer) {
        this.myPlayer = storedPlayer;
        if (storedPlayer === 'PLAYER_1') {
          this.checkStatusThenPoll();
        } else {
          this.gameStatus = 'ACTIVE';
          this.player2Joined = true;
          this.loadGame();
          this.startPollingIfOpponentTurn();
        }
      } else {
        this.joinAsPlayer2(paramGameId);
      }
    } else {
      const savedId = localStorage.getItem('morabaraba-game-id');
      if (savedId) {
        this.gameId = savedId;
        const storedPlayer = localStorage.getItem(`morabaraba-player-${savedId}`);
        if (storedPlayer) {
          this.myPlayer = storedPlayer;
          this.router.navigate(['/morabaraba', savedId], { replaceUrl: true });
          this.checkStatusThenPoll();
        } else {
          this.createNewGame();
        }
      } else {
        this.createNewGame();
      }
    }
  }

  private initializeSoloGame() {
    const paramGameId = this.route.snapshot.paramMap.get('gameId');
    this.myPlayer = 'PLAYER_1';
    this.gameStatus = 'ACTIVE';
    this.player2Joined = true;

    if (paramGameId) {
      this.gameId = paramGameId;
      localStorage.setItem('morabaraba-game-id', paramGameId);
      localStorage.setItem(`morabaraba-player-${paramGameId}`, 'PLAYER_1');
      this.loadGame();
      return;
    }

    const savedId = localStorage.getItem('morabaraba-game-id');
    if (savedId) {
      this.gameId = savedId;
      localStorage.setItem(`morabaraba-player-${savedId}`, 'PLAYER_1');
      this.router.navigate(['/morabaraba', savedId], { replaceUrl: true });
      this.loadGame();
      return;
    }

    this.createNewGame();
  }

  ngOnDestroy() {
    this.stopPolling();
  }

  private checkStatusThenPoll() {
    if (this.soloMode) {
      this.gameStatus = 'ACTIVE';
      this.player2Joined = true;
      this.loadGame();
      return;
    }

    if (!this.gameId) return;
    this.gameService.getGameStatus(this.gameId).subscribe({
      next: (status) => {
        this.gameStatus = status.status;
        this.player2Joined = status.player2Joined;
        this.loadGame();
        if (status.player2Joined) {
          this.startPollingIfOpponentTurn();
        } else {
          this.startStatusPolling();
        }
      },
      error: () => { this.loadGame(); }
    });
  }

  private joinAsPlayer2(gameId: string) {
    this.gameService.joinGame(gameId).subscribe({
      next: (res) => {
        this.myPlayer = res.player;
        this.gameStatus = 'ACTIVE';
        this.player2Joined = true;
        localStorage.setItem(`morabaraba-player-${gameId}`, res.player);
        this.loadGame();
        this.startPollingIfOpponentTurn();
      },
      error: () => {
        this.errorMessage = 'Failed to join game. The game may not exist.';
      }
    });
  }

  createNewGame() {
    this.stopPolling();
    this.errorMessage = '';
    this.gameService.createGame().subscribe({
      next: (gameId) => {
        this.gameId = gameId;
        this.myPlayer = 'PLAYER_1';
        this.gameStatus = this.soloMode ? 'ACTIVE' : 'WAITING';
        this.player2Joined = this.soloMode;
        localStorage.setItem('morabaraba-game-id', gameId);
        localStorage.setItem(`morabaraba-player-${gameId}`, 'PLAYER_1');
        this.router.navigate(['/morabaraba', gameId], { replaceUrl: true });
        this.clearSelection();
        this.loadGame();
        if (!this.soloMode) {
          this.startStatusPolling();
        }
      },
      error: () => {
        this.errorMessage = 'Failed to create game.';
      }
    });
  }

  private startStatusPolling() {
    if (this.soloMode) return;

    this.stopPolling();
    this.pollInterval = setInterval(() => {
      if (!this.gameId) return;
      this.gameService.getGameStatus(this.gameId).subscribe({
        next: (status: GameStatusResponse) => {
          this.player2Joined = status.player2Joined;
          this.gameStatus = status.status;
          if (status.player2Joined) {
            this.stopPolling();
            this.loadGame();
            this.startPollingIfOpponentTurn();
          }
        }
      });
    }, 2500);
  }

  private startPollingIfOpponentTurn() {
    if (this.soloMode) return;

    this.stopPolling();
    this.pollInterval = setInterval(() => {
      if (!this.gameId || !this.myPlayer) return;
      if (this.board?.gameState.currentPlayer !== this.myPlayer) {
        this.gameService.getGame(this.gameId).subscribe({
          next: (board) => {
            this.board = board;
            if (board.gameState.currentPlayer === this.myPlayer || board.gameState.winner) {
              this.stopPolling();
            }
          }
        });
      }
    }, 2500);
  }

  private stopPolling() {
    if (this.pollInterval !== null) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  get isMyTurn(): boolean {
    if (!this.board) return false;
    if (this.soloMode) return !this.board.gameState.winner;
    if (!this.myPlayer) return false;
    if (this.gameStatus === 'WAITING' || !this.player2Joined) return false;
    return this.board.gameState.currentPlayer === this.myPlayer;
  }

  private getRequestPlayer(): string {
    if (this.soloMode && this.board) {
      return this.board.gameState.currentPlayer;
    }

    return this.myPlayer ?? 'PLAYER_1';
  }

  get inviteUrl(): string {
    return `${window.location.origin}/morabaraba/${this.gameId}`;
  }

  copyInviteLink() {
    navigator.clipboard.writeText(this.inviteUrl).then(() => {
      this.inviteLinkCopied = true;
      setTimeout(() => { this.inviteLinkCopied = false; }, 2000);
    });
  }

  loadGame() {
    if (!this.gameId) {
      return;
    }
    this.errorMessage = '';
    this.gameService.getGame(this.gameId).subscribe({
      next: (board) => {
        if (!this.isStandardBoard(board)) {
          this.errorMessage = 'Saved game used an old board layout. A new 24-node board is being created.';
          this.createNewGame();
          return;
        }
        this.board = board;
      },
      error: () => {
        this.errorMessage = 'Failed to load game. Check that backend is running.';
      }
    });
  }

  onNodeClick(node: Node) {
    if (!this.board) return;
    if (!this.isMyTurn) return;

    const phase = this.board.gameState.phase;
    const currentPlayer = this.board.gameState.currentPlayer;
    const captureRequired = this.board.gameState.captureRequired;

    // ── Capture pending: click opponent piece to remove it immediately ──
    if (captureRequired) {
      if (node.occupiedBy !== null && node.occupiedBy !== currentPlayer) {
        this.selectedNode = node;
        this.removeSelectedPiece();
      }
      return;
    }

    // ── Placement phase: single click on empty node places a piece ──
    if (phase === 'PLACEMENT') {
      if (node.occupiedBy === null) {
        this.selectedNode = node;
        this.placePiece();
      }
      return;
    }

    // ── Movement / Flying phase ──
    if (node.occupiedBy === currentPlayer) {
      this.selectedNode = this.selectedNode?.id === node.id ? null : node;
      this.targetNode = null;
      return;
    }

    if (node.occupiedBy === null && this.selectedNode) {
      this.targetNode = node;
      this.movePiece();
      return;
    }
  }

  clearSelection() {
    this.selectedNode = null;
    this.targetNode = null;
  }

  placePiece() {
    if (!this.gameId || !this.selectedNode || !this.board) {
      return;
    }

    const request: PlaceRequest = {
      nodeId: this.selectedNode.id,
      player: this.getRequestPlayer()
    };

    this.errorMessage = '';
    this.gameService.placePiece(this.gameId, request).subscribe({
      next: () => {
        this.loadGame();
        this.clearSelection();
        this.startPollingIfOpponentTurn();
      },
      error: () => {
        this.errorMessage = 'Place piece failed.';
      }
    });
  }

  movePiece() {
    if (!this.gameId || !this.selectedNode || !this.targetNode) {
      return;
    }

    const request: MoveRequest = {
      from: this.selectedNode.id,
      to: this.targetNode.id,
      player: this.getRequestPlayer()
    };

    this.errorMessage = '';
    this.gameService.movePiece(this.gameId, request).subscribe({
      next: () => {
        this.loadGame();
        this.clearSelection();
        this.startPollingIfOpponentTurn();
      },
      error: () => {
        this.errorMessage = 'Move piece failed.';
      }
    });
  }

  removeSelectedPiece() {
    if (!this.selectedNode) {
      return;
    }
    this.removePiece(this.selectedNode);
  }

  removePiece(node: Node) {
    if (!this.gameId) {
      return;
    }

    const request: RemoveRequest = {
      nodeId: node.id,
      player: this.getRequestPlayer()
    };

    this.errorMessage = '';
    this.gameService.removePiece(this.gameId, request).subscribe({
      next: () => {
        this.loadGame();
        this.clearSelection();
        this.startPollingIfOpponentTurn();
      },
      error: () => {
        this.errorMessage = 'Remove piece failed.';
      }
    });
  }

  canPlace(): boolean {
    return !!this.board && !!this.selectedNode && this.board.gameState.phase === 'PLACEMENT' && this.isMyTurn;
  }

  canMove(): boolean {
    return !!this.board && !!this.selectedNode && !!this.targetNode && this.board.gameState.phase !== 'PLACEMENT' && this.isMyTurn;
  }

  canRemove(): boolean {
    return !!this.board && !!this.selectedNode && this.selectedNode.occupiedBy !== null
      && this.selectedNode.occupiedBy !== this.board.gameState.currentPlayer && this.isMyTurn;
  }

  boardX(node: Node): number {
    return 50 + node.x * 100;
  }

  boardY(node: Node): number {
    return 50 + node.y * 100;
  }

  boardXById(id: string): number {
    const node = this.getNodeById(id);
    return node ? this.boardX(node) : 0;
  }

  boardYById(id: string): number {
    const node = this.getNodeById(id);
    return node ? this.boardY(node) : 0;
  }

  getNodeById(id: string): Node | undefined {
    return this.board?.nodes.find(n => n.id === id);
  }

  isStandardBoard(board: Board): boolean {
    return board.nodes.length === 24 && !board.nodes.some(node => node.id === 'D4');
  }

  getNodeClass(node: Node): string {
    const classes = ['node'];

    if (node.occupiedBy === 'PLAYER_1') {
      classes.push('node-p1');
    } else if (node.occupiedBy === 'PLAYER_2') {
      classes.push('node-p2');
    } else {
      classes.push('node-empty');
    }

    if (this.selectedNode?.id === node.id) {
      classes.push('node-selected');
    }

    if (this.targetNode?.id === node.id) {
      classes.push('node-target');
    }

    return classes.join(' ');
  }
}
