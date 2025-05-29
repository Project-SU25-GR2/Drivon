package Drivon.backend.dto;

import lombok.Data;

@Data
public class CarData {
    private String licensePlate;
    private String brand;
    private String model;
    private Integer year;
    private String description;
    private String location;
    private Double dailyRate;
    private Integer ownerId;
    private String status;
} 