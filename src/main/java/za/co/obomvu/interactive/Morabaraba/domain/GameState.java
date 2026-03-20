package za.co.obomvu.interactive.Morabaraba.domain;

import za.co.obomvu.interactive.Morabaraba.domain.PlayerEnum;
import za.co.obomvu.interactive.Morabaraba.domain.Phase;
import java.util.Map;

public class GameState {
    private PlayerEnum currentPlayer;
    private Phase phase;
    private Map<PlayerEnum, Integer> piecesInHand;

    public GameState() {}

    public GameState(PlayerEnum currentPlayer, Phase phase, Map<PlayerEnum, Integer> piecesInHand) {
        this.currentPlayer = currentPlayer;
        this.phase = phase;
        this.piecesInHand = piecesInHand;
    }

    // Getters and setters
    public PlayerEnum getCurrentPlayer() {
        return currentPlayer;
    }

    public void setCurrentPlayer(PlayerEnum currentPlayer) {
        this.currentPlayer = currentPlayer;
    }

    public Phase getPhase() {
        return phase;
    }

    public void setPhase(Phase phase) {
        this.phase = phase;
    }

    public Map<PlayerEnum, Integer> getPiecesInHand() {
        return piecesInHand;
    }

    public void setPiecesInHand(Map<PlayerEnum, Integer> piecesInHand) {
        this.piecesInHand = piecesInHand;
    }
}
