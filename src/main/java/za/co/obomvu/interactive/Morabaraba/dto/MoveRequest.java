package za.co.obomvu.interactive.Morabaraba.dto;

public class MoveRequest {
    private String from;
    private String to;

    public MoveRequest() {}

    public MoveRequest(String from, String to) {
        this.from = from;
        this.to = to;
    }

    // Getters and setters
    public String getFrom() {
        return from;
    }

    public void setFrom(String from) {
        this.from = from;
    }

    public String getTo() {
        return to;
    }

    public void setTo(String to) {
        this.to = to;
    }
}
