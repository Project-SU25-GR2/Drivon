package com.drivon.service;

import com.drivon.entity.Payment;
import com.drivon.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class PaymentService {
    @Autowired
    private PaymentRepository paymentRepository;

    @Transactional
    public Payment savePayment(Payment payment) {
        payment.setPaymentDate(LocalDateTime.now());
        return paymentRepository.save(payment);
    }

    public Payment findByPaymentId(String paymentId) {
        return paymentRepository.findByPaymentId(paymentId);
    }

    public Payment findByOrderCode(String orderCode) {
        return paymentRepository.findByOrderCode(orderCode);
    }
}