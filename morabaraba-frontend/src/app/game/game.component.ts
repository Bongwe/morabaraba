import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService, Board, Node, PlaceRequest, MoveRequest, RemoveRequest } from './game.service';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="game-container">
      <div class="game-info">
        <div *ngIf="board">
          <h2>Current Player: {{ board.gameState.currentPlayer }}</h2>
          <p>Phase: {{ board.gameState.phase }}</p>
          <p>Player 1 Pieces: {{ board.gameState.piecesInHand['PLAYER_1'] }}</p>
          <p>Player 2 Pieces: {{ board.gameState.piecesInHand['PLAYER_2'] }}</p>
        </div>
        <button (click)="createNewGame()" *ngIf="!gameId">New Game</button>
        <button (click)="loadGame()" *ngIf="gameId">Refresh</button>
      </div>

      <div class="board" *ngIf="board">
        <svg width="600" height="600" viewBox="0 0 7 7">
          <!-- Draw edges -->
          <line *ngFor="let edge of board.edges"
                [attr.x1]="getNodeById(edge[0])?.x"
                [attr.y1]="getNodeById(edge[0])?.y"
                [attr.x2]="getNodeById(edge[1])?.x"
                [attr.y2]="getNodeById(edge[1])?.y"
                stroke="black" stroke-width="0.05"></line>

          <!-- Draw nodes -->
          <circle *ngFor="let node of board.nodes"
                  [attr.cx]="node.x"
                  [attr.cy]="node.y"
                  r="0.2"
                  [attr.fill]="getNodeColor(node)"
                  (click)="onNodeClick(node)"
                  style="cursor: pointer;"></circle>
        </svg>
      </div>

      <div class="controls" *ngIf="board">
        <div *ngIf="selectedNode">
          <p>Selected: {{ selectedNode.id }}</p>
          <button (click)="placePiece()">Place Piece</button>
          <button (click)="removePiece(selectedNode)">Remove Piece</button>
        </div>
        <div *ngIf="selectedNode && targetNode">
          <p>From: {{ selectedNode.id }} To: {{ targetNode.id }}</p>
          <button (click)="movePiece()">Move Piece</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .game-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px;
    }
    .game-info {
      margin-bottom: 20px;
      text-align: center;
    }
    .board {
      border: 2px solid black;
      margin: 20px;
    }
    .controls {
      margin-top: 20px;
    }
  `]
})
export class GameComponent implements OnInit {
  gameId: string | null = null;
  board: Board | null = null;
  selectedNode: Node | null = null;
  targetNode: Node | null = null;

  constructor(private gameService: GameService) {}

  ngOnInit() {
    this.createNewGame();
  }

  createNewGame() {
    this.gameService.createGame().subscribe({
      next: (gameId) => {
        this.gameId = gameId;
        localStorage.setItem('morabaraba-game-id', gameId);
        this.loadGame();
      },
      error: (err) => console.error('Error creating game:', err)
    });
  }

  loadGame() {
    if (!this.gameId) return;
    this.gameService.getGame(this.gameId).subscribe({
      next: (board) => {
        this.board = board;
      },
      error: (err) => console.error('Error loading game:', err)
    });
  }

  onNodeClick(node: Node) {
    if (!this.selectedNode) {
      this.selectedNode = node;
    } else if (!this.targetNode) {
      this.targetNode = node;
    } else {
      this.selectedNode = node;
      this.targetNode = null;
    }
  }

  placePiece() {
    if (!this.gameId || !this.selectedNode || !this.board) return;

    const request: PlaceRequest = {
      nodeId: this.selectedNode.id,
      player: this.board.gameState.currentPlayer
    };

    this.gameService.placePiece(this.gameId, request).subscribe({
      next: () => {
        this.loadGame();
        this.selectedNode = null;
      },
      error: (err) => console.error('Error placing piece:', err)
    });
  }

  movePiece() {
    if (!this.gameId || !this.selectedNode || !this.targetNode) return;

    const request: MoveRequest = {
      from: this.selectedNode.id,
      to: this.targetNode.id
    };

    this.gameService.movePiece(this.gameId, request).subscribe({
      next: () => {
        this.loadGame();
        this.selectedNode = null;
        this.targetNode = null;
      },
      error: (err) => console.error('Error moving piece:', err)
    });
  }

  removePiece(node: Node) {
    if (!this.gameId) return;

    const request: RemoveRequest = {
      nodeId: node.id
    };

    this.gameService.removePiece(this.gameId, request).subscribe({
      next: () => {
        this.loadGame();
      },
      error: (err) => console.error('Error removing piece:', err)
    });
  }

  getNodeColor(node: Node): string {
    if (node === this.selectedNode) return 'yellow';
    if (node === this.targetNode) return 'orange';
    if (node.occupiedBy === 'PLAYER_1') return 'red';
    if (node.occupiedBy === 'PLAYER_2') return 'blue';
    return 'white';
  }

  getNodeById(id: string): Node | undefined {
    return this.board?.nodes.find(n => n.id === id);
  }
}
