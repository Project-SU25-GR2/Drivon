package Drivon.backend.repository;

import Drivon.backend.model.Booking;
import Drivon.backend.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByBookingIn(List<Booking> bookings);
} 