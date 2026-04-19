package za.co.obomvu.interactive.Morabaraba.checkers;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import java.util.UUID;

@Entity
public class CheckersGameEntity {

    @Id
    private UUID id;

    @Column(columnDefinition = "TEXT")
    private String boardJson;

    public CheckersGameEntity() {}

    public CheckersGameEntity(UUID id, String boardJson) {
        this.id = id;
        this.boardJson = boardJson;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getBoardJson() { return boardJson; }
    public void setBoardJson(String boardJson) { this.boardJson = boardJson; }
}