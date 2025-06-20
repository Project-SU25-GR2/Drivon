package Drivon.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
public class ReviewDto {
    private Long id;
    private int rating;
    private String comment;
    private LocalDateTime date;
    private String userName;
    private String userAvatar;
} 