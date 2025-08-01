package Drivon.backend.repository;

import Drivon.backend.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Integer> {
    List<Booking> findByCarLicensePlate(String licensePlate);
    List<Booking> findByCarOwnerId(Integer ownerId);
}