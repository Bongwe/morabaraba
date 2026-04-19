package za.co.obomvu.interactive.Morabaraba.checkers;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface CheckersGameRepository extends JpaRepository<CheckersGameEntity, UUID> {
}
