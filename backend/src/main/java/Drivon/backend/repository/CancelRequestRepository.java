package Drivon.backend.repository;

import Drivon.backend.model.CancelRequest;
import Drivon.backend.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface CancelRequestRepository extends JpaRepository<CancelRequest, Long> {
    Optional<CancelRequest> findByBookingAndStatus(Booking booking, CancelRequest.Status status);
    List<CancelRequest> findByBooking(Booking booking);
    List<CancelRequest> findByRequesterUserId(Long userId);
} 