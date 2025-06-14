package Drivon.backend.controller;

import Drivon.backend.model.Car;
import Drivon.backend.model.CarImage;
import Drivon.backend.service.CarService;
import Drivon.backend.repository.CarImageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cars")
@CrossOrigin(origins = "http://localhost:3000")
public class CarController {

    @Autowired
    private CarService carService;

    @Autowired
    private CarImageRepository carImageRepository;

    @GetMapping
    public ResponseEntity<?> getAllCars() {
        try {
            List<Car> cars = carService.getAllCars();
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

    @GetMapping("/active-lease")
    public ResponseEntity<?> getActiveLeaseCars() {
        try {
            List<Car> cars = carService.getActiveLeaseCars();
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
                System.out.println(car);
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
}