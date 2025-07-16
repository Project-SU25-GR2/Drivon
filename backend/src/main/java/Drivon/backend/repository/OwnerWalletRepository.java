package Drivon.backend.repository;

import Drivon.backend.model.OwnerWallet;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
 
public interface OwnerWalletRepository extends JpaRepository<OwnerWallet, Long> {
    Optional<OwnerWallet> findByOwnerId(Long ownerId);
} 