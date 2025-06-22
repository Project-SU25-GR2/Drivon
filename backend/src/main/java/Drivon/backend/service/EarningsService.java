package Drivon.backend.service;

import Drivon.backend.dto.EarningsReportDto;
import Drivon.backend.dto.TransactionDto;
import Drivon.backend.model.Car;
import Drivon.backend.model.Payment;
import Drivon.backend.model.User;
import Drivon.backend.repository.CarRepository;
import Drivon.backend.repository.PaymentRepository;
import Drivon.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class EarningsService {

    @Autowired
    private CarRepository carRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private UserRepository userRepository;

    public EarningsReportDto getEarningsReport(Long ownerId, YearMonth yearMonth) {
        // 1. Get owner's cars
        List<Car> ownerCars = carRepository.findByOwnerId(ownerId);
        if (ownerCars.isEmpty()) {
            return new EarningsReportDto(0, 0, 0, 0, new ArrayList<>());
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
                        userIdToNameMap.getOrDefault(p.getUserId(), "Unknown Renter")
                ))
                .collect(Collectors.toList());

        return new EarningsReportDto(totalEarnings, monthlyEarnings, pendingPayouts, lastMonthEarnings, transactions);
    }
} 