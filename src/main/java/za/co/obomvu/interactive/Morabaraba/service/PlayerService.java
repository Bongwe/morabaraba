package za.co.obomvu.interactive.Morabaraba.service;

import za.co.obomvu.interactive.Morabaraba.domain.Player;
import za.co.obomvu.interactive.Morabaraba.repository.PlayerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PlayerService {

    @Autowired
    private PlayerRepository playerRepository;

    public List<Player> getAllPlayers() {
        return playerRepository.findAll();
    }

    public Player savePlayer(Player player) {
        return playerRepository.save(player);
    }

    public void fetchAndPrintAllPlayers() {
        List<Player> players = playerRepository.findAll();
        System.out.println("Fetched Players:");
        for (Player player : players) {
            System.out.println(player);
        }
    }
}
