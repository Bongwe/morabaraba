package za.co.obomvu.interactive.Morabaraba.checkers;

public class CheckersMoveRequest {
    private String from;
    private String to;

    public CheckersMoveRequest() {}

    public String getFrom() { return from; }
    public void setFrom(String from) { this.from = from; }

    public String getTo() { return to; }
    public void setTo(String to) { this.to = to; }
}