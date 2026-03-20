package za.co.obomvu.interactive.Morabaraba.controller;

import za.co.obomvu.interactive.Morabaraba.domain.Board;
import za.co.obomvu.interactive.Morabaraba.dto.MoveRequest;
import za.co.obomvu.interactive.Morabaraba.dto.PlaceRequest;
import za.co.obomvu.interactive.Morabaraba.dto.RemoveRequest;
import za.co.obomvu.interactive.Morabaraba.service.GameService;
import com.fasterxml.jackson.core.JsonProcessingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping(value = "/api/games", produces = "application/json")
@CrossOrigin(origins = "http://localhost:4200")
public class GameController {

    @Autowired
    private GameService gameService;

    @PostMapping
    public ResponseEntity<UUID> createGame() {
        UUID id = gameService.createNewGame();
        return ResponseEntity.ok(id);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Board> getGame(@PathVariable UUID id) throws JsonProcessingException {
        Board board = gameService.loadGame(id);
        return ResponseEntity.ok(board);
    }

    @PostMapping("/{id}/place")
    public ResponseEntity<Void> placePiece(@PathVariable UUID id, @RequestBody PlaceRequest request) throws JsonProcessingException {
        gameService.placePiece(id, request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/move")
    public ResponseEntity<Void> movePiece(@PathVariable UUID id, @RequestBody MoveRequest request) throws JsonProcessingException {
        gameService.movePiece(id, request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/remove")
    public ResponseEntity<Void> removePiece(@PathVariable UUID id, @RequestBody RemoveRequest request) throws JsonProcessingException {
        gameService.removePiece(id, request);
        return ResponseEntity.ok().build();
    }
}
