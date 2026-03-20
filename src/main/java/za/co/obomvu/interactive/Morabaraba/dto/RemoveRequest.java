package za.co.obomvu.interactive.Morabaraba.dto;

public class RemoveRequest {
    private String nodeId;

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
}
