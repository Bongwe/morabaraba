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

    // Define the mills
    private static final List<List<String>> MILLS = Arrays.asList(
        Arrays.asList("A1", "A4", "A7"),
        Arrays.asList("B2", "B4", "B6"),
        Arrays.asList("C3", "C4", "C5"),
        Arrays.asList("D1", "D2", "D3"),
        Arrays.asList("D5", "D6", "D7"),
        Arrays.asList("E3", "E4", "E5"),
        Arrays.asList("F2", "F4", "F6"),
        Arrays.asList("G1", "G4", "G7"),
        Arrays.asList("A1", "B1", "C1"),
        Arrays.asList("A4", "B4", "C4"),
        Arrays.asList("A7", "B7", "C7"),
        Arrays.asList("C3", "D3", "E3"),
        Arrays.asList("C4", "D4", "E4"),
        Arrays.asList("C5", "D5", "E5"),
        Arrays.asList("E3", "F3", "G3"),
        Arrays.asList("E4", "F4", "G4"),
        Arrays.asList("E5", "F5", "G5"),
        Arrays.asList("A1", "D1", "G1"),
        Arrays.asList("B2", "D2", "F2"),
        Arrays.asList("C3", "D3", "E3"),
        Arrays.asList("A7", "D7", "G7"),
        Arrays.asList("B6", "D6", "F6"),
        Arrays.asList("C5", "D5", "E5"),
        Arrays.asList("A4", "D4", "G4"),
        Arrays.asList("B4", "D4", "F4"),
        Arrays.asList("C4", "D4", "E4")
    );

    // Define edges
    private static final List<List<String>> EDGES = Arrays.asList(
        Arrays.asList("A1", "A4"), Arrays.asList("A4", "A7"),
        Arrays.asList("B2", "B4"), Arrays.asList("B4", "B6"),
        Arrays.asList("C3", "C4"), Arrays.asList("C4", "C5"),
        Arrays.asList("D1", "D2"), Arrays.asList("D2", "D3"),
        Arrays.asList("D5", "D6"), Arrays.asList("D6", "D7"),
        Arrays.asList("E3", "E4"), Arrays.asList("E4", "E5"),
        Arrays.asList("F2", "F4"), Arrays.asList("F4", "F6"),
        Arrays.asList("G1", "G4"), Arrays.asList("G4", "G7"),
        Arrays.asList("A1", "B1"), Arrays.asList("B1", "C1"),
        Arrays.asList("A4", "B4"), Arrays.asList("B4", "C4"),
        Arrays.asList("A7", "B7"), Arrays.asList("B7", "C7"),
        Arrays.asList("C3", "D3"), Arrays.asList("D3", "E3"),
        Arrays.asList("C4", "D4"), Arrays.asList("D4", "E4"),
        Arrays.asList("C5", "D5"), Arrays.asList("D5", "E5"),
        Arrays.asList("E3", "F3"), Arrays.asList("F3", "G3"),
        Arrays.asList("E4", "F4"), Arrays.asList("F4", "G4"),
        Arrays.asList("E5", "F5"), Arrays.asList("F5", "G5"),
        Arrays.asList("A1", "D1"), Arrays.asList("D1", "G1"),
        Arrays.asList("B2", "D2"), Arrays.asList("D2", "F2"),
        Arrays.asList("C3", "D3"), Arrays.asList("D3", "E3"),
        Arrays.asList("A7", "D7"), Arrays.asList("D7", "G7"),
        Arrays.asList("B6", "D6"), Arrays.asList("D6", "F6"),
        Arrays.asList("C5", "D5"), Arrays.asList("D5", "E5"),
        Arrays.asList("A4", "D4"), Arrays.asList("D4", "G4"),
        Arrays.asList("B4", "D4"), Arrays.asList("D4", "F4"),
        Arrays.asList("C4", "D4"), Arrays.asList("D4", "E4")
    );

    // Define nodes with positions (approximate for simplicity)
    private List<Node> createInitialNodes() {
        List<Node> nodes = new ArrayList<>();
        // A row
        nodes.add(new Node("A1", 0, 0));
        nodes.add(new Node("A4", 0, 3));
        nodes.add(new Node("A7", 0, 6));
        // B row
        nodes.add(new Node("B1", 1, 0));
        nodes.add(new Node("B2", 1, 1));
        nodes.add(new Node("B4", 1, 3));
        nodes.add(new Node("B6", 1, 5));
        nodes.add(new Node("B7", 1, 6));
        // C row
        nodes.add(new Node("C1", 2, 0));
        nodes.add(new Node("C3", 2, 2));
        nodes.add(new Node("C4", 2, 3));
        nodes.add(new Node("C5", 2, 4));
        nodes.add(new Node("C7", 2, 6));
        // D row
        nodes.add(new Node("D1", 3, 0));
        nodes.add(new Node("D2", 3, 1));
        nodes.add(new Node("D3", 3, 2));
        nodes.add(new Node("D4", 3, 3));
        nodes.add(new Node("D5", 3, 4));
        nodes.add(new Node("D6", 3, 5));
        nodes.add(new Node("D7", 3, 6));
        // E row
        nodes.add(new Node("E3", 4, 2));
        nodes.add(new Node("E4", 4, 3));
        nodes.add(new Node("E5", 4, 4));
        // F row
        nodes.add(new Node("F2", 5, 1));
        nodes.add(new Node("F3", 5, 2));
        nodes.add(new Node("F4", 5, 3));
        nodes.add(new Node("F5", 5, 4));
        nodes.add(new Node("F6", 5, 5));
        // G row
        nodes.add(new Node("G1", 6, 0));
        nodes.add(new Node("G3", 6, 2));
        nodes.add(new Node("G4", 6, 3));
        nodes.add(new Node("G5", 6, 4));
        nodes.add(new Node("G7", 6, 6));
        return nodes;
    }

    public Board createInitialBoard() {
        List<Node> nodes = createInitialNodes();
        Map<PlayerEnum, Integer> piecesInHand = new HashMap<>();
        piecesInHand.put(PlayerEnum.PLAYER_1, 9);
        piecesInHand.put(PlayerEnum.PLAYER_2, 9);
        GameState gameState = new GameState(PlayerEnum.PLAYER_1, Phase.PLACEMENT, piecesInHand);
        return new Board(nodes, EDGES, gameState);
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
            return objectMapper.readValue(entity.getBoardJson(), Board.class);
        } catch (JsonProcessingException e) {
            logger.error("Failed to parse JSON for game {}: {}", id, entity.getBoardJson(), e);
            throw e;
        }
    }

    public void placePiece(UUID gameId, PlaceRequest request) throws JsonProcessingException {
        Board board = loadGame(gameId);
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
        // Check for mill and handle removal if needed
        if (hasMill(board, request.getNodeId())) {
            // For simplicity, assume removal is handled separately
        }
        switchTurn(board);
        updatePhase(board);
        saveGame(gameId, board);
    }

    public void movePiece(UUID gameId, MoveRequest request) throws JsonProcessingException {
        Board board = loadGame(gameId);
        Phase phase = board.getGameState().getPhase();
        if (phase != Phase.MOVEMENT && phase != Phase.FLYING) {
            throw new IllegalArgumentException("Not in movement phase");
        }
        Node fromNode = findNodeById(board, request.getFrom());
        Node toNode = findNodeById(board, request.getTo());
        if (fromNode == null || toNode == null || fromNode.getOccupiedBy() == null || !fromNode.getOccupiedBy().equals(board.getGameState().getCurrentPlayer()) || !toNode.isEmpty()) {
            throw new IllegalArgumentException("Invalid move");
        }
        if (phase == Phase.MOVEMENT && !isAdjacent(fromNode.getId(), toNode.getId(), board.getEdges())) {
            throw new IllegalArgumentException("Not adjacent");
        }
        fromNode.setOccupiedBy(null);
        toNode.setOccupiedBy(board.getGameState().getCurrentPlayer());
        if (hasMill(board, request.getTo())) {
            // handle removal
        }
        switchTurn(board);
        saveGame(gameId, board);
    }

    public void removePiece(UUID gameId, RemoveRequest request) throws JsonProcessingException {
        Board board = loadGame(gameId);
        Node node = findNodeById(board, request.getNodeId());
        if (node == null || node.isEmpty() || node.getOccupiedBy().equals(board.getGameState().getCurrentPlayer())) {
            throw new IllegalArgumentException("Invalid removal");
        }
        // Check if in mill, but for simplicity, allow
        node.setOccupiedBy(null);
        saveGame(gameId, board);
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
        PlayerEnum player = findNodeById(board, nodeId).getOccupiedBy();
        return MILLS.stream().anyMatch(mill -> mill.contains(nodeId) && mill.stream().allMatch(id -> {
            Node n = findNodeById(board, id);
            return n != null && player.equals(n.getOccupiedBy());
        }));
    }

    private void switchTurn(Board board) {
        board.getGameState().setCurrentPlayer(board.getGameState().getCurrentPlayer() == PlayerEnum.PLAYER_1 ? PlayerEnum.PLAYER_2 : PlayerEnum.PLAYER_1);
    }

    private void updatePhase(Board board) {
        if (board.getGameState().getPiecesInHand().get(PlayerEnum.PLAYER_1) == 0 && board.getGameState().getPiecesInHand().get(PlayerEnum.PLAYER_2) == 0) {
            board.getGameState().setPhase(Phase.MOVEMENT);
        }
        if (getPlayerPieces(board, board.getGameState().getCurrentPlayer()) == 3) {
            board.getGameState().setPhase(Phase.FLYING);
        }
    }
}
