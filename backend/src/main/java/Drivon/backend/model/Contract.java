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
@Table(name = "contracts")
public class Contract {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String contractNumber;

    private LocalDate startDate;
    private LocalDate endDate;
    private String carId;
    private String customerId;
    private Double deposit;
    private String status;
    private String name;
    private String phone;
    private String cccd;
    private String email;
}