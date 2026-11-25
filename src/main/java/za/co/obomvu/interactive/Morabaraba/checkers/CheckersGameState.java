package za.co.obomvu.interactive.Morabaraba.checkers;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import za.co.obomvu.interactive.Morabaraba.domain.PlayerEnum;

import java.util.Map;

@JsonIgnoreProperties(ignoreUnknown = true)
public class CheckersGameState {
    private PlayerEnum currentPlayer;
    private PlayerEnum winner;
    private Map<PlayerEnum, Integer> capturedPieces;
    private String mustJumpFrom;

    public CheckersGameState() {}

    public CheckersGameState(PlayerEnum currentPlayer, PlayerEnum winner,
                              Map<PlayerEnum, Integer> capturedPieces, String mustJumpFrom) {
        this.currentPlayer = currentPlayer;
        this.winner = winner;
        this.capturedPieces = capturedPieces;
        this.mustJumpFrom = mustJumpFrom;
    }

    public PlayerEnum getCurrentPlayer() { return currentPlayer; }
    public void setCurrentPlayer(PlayerEnum currentPlayer) { this.currentPlayer = currentPlayer; }

    public PlayerEnum getWinner() { return winner; }
    public void setWinner(PlayerEnum winner) { this.winner = winner; }

    public Map<PlayerEnum, Integer> getCapturedPieces() { return capturedPieces; }
    public void setCapturedPieces(Map<PlayerEnum, Integer> capturedPieces) { this.capturedPieces = capturedPieces; }

    public String getMustJumpFrom() { return mustJumpFrom; }
    public void setMustJumpFrom(String mustJumpFrom) { this.mustJumpFrom = mustJumpFrom; }
}