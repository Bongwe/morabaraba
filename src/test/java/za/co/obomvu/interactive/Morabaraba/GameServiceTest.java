package za.co.obomvu.interactive.Morabaraba;

import za.co.obomvu.interactive.Morabaraba.domain.*;
import za.co.obomvu.interactive.Morabaraba.dto.PlaceRequest;
import za.co.obomvu.interactive.Morabaraba.service.GameService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
public class GameServiceTest {

    @Autowired
    private GameService gameService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void testCreateNewGame() {
        Board board = gameService.createNewGame();
        assertNotNull(board);
        assertEquals(24, board.getNodes().size()); // Assuming 24 nodes
        assertEquals(PlayerEnum.PLAYER_1, board.getGameState().getCurrentPlayer());
        assertEquals(Phase.PLACEMENT, board.getGameState().getPhase());
    }

    @Test
    public void testPlacePiece() throws Exception {
        Board board = gameService.createNewGame();
        UUID id = gameService.saveGame(board);
        PlaceRequest request = new PlaceRequest("A1", PlayerEnum.PLAYER_1);
        gameService.placePiece(id, request);
        Board updated = gameService.loadGame(id);
        Node node = updated.getNodes().stream().filter(n -> "A1".equals(n.getId())).findFirst().orElse(null);
        assertNotNull(node);
        assertEquals(PlayerEnum.PLAYER_1, node.getOccupiedBy());
    }

    // Add more tests for move, remove, mill detection
}
