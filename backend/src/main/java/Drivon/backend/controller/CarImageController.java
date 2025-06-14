package Drivon.backend.controller;

import Drivon.backend.model.CarImage;
import Drivon.backend.repository.CarImageRepository;
import Drivon.backend.repository.CarRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cars/images")
@CrossOrigin(origins = "http://localhost:3000")
public class CarImageController {

    @Autowired
    private CarImageRepository carImageRepository;

    @Autowired
    private CarRepository carRepository;

    @PostMapping
    public ResponseEntity<?> saveCarImages(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String carId = (String) request.get("carId");
            String mainImageUrl = (String) request.get("mainImage");
            Object otherImageUrlsObj = request.get("otherImages");
            List<String> otherImageUrls = new ArrayList<>();
            
            if (otherImageUrlsObj instanceof List<?>) {
                for (Object url : (List<?>) otherImageUrlsObj) {
                    otherImageUrls.add(url.toString());
                }
            }

            if (carId == null) {
                response.put("error", "Car ID is required");
                return ResponseEntity.badRequest().body(response);
            }

            // Lưu main image vào table cars
            if (mainImageUrl != null && !mainImageUrl.isEmpty()) {
                carRepository.findById(carId).ifPresent(car -> {
                    car.setMainImage(mainImageUrl);
                    carRepository.save(car);
                });
            }

            // Xóa other images cũ trước khi lưu mới
            carImageRepository.deleteByCarId(carId);

            // Lưu other images vào table car_images
            for (String imageUrl : otherImageUrls) {
                CarImage carImage = new CarImage();
                carImage.setCarId(carId);
                carImage.setImageUrl(imageUrl);
                carImageRepository.save(carImage);
            }

            response.put("success", true);
            response.put("message", "Car images saved successfully");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("error", "Failed to save car images: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @GetMapping("/{carId}")
    public ResponseEntity<?> getCarImages(@PathVariable String carId) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Lấy main image từ table cars
            String mainImage = carRepository.findById(carId)
                .map(car -> car.getMainImage())
                .orElse(null);
            
            // Lấy other images từ table car_images
            List<CarImage> otherImages = carImageRepository.findByCarId(carId);
            List<String> otherImageUrls = new ArrayList<>();
            for (CarImage image : otherImages) {
                otherImageUrls.add(image.getImageUrl());
            }
            
            response.put("success", true);
            response.put("mainImage", mainImage);
            response.put("otherImages", otherImageUrls);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("error", "Failed to get car images: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @DeleteMapping("/{carId}")
    public ResponseEntity<?> deleteCarImages(@PathVariable String carId) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Xóa main image từ table cars
            carRepository.findById(carId).ifPresent(car -> {
                car.setMainImage(null);
                carRepository.save(car);
            });
            
            // Xóa other images từ table car_images
            carImageRepository.deleteByCarId(carId);
            
            response.put("success", true);
            response.put("message", "Car images deleted successfully");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("error", "Failed to delete car images: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
} 