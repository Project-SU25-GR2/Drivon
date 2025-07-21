package Drivon.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Data
@Getter
@Setter
@Entity
@Table(name = "contract_partners")
public class Contract {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "contract_number", unique = true, nullable = false)
    private String contractNumber;

    @Column(name = "car_id", nullable = false)
    private String carId;

    @Column(name = "customer_id", nullable = false)
    private String customerId;

    @Column(name = "deposit", nullable = false)
    private Double deposit;

    @Column(name = "status")
    private String status;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "phone", nullable = false)
    private String phone;

    @Column(name = "email", nullable = false)
    private String email;

    @Column(name = "price_per_day", nullable = false)
    private Double pricePerDay;

    @Column(name = "created_at")
    private java.time.LocalDateTime createdAt;
}