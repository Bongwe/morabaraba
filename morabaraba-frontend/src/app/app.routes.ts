import { Routes } from '@angular/router';
import { LobbyComponent } from './lobby/lobby.component';
import { GameComponent } from './game/game.component';
import { CheckersComponent } from './checkers/checkers.component';

export const routes: Routes = [
  { path: '', component: LobbyComponent },
  { path: 'morabaraba', component: GameComponent },
  { path: 'checkers', component: CheckersComponent }
];
