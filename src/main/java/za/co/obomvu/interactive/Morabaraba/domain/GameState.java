package za.co.obomvu.interactive.Morabaraba.domain;

import java.util.Map;
import java.util.HashMap;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class GameState {
    private PlayerEnum currentPlayer;
    private Phase phase;
    private Map<PlayerEnum, Integer> piecesInHand;
    private boolean captureRequired;
    private PlayerEnum capturePlayer;
    private Map<PlayerEnum, Boolean> canRemove;
    private PlayerEnum winner;
    private GameStatus status;
    private boolean player2Joined;

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
        this.status = GameStatus.WAITING;
        this.player2Joined = false;
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

    public PlayerEnum getWinner() {
        return winner;
    }

    public void setWinner(PlayerEnum winner) {
        this.winner = winner;
    }

    public GameStatus getStatus() {
        return status;
    }

    public void setStatus(GameStatus status) {
        this.status = status;
    }

    public boolean isPlayer2Joined() {
        return player2Joined;
    }

    public void setPlayer2Joined(boolean player2Joined) {
        this.player2Joined = player2Joined;
    }
}
