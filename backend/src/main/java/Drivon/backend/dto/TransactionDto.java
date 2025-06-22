package Drivon.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransactionDto {
    private Long id;
    private LocalDateTime date;
    private String type;
    private Double amount;
    private String status;
    private String carName;
    private String renterName;
} 