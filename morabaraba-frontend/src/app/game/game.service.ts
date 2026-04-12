import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Node {
  id: string;
  x: number;
  y: number;
  occupiedBy: string | null;
}

export interface GameState {
  currentPlayer: string;
  phase: string;
  piecesInHand: { [key: string]: number };
  captureRequired: boolean;
  capturePlayer: string | null;
  canRemove: { [key: string]: boolean };
  winner: string | null;
}

export interface Board {
  nodes: Node[];
  edges: string[][];
  gameState: GameState;
}

export interface PlaceRequest {
  nodeId: string;
  player: string;
}

export interface MoveRequest {
  from: string;
  to: string;
}

export interface RemoveRequest {
  nodeId: string;
}

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private baseUrl = 'http://localhost:8080/api/games';

  constructor(private http: HttpClient) {}

  createGame(): Observable<string> {
    return this.http.post<string>(this.baseUrl, {});
  }

  getGame(gameId: string): Observable<Board> {
    return this.http.get<Board>(`${this.baseUrl}/${gameId}`);
  }

  placePiece(gameId: string, request: PlaceRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${gameId}/place`, request);
  }

  movePiece(gameId: string, request: MoveRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${gameId}/move`, request);
  }

  removePiece(gameId: string, request: RemoveRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${gameId}/remove`, request);
  }
}
