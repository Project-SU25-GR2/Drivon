package Drivon.backend.repository;

import Drivon.backend.model.SystemRevenue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SystemRevenueRepository extends JpaRepository<SystemRevenue, Long> {
    
    // Tính tổng tiền thực sự đã nhận (REVENUE_IN từ BANK)
    @Query("SELECT COALESCE(SUM(sr.amount), 0.0) FROM SystemRevenue sr " +
           "WHERE sr.transactionType = 'REVENUE_IN' AND sr.paymentMethod = 'BANK' AND sr.status = 'CONFIRMED'")
    Double getTotalActualRevenue();
    
    // Tính tổng nợ chưa thu (DEBT_CREATED từ CASH)
    @Query("SELECT COALESCE(SUM(sr.amount), 0.0) FROM SystemRevenue sr " +
           "WHERE sr.transactionType = 'DEBT_CREATED' AND sr.status = 'CONFIRMED'")
    Double getTotalUnpaidDebt();
    
    // Tính tổng nợ đã thu (DEBT_COLLECTED)
    @Query("SELECT COALESCE(SUM(sr.amount), 0.0) FROM SystemRevenue sr " +
           "WHERE sr.transactionType = 'DEBT_COLLECTED' AND sr.status = 'CONFIRMED'")
    Double getTotalCollectedDebt();
    
    // Tính tổng tiền chi ra (REVENUE_OUT)
    @Query("SELECT COALESCE(SUM(sr.amount), 0.0) FROM SystemRevenue sr " +
           "WHERE sr.transactionType = 'REVENUE_OUT' AND sr.status = 'CONFIRMED'")
    Double getTotalExpenses();
    
    // Tính tổng revenue theo tháng (REVENUE_IN + DEBT_COLLECTED)
    @Query("SELECT COALESCE(SUM(sr.amount), 0.0) FROM SystemRevenue sr " +
           "WHERE (sr.transactionType = 'REVENUE_IN' OR sr.transactionType = 'DEBT_COLLECTED') " +
           "AND sr.status = 'CONFIRMED' " +
           "AND sr.transactionDate >= :startDate AND sr.transactionDate < :endDate")
    Double getMonthlyRevenue(@Param("startDate") LocalDateTime startDate, 
                           @Param("endDate") LocalDateTime endDate);
    
    // Lấy danh sách giao dịch theo owner
    List<SystemRevenue> findByOwnerIdOrderByTransactionDateDesc(Long ownerId);
    
    // Lấy danh sách giao dịch theo loại
    List<SystemRevenue> findByTransactionTypeOrderByTransactionDateDesc(String transactionType);
    
    // Lấy danh sách giao dịch trong khoảng thời gian
    @Query("SELECT sr FROM SystemRevenue sr " +
           "WHERE sr.transactionDate >= :startDate AND sr.transactionDate < :endDate " +
           "ORDER BY sr.transactionDate DESC")
    List<SystemRevenue> findByDateRange(@Param("startDate") LocalDateTime startDate, 
                                      @Param("endDate") LocalDateTime endDate);
    
    // Kiểm tra xem đã có giao dịch cho booking này chưa
    boolean existsByBookingIdAndTransactionType(Integer bookingId, String transactionType);
    
    // Lấy giao dịch theo payment_id
    List<SystemRevenue> findByPaymentId(String paymentId);
} 