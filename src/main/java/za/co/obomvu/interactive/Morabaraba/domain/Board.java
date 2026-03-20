package za.co.obomvu.interactive.Morabaraba.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Board {
    private List<Node> nodes;
    private List<List<String>> edges;
    private GameState gameState;

    public Board() {}

    public Board(List<Node> nodes, List<List<String>> edges, GameState gameState) {
        this.nodes = nodes;
        this.edges = edges;
        this.gameState = gameState;
    }

    // Getters and setters
    public List<Node> getNodes() {
        return nodes;
    }

    public void setNodes(List<Node> nodes) {
        this.nodes = nodes;
    }

    public List<List<String>> getEdges() {
        return edges;
    }

    public void setEdges(List<List<String>> edges) {
        this.edges = edges;
    }

    public GameState getGameState() {
        return gameState;
    }

    public void setGameState(GameState gameState) {
        this.gameState = gameState;
    }
}
