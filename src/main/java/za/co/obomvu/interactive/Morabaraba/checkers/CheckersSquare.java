package za.co.obomvu.interactive.Morabaraba.checkers;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import za.co.obomvu.interactive.Morabaraba.domain.PlayerEnum;

@JsonIgnoreProperties(ignoreUnknown = true)
public class CheckersSquare {
    private int row;
    private int col;
    private PlayerEnum occupiedBy;
    private boolean king;

    public CheckersSquare() {}

    public CheckersSquare(int row, int col) {
        this.row = row;
        this.col = col;
    }

    public String getId() {
        return row + "-" + col;
    }

    public int getRow() { return row; }
    public void setRow(int row) { this.row = row; }

    public int getCol() { return col; }
    public void setCol(int col) { this.col = col; }

    public PlayerEnum getOccupiedBy() { return occupiedBy; }
    public void setOccupiedBy(PlayerEnum occupiedBy) { this.occupiedBy = occupiedBy; }

    public boolean isKing() { return king; }
    public void setKing(boolean king) { this.king = king; }
}