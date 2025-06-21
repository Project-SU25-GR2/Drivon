package Drivon.backend.controller;

import Drivon.backend.dto.ReviewResponseDto;
import Drivon.backend.dto.ReviewDto;
import Drivon.backend.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "http://localhost:3000")
public class ReviewController {

    private final ReviewService reviewService;

    @Autowired
    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
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
} 