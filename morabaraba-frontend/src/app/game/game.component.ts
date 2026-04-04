import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { GameService, Board, Node, PlaceRequest, MoveRequest, RemoveRequest } from './game.service';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatChipsModule],
  template: `
    <div class="page">
      <mat-card class="top-card">
        <div class="top-row">
          <div>
            <h1>Morabaraba</h1>
            <p class="subtitle">Backend-driven gameplay with real-time board refresh</p>
            <p class="game-id" *ngIf="gameId">Game ID: <code>{{ gameId }}</code></p>
          </div>
          <div class="top-actions">
            <button mat-raised-button color="primary" (click)="createNewGame()">New Game</button>
            <button mat-stroked-button (click)="loadGame()" [disabled]="!gameId">Refresh</button>
          </div>
        </div>
        <div class="board-rules">
          <span>24 nodes</span>
          <span>Connected by edges</span>
          <span>Pieces sit on nodes</span>
          <span>No jumping</span>
        </div>
      </mat-card>

      <div class="layout" *ngIf="board as b">
        <mat-card class="status-card">
          <h2>Game Status</h2>

          <div class="status-row">
            <span>Current Player</span>
            <mat-chip [ngClass]="b.gameState.currentPlayer === 'PLAYER_1' ? 'chip-p1' : 'chip-p2'">
              {{ b.gameState.currentPlayer }}
            </mat-chip>
          </div>

          <div class="status-row">
            <span>Phase</span>
            <mat-chip color="accent">{{ b.gameState.phase }}</mat-chip>
          </div>

          <div class="status-row">
            <span>Player 1 pieces in hand</span>
            <strong>{{ b.gameState.piecesInHand['PLAYER_1'] }}</strong>
          </div>

          <div class="status-row">
            <span>Player 2 pieces in hand</span>
            <strong>{{ b.gameState.piecesInHand['PLAYER_2'] }}</strong>
          </div>

          <hr>

          <div class="selection">
            <p><strong>Selected:</strong> {{ selectedNode?.id || '-' }}</p>
            <p><strong>Target:</strong> {{ targetNode?.id || '-' }}</p>
          </div>

          <div class="actions">
            <button mat-raised-button color="primary" (click)="placePiece()" [disabled]="!canPlace()">
              Place Piece
            </button>
            <button mat-raised-button color="accent" (click)="movePiece()" [disabled]="!canMove()">
              Move Piece
            </button>
            <button mat-stroked-button color="warn" (click)="removeSelectedPiece()" [disabled]="!canRemove()">
              Remove Piece
            </button>
            <button mat-button (click)="clearSelection()">Clear Selection</button>
          </div>

          <p class="error" *ngIf="errorMessage">{{ errorMessage }}</p>
        </mat-card>

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
                <circle
                  [attr.cx]="boardX(node)"
                  [attr.cy]="boardY(node)"
                  r="14"
                  [ngClass]="getNodeClass(node)">
                </circle>
                <text [attr.x]="boardX(node)" [attr.y]="boardY(node) - 20" class="node-label">
                  {{ node.id }}
                </text>
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

    .top-card h1 {
      margin: 0;
      font-size: 28px;
      color: #243b7a;
    }

    .subtitle {
      margin: 6px 0 0;
      color: #5b6474;
    }

    .game-id {
      margin: 10px 0 0;
      color: #111827;
      font-size: 13px;
    }

    .top-row {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: flex-start;
      flex-wrap: wrap;
    }

    .top-actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .board-rules {
      margin-top: 14px;
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .board-rules span {
      display: inline-flex;
      align-items: center;
      padding: 6px 10px;
      border-radius: 999px;
      background: #e8eefc;
      color: #23408e;
      font-size: 12px;
      font-weight: 600;
    }

    .layout {
      display: grid;
      grid-template-columns: minmax(270px, 340px) 1fr;
      gap: 16px;
      align-items: start;
    }

    .status-card h2 {
      margin-top: 0;
      margin-bottom: 14px;
    }

    .status-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      gap: 12px;
    }

    .selection p {
      margin: 6px 0;
    }

    .actions {
      margin-top: 12px;
      display: grid;
      gap: 10px;
    }

    .error {
      margin-top: 12px;
      color: #b00020;
      font-weight: 500;
    }

    .board-card {
      overflow: hidden;
    }

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

    .board-edge {
      stroke: #4c2d14;
      stroke-width: 4;
    }

    .node-group {
      cursor: pointer;
    }

    .node-label {
      text-anchor: middle;
      font-size: 12px;
      font-weight: 600;
      fill: #3f2a14;
      user-select: none;
    }

    .node {
      stroke: #2f1e0f;
      stroke-width: 3;
    }

    .node-empty {
      fill: #fff8ed;
    }

    .node-p1 {
      fill: #d32f2f;
    }

    .node-p2 {
      fill: #1976d2;
    }

    .node-selected {
      stroke: #ffb300;
      stroke-width: 5;
    }

    .node-target {
      stroke: #fb8c00;
      stroke-width: 5;
    }

    .legend {
      margin-top: 12px;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
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

    .dot.p1 { background: #d32f2f; }
    .dot.p2 { background: #1976d2; }
    .dot.empty { background: #fff8ed; }
    .dot.selected { background: #ffb300; }
    .dot.target { background: #fb8c00; }

    .chip-p1 {
      background: #ffebee;
      color: #b71c1c;
    }

    .chip-p2 {
      background: #e3f2fd;
      color: #0d47a1;
    }

    @media (max-width: 980px) {
      .layout {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class GameComponent implements OnInit {
  gameId: string | null = null;
  board: Board | null = null;
  selectedNode: Node | null = null;
  targetNode: Node | null = null;
  errorMessage = '';

  constructor(private gameService: GameService) {}

  ngOnInit() {
    this.gameId = localStorage.getItem('morabaraba-game-id');
    if (this.gameId) {
      this.loadGame();
    } else {
      this.createNewGame();
    }
  }

  createNewGame() {
    this.errorMessage = '';
    this.gameService.createGame().subscribe({
      next: (gameId) => {
        this.gameId = gameId;
        localStorage.setItem('morabaraba-game-id', gameId);
        this.clearSelection();
        this.loadGame();
      },
      error: (err) => {
        this.errorMessage = 'Failed to create game.';
        console.error('Error creating game:', err);
      }
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
      error: (err) => {
        this.errorMessage = 'Failed to load game. Check that backend is running.';
        console.error('Error loading game:', err);
      }
    });
  }

  onNodeClick(node: Node) {
    if (!this.selectedNode) {
      this.selectedNode = node;
      return;
    }

    if (this.selectedNode.id === node.id) {
      this.clearSelection();
      return;
    }

    this.targetNode = node;
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
      player: this.board.gameState.currentPlayer
    };

    this.errorMessage = '';
    this.gameService.placePiece(this.gameId, request).subscribe({
      next: () => {
        this.loadGame();
        this.clearSelection();
      },
      error: (err) => {
        this.errorMessage = 'Place piece failed.';
        console.error('Error placing piece:', err);
      }
    });
  }

  movePiece() {
    if (!this.gameId || !this.selectedNode || !this.targetNode) {
      return;
    }

    const request: MoveRequest = {
      from: this.selectedNode.id,
      to: this.targetNode.id
    };

    this.errorMessage = '';
    this.gameService.movePiece(this.gameId, request).subscribe({
      next: () => {
        this.loadGame();
        this.clearSelection();
      },
      error: (err) => {
        this.errorMessage = 'Move piece failed.';
        console.error('Error moving piece:', err);
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
      nodeId: node.id
    };

    this.errorMessage = '';
    this.gameService.removePiece(this.gameId, request).subscribe({
      next: () => {
        this.loadGame();
        this.clearSelection();
      },
      error: (err) => {
        this.errorMessage = 'Remove piece failed.';
        console.error('Error removing piece:', err);
      }
    });
  }

  canPlace(): boolean {
    return !!this.board && !!this.selectedNode && this.board.gameState.phase === 'PLACEMENT';
  }

  canMove(): boolean {
    return !!this.board && !!this.selectedNode && !!this.targetNode && this.board.gameState.phase !== 'PLACEMENT';
  }

  canRemove(): boolean {
    return !!this.board && !!this.selectedNode && this.selectedNode.occupiedBy !== null && this.selectedNode.occupiedBy !== this.board.gameState.currentPlayer;
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
