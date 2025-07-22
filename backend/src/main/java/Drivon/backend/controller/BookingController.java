package Drivon.backend.controller;

import Drivon.backend.dto.BookingRequest;
import Drivon.backend.model.Booking;
import Drivon.backend.model.CancelRequest;
import Drivon.backend.repository.CancelRequestRepository;
import Drivon.backend.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final CancelRequestRepository cancelRequestRepository;

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

    // Lấy CancelRequest trạng thái PENDING theo bookingId
    @GetMapping("/{bookingId}/cancel-request")
    public ResponseEntity<CancelRequest> getCancelRequestByBooking(@PathVariable Integer bookingId) {
        Booking booking = bookingService.getBookingById(bookingId);
        if (booking == null) return ResponseEntity.notFound().build();
        Optional<CancelRequest> req = cancelRequestRepository.findByBookingAndStatus(booking, CancelRequest.Status.PENDING);
        return req.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Người thuê yêu cầu huỷ booking khi đang thuê (tạo CancelRequest, không đổi trạng thái booking)
    @PostMapping("/{bookingId}/request-cancel")
    public ResponseEntity<?> requestCancelByRenter(@PathVariable Integer bookingId, @RequestParam Long renterId) {
        CancelRequest cancelRequest = bookingService.requestCancelByRenter(bookingId, renterId);
        if (cancelRequest == null) {
            // Booking đã bị huỷ ngay lập tức, trả về thông tin booking đã huỷ
            Booking cancelledBooking = bookingService.getBookingById(bookingId);
            return ResponseEntity.ok(cancelledBooking);
        }
        return ResponseEntity.ok(cancelRequest);
    }

    // Chủ xe xác nhận huỷ booking (duyệt CancelRequest, đổi trạng thái booking)
    @PutMapping("/{bookingId}/accept-cancel")
    public ResponseEntity<Booking> acceptCancelByOwner(@PathVariable Integer bookingId, @RequestParam Long ownerId) {
        Booking updated = bookingService.acceptCancelByOwner(bookingId, ownerId);
        return ResponseEntity.ok(updated);
    }

    // Chủ xe từ chối huỷ booking (từ chối CancelRequest, booking vẫn ongoing)
    @PutMapping("/{bookingId}/reject-cancel")
    public ResponseEntity<CancelRequest> rejectCancelByOwner(@PathVariable Integer bookingId, @RequestParam Long ownerId) {
        CancelRequest updated = bookingService.rejectCancelByOwner(bookingId, ownerId);
        return ResponseEntity.ok(updated);
    }
}