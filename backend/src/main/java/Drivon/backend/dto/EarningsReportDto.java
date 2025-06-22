package Drivon.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EarningsReportDto {
    private double totalEarnings;
    private double monthlyEarnings;
    private double pendingPayouts;
    private double lastMonthEarnings;
    private List<TransactionDto> transactions;
} 