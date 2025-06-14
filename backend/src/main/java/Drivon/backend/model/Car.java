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

    @Column(name = "seats")
    private Integer seats;

    @Column(name = "description")
    private String description;

    @Column(name = "type")
    private String type;

    @Column(name = "transmission")
    @Enumerated(EnumType.STRING)
    private Transmission transmission;

    @Column(name = "fuel_type")
    @Enumerated(EnumType.STRING)
    private FuelType fuelType;

    @Column(name = "fuel_consumption")
    private Double fuelConsumption;

    @Column(name = "status")
    private String status;

    @Column(name = "location")
    private String location;

    public enum Transmission {
        manual, automatic
    }

    public enum FuelType {
        gasoline, diesel, electric, hybrid
    }
} 