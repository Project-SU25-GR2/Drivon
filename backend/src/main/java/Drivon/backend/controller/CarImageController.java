package Drivon.backend.controller;

import Drivon.backend.model.CarImage;
import Drivon.backend.repository.CarImageRepository;
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

    @PostMapping
    public ResponseEntity<?> saveCarImages(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String carId = (String) request.get("carId");
            Object imageUrlsObj = request.get("imageUrls");
            List<String> imageUrls = new ArrayList<>();
            if (imageUrlsObj instanceof List<?>) {
                for (Object url : (List<?>) imageUrlsObj) {
                    imageUrls.add(url.toString());
                }
            }

            if (carId == null || imageUrls.isEmpty()) {
                response.put("error", "Car ID and image URLs are required");
                return ResponseEntity.badRequest().body(response);
            }

            // Lưu từng URL ảnh vào database
            for (String imageUrl : imageUrls) {
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
            List<CarImage> images = carImageRepository.findByCarId(carId);
            response.put("success", true);
            response.put("images", images);
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