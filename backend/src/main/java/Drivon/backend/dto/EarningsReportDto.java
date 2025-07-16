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
    private double totalCash;
    private double totalBanking;
    private double totalProfit; // Tổng lãi từ owner_wallet
    private double totalDebt;   // Tổng nợ từ owner_wallet
    private double balance;     // Số dư thực tế (lãi - nợ)
    private List<TransactionDto> transactions;
} 