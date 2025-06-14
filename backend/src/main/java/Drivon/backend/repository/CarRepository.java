package Drivon.backend.repository;

import Drivon.backend.model.Car;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CarRepository extends JpaRepository<Car, String> {
    // String là kiểu của licensePlate (PK)
    List<Car> findByOwnerId(Long ownerId);
    List<Car> findByStatus(String status);

    @Query("SELECT c FROM Car c WHERE c.licensePlate IN (SELECT ct.carId FROM Contract ct WHERE ct.status = :status)")
    List<Car> findCarsByContractStatus(@Param("status") String status);
}