package Drivon.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class BookingRequest {
    private long renterId;
    private String carId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String pickupLocation;
    private String dropoffLocation;
    private double totalPrice;
}