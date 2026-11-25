import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CheckersSquare {
  id: string;
  row: number;
  col: number;
  occupiedBy: 'PLAYER_1' | 'PLAYER_2' | null;
  king: boolean;
}

export interface CheckersGameState {
  currentPlayer: 'PLAYER_1' | 'PLAYER_2';
  winner: 'PLAYER_1' | 'PLAYER_2' | null;
  capturedPieces: { PLAYER_1: number; PLAYER_2: number };
  mustJumpFrom: string | null;
}

export interface CheckersBoard {
  squares: CheckersSquare[];
  gameState: CheckersGameState;
}

@Injectable({ providedIn: 'root' })
export class CheckersService {
  private base = `${environment.apiUrl}/checkers`;

  constructor(private http: HttpClient) {}

  createGame(): Observable<string> {
    return this.http.post<string>(this.base, null);
  }

  getGame(id: string): Observable<CheckersBoard> {
    return this.http.get<CheckersBoard>(`${this.base}/${id}`);
  }

  move(id: string, from: string, to: string): Observable<void> {
    return this.http.post<void>(`${this.base}/${id}/move`, { from, to });
  }
}