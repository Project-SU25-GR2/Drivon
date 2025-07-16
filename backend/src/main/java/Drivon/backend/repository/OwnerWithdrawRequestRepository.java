package Drivon.backend.repository;

import Drivon.backend.model.OwnerWithdrawRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
 
public interface OwnerWithdrawRequestRepository extends JpaRepository<OwnerWithdrawRequest, Long> {
    List<OwnerWithdrawRequest> findByOwnerIdOrderByRequestedAtDesc(Long ownerId);
} 