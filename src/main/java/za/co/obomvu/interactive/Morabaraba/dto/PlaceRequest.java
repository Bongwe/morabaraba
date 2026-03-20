package za.co.obomvu.interactive.Morabaraba.dto;

import za.co.obomvu.interactive.Morabaraba.domain.PlayerEnum;

public class PlaceRequest {
    private String nodeId;
    private PlayerEnum player;

    public PlaceRequest() {}

    public PlaceRequest(String nodeId, PlayerEnum player) {
        this.nodeId = nodeId;
        this.player = player;
    }

    // Getters and setters
    public String getNodeId() {
        return nodeId;
    }

    public void setNodeId(String nodeId) {
        this.nodeId = nodeId;
    }

    public PlayerEnum getPlayer() {
        return player;
    }

    public void setPlayer(PlayerEnum player) {
        this.player = player;
    }
}
