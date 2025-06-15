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
    // List<Car> findByOwnerIdAndStatus(Long ownerId, String status); // Bỏ qua cái này vì không còn dùng

    @Query(value = "SELECT c.* FROM cars c WHERE c.owner_id = :ownerId AND c.license_plate IN (SELECT cp.car_id FROM contract_partners cp WHERE cp.status = :contractStatus)", nativeQuery = true)
    List<Car> findCarsByOwnerIdAndContractStatus(@Param("ownerId") Long ownerId, @Param("contractStatus") String contractStatus);

    @Query("SELECT c FROM Car c WHERE c.licensePlate IN (SELECT ct.carId FROM Contract ct WHERE ct.status = :status)")
    List<Car> findCarsByContractStatus(@Param("status") String status);
}