package za.co.obomvu.interactive.Morabaraba.dto;

import za.co.obomvu.interactive.Morabaraba.domain.PlayerEnum;

public class RemoveRequest {
    private String nodeId;
    private PlayerEnum player;

    public RemoveRequest() {}

    public RemoveRequest(String nodeId) {
        this.nodeId = nodeId;
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
