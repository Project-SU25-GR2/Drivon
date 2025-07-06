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
} 