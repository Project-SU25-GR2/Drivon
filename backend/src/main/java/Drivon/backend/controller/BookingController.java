package Drivon.backend.controller;

import Drivon.backend.dto.BookingRequest;
import Drivon.backend.model.Booking;
import Drivon.backend.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<Booking> createBooking(@RequestBody BookingRequest bookingRequest) {
        Booking newBooking = bookingService.createBooking(bookingRequest);
        return ResponseEntity.ok(newBooking);
    }

    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<List<Booking>> getBookingsByOwnerId(@PathVariable Integer ownerId) {
        List<Booking> bookings = bookingService.getBookingsByOwnerId(ownerId);
        System.out.println("[BookingController] Bookings for ownerId=" + ownerId + ": " + bookings);
        return ResponseEntity.ok(bookings);
    }

    @GetMapping
    public ResponseEntity<List<Booking>> getAllBookings() {
        List<Booking> bookings = bookingService.getAllBookings();
        return ResponseEntity.ok(bookings);
    }

    @PutMapping("/status/{bookingId}")
    public ResponseEntity<Booking> updateBookingStatus(@PathVariable Integer bookingId,
            @RequestBody java.util.Map<String, String> body) {
        String status = body.get("status");
        Booking updatedBooking = bookingService.updateBookingStatus(bookingId, status);
        return ResponseEntity.ok(updatedBooking);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Booking> getBookingById(@PathVariable Integer id) {
        Booking booking = bookingService.getBookingById(id);
        if (booking != null) {
            return ResponseEntity.ok(booking);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteBooking(@PathVariable Integer id) {
        try {
            boolean deleted = bookingService.deleteBooking(id);
            if (deleted) {
                return ResponseEntity.ok("Booking deleted successfully");
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}