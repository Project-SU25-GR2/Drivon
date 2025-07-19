package Drivon.backend.controller;

import Drivon.backend.dto.ReviewResponseDto;
import Drivon.backend.dto.ReviewDto;
import Drivon.backend.model.Review;
import Drivon.backend.repository.ReviewRepository;
import Drivon.backend.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import Drivon.backend.model.Booking;
import Drivon.backend.model.Car;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "http://localhost:3000")
public class ReviewController {

    private final ReviewService reviewService;
    private final ReviewRepository reviewRepository;

    @Autowired
    public ReviewController(ReviewService reviewService, ReviewRepository reviewRepository) {
        this.reviewService = reviewService;
        this.reviewRepository = reviewRepository;
    }

    @GetMapping("/car/{licensePlate}")
    public ResponseEntity<ReviewResponseDto> getReviewsByCar(@PathVariable String licensePlate) {
        ReviewResponseDto response = reviewService.getReviewsForCar(licensePlate);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/car/{licensePlate}")
    public ResponseEntity<?> addReviewForCar(@PathVariable String licensePlate, @RequestBody ReviewDto reviewDto, @RequestParam int bookingId, @RequestParam Long reviewerId) {
        boolean result = reviewService.saveReviewForCar(licensePlate, reviewDto, bookingId, reviewerId);
        if (result) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.badRequest().body("Không thể lưu đánh giá");
        }
    }

    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<?> getOwnerAverageRating(@PathVariable Integer ownerId) {
        try {
            // Lấy tất cả review của các xe thuộc owner
            List<Review> reviews = reviewRepository.findByCarOwnerId(ownerId);
            
            if (reviews.isEmpty()) {
                return ResponseEntity.ok(Collections.singletonMap("averageRating", null));
            }
            
            // Tính trung bình rating
            double averageRating = reviews.stream()
                    .mapToInt(Review::getRating)
                    .average()
                    .orElse(0.0);
            
            // Làm tròn đến 1 chữ số thập phân
            averageRating = Math.round(averageRating * 10.0) / 10.0;
            
            return ResponseEntity.ok(Collections.singletonMap("averageRating", averageRating));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "Failed to calculate average rating"));
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getReviewsByUser(@PathVariable Long userId) {
        try {
            List<Review> reviews = reviewRepository.findByReviewerId(userId);
            // Trả về thông tin cần thiết cho frontend
            List<java.util.Map<String, Object>> result = reviews.stream().map(r -> {
                Integer bookingId = null;
                String carId = null;
                Booking booking = r.getBooking();
                if (booking != null) {
                    try {
                        bookingId = booking.getId();
                    } catch (Exception e) {
                        bookingId = null;
                    }
                    try {
                        Car car = booking.getCar();
                        if (car != null) {
                            carId = car.getLicensePlate();
                        }
                    } catch (Exception e) {
                        carId = null;
                    }
                }
                java.util.Map<String, Object> map = new java.util.HashMap<>();
                map.put("id", r.getId());
                map.put("bookingId", bookingId);
                map.put("carId", carId);
                map.put("rating", r.getRating());
                map.put("comment", r.getComment());
                map.put("createdAt", r.getCreatedAt());
                return map;
            }).collect(java.util.stream.Collectors.toList());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "Failed to get user reviews: " + e.getMessage()));
        }
    }
} 