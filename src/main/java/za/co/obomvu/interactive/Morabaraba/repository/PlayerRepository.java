package za.co.obomvu.interactive.Morabaraba.repository;

import za.co.obomvu.interactive.Morabaraba.domain.Player;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PlayerRepository extends JpaRepository<Player, Long> {
}
