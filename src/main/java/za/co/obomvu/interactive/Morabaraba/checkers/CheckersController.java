package za.co.obomvu.interactive.Morabaraba.checkers;

import com.fasterxml.jackson.core.JsonProcessingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping(value = "/api/checkers", produces = "application/json")
public class CheckersController {

    @Autowired
    private CheckersService checkersService;

    @PostMapping
    public ResponseEntity<UUID> createGame() {
        return ResponseEntity.ok(checkersService.createNewGame());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CheckersBoard> getGame(@PathVariable UUID id) throws JsonProcessingException {
        return ResponseEntity.ok(checkersService.loadGame(id));
    }

    @PostMapping("/{id}/move")
    public ResponseEntity<Void> move(@PathVariable UUID id, @RequestBody CheckersMoveRequest request)
            throws JsonProcessingException {
        checkersService.makeMove(id, request);
        return ResponseEntity.ok().build();
    }
}