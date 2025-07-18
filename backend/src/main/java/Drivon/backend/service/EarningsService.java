package Drivon.backend.service;

import Drivon.backend.dto.EarningsReportDto;
import Drivon.backend.dto.TransactionDto;
import Drivon.backend.model.Car;
import Drivon.backend.model.Payment;
import Drivon.backend.model.User;
import Drivon.backend.model.OwnerWallet;
import Drivon.backend.model.SystemRevenue;
import Drivon.backend.repository.CarRepository;
import Drivon.backend.repository.PaymentRepository;
import Drivon.backend.repository.UserRepository;
import Drivon.backend.repository.OwnerWalletRepository;
import Drivon.backend.repository.SystemRevenueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.YearMonth;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@Service
public class EarningsService {

    @Autowired
    private CarRepository carRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OwnerWalletRepository ownerWalletRepository;

    @Autowired
    private SystemRevenueRepository systemRevenueRepository;

    public EarningsReportDto getEarningsReport(Long ownerId, YearMonth yearMonth) {
        // 1. Get owner's cars
        List<Car> ownerCars = carRepository.findByOwnerId(ownerId);
        if (ownerCars.isEmpty()) {
            return new EarningsReportDto(0, 0, 0, 0, 0, 0, 0, 0, 0, new ArrayList<>());
        }
        List<String> carIds = ownerCars.stream().map(Car::getLicensePlate).collect(Collectors.toList());

        // 2. Get all payments for these cars
        List<Payment> payments = paymentRepository.findByCarIdIn(carIds);
        
        Map<String, String> carIdToNameMap = ownerCars.stream()
            .collect(Collectors.toMap(Car::getLicensePlate, car -> car.getBrand() + " " + car.getModel()));
        
        List<Long> userIds = payments.stream().map(Payment::getUserId).distinct().collect(Collectors.toList());
        Map<Long, String> userIdToNameMap = userRepository.findAllById(userIds).stream()
            .collect(Collectors.toMap(User::getUserId, User::getFullName));


        // 3. Calculate earnings
        double totalEarnings = payments.stream()
                .filter(p -> "PAID".equalsIgnoreCase(p.getStatus()))
                .mapToDouble(Payment::getAmount)
                .sum();

        double monthlyEarnings = payments.stream()
                .filter(p -> "PAID".equalsIgnoreCase(p.getStatus()))
                .filter(p -> p.getPaymentDate() != null && YearMonth.from(p.getPaymentDate()).equals(yearMonth))
                .mapToDouble(Payment::getAmount)
                .sum();

        double pendingPayouts = payments.stream()
                .filter(p -> "PENDING".equalsIgnoreCase(p.getStatus()))
                .mapToDouble(Payment::getAmount)
                .sum();

        YearMonth lastMonth = yearMonth.minusMonths(1);
        double lastMonthEarnings = payments.stream()
                .filter(p -> "PAID".equalsIgnoreCase(p.getStatus()))
                .filter(p -> p.getPaymentDate() != null && YearMonth.from(p.getPaymentDate()).equals(lastMonth))
                .mapToDouble(Payment::getAmount)
                .sum();

        // Calculate cash and banking totals for the selected month
        double totalCash = payments.stream()
                .filter(p -> "PAID".equalsIgnoreCase(p.getStatus()))
                .filter(p -> "CASH".equalsIgnoreCase(p.getPaymentMethod()))
                .filter(p -> p.getPaymentDate() != null && YearMonth.from(p.getPaymentDate()).equals(yearMonth))
                .mapToDouble(Payment::getAmount)
                .sum();

        double totalBanking = payments.stream()
                .filter(p -> "PAID".equalsIgnoreCase(p.getStatus()))
                .filter(p -> "BANK".equalsIgnoreCase(p.getPaymentMethod()) || "BANK_TRANSFER".equalsIgnoreCase(p.getPaymentMethod()))
                .filter(p -> p.getPaymentDate() != null && YearMonth.from(p.getPaymentDate()).equals(yearMonth))
                .mapToDouble(Payment::getAmount)
                .sum();

        // 4. Create transaction list
        List<TransactionDto> transactions = payments.stream()
                .sorted((p1, p2) -> p2.getCreatedAt().compareTo(p1.getCreatedAt())) 
                .map(p -> new TransactionDto(
                        p.getId(),
                        p.getPaymentDate(),
                        "Rental Income",
                        p.getAmount(),
                        p.getStatus(),
                        carIdToNameMap.getOrDefault(p.getCarId(), "Unknown Car"),
                        userIdToNameMap.getOrDefault(p.getUserId(), "Unknown Renter"),
                        p.getPaymentMethod()
                ))
                .collect(Collectors.toList());

        // Lấy thông tin ví owner
        double totalProfit = 0;
        double totalDebt = 0;
        double balance = 0;
        OwnerWallet wallet = ownerWalletRepository.findByOwnerId(ownerId).orElse(null);
        if (wallet != null) {
            totalProfit = wallet.getTotalProfit() != null ? wallet.getTotalProfit() : 0;
            totalDebt = wallet.getTotalDebt() != null ? wallet.getTotalDebt() : 0;
            balance = wallet.getBalance() != null ? wallet.getBalance() : 0;
        }

        return new EarningsReportDto(totalEarnings, monthlyEarnings, pendingPayouts, lastMonthEarnings, totalCash, totalBanking, totalProfit, totalDebt, balance, transactions);
    }

    /**
     * Calculate system statistics using SystemRevenue table for accurate tracking
     */
    public Map<String, Object> getSystemStatistics() {
        // Tiền thực sự đã nhận (2% từ bank payments)
        double totalActualRevenue = systemRevenueRepository.getTotalActualRevenue();
        
        // Tổng nợ chưa thu (2% từ cash payments)
        double totalUnpaidDebt = systemRevenueRepository.getTotalUnpaidDebt();
        
        // Tổng nợ đã thu được
        double totalCollectedDebt = systemRevenueRepository.getTotalCollectedDebt();
        
        // Tổng chi phí hệ thống
        double totalExpenses = systemRevenueRepository.getTotalExpenses();
        
        // Tính tổng revenue thực tế = tiền đã nhận + nợ đã thu
        double totalSystemRevenue = totalActualRevenue + totalCollectedDebt;
        
        // Tính total transaction volume từ owner wallets (tổng tiền trong hệ thống)
        double totalTransactionVolume = ownerWalletRepository.findAll().stream()
                .mapToDouble(w -> w.getTotalProfit() != null ? w.getTotalProfit() : 0.0)
                .sum();
        
        // Get current month for comparison
        YearMonth currentMonth = YearMonth.now();
        YearMonth lastMonth = currentMonth.minusMonths(1);
        
        // Calculate current month revenue from SystemRevenue
        LocalDateTime currentMonthStart = currentMonth.atDay(1).atStartOfDay();
        LocalDateTime nextMonthStart = currentMonth.plusMonths(1).atDay(1).atStartOfDay();
        double currentMonthSystemRevenue = systemRevenueRepository.getMonthlyRevenue(currentMonthStart, nextMonthStart);
        
        // Calculate last month revenue from SystemRevenue  
        LocalDateTime lastMonthStart = lastMonth.atDay(1).atStartOfDay();
        LocalDateTime currentMonthStartForLast = currentMonth.atDay(1).atStartOfDay();
        double lastMonthSystemRevenue = systemRevenueRepository.getMonthlyRevenue(lastMonthStart, currentMonthStartForLast);
        
        // Calculate total debt from all wallets (nợ chưa thanh toán)
        double totalSystemDebt = ownerWalletRepository.findAll().stream()
                .mapToDouble(w -> w.getTotalDebt() != null ? w.getTotalDebt() : 0.0)
                .sum();
        
        // Active drivers count
        long activeDrivers = ownerWalletRepository.findAll().stream()
                .filter(w -> (w.getTotalProfit() != null && w.getTotalProfit() > 0) || 
                           (w.getTotalDebt() != null && w.getTotalDebt() > 0))
                .count();
        
        // Calculate percentage change
        double percentageChange = 0.0;
        if (lastMonthSystemRevenue > 0) {
            percentageChange = ((currentMonthSystemRevenue - lastMonthSystemRevenue) / lastMonthSystemRevenue) * 100;
        } else if (currentMonthSystemRevenue > 0) {
            percentageChange = 100.0; // First month with revenue
        }
        
        Map<String, Object> statistics = new HashMap<>();
        statistics.put("totalSystemRevenue", totalSystemRevenue);
        statistics.put("totalTransactionVolume", totalTransactionVolume);
        statistics.put("totalSystemDebt", totalSystemDebt);
        statistics.put("activeDrivers", activeDrivers);
        statistics.put("currentMonthRevenue", currentMonthSystemRevenue);
        statistics.put("lastMonthRevenue", lastMonthSystemRevenue);
        statistics.put("monthlyPercentageChange", percentageChange);
        
        return statistics;
    }

    /**
     * Record system revenue when payment is completed
     * This method should be called when booking status changes to "completed"
     */
    public void recordSystemRevenue(Payment payment, Long ownerId) {
        if (payment == null || ownerId == null) return;
        
        String paymentMethod = payment.getPaymentMethod();
        double amount = payment.getAmount();
        double systemFee = amount * 0.02; // 2% system fee
        
        // Kiểm tra xem đã có record cho booking này chưa
        String transactionType = "";
        if ("bank".equalsIgnoreCase(paymentMethod) || "BANK_TRANSFER".equalsIgnoreCase(paymentMethod)) {
            transactionType = "REVENUE_IN";
        } else if ("cash".equalsIgnoreCase(paymentMethod)) {
            transactionType = "DEBT_CREATED";
        }
        
        // Chỉ tạo record nếu chưa có
        if (!systemRevenueRepository.existsByBookingIdAndTransactionType(payment.getBookingId(), transactionType)) {
            SystemRevenue systemRevenue = new SystemRevenue();
            systemRevenue.setTransactionType(transactionType);
            systemRevenue.setPaymentMethod(paymentMethod.toUpperCase());
            systemRevenue.setAmount(systemFee);
            systemRevenue.setOwnerId(ownerId);
            systemRevenue.setBookingId(payment.getBookingId());
            systemRevenue.setPaymentId(payment.getPaymentId());
            
            if ("REVENUE_IN".equals(transactionType)) {
                systemRevenue.setDescription("System fee 2% from bank payment - " + payment.getPaymentId());
            } else {
                systemRevenue.setDescription("System debt 2% from cash payment - " + payment.getPaymentId());
            }
            
            systemRevenue.setTransactionDate(payment.getPaymentDate() != null ? 
                                           payment.getPaymentDate() : LocalDateTime.now());
            
            systemRevenueRepository.save(systemRevenue);
        }
    }

    /**
     * Record debt collection when owner pays cash debt
     */
    public void recordDebtCollection(Long ownerId, double amount, String description) {
        SystemRevenue systemRevenue = new SystemRevenue();
        systemRevenue.setTransactionType("DEBT_COLLECTED");
        systemRevenue.setPaymentMethod("CASH");
        systemRevenue.setAmount(amount);
        systemRevenue.setOwnerId(ownerId);
        systemRevenue.setDescription("Debt collection: " + description);
        systemRevenue.setTransactionDate(LocalDateTime.now());
        
        systemRevenueRepository.save(systemRevenue);
    }

    /**
     * Record system expenses (withdrawals, operational costs, etc.)
     */
    public void recordSystemExpense(Long ownerId, double amount, String description) {
        SystemRevenue systemRevenue = new SystemRevenue();
        systemRevenue.setTransactionType("REVENUE_OUT");
        systemRevenue.setAmount(amount);
        systemRevenue.setOwnerId(ownerId);
        systemRevenue.setDescription("System expense: " + description);
        systemRevenue.setTransactionDate(LocalDateTime.now());
        
        systemRevenueRepository.save(systemRevenue);
    }

    /**
     * Trả về danh sách doanh thu từng tháng trong năm hiện tại (hoặc 12 tháng gần nhất)
     */
    public List<Map<String, Object>> getMonthlyRevenueStats(int year) {
        List<Map<String, Object>> result = new ArrayList<>();
        for (int month = 1; month <= 12; month++) {
            java.time.LocalDateTime start = java.time.LocalDateTime.of(year, month, 1, 0, 0);
            java.time.LocalDateTime end = (month < 12)
                ? java.time.LocalDateTime.of(year, month + 1, 1, 0, 0)
                : java.time.LocalDateTime.of(year + 1, 1, 1, 0, 0);
            Double revenue = systemRevenueRepository.getMonthlyRevenue(start, end);
            Map<String, Object> item = new HashMap<>();
            item.put("month", String.format("%d-%02d", year, month));
            item.put("revenue", revenue != null ? revenue : 0.0);
            result.add(item);
        }
        return result;
    }
} 