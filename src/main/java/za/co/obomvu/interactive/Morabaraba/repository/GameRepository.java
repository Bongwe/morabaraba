package za.co.obomvu.interactive.Morabaraba.repository;

import za.co.obomvu.interactive.Morabaraba.domain.GameEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface GameRepository extends JpaRepository<GameEntity, UUID> {
}
