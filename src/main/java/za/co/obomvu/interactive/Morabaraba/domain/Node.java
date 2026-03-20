package za.co.obomvu.interactive.Morabaraba.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import za.co.obomvu.interactive.Morabaraba.domain.PlayerEnum;

public class Node {
    private String id;
    private int x;
    private int y;
    private PlayerEnum occupiedBy;

    public Node() {}

    public Node(String id, int x, int y) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.occupiedBy = null;
    }

    // Getters and setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public int getX() {
        return x;
    }

    public void setX(int x) {
        this.x = x;
    }

    public int getY() {
        return y;
    }

    public void setY(int y) {
        this.y = y;
    }

    public PlayerEnum getOccupiedBy() {
        return occupiedBy;
    }

    public void setOccupiedBy(PlayerEnum occupiedBy) {
        this.occupiedBy = occupiedBy;
    }

    @JsonIgnore
    public boolean isEmpty() {
        return occupiedBy == null;
    }
}
