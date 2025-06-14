package Drivon.backend.repository;

import Drivon.backend.model.Car;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CarRepository extends JpaRepository<Car, String> {
    // String là kiểu của licensePlate (PK)
    List<Car> findByOwnerId(Long ownerId);
}