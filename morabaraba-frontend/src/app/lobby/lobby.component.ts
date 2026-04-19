import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Game {
  id: string;
  name: string;
  description: string;
  genre: string;
  players: string;
  gradientStart: string;
  gradientEnd: string;
  route: string;
  available: boolean;
}

@Component({
  selector: 'app-lobby',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="arcade">

      <header class="arcade-header">
        <div class="scanlines"></div>
        <div class="header-content">
          <p class="arcade-label">OBOMVU INTERACTIVE PRESENTS</p>
          <h1 class="arcade-title">OBOMVU <span class="accent">ARCADE</span></h1>
          <p class="arcade-sub">— SELECT YOUR GAME —</p>
          <span class="blink-cursor">▮</span>
        </div>
      </header>

      <main class="games-section">
        <div class="games-grid">
          <div
            *ngFor="let game of games"
            class="game-card"
            [class.available]="game.available"
            [class.coming-soon]="!game.available"
            (click)="game.available && playGame(game)"
          >
            <div class="card-art" [style.background]="'linear-gradient(145deg,' + game.gradientStart + ',' + game.gradientEnd + ')'">
              <div class="card-art-noise"></div>

              <ng-container *ngIf="game.id === 'morabaraba'">
                <svg viewBox="0 0 120 120" class="game-svg">
                  <rect x="4" y="4" width="112" height="112" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="2.5"/>
                  <rect x="22" y="22" width="76" height="76" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="2.5"/>
                  <rect x="40" y="40" width="40" height="40" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="2.5"/>
                  <line x1="60" y1="4" x2="60" y2="40" stroke="rgba(255,255,255,0.35)" stroke-width="2.5"/>
                  <line x1="60" y1="80" x2="60" y2="116" stroke="rgba(255,255,255,0.35)" stroke-width="2.5"/>
                  <line x1="4" y1="60" x2="40" y2="60" stroke="rgba(255,255,255,0.35)" stroke-width="2.5"/>
                  <line x1="80" y1="60" x2="116" y2="60" stroke="rgba(255,255,255,0.35)" stroke-width="2.5"/>
                  <circle cx="4"   cy="4"   r="4" fill="rgba(255,255,255,0.7)"/>
                  <circle cx="116" cy="4"   r="4" fill="rgba(255,255,255,0.7)"/>
                  <circle cx="4"   cy="116" r="4" fill="rgba(255,255,255,0.7)"/>
                  <circle cx="116" cy="116" r="4" fill="rgba(255,255,255,0.7)"/>
                  <circle cx="22"  cy="22"  r="4" fill="rgba(255,255,255,0.6)"/>
                  <circle cx="98"  cy="22"  r="4" fill="rgba(255,255,255,0.6)"/>
                  <circle cx="22"  cy="98"  r="4" fill="rgba(255,255,255,0.6)"/>
                  <circle cx="98"  cy="98"  r="4" fill="rgba(255,255,255,0.6)"/>
                  <circle cx="60"  cy="4"   r="5" fill="#f87171" filter="url(#glow-r)"/>
                  <circle cx="116" cy="60"  r="5" fill="#f87171" filter="url(#glow-r)"/>
                  <circle cx="60"  cy="116" r="5" fill="#60a5fa" filter="url(#glow-b)"/>
                  <circle cx="4"   cy="60"  r="5" fill="#60a5fa" filter="url(#glow-b)"/>
                  <defs>
                    <filter id="glow-r"><feGaussianBlur stdDeviation="2" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                    <filter id="glow-b"><feGaussianBlur stdDeviation="2" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                  </defs>
                </svg>
              </ng-container>

              <ng-container *ngIf="!game.available">
                <div class="cs-art">?</div>
                <div class="cs-badge">COMING SOON</div>
              </ng-container>

              <div class="card-glow-border"></div>
            </div>

            <div class="card-body">
              <h2 class="card-title">{{ game.name }}</h2>
              <div class="card-badges">
                <span class="badge genre-badge">{{ game.genre }}</span>
                <span class="badge players-badge">{{ game.players }}</span>
              </div>
              <p class="card-desc">{{ game.description }}</p>
              <button
                *ngIf="game.available"
                class="play-btn"
                (click)="playGame(game); $event.stopPropagation()"
              >&#9654; PLAY NOW</button>
              <div *ngIf="!game.available" class="locked-label">LOCKED</div>
            </div>
          </div>
        </div>
      </main>

      <footer class="arcade-footer">
        <p>© 2025 OBOMVU INTERACTIVE &nbsp;·&nbsp; MORE GAMES COMING SOON</p>
      </footer>
    </div>
  `,
  styles: [`
    .arcade {
      min-height: 100vh;
      background: #05050f;
      display: flex;
      flex-direction: column;
    }

    /* ── Header ── */
    .arcade-header {
      position: relative;
      background: linear-gradient(180deg, #0d0020 0%, #1a0038 60%, #0d0020 100%);
      padding: 64px 20px 48px;
      text-align: center;
      border-bottom: 2px solid #7c3aed;
      overflow: hidden;
    }

    .scanlines {
      position: absolute;
      inset: 0;
      background: repeating-linear-gradient(
        0deg,
        transparent 0px,
        transparent 3px,
        rgba(0, 0, 0, 0.18) 3px,
        rgba(0, 0, 0, 0.18) 4px
      );
      pointer-events: none;
    }

    .header-content {
      position: relative;
      z-index: 2;
    }

    .arcade-label {
      font-family: 'Press Start 2P', 'Courier New', monospace;
      font-size: clamp(7px, 1.2vw, 10px);
      color: rgba(192, 132, 252, 0.6);
      letter-spacing: 4px;
      margin: 0 0 18px;
    }

    .arcade-title {
      font-family: 'Press Start 2P', 'Courier New', monospace;
      font-size: clamp(22px, 5vw, 54px);
      color: #ffffff;
      text-shadow:
        0 0 10px #c084fc,
        0 0 30px #7c3aed,
        0 0 70px #4c1d95;
      margin: 0 0 20px;
      letter-spacing: 6px;
      line-height: 1.4;
    }

    .accent {
      color: #c084fc;
      text-shadow:
        0 0 10px #c084fc,
        0 0 30px #a855f7,
        0 0 60px #7c3aed;
    }

    .arcade-sub {
      font-family: 'Press Start 2P', 'Courier New', monospace;
      font-size: clamp(9px, 1.8vw, 13px);
      color: #7dd3fc;
      letter-spacing: 6px;
      text-shadow: 0 0 12px #38bdf8;
      margin: 0 0 14px;
    }

    .blink-cursor {
      font-size: 18px;
      color: #c084fc;
      animation: blink 1s step-end infinite;
    }

    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0; }
    }

    /* ── Games section ── */
    .games-section {
      flex: 1;
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
      padding: 52px 24px;
      box-sizing: border-box;
    }

    .games-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 28px;
    }

    /* ── Game card ── */
    .game-card {
      background: #0e0e20;
      border: 1px solid #1e1e40;
      border-radius: 14px;
      overflow: hidden;
      transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
      display: flex;
      flex-direction: column;
    }

    .game-card.available {
      cursor: pointer;
    }

    .game-card.available:hover {
      transform: translateY(-8px) scale(1.01);
      border-color: #a855f7;
      box-shadow:
        0 0 0 1px #a855f7,
        0 0 30px rgba(168, 85, 247, 0.35),
        0 20px 50px rgba(0, 0, 0, 0.6);
    }

    .game-card.coming-soon {
      opacity: 0.5;
      cursor: default;
    }

    /* ── Card art ── */
    .card-art {
      position: relative;
      height: 190px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .card-art-noise {
      position: absolute;
      inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
      pointer-events: none;
    }

    .card-glow-border {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(255,255,255,0.06) 0%, transparent 60%);
      pointer-events: none;
    }

    .game-svg {
      width: 110px;
      height: 110px;
      position: relative;
      z-index: 1;
      filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.25));
    }

    .cs-art {
      font-family: 'Press Start 2P', monospace;
      font-size: 64px;
      color: rgba(255,255,255,0.1);
      position: relative;
      z-index: 1;
    }

    .cs-badge {
      position: absolute;
      top: 14px;
      right: 14px;
      background: rgba(30, 30, 60, 0.9);
      border: 1px solid #444;
      color: #666;
      font-family: 'Press Start 2P', 'Courier New', monospace;
      font-size: 8px;
      padding: 5px 9px;
      border-radius: 4px;
      letter-spacing: 1px;
      z-index: 2;
    }

    /* ── Card body ── */
    .card-body {
      padding: 22px 20px 20px;
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .card-title {
      margin: 0 0 12px;
      font-family: 'Press Start 2P', 'Courier New', monospace;
      font-size: 13px;
      color: #f0f0ff;
      letter-spacing: 1px;
      line-height: 1.5;
    }

    .card-badges {
      display: flex;
      gap: 8px;
      margin-bottom: 14px;
      flex-wrap: wrap;
    }

    .badge {
      font-size: 10px;
      padding: 4px 10px;
      border-radius: 999px;
      font-weight: 600;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }

    .genre-badge {
      background: rgba(124, 58, 237, 0.2);
      color: #c084fc;
      border: 1px solid rgba(124, 58, 237, 0.45);
    }

    .players-badge {
      background: rgba(56, 189, 248, 0.12);
      color: #7dd3fc;
      border: 1px solid rgba(56, 189, 248, 0.3);
    }

    .card-desc {
      margin: 0 0 20px;
      font-size: 13px;
      color: #9ca3af;
      line-height: 1.65;
      flex: 1;
    }

    .play-btn {
      width: 100%;
      padding: 13px 16px;
      background: linear-gradient(135deg, #6d28d9, #a855f7);
      color: #fff;
      border: none;
      border-radius: 7px;
      font-family: 'Press Start 2P', 'Courier New', monospace;
      font-size: 11px;
      letter-spacing: 2px;
      cursor: pointer;
      transition: box-shadow 0.2s, opacity 0.2s;
      margin-top: auto;
    }

    .play-btn:hover {
      box-shadow: 0 0 20px rgba(168, 85, 247, 0.55), 0 0 40px rgba(168, 85, 247, 0.25);
      opacity: 0.92;
    }

    .locked-label {
      text-align: center;
      font-family: 'Press Start 2P', 'Courier New', monospace;
      font-size: 10px;
      color: #3f3f5a;
      letter-spacing: 3px;
      padding: 12px 0 4px;
    }

    /* ── Footer ── */
    .arcade-footer {
      text-align: center;
      padding: 24px 20px;
      border-top: 1px solid #12122a;
      color: #2e2e4e;
      font-family: 'Press Start 2P', 'Courier New', monospace;
      font-size: 9px;
      letter-spacing: 2px;
    }

    .arcade-footer p { margin: 0; }

    @media (max-width: 640px) {
      .games-grid { grid-template-columns: 1fr; }
      .arcade-title { letter-spacing: 3px; }
    }
  `]
})
export class LobbyComponent {
  constructor(private router: Router) {}
  games: Game[] = [
    {
      id: 'morabaraba',
      name: 'Morabaraba',
      description: 'Ancient African strategy game. Place pieces, form mills, and capture your opponent\'s army on the 24-node board.',
      genre: 'Strategy',
      players: '2 Players',
      gradientStart: '#2e1065',
      gradientEnd: '#6d28d9',
      route: '/morabaraba',
      available: true
    },
    {
      id: 'coming-1',
      name: 'Coming Soon',
      description: 'A new title is in development. Stay tuned for more games from Obomvu Interactive.',
      genre: '???',
      players: '???',
      gradientStart: '#0f0f1e',
      gradientEnd: '#1a1a30',
      route: '',
      available: false
    },
    {
      id: 'coming-2',
      name: 'Coming Soon',
      description: 'More African board games and strategy titles are on the way.',
      genre: '???',
      players: '???',
      gradientStart: '#0f0f1e',
      gradientEnd: '#1a1a30',
      route: '',
      available: false
    }
  ];

  playGame(game: Game) {
    this.router.navigate([game.route]);
  }
}
