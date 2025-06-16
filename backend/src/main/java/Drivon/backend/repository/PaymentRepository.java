package Drivon.backend.repository;

import Drivon.backend.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Payment findByOrderCode(String orderCode);

    Payment findByPaymentId(String paymentId);

    List<Payment> findByUserIdOrderByCreatedAtDesc(Long userId);
}