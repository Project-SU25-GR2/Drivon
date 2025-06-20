package Drivon.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
@Builder
@AllArgsConstructor
public class ReviewResponseDto {
    private double averageRating;
    private int totalReviews;
    private Map<Integer, Long> ratingCounts;
    private List<ReviewDto> reviews;
} 