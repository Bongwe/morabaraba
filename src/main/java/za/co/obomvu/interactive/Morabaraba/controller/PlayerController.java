package za.co.obomvu.interactive.Morabaraba.controller;

import za.co.obomvu.interactive.Morabaraba.domain.Player;
import za.co.obomvu.interactive.Morabaraba.service.PlayerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/players")
public class PlayerController {

    @Autowired
    private PlayerService playerService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestParam String name, @RequestParam String email) {
        Player player = playerService.login(name, email);
        if (player != null) {
            return ResponseEntity.ok(player);
        } else {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }
    }
}
