package Drivon.backend.repository;

import Drivon.backend.model.Contract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface ContractRepository extends JpaRepository<Contract, Long> {
    List<Contract> findByCustomerId(String customerId);
    List<Contract> findByCarIdOrderByIdDesc(String carId);
}