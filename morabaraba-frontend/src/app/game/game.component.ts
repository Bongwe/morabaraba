import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Router, ActivatedRoute } from '@angular/router';
import { GameService, Board, Node, PlaceRequest, MoveRequest, RemoveRequest, GameStatusResponse } from './game.service';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule],
  template: `
    <div class="page">
      <!-- Header -->
      <div class="header">
        <div class="header-brand">
          <span class="brand-label">OBOMVU ARCADE</span>
          <h1 class="title">MORABARABA</h1>
        </div>
        <div class="header-actions">
          <button class="back-btn" (click)="goToLobby()" title="Back to Arcade">&#8592; Arcade</button>
          <button class="help-btn" (click)="showInstructions = true" title="How to play">?</button>
          <button mat-raised-button color="primary" (click)="createNewGame()">New Game</button>
        </div>
      </div>

      <!-- Invite banner (shown to PLAYER_1 while waiting for PLAYER_2) -->
      <div class="invite-banner" *ngIf="myPlayer === 'PLAYER_1' && !player2Joined">
        <span class="invite-label">Invite Player 2:</span>
        <code class="invite-link">{{ inviteUrl }}</code>
        <button class="copy-btn" (click)="copyInviteLink()">{{ inviteLinkCopied ? '✓ Copied!' : 'Copy link' }}</button>
      </div>

      <div class="layout" *ngIf="board as b">
        <!-- Status sidebar -->
        <mat-card class="status-card">
          <div class="turn-indicator" [ngClass]="b.gameState.currentPlayer === 'PLAYER_1' ? 'turn-p1' : 'turn-p2'">
            <span class="turn-dot"></span>
            <span>{{ b.gameState.currentPlayer === 'PLAYER_1' ? 'Player 1' : 'Player 2' }}'s turn</span>
          </div>

          <div class="my-player-label" *ngIf="myPlayer">
            You are: <strong>{{ myPlayer === 'PLAYER_1' ? 'Player 1' : 'Player 2' }}</strong>
          </div>

          <div class="waiting-turn" *ngIf="!isMyTurn && player2Joined && !b.gameState.winner">
            Waiting for opponent...
          </div>

          <div class="status-row">
            <span>Phase</span>
            <span class="phase-badge">{{ b.gameState.phase }}</span>
          </div>

          <div class="pieces-grid">
            <div class="pieces-info">
              <span class="piece-dot p1-dot"></span>
              <span>P1: {{ b.gameState.piecesInHand['PLAYER_1'] }} in hand</span>
            </div>
            <div class="pieces-info">
              <span class="piece-dot p2-dot"></span>
              <span>P2: {{ b.gameState.piecesInHand['PLAYER_2'] }} in hand</span>
            </div>
          </div>

          <hr>

          <div class="selection" *ngIf="selectedNode || targetNode">
            <p *ngIf="selectedNode"><strong>Selected:</strong> {{ selectedNode.id }}</p>
            <p *ngIf="targetNode"><strong>Target:</strong> {{ targetNode.id }}</p>
          </div>

          <div class="actions">
            <button mat-button (click)="clearSelection()">Clear</button>
          </div>

          <p class="error" *ngIf="errorMessage">{{ errorMessage }}</p>
        </mat-card>

        <!-- Board -->
        <mat-card class="board-card">
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
                <text [attr.x]="boardX(node)" [attr.y]="boardY(node) - 20" class="node-label">{{ node.id }}</text>
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
        </mat-card>
      </div>

      <!-- Waiting for Player 2 overlay -->
      <div class="overlay" *ngIf="myPlayer === 'PLAYER_1' && !player2Joined && gameStatus === 'WAITING'">
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
    .page {
      max-width: 1280px;
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

    .header-brand {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

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
      line-height: 1.3;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .back-btn {
      padding: 8px 14px;
      border-radius: 6px;
      border: 1px solid rgba(168, 85, 247, 0.4);
      background: transparent;
      color: #c084fc;
      font-size: 12px;
      font-family: 'Press Start 2P', 'Courier New', monospace;
      cursor: pointer;
      letter-spacing: 1px;
      transition: background 0.2s, color 0.2s;
    }

    .back-btn:hover {
      background: rgba(168, 85, 247, 0.15);
      color: #fff;
    }

    .help-btn {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      border: 2px solid #a855f7;
      background: transparent;
      color: #c084fc;
      font-size: 18px;
      font-weight: 700;
      cursor: pointer;
      line-height: 1;
      transition: background 0.2s, color 0.2s, box-shadow 0.2s;
    }

    .help-btn:hover {
      background: #a855f7;
      color: #fff;
      box-shadow: 0 0 14px rgba(168, 85, 247, 0.5);
    }

    /* ── Invite banner ── */
    .invite-banner {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 20px;
      background: #1a0038;
      border: 1px solid #7c3aed;
      border-radius: 10px;
      flex-wrap: wrap;
    }

    .invite-label {
      color: #c084fc;
      font-size: 13px;
      font-weight: 600;
      white-space: nowrap;
    }

    .invite-link {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      background: #0d0020;
      color: #e0e0e0;
      padding: 6px 10px;
      border-radius: 6px;
      font-size: 13px;
      border: 1px solid #3b1f6a;
    }

    .copy-btn {
      padding: 6px 16px;
      border-radius: 6px;
      border: 1px solid #7c3aed;
      background: #7c3aed;
      color: #fff;
      font-size: 13px;
      cursor: pointer;
      white-space: nowrap;
      transition: background 0.2s;
    }

    .copy-btn:hover { background: #6d28d9; }

    /* ── Layout ── */
    .layout {
      display: grid;
      grid-template-columns: minmax(240px, 300px) 1fr;
      gap: 16px;
      align-items: start;
    }

    /* ── Status & board cards dark override ── */
    mat-card {
      background: #0e0e20 !important;
      color: #e0e0e0 !important;
    }

    /* ── Status card ── */
    .turn-indicator {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 14px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 15px;
      margin-bottom: 14px;
    }

    .turn-p1 { background: #ffebee; color: #b71c1c; }
    .turn-p2 { background: #e3f2fd; color: #0d47a1; }

    .turn-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .turn-p1 .turn-dot { background: #d32f2f; }
    .turn-p2 .turn-dot { background: #1976d2; }

    .my-player-label {
      font-size: 12px;
      color: #a0a0c0;
      margin-bottom: 6px;
    }

    .waiting-turn {
      font-size: 12px;
      color: #c084fc;
      margin-bottom: 10px;
      font-style: italic;
    }

    .status-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }

    .phase-badge {
      padding: 3px 10px;
      border-radius: 999px;
      background: #e8eefc;
      color: #23408e;
      font-size: 12px;
      font-weight: 600;
    }

    .pieces-grid {
      display: grid;
      gap: 6px;
      margin-bottom: 10px;
    }

    .pieces-info {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
    }

    .piece-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      border: 1px solid #555;
      flex-shrink: 0;
    }

    .p1-dot { background: #d32f2f; }
    .p2-dot { background: #1976d2; }

    .selection p { margin: 6px 0; font-size: 13px; }

    .actions {
      margin-top: 12px;
      display: grid;
      gap: 10px;
    }

    .error {
      margin-top: 12px;
      color: #b00020;
      font-weight: 500;
      font-size: 13px;
    }

    /* ── Board card ── */
    .board-card { overflow: hidden; }

    .board-wrapper {
      background: linear-gradient(180deg, #f7d9a8 0%, #e7c287 100%);
      border: 2px solid #a56d2b;
      border-radius: 12px;
      padding: 12px;
    }

    .game-board {
      width: 100%;
      height: auto;
      display: block;
      background: radial-gradient(circle at center, #f6deb8 0%, #ebc88f 80%);
      border-radius: 8px;
    }

    .board-edge { stroke: #4c2d14; stroke-width: 4; }
    .node-group { cursor: pointer; }

    .node-label {
      text-anchor: middle;
      font-size: 12px;
      font-weight: 600;
      fill: #3f2a14;
      user-select: none;
    }

    .node { stroke: #2f1e0f; stroke-width: 3; }
    .node-empty  { fill: #fff8ed; }
    .node-p1     { fill: #d32f2f; }
    .node-p2     { fill: #1976d2; }
    .node-selected { stroke: #ffb300; stroke-width: 5; }
    .node-target   { stroke: #fb8c00; stroke-width: 5; }

    .legend {
      margin-top: 12px;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
      gap: 8px;
      font-size: 13px;
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

    .dot.p1       { background: #d32f2f; }
    .dot.p2       { background: #1976d2; }
    .dot.empty    { background: #fff8ed; }
    .dot.selected { background: #ffb300; }
    .dot.target   { background: #fb8c00; }

    @media (max-width: 980px) {
      .layout { grid-template-columns: 1fr; }
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
      background: #1a0038;
      border: 1px solid #7c3aed;
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
      color: #e0e0e0;
    }

    .waiting-sub { margin: 0 0 16px; color: #a0a0c0; font-size: 14px; }

    .waiting-link-row {
      display: flex;
      gap: 10px;
      align-items: center;
      flex-wrap: wrap;
      justify-content: center;
      margin-top: 4px;
    }

    .waiting-invite-link {
      background: #0d0020;
      color: #e0e0e0;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 12px;
      border: 1px solid #3b1f6a;
      max-width: 320px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      display: block;
    }

    .waiting-spinner {
      width: 48px;
      height: 48px;
      border: 4px solid #3b1f6a;
      border-top-color: #c084fc;
      border-radius: 50%;
      margin: 0 auto;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* ── Winner card ── */
    .winner-card {
      background: #fff;
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
      color: #1a237e;
    }

    .winner-name {
      margin: 0 0 6px;
      font-size: 22px;
      font-weight: 600;
      color: #2e7d32;
    }

    .winner-sub { margin: 0 0 28px; color: #666; font-size: 14px; }

    .popup-btn { min-width: 140px; font-size: 15px; }

    /* ── Instructions card ── */
    .instructions-card {
      position: relative;
      background: #fff;
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
      color: #243b7a;
    }

    .instructions-body h3 {
      margin: 16px 0 4px;
      font-size: 14px;
      font-weight: 700;
      color: #243b7a;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .instructions-body p {
      margin: 0 0 8px;
      font-size: 14px;
      color: #444;
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
      color: #888;
      cursor: pointer;
      padding: 0;
    }

    .close-btn:hover { color: #222; }
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

  ngOnDestroy() {
    this.stopPolling();
  }

  private checkStatusThenPoll() {
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
        this.gameStatus = 'WAITING';
        this.player2Joined = false;
        localStorage.setItem('morabaraba-game-id', gameId);
        localStorage.setItem(`morabaraba-player-${gameId}`, 'PLAYER_1');
        this.router.navigate(['/morabaraba', gameId], { replaceUrl: true });
        this.clearSelection();
        this.loadGame();
        this.startStatusPolling();
      },
      error: () => {
        this.errorMessage = 'Failed to create game.';
      }
    });
  }

  private startStatusPolling() {
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
    if (!this.board || !this.myPlayer) return false;
    if (this.gameStatus === 'WAITING' || !this.player2Joined) return false;
    return this.board.gameState.currentPlayer === this.myPlayer;
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
    if (!this.gameId || !this.selectedNode || !this.board || !this.myPlayer) {
      return;
    }

    const request: PlaceRequest = {
      nodeId: this.selectedNode.id,
      player: this.myPlayer
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
    if (!this.gameId || !this.selectedNode || !this.targetNode || !this.myPlayer) {
      return;
    }

    const request: MoveRequest = {
      from: this.selectedNode.id,
      to: this.targetNode.id,
      player: this.myPlayer
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
    if (!this.gameId || !this.myPlayer) {
      return;
    }

    const request: RemoveRequest = {
      nodeId: node.id,
      player: this.myPlayer
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
