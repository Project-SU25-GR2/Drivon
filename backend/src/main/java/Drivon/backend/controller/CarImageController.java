package Drivon.backend.controller;

import Drivon.backend.model.CarImage;
import Drivon.backend.repository.CarImageRepository;
import Drivon.backend.repository.CarRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

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

    @PersistenceContext
    private EntityManager entityManager;

    @PostMapping
    @Transactional
    public ResponseEntity<?> saveCarImages(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String carId = (String) request.get("carId");
            // mainImageUrl will be ignored by this controller as mainImage is handled by CarController
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

            // Delete existing other images first
            List<CarImage> existingImages = carImageRepository.findByCarId(carId);
            for (CarImage image : existingImages) {
                carImageRepository.delete(image);
            }
            entityManager.flush();

            // Save new other images
            if (otherImageUrls != null && !otherImageUrls.isEmpty()) {
                for (String imageUrl : otherImageUrls) {
                    CarImage carImage = new CarImage();
                    carImage.setCarId(carId);
                    carImage.setImageUrl(imageUrl);
                    carImageRepository.save(carImage);
                }
            }

            response.put("success", true);
            response.put("message", "Car images saved successfully");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("error", "Failed to save car images: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @PostMapping("/cavet")
    @Transactional
    public ResponseEntity<?> saveCavetImages(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            String carId = (String) request.get("carId");
            Object cavetImageUrlsObj = request.get("cavetImages");
            List<String> cavetImageUrls = new ArrayList<>();
            if (cavetImageUrlsObj instanceof List<?>) {
                for (Object url : (List<?>) cavetImageUrlsObj) {
                    cavetImageUrls.add(url.toString());
                }
            }
            if (carId == null) {
                response.put("error", "Car ID is required");
                return ResponseEntity.badRequest().body(response);
            }
            // Delete existing cavet images first
            List<CarImage> existingCavetImages = carImageRepository.findByCarIdAndType(carId, "cavet");
            for (CarImage image : existingCavetImages) {
                carImageRepository.delete(image);
            }
            entityManager.flush();
            // Save new cavet images
            if (cavetImageUrls != null && !cavetImageUrls.isEmpty()) {
                for (String imageUrl : cavetImageUrls) {
                    CarImage carImage = new CarImage();
                    carImage.setCarId(carId);
                    carImage.setImageUrl(imageUrl);
                    carImage.setType("cavet");
                    carImageRepository.save(carImage);
                }
            }
            response.put("success", true);
            response.put("message", "Cavet images saved successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("error", "Failed to save cavet images: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @PostMapping("/other")
    @Transactional
    public ResponseEntity<?> saveOtherDocumentImages(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            String carId = (String) request.get("carId");
            Object otherDocImageUrlsObj = request.get("otherDocumentImages");
            List<String> otherDocImageUrls = new ArrayList<>();
            if (otherDocImageUrlsObj instanceof List<?>) {
                for (Object url : (List<?>) otherDocImageUrlsObj) {
                    otherDocImageUrls.add(url.toString());
                }
            }
            if (carId == null) {
                response.put("error", "Car ID is required");
                return ResponseEntity.badRequest().body(response);
            }
            // Delete existing other document images first
            List<CarImage> existingOtherDocImages = carImageRepository.findByCarIdAndType(carId, "other");
            for (CarImage image : existingOtherDocImages) {
                carImageRepository.delete(image);
            }
            entityManager.flush();
            // Save new other document images
            if (otherDocImageUrls != null && !otherDocImageUrls.isEmpty()) {
                for (String imageUrl : otherDocImageUrls) {
                    CarImage carImage = new CarImage();
                    carImage.setCarId(carId);
                    carImage.setImageUrl(imageUrl);
                    carImage.setType("other");
                    carImageRepository.save(carImage);
                }
            }
            response.put("success", true);
            response.put("message", "Other document images saved successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("error", "Failed to save other document images: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @GetMapping("/{carId}")
    public ResponseEntity<?> getCarImages(@PathVariable String carId) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Get main image from cars table
            String mainImage = carRepository.findById(carId)
                .map(car -> car.getMainImage())
                .orElse(null);
            
            // Get other images from car_images table
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
    @Transactional
    public ResponseEntity<?> deleteCarImages(@PathVariable String carId) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Delete main image from cars table
            carRepository.findById(carId).ifPresent(car -> {
                car.setMainImage(null);
                carRepository.save(car);
            });
            
            // Delete other images from car_images table
            List<CarImage> existingImages = carImageRepository.findByCarId(carId);
            for (CarImage image : existingImages) {
                carImageRepository.delete(image);
            }
            entityManager.flush();
            
            response.put("success", true);
            response.put("message", "Car images deleted successfully");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("error", "Failed to delete car images: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
} 