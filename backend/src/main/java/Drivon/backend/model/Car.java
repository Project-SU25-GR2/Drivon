package Drivon.backend.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "cars")
public class Car {
    @Id
    @Column(name = "license_plate", length = 15)
    private String licensePlate;

    @Column(name = "owner_id")
    private Integer ownerId;

    @Column(name = "brand")
    private String brand;

    @Column(name = "model")
    private String model;

    @Column(name = "year")
    private Integer year;

    @Column(name = "description")
    private String description;

    @Column(name = "status")
    private String status;

    @Column(name = "location")
    private String location;
} 