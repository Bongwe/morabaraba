package za.co.obomvu.interactive.Morabaraba.service;

import za.co.obomvu.interactive.Morabaraba.domain.*;
import za.co.obomvu.interactive.Morabaraba.dto.MoveRequest;
import za.co.obomvu.interactive.Morabaraba.dto.PlaceRequest;
import za.co.obomvu.interactive.Morabaraba.dto.RemoveRequest;
import za.co.obomvu.interactive.Morabaraba.repository.GameRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;

@Service
@Transactional
public class GameService {

    private static final Logger logger = LoggerFactory.getLogger(GameService.class);

    @Autowired
    private GameRepository gameRepository;

    @Autowired
    private ObjectMapper objectMapper;

    // Standard 24-node Morabaraba mills (horizontal, vertical + diagonal corners)
    private static final List<List<String>> MILLS = Arrays.asList(
        // Horizontal / vertical rows of each ring
        Arrays.asList("A1", "D1", "G1"),
        Arrays.asList("B2", "D2", "F2"),
        Arrays.asList("C3", "D3", "E3"),
        Arrays.asList("A4", "B4", "C4"),
        Arrays.asList("E4", "F4", "G4"),
        Arrays.asList("C5", "D5", "E5"),
        Arrays.asList("B6", "D6", "F6"),
        Arrays.asList("A7", "D7", "G7"),
        // Vertical columns connecting rings
        Arrays.asList("A1", "A4", "A7"),
        Arrays.asList("B2", "B4", "B6"),
        Arrays.asList("C3", "C4", "C5"),
        Arrays.asList("D1", "D2", "D3"),
        Arrays.asList("D5", "D6", "D7"),
        Arrays.asList("E3", "E4", "E5"),
        Arrays.asList("F2", "F4", "F6"),
        Arrays.asList("G1", "G4", "G7"),
        // Diagonal corner connections (Morabaraba-specific)
        Arrays.asList("A1", "B2", "C3"),
        Arrays.asList("G1", "F2", "E3"),
        Arrays.asList("G7", "F6", "E5"),
        Arrays.asList("A7", "B6", "C5")
    );

    // Standard 24-node Morabaraba movement graph (includes diagonal corner edges)
    private static final List<List<String>> EDGES = Arrays.asList(
        // Outer ring
        Arrays.asList("A1", "D1"), Arrays.asList("D1", "G1"),
        Arrays.asList("G1", "G4"), Arrays.asList("G4", "G7"),
        Arrays.asList("G7", "D7"), Arrays.asList("D7", "A7"),
        Arrays.asList("A7", "A4"), Arrays.asList("A4", "A1"),
        // Middle ring
        Arrays.asList("B2", "D2"), Arrays.asList("D2", "F2"),
        Arrays.asList("F2", "F4"), Arrays.asList("F4", "F6"),
        Arrays.asList("F6", "D6"), Arrays.asList("D6", "B6"),
        Arrays.asList("B6", "B4"), Arrays.asList("B4", "B2"),
        // Inner ring
        Arrays.asList("C3", "D3"), Arrays.asList("D3", "E3"),
        Arrays.asList("E3", "E4"), Arrays.asList("E4", "E5"),
        Arrays.asList("E5", "D5"), Arrays.asList("D5", "C5"),
        Arrays.asList("C5", "C4"), Arrays.asList("C4", "C3"),
        // Bridges (connecting rings at midpoints)
        Arrays.asList("A4", "B4"), Arrays.asList("B4", "C4"),
        Arrays.asList("D1", "D2"), Arrays.asList("D2", "D3"),
        Arrays.asList("E4", "F4"), Arrays.asList("F4", "G4"),
        Arrays.asList("D5", "D6"), Arrays.asList("D6", "D7"),
        // Diagonal corner connections (Morabaraba-specific)
        Arrays.asList("A1", "B2"), Arrays.asList("B2", "C3"),
        Arrays.asList("G1", "F2"), Arrays.asList("F2", "E3"),
        Arrays.asList("G7", "F6"), Arrays.asList("F6", "E5"),
        Arrays.asList("A7", "B6"), Arrays.asList("B6", "C5")
    );

    // Define the standard 24-node Morabaraba board
    private List<Node> createInitialNodes() {
        List<Node> nodes = new ArrayList<>();
        nodes.add(new Node("A1", 0, 0));
        nodes.add(new Node("B2", 1, 1));
        nodes.add(new Node("C3", 2, 2));
        nodes.add(new Node("D1", 3, 0));
        nodes.add(new Node("D2", 3, 1));
        nodes.add(new Node("D3", 3, 2));
        nodes.add(new Node("D5", 3, 4));
        nodes.add(new Node("D6", 3, 5));
        nodes.add(new Node("D7", 3, 6));
        nodes.add(new Node("E3", 4, 2));
        nodes.add(new Node("E4", 4, 3));
        nodes.add(new Node("E5", 4, 4));
        nodes.add(new Node("F2", 5, 1));
        nodes.add(new Node("F4", 5, 3));
        nodes.add(new Node("F6", 5, 5));
        nodes.add(new Node("G1", 6, 0));
        nodes.add(new Node("G4", 6, 3));
        nodes.add(new Node("G7", 6, 6));
        nodes.add(new Node("A4", 0, 3));
        nodes.add(new Node("A7", 0, 6));
        nodes.add(new Node("B4", 1, 3));
        nodes.add(new Node("B6", 1, 5));
        nodes.add(new Node("C4", 2, 3));
        nodes.add(new Node("C5", 2, 4));
        return nodes;
    }

    public Board createInitialBoard() {
        List<Node> nodes = createInitialNodes();
        Map<PlayerEnum, Integer> piecesInHand = new HashMap<>();
        piecesInHand.put(PlayerEnum.PLAYER_1, 12);
        piecesInHand.put(PlayerEnum.PLAYER_2, 12);
        GameState gameState = new GameState(PlayerEnum.PLAYER_1, Phase.PLACEMENT, piecesInHand);
        Board board = new Board(nodes, EDGES, gameState);
        refreshCanRemove(board);
        return board;
    }

    public UUID createNewGame() {
        Board board = createInitialBoard();
        UUID id = UUID.randomUUID();
        try {
            saveGame(id, board);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to save new game", e);
        }
        return id;
    }

    public void saveGame(UUID id, Board board) throws JsonProcessingException {
        String json = objectMapper.writeValueAsString(board);
        GameEntity entity = gameRepository.findById(id).orElse(new GameEntity(id, null));
        entity.setBoardJson(json);
        gameRepository.save(entity);
    }

    public Board loadGame(UUID id) throws JsonProcessingException {
        GameEntity entity = gameRepository.findById(id).orElseThrow(() -> new RuntimeException("Game not found"));
        try {
            Board board = objectMapper.readValue(entity.getBoardJson(), Board.class);
            refreshCanRemove(board);
            return board;
        } catch (JsonProcessingException e) {
            logger.error("Failed to parse JSON for game {}: {}", id, entity.getBoardJson(), e);
            throw e;
        }
    }

    public void placePiece(UUID gameId, PlaceRequest request) throws JsonProcessingException {
        Board board = loadGame(gameId);
        ensureNoPendingCapture(board);
        if (!board.getGameState().getCurrentPlayer().equals(request.getPlayer())) {
            throw new IllegalArgumentException("Not your turn");
        }
        if (board.getGameState().getPhase() != Phase.PLACEMENT) {
            throw new IllegalArgumentException("Not in placement phase");
        }
        Node node = findNodeById(board, request.getNodeId());
        if (node == null || !node.isEmpty()) {
            throw new IllegalArgumentException("Invalid placement");
        }
        if (board.getGameState().getPiecesInHand().get(request.getPlayer()) <= 0) {
            throw new IllegalArgumentException("No pieces left");
        }
        node.setOccupiedBy(request.getPlayer());
        board.getGameState().getPiecesInHand().put(request.getPlayer(), board.getGameState().getPiecesInHand().get(request.getPlayer()) - 1);
        updatePhase(board);
        refreshCanRemove(board);
        if (hasMill(board, request.getNodeId())) {
            markCaptureRequired(board, request.getPlayer());
            refreshCanRemove(board);
            saveGame(gameId, board);
            return;
        }
        switchTurn(board);
        refreshCanRemove(board);
        saveGame(gameId, board);
    }

    public void movePiece(UUID gameId, MoveRequest request) throws JsonProcessingException {
        Board board = loadGame(gameId);
        ensureNoPendingCapture(board);
        if (!bothPlayersPlacedAllPieces(board)) {
            throw new IllegalArgumentException("Both players must place all 12 pieces before moving");
        }
        Phase phase = board.getGameState().getPhase();
        if (phase != Phase.MOVEMENT && phase != Phase.FLYING) {
            throw new IllegalArgumentException("Not in movement phase");
        }
        Node fromNode = findNodeById(board, request.getFrom());
        Node toNode = findNodeById(board, request.getTo());
        if (fromNode == null || toNode == null || fromNode.getOccupiedBy() == null || !fromNode.getOccupiedBy().equals(board.getGameState().getCurrentPlayer()) || !toNode.isEmpty()) {
            throw new IllegalArgumentException("Invalid move");
        }
        if (!isAdjacent(fromNode.getId(), toNode.getId(), board.getEdges())) {
            throw new IllegalArgumentException("Not adjacent");
        }
        fromNode.setOccupiedBy(null);
        toNode.setOccupiedBy(board.getGameState().getCurrentPlayer());
        refreshCanRemove(board);
        if (hasMill(board, request.getTo())) {
            markCaptureRequired(board, board.getGameState().getCurrentPlayer());
            refreshCanRemove(board);
            saveGame(gameId, board);
            return;
        }
        switchTurn(board);
        refreshCanRemove(board);
        saveGame(gameId, board);
    }

    public void removePiece(UUID gameId, RemoveRequest request) throws JsonProcessingException {
        Board board = loadGame(gameId);
        if (!board.getGameState().isCaptureRequired()) {
            throw new IllegalArgumentException("No capture available");
        }

        PlayerEnum capturePlayer = board.getGameState().getCapturePlayer();
        if (capturePlayer == null || capturePlayer != board.getGameState().getCurrentPlayer()) {
            throw new IllegalArgumentException("Only the player who formed the mill can capture");
        }

        Node node = findNodeById(board, request.getNodeId());
        if (node == null || node.isEmpty() || node.getOccupiedBy().equals(capturePlayer)) {
            throw new IllegalArgumentException("Invalid removal");
        }

        node.setOccupiedBy(null);
        clearCaptureRequired(board);
        updatePhase(board);
        switchTurn(board);
        refreshCanRemove(board);
        saveGame(gameId, board);
    }

    private void ensureNoPendingCapture(Board board) {
        if (board.getGameState().isCaptureRequired()) {
            throw new IllegalArgumentException("You must remove an opponent piece first");
        }
    }

    private void markCaptureRequired(Board board, PlayerEnum capturePlayer) {
        board.getGameState().setCaptureRequired(true);
        board.getGameState().setCapturePlayer(capturePlayer);
    }

    private void clearCaptureRequired(Board board) {
        board.getGameState().setCaptureRequired(false);
        board.getGameState().setCapturePlayer(null);
    }

    private void refreshCanRemove(Board board) {
        Map<PlayerEnum, Boolean> canRemove = new EnumMap<>(PlayerEnum.class);
        canRemove.put(PlayerEnum.PLAYER_1, hasAnyMill(board, PlayerEnum.PLAYER_1));
        canRemove.put(PlayerEnum.PLAYER_2, hasAnyMill(board, PlayerEnum.PLAYER_2));
        board.getGameState().setCanRemove(canRemove);
    }

    private Node findNodeById(Board board, String id) {
        return board.getNodes().stream().filter(n -> n.getId().equals(id)).findFirst().orElse(null);
    }

    private boolean isAdjacent(String idA, String idB, List<List<String>> edges) {
        return edges.stream().anyMatch(e -> (e.get(0).equals(idA) && e.get(1).equals(idB)) || (e.get(0).equals(idB) && e.get(1).equals(idA)));
    }

    private int getPlayerPieces(Board board, PlayerEnum player) {
        return (int) board.getNodes().stream().filter(n -> player.equals(n.getOccupiedBy())).count();
    }

    private boolean hasMill(Board board, String nodeId) {
        Node sourceNode = findNodeById(board, nodeId);
        if (sourceNode == null || sourceNode.getOccupiedBy() == null) {
            return false;
        }

        PlayerEnum player = sourceNode.getOccupiedBy();
        return MILLS.stream().anyMatch(mill -> mill.contains(nodeId) && mill.stream().allMatch(id -> {
            Node n = findNodeById(board, id);
            return n != null && player.equals(n.getOccupiedBy());
        }));
    }

    private boolean hasAnyMill(Board board, PlayerEnum player) {
        return MILLS.stream().anyMatch(mill -> mill.stream().allMatch(id -> {
            Node node = findNodeById(board, id);
            return node != null && player.equals(node.getOccupiedBy());
        }));
    }

    private void switchTurn(Board board) {
        board.getGameState().setCurrentPlayer(board.getGameState().getCurrentPlayer() == PlayerEnum.PLAYER_1 ? PlayerEnum.PLAYER_2 : PlayerEnum.PLAYER_1);
    }

    private boolean bothPlayersPlacedAllPieces(Board board) {
        Map<PlayerEnum, Integer> piecesInHand = board.getGameState().getPiecesInHand();
        return piecesInHand.getOrDefault(PlayerEnum.PLAYER_1, 0) == 0
                && piecesInHand.getOrDefault(PlayerEnum.PLAYER_2, 0) == 0;
    }

    private void updatePhase(Board board) {
        if (!bothPlayersPlacedAllPieces(board)) {
            board.getGameState().setPhase(Phase.PLACEMENT);
            return;
        }

        board.getGameState().setPhase(Phase.MOVEMENT);
    }
}
