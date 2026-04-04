package za.co.obomvu.interactive.Morabaraba.domain;

import java.util.Map;
import java.util.HashMap;

public class GameState {
    private PlayerEnum currentPlayer;
    private Phase phase;
    private Map<PlayerEnum, Integer> piecesInHand;
    private boolean captureRequired;
    private PlayerEnum capturePlayer;
    private Map<PlayerEnum, Boolean> canRemove;

    public GameState() {}

    public GameState(PlayerEnum currentPlayer, Phase phase, Map<PlayerEnum, Integer> piecesInHand) {
        this.currentPlayer = currentPlayer;
        this.phase = phase;
        this.piecesInHand = piecesInHand;
        this.captureRequired = false;
        this.capturePlayer = null;
        this.canRemove = new HashMap<>();
        this.canRemove.put(PlayerEnum.PLAYER_1, false);
        this.canRemove.put(PlayerEnum.PLAYER_2, false);
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

    public boolean isCaptureRequired() {
        return captureRequired;
    }

    public void setCaptureRequired(boolean captureRequired) {
        this.captureRequired = captureRequired;
    }

    public PlayerEnum getCapturePlayer() {
        return capturePlayer;
    }

    public void setCapturePlayer(PlayerEnum capturePlayer) {
        this.capturePlayer = capturePlayer;
    }

    public Map<PlayerEnum, Boolean> getCanRemove() {
        return canRemove;
    }

    public void setCanRemove(Map<PlayerEnum, Boolean> canRemove) {
        this.canRemove = canRemove;
    }
}
