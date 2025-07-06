package Drivon.backend.repository;

import Drivon.backend.model.Booking;
import Drivon.backend.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByBookingIn(List<Booking> bookings);
    
    // Lấy review theo car license plate
    @Query("SELECT r FROM Review r JOIN r.booking b WHERE b.car.licensePlate = :licensePlate")
    List<Review> findByCarLicensePlate(@Param("licensePlate") String licensePlate);
    
    // Lấy review theo owner ID
    @Query("SELECT r FROM Review r JOIN r.booking b WHERE b.car.ownerId = :ownerId")
    List<Review> findByCarOwnerId(@Param("ownerId") Integer ownerId);
} 