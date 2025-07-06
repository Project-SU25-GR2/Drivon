package Drivon.backend.repository;

import Drivon.backend.model.OwnerBank;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface OwnerBankRepository extends JpaRepository<OwnerBank, Long> {
    Optional<OwnerBank> findByOwnerId(Long ownerId);
} 