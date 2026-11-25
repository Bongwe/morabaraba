package za.co.obomvu.interactive.Morabaraba.checkers;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class CheckersBoard {
    private List<CheckersSquare> squares;
    private CheckersGameState gameState;

    public CheckersBoard() {}

    public CheckersBoard(List<CheckersSquare> squares, CheckersGameState gameState) {
        this.squares = squares;
        this.gameState = gameState;
    }

    public List<CheckersSquare> getSquares() { return squares; }
    public void setSquares(List<CheckersSquare> squares) { this.squares = squares; }

    public CheckersGameState getGameState() { return gameState; }
    public void setGameState(CheckersGameState gameState) { this.gameState = gameState; }
}