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
                carData.put("description", car.getDescription());
                carData.put("type", car.getType());
                carData.put("status", car.getStatus());
                carData.put("location", car.getLocation());
                carData.put("ownerId", car.getOwnerId());

                // Get car images
                List<CarImage> images = carImageRepository.findByCarId(car.getLicensePlate());
                List<String> imageUrls = new ArrayList<>();
                for (CarImage image : images) {
                    imageUrls.add(image.getImageUrl());
                }
                carData.put("images", imageUrls);

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
            carData.put("description", car.getDescription());
            carData.put("type", car.getType());
            carData.put("status", car.getStatus());
            carData.put("location", car.getLocation());
            carData.put("ownerId", car.getOwnerId());

            // Get car images
            List<CarImage> images = carImageRepository.findByCarId(licensePlate);
            List<String> imageUrls = new ArrayList<>();
            for (CarImage image : images) {
                imageUrls.add(image.getImageUrl());
            }
            carData.put("images", imageUrls);

            return ResponseEntity.ok(carData);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}