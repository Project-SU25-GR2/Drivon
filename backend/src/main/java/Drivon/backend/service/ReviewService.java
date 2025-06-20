package Drivon.backend.service;

import Drivon.backend.dto.ReviewDto;
import Drivon.backend.dto.ReviewResponseDto;
import Drivon.backend.model.Booking;
import Drivon.backend.model.Review;
import Drivon.backend.model.User;
import Drivon.backend.repository.BookingRepository;
import Drivon.backend.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;

    @Autowired
    public ReviewService(ReviewRepository reviewRepository, BookingRepository bookingRepository) {
        this.reviewRepository = reviewRepository;
        this.bookingRepository = bookingRepository;
    }

    public ReviewResponseDto getReviewsForCar(String licensePlate) {
        // Step 1: Find bookings for the given car
        List<Booking> bookings = bookingRepository.findByCarLicensePlate(licensePlate);
        if (bookings.isEmpty()) {
            return new ReviewResponseDto(0, 0, Collections.emptyMap(), Collections.emptyList());
        }

        // Step 2: Find reviews for those bookings
        List<Review> reviews = reviewRepository.findByBookingIn(bookings);
        if (reviews.isEmpty()) {
            return new ReviewResponseDto(0, 0, Collections.emptyMap(), Collections.emptyList());
        }

        // Step 3: Calculate statistics
        double averageRating = reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);

        Map<Integer, Long> ratingCounts = reviews.stream()
                .collect(Collectors.groupingBy(Review::getRating, Collectors.counting()));
        
        for (int i = 1; i <= 5; i++) {
            ratingCounts.putIfAbsent(i, 0L);
        }

        // Step 4: Map to DTOs
        List<ReviewDto> reviewDtos = reviews.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        // Step 5: Build and return the response
        return new ReviewResponseDto(
                Math.round(averageRating * 10.0) / 10.0,
                reviews.size(),
                ratingCounts,
                reviewDtos
        );
    }

    private ReviewDto mapToDto(Review review) {
        User user = review.getReviewer();
        String avatarUrl = user.getAvatarUrl() != null ? user.getAvatarUrl() :
                "https://ui-avatars.com/api/?name=" + user.getFullName().replace(" ", "+") + "&background=random";

        return new ReviewDto(
                review.getId(),
                review.getRating(),
                review.getComment(),
                review.getCreatedAt(),
                user.getFullName(),
                avatarUrl
        );
    }
} 