package za.co.obomvu.interactive.Morabaraba;

import za.co.obomvu.interactive.Morabaraba.domain.*;
import za.co.obomvu.interactive.Morabaraba.dto.MoveRequest;
import za.co.obomvu.interactive.Morabaraba.dto.PlaceRequest;
import za.co.obomvu.interactive.Morabaraba.service.GameService;
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

    @Test
    public void testCreateNewGame() throws Exception {
        UUID gameId = gameService.createNewGame();
        assertNotNull(gameId);

        Board board = gameService.loadGame(gameId);
        assertNotNull(board);
        assertEquals(24, board.getNodes().size());
        assertEquals(PlayerEnum.PLAYER_1, board.getGameState().getCurrentPlayer());
        assertEquals(Phase.PLACEMENT, board.getGameState().getPhase());
        assertEquals(12, board.getGameState().getPiecesInHand().get(PlayerEnum.PLAYER_1));
        assertEquals(12, board.getGameState().getPiecesInHand().get(PlayerEnum.PLAYER_2));
        assertNull(board.getNodes().stream().filter(node -> "D4".equals(node.getId())).findFirst().orElse(null));
    }

    @Test
    public void testPlacePiece() throws Exception {
        UUID gameId = gameService.createNewGame();

        PlaceRequest request = new PlaceRequest("A1", PlayerEnum.PLAYER_1);
        gameService.placePiece(gameId, request);

        Board updated = gameService.loadGame(gameId);
        Node node = updated.getNodes().stream().filter(n -> "A1".equals(n.getId())).findFirst().orElse(null);
        assertNotNull(node);
        assertEquals(PlayerEnum.PLAYER_1, node.getOccupiedBy());
        assertEquals(11, updated.getGameState().getPiecesInHand().get(PlayerEnum.PLAYER_1));
        assertEquals(PlayerEnum.PLAYER_2, updated.getGameState().getCurrentPlayer());
    }

    @Test
    public void testMovePieceRejectsJumpingAcrossBoard() throws Exception {
        UUID gameId = gameService.createNewGame();
        Board board = gameService.loadGame(gameId);

        board.getGameState().getPiecesInHand().put(PlayerEnum.PLAYER_1, 0);
        board.getGameState().getPiecesInHand().put(PlayerEnum.PLAYER_2, 0);
        board.getGameState().setPhase(Phase.MOVEMENT);
        board.getGameState().setCurrentPlayer(PlayerEnum.PLAYER_1);

        Node fromNode = board.getNodes().stream().filter(node -> "A1".equals(node.getId())).findFirst().orElseThrow();
        fromNode.setOccupiedBy(PlayerEnum.PLAYER_1);

        gameService.saveGame(gameId, board);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> gameService.movePiece(gameId, new MoveRequest("A1", "G1")));

        assertEquals("Not adjacent", exception.getMessage());
    }
}
