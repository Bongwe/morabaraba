package za.co.obomvu.interactive.Morabaraba.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import java.util.UUID;

@Entity
public class GameEntity {

    @Id
    private UUID id;

    @Column(columnDefinition = "TEXT")
    private String boardJson;

    public GameEntity() {}

    public GameEntity(UUID id, String boardJson) {
        this.id = id;
        this.boardJson = boardJson;
    }

    // Getters and setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getBoardJson() {
        return boardJson;
    }

    public void setBoardJson(String boardJson) {
        this.boardJson = boardJson;
    }
}
