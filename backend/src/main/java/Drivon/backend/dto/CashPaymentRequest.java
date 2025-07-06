package Drivon.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CashPaymentRequest {
    private String orderCode;
    private Double amount;
    private Long userId;
    private String carId;
    private String additionalRequirements;
    private String rentalStartDate;
    private String rentalEndDate;
    private Integer bookingId;
    private String promotionCode;
    private Integer discountPercent;
}