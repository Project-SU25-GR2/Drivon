package Drivon.backend.controller;

import Drivon.backend.model.Car;
import Drivon.backend.model.CarImage;
import Drivon.backend.service.CarService;
import Drivon.backend.repository.CarImageRepository;
import Drivon.backend.service.ContractService;
import Drivon.backend.service.ReviewService;
import Drivon.backend.dto.ReviewResponseDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/cars")
@CrossOrigin(origins = "http://localhost:3000")
public class CarController {

    @Autowired
    private CarService carService;

    @Autowired
    private CarImageRepository carImageRepository;

    @Autowired
    private ContractService contractService;

    @Autowired
    private ReviewService reviewService;

    @GetMapping
    public ResponseEntity<?> getAllCars() {
        try {
            List<Car> availableCars = carService.getCarsByStatus("available");
            List<Car> activeLeaseCars = carService.getActiveLeaseCars();

            // Gộp hai danh sách, loại trùng (theo licensePlate)
            Map<String, Car> carMap = new HashMap<>();
            for (Car car : availableCars) {
                carMap.put(car.getLicensePlate(), car);
            }
            for (Car car : activeLeaseCars) {
                carMap.put(car.getLicensePlate(), car);
            }
            List<Car> cars = new ArrayList<>(carMap.values());

            List<Map<String, Object>> carsWithImages = new ArrayList<>();

            for (Car car : cars) {
                Map<String, Object> carData = new HashMap<>();
                carData.put("licensePlate", car.getLicensePlate());
                carData.put("brand", car.getBrand());
                carData.put("model", car.getModel());
                carData.put("year", car.getYear());
                carData.put("seats", car.getSeats());
                carData.put("description", car.getDescription());
                carData.put("type", car.getType());
                carData.put("transmission", car.getTransmission());
                carData.put("fuelType", car.getFuelType());
                carData.put("fuelConsumption", car.getFuelConsumption());
                carData.put("status", car.getStatus());
                carData.put("location", car.getLocation());
                carData.put("ownerId", car.getOwnerId());

                // Get main image from cars table
                carData.put("mainImage", car.getMainImage());

                // Get other images from car_images table
                List<CarImage> otherImages = carImageRepository.findByCarId(car.getLicensePlate());
                List<String> otherImageUrls = new ArrayList<>();
                for (CarImage image : otherImages) {
                    otherImageUrls.add(image.getImageUrl());
                }
                carData.put("otherImages", otherImageUrls);

                carsWithImages.add(carData);
            }

            return ResponseEntity.ok(carsWithImages);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/{licensePlate}")
    public ResponseEntity<?> getCarById(@PathVariable String licensePlate) {
        try {
            Car car = carService.getCarById(licensePlate);
            if (car == null) {
                return ResponseEntity.notFound().build();
            }

            Map<String, Object> carData = new HashMap<>();
            carData.put("licensePlate", car.getLicensePlate());
            carData.put("brand", car.getBrand());
            carData.put("model", car.getModel());
            carData.put("year", car.getYear());
            carData.put("seats", car.getSeats());
            carData.put("description", car.getDescription());
            carData.put("type", car.getType());
            carData.put("transmission", car.getTransmission());
            carData.put("fuelType", car.getFuelType());
            carData.put("fuelConsumption", car.getFuelConsumption());
            carData.put("status", car.getStatus());
            carData.put("location", car.getLocation());
            carData.put("ownerId", car.getOwnerId());

            // Get main image from cars table
            carData.put("mainImage", car.getMainImage());

            // Get other images from car_images table
            List<CarImage> otherImages = carImageRepository.findByCarId(car.getLicensePlate());
            List<String> otherImageUrls = new ArrayList<>();
            for (CarImage image : otherImages) {
                otherImageUrls.add(image.getImageUrl());
            }
            carData.put("otherImages", otherImageUrls);

            return ResponseEntity.ok(carData);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<?> getCarsByOwnerId(@PathVariable Long ownerId) {
        try {
            List<Car> cars = carService.getCarsByOwnerId(ownerId);
            List<Map<String, Object>> carsWithImages = new ArrayList<>();

            for (Car car : cars) {
                Map<String, Object> carData = new HashMap<>();
                carData.put("licensePlate", car.getLicensePlate());
                carData.put("brand", car.getBrand());
                carData.put("model", car.getModel());
                carData.put("year", car.getYear());
                carData.put("seats", car.getSeats());
                carData.put("description", car.getDescription());
                carData.put("type", car.getType());
                carData.put("transmission", car.getTransmission());
                carData.put("fuelType", car.getFuelType());
                carData.put("fuelConsumption", car.getFuelConsumption());
                carData.put("status", car.getStatus());
                carData.put("location", car.getLocation());
                carData.put("ownerId", car.getOwnerId());

                // Get main image from cars table
                carData.put("mainImage", car.getMainImage());
                System.out.println("Car data: " + car);
                // Get other images from car_images table
                List<CarImage> otherImages = carImageRepository.findByCarId(car.getLicensePlate());
                List<String> otherImageUrls = new ArrayList<>();
                for (CarImage image : otherImages) {
                    otherImageUrls.add(image.getImageUrl());
                }
                carData.put("otherImages", otherImageUrls);

                carsWithImages.add(carData);
            }

            return ResponseEntity.ok(carsWithImages);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/owner/{ownerId}/with-contracts")
    public ResponseEntity<?> getCarsByOwnerIdWithContracts(@PathVariable Long ownerId) {
        try {
            List<Car> cars = carService.getCarsByOwnerId(ownerId);
            List<Map<String, Object>> carsWithDetails = new ArrayList<>();

            for (Car car : cars) {
                Map<String, Object> carData = new HashMap<>();
                carData.put("licensePlate", car.getLicensePlate());
                carData.put("brand", car.getBrand());
                carData.put("model", car.getModel());
                carData.put("year", car.getYear());
                carData.put("seats", car.getSeats());
                carData.put("description", car.getDescription());
                carData.put("type", car.getType());
                carData.put("transmission", car.getTransmission());
                carData.put("fuelType", car.getFuelType());
                carData.put("fuelConsumption", car.getFuelConsumption());
                carData.put("status", car.getStatus());
                carData.put("location", car.getLocation());
                carData.put("ownerId", car.getOwnerId());

                // Get main image from cars table
                carData.put("mainImage", car.getMainImage());

                // Get other images from car_images table
                List<CarImage> otherImages = carImageRepository.findByCarId(car.getLicensePlate());
                List<String> otherImageUrls = new ArrayList<>();
                for (CarImage image : otherImages) {
                    otherImageUrls.add(image.getImageUrl());
                }
                carData.put("otherImages", otherImageUrls);

                // Get contract details
                try {
                    Optional<Drivon.backend.model.Contract> contractOpt = contractService.getLatestContractByCar(car.getLicensePlate());
                    if (contractOpt.isPresent()) {
                        carData.put("contract", contractOpt.get());
                        carData.put("pricePerDay", contractOpt.get().getPricePerDay());
                    } else {
                        carData.put("contract", null);
                        carData.put("pricePerDay", null);
                    }
                } catch (Exception e) {
                    carData.put("contract", null);
                    carData.put("pricePerDay", null);
                }

                carsWithDetails.add(carData);
            }

            return ResponseEntity.ok(carsWithDetails);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/active-lease")
    public ResponseEntity<?> getActiveLeaseCars() {
        try {
            List<Car> availableCars = carService.getCarsByStatus("available");
            List<Car> activeLeaseCars = carService.getActiveLeaseCars();

            // Gộp hai danh sách, loại trùng (theo licensePlate)
            Map<String, Car> carMap = new HashMap<>();
            for (Car car : availableCars) {
                carMap.put(car.getLicensePlate(), car);
            }
            for (Car car : activeLeaseCars) {
                carMap.put(car.getLicensePlate(), car);
            }
            List<Car> cars = new ArrayList<>(carMap.values());

            List<Map<String, Object>> carsWithImages = new ArrayList<>();

            for (Car car : cars) {
                Map<String, Object> carData = new HashMap<>();
                carData.put("licensePlate", car.getLicensePlate());
                carData.put("brand", car.getBrand());
                carData.put("model", car.getModel());
                carData.put("year", car.getYear());
                carData.put("seats", car.getSeats());
                carData.put("description", car.getDescription());
                carData.put("type", car.getType());
                carData.put("transmission", car.getTransmission());
                carData.put("fuelType", car.getFuelType());
                carData.put("fuelConsumption", car.getFuelConsumption());
                carData.put("status", car.getStatus());
                carData.put("location", car.getLocation());
                carData.put("ownerId", car.getOwnerId());
                carData.put("mainImage", car.getMainImage());

                // Get other images from car_images table
                List<CarImage> otherImages = carImageRepository.findByCarId(car.getLicensePlate());
                List<String> otherImageUrls = new ArrayList<>();
                for (CarImage image : otherImages) {
                    otherImageUrls.add(image.getImageUrl());
                }
                carData.put("otherImages", otherImageUrls);
                carsWithImages.add(carData);
            }

            return ResponseEntity.ok(carsWithImages);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/active-lease-with-details")
    public ResponseEntity<?> getActiveLeaseCarsWithDetails() {
        try {
            List<Car> availableCars = carService.getCarsByStatus("available");
            List<Car> activeLeaseCars = carService.getActiveLeaseCars();

            // Gộp hai danh sách, loại trùng (theo licensePlate)
            Map<String, Car> carMap = new HashMap<>();
            for (Car car : availableCars) {
                carMap.put(car.getLicensePlate(), car);
            }
            for (Car car : activeLeaseCars) {
                carMap.put(car.getLicensePlate(), car);
            }
            List<Car> cars = new ArrayList<>(carMap.values());

            List<Map<String, Object>> carsWithDetails = new ArrayList<>();

            for (Car car : cars) {
                Map<String, Object> carData = new HashMap<>();
                carData.put("licensePlate", car.getLicensePlate());
                carData.put("brand", car.getBrand());
                carData.put("model", car.getModel());
                carData.put("year", car.getYear());
                carData.put("seats", car.getSeats());
                carData.put("description", car.getDescription());
                carData.put("type", car.getType());
                carData.put("transmission", car.getTransmission());
                carData.put("fuelType", car.getFuelType());
                carData.put("fuelConsumption", car.getFuelConsumption());
                carData.put("status", car.getStatus());
                carData.put("location", car.getLocation());
                carData.put("ownerId", car.getOwnerId());
                carData.put("mainImage", car.getMainImage());

                // Get other images from car_images table
                List<CarImage> otherImages = carImageRepository.findByCarId(car.getLicensePlate());
                List<String> otherImageUrls = new ArrayList<>();
                for (CarImage image : otherImages) {
                    otherImageUrls.add(image.getImageUrl());
                }
                carData.put("otherImages", otherImageUrls);

                // Get contract details
                try {
                    Optional<Drivon.backend.model.Contract> contractOpt = contractService.getLatestContractByCar(car.getLicensePlate());
                    if (contractOpt.isPresent()) {
                        carData.put("contract", contractOpt.get());
                    } else {
                        carData.put("contract", null);
                    }
                } catch (Exception e) {
                    carData.put("contract", null);
                }

                // Get review statistics
                try {
                    ReviewResponseDto reviewStats = reviewService.getReviewsForCar(car.getLicensePlate());
                    carData.put("reviewStats", reviewStats);
                } catch (Exception e) {
                    carData.put("reviewStats", null);
                }

                carsWithDetails.add(carData);
            }

            return ResponseEntity.ok(carsWithDetails);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/{licensePlate}")
    public ResponseEntity<?> updateCar(@PathVariable String licensePlate, @RequestBody Car updatedCar) {
        try {
            Car existingCar = carService.getCarById(licensePlate);
            if (existingCar == null) {
                return ResponseEntity.notFound().build();
            }

            // Update car information
            existingCar.setBrand(updatedCar.getBrand());
            existingCar.setModel(updatedCar.getModel());
            existingCar.setYear(updatedCar.getYear());
            existingCar.setSeats(updatedCar.getSeats());
            existingCar.setDescription(updatedCar.getDescription());
            existingCar.setType(updatedCar.getType());
            existingCar.setTransmission(updatedCar.getTransmission());
            existingCar.setFuelType(updatedCar.getFuelType());
            existingCar.setFuelConsumption(updatedCar.getFuelConsumption());
            existingCar.setLocation(updatedCar.getLocation());
            if (updatedCar.getMainImage() != null) {
                existingCar.setMainImage(updatedCar.getMainImage());
            }

            Car savedCar = carService.updateCar(existingCar);

            // Prepare response with images
            Map<String, Object> carData = new HashMap<>();
            carData.put("licensePlate", savedCar.getLicensePlate());
            carData.put("brand", savedCar.getBrand());
            carData.put("model", savedCar.getModel());
            carData.put("year", savedCar.getYear());
            carData.put("seats", savedCar.getSeats());
            carData.put("description", savedCar.getDescription());
            carData.put("type", savedCar.getType());
            carData.put("transmission", savedCar.getTransmission());
            carData.put("fuelType", savedCar.getFuelType());
            carData.put("fuelConsumption", savedCar.getFuelConsumption());
            carData.put("status", savedCar.getStatus());
            carData.put("location", savedCar.getLocation());
            carData.put("ownerId", savedCar.getOwnerId());
            carData.put("mainImage", savedCar.getMainImage());

            // Get other images
            List<CarImage> otherImages = carImageRepository.findByCarId(savedCar.getLicensePlate());
            List<String> otherImageUrls = new ArrayList<>();
            for (CarImage image : otherImages) {
                otherImageUrls.add(image.getImageUrl());
            }
            carData.put("otherImages", otherImageUrls);

            System.out.println("Backend returning carData: " + carData);

            return ResponseEntity.ok(carData);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PatchMapping("/{licensePlate}/status")
    public ResponseEntity<?> updateCarStatus(@PathVariable String licensePlate, @RequestBody Map<String, String> body) {
        String newStatus = body.get("status");
        if (!"available".equalsIgnoreCase(newStatus) && !"unavailable".equalsIgnoreCase(newStatus)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid status. Only 'available' or 'unavailable' allowed."));
        }
        Car car = carService.getCarById(licensePlate);
        if (car == null) {
            return ResponseEntity.notFound().build();
        }
        car.setStatus(newStatus.toLowerCase());
        carService.updateCar(car);
        return ResponseEntity.ok(Map.of("success", true, "status", car.getStatus()));
    }
}