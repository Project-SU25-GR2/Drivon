package com.drivon.repository;

import com.drivon.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Payment findByPaymentId(String paymentId);

    Payment findByOrderCode(String orderCode);
}