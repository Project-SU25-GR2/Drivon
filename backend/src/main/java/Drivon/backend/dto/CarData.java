package Drivon.backend.dto;

import Drivon.backend.model.Car.Transmission;
import Drivon.backend.model.Car.FuelType;
import lombok.Data;

@Data
public class CarData {
    private String licensePlate;
    private String brand;
    private String model;
    private Integer year;
    private Integer seats;
    private String description;
    private String type;
    private Transmission transmission;
    private FuelType fuelType;
    private Double fuelConsumption;
    private String location;
    private Double dailyRate;
    private Integer ownerId;
    private String status;
} 