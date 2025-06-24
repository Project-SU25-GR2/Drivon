package Drivon.backend.controller;

import Drivon.backend.model.User;
import Drivon.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
// import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map; // Import Map for role update request body
import Drivon.backend.model.UserRole; // Import UserRole enum
import Drivon.backend.model.UserStatus;
import Drivon.backend.model.Contract;
import Drivon.backend.service.ContractService;
import Drivon.backend.model.Car;
import Drivon.backend.service.CarService;
import Drivon.backend.model.CarImage;
import Drivon.backend.repository.CarImageRepository;
import java.util.ArrayList;
import java.util.HashMap;
import org.springframework.http.HttpStatus;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000")
// @PreAuthorize("hasRole('ADMIN')") // Ensure only users with ADMIN role can
// access this controller
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ContractService contractService;

    @Autowired
    private CarService carService;

    @Autowired
    private CarImageRepository carImageRepository; // Inject CarImageRepository

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(users);
    }

    // Endpoint to update user role
    @PutMapping("/users/{userId}/role")
    public ResponseEntity<?> updateUserRole(@PathVariable Long userId, @RequestBody Map<String, String> roleUpdate) {
        return userRepository.findById(userId).map(user -> {
            String newRole = roleUpdate.get("role");
            if (newRole == null || newRole.isEmpty()) {
                return ResponseEntity.badRequest().body("New role must be provided.");
            }
            // Chuyển đổi role về chữ thường để khớp với enum
            String lowerCaseRole = newRole.toLowerCase();
            if (!lowerCaseRole.equals("renter") && !lowerCaseRole.equals("owner") && !lowerCaseRole.equals("admin")) {
                return ResponseEntity.badRequest().body("Invalid role.");
            }

            try {
                UserRole roleEnum = UserRole.valueOf(lowerCaseRole); // Chuyển đổi string sang enum, dùng giá trị chữ
                                                                     // thường
                user.setRole(roleEnum);
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body("Invalid role provided.");
            }
            userRepository.save(user);
            return ResponseEntity.ok().body("User role updated successfully.");
        }).orElse(ResponseEntity.notFound().build());
    }

    // Endpoint to update user information
    @PutMapping("/users/{userId}")
    public ResponseEntity<?> updateUserInfo(@PathVariable Long userId, @RequestBody User updatedUser) {
        return userRepository.findById(userId).map(user -> {
            // Update user properties from updatedUser object
            user.setEmail(updatedUser.getEmail());
            user.setPhone(updatedUser.getPhone()); // Assuming phone can be updated
            user.setFullName(updatedUser.getFullName());
            user.setAddress(updatedUser.getAddress()); // Assuming address can be updated
            user.setRole(updatedUser.getRole()); // Allow updating role via this endpoint as well
            // Add other fields you want to allow updating

            userRepository.save(user);
            return ResponseEntity.ok().body("User information updated successfully.");
        }).orElse(ResponseEntity.notFound().build());
    }

    // Endpoint to delete a user
    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        return userRepository.findById(userId).map(user -> {
            userRepository.delete(user);
            return ResponseEntity.ok().body("User deleted successfully.");
        }).orElse(ResponseEntity.notFound().build());
    }

    // Endpoint to update user status
    @PutMapping("/users/{userId}/status")
    public ResponseEntity<?> updateUserStatus(@PathVariable Long userId,
            @RequestBody Map<String, String> statusUpdate) {
        return userRepository.findById(userId).map(user -> {
            String newStatus = statusUpdate.get("status");
            if (newStatus == null || newStatus.isEmpty()) {
                return ResponseEntity.badRequest().body("New status must be provided.");
            }

            try {
                UserStatus statusEnum = UserStatus.valueOf(newStatus.toLowerCase());
                user.setStatus(statusEnum);
                userRepository.save(user);
                return ResponseEntity.ok().body("User status updated successfully.");
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body("Invalid status. Must be one of: active, inactive, banned.");
            }
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/partners")
    public ResponseEntity<?> getAllPartners() {
        try {
            List<Contract> contracts = contractService.getAllContracts();
            List<Map<String, Object>> partners = new ArrayList<>();

            for (Contract contract : contracts) {
                Map<String, Object> partner = new HashMap<>();
                
                // Sử dụng reflection để truy cập các field private
                try {
                    java.lang.reflect.Field idField = Contract.class.getDeclaredField("id");
                    java.lang.reflect.Field contractNumberField = Contract.class.getDeclaredField("contractNumber");
                    java.lang.reflect.Field nameField = Contract.class.getDeclaredField("name");
                    java.lang.reflect.Field phoneField = Contract.class.getDeclaredField("phone");
                    java.lang.reflect.Field emailField = Contract.class.getDeclaredField("email");
                    java.lang.reflect.Field carIdField = Contract.class.getDeclaredField("carId");
                    java.lang.reflect.Field pricePerDayField = Contract.class.getDeclaredField("pricePerDay");
                    java.lang.reflect.Field depositField = Contract.class.getDeclaredField("deposit");
                    java.lang.reflect.Field statusField = Contract.class.getDeclaredField("status");
                    
                    idField.setAccessible(true);
                    contractNumberField.setAccessible(true);
                    nameField.setAccessible(true);
                    phoneField.setAccessible(true);
                    emailField.setAccessible(true);
                    carIdField.setAccessible(true);
                    pricePerDayField.setAccessible(true);
                    depositField.setAccessible(true);
                    statusField.setAccessible(true);
                    
                    partner.put("id", idField.get(contract));
                    partner.put("contractNumber", contractNumberField.get(contract));
                    partner.put("name", nameField.get(contract));
                    partner.put("phone", phoneField.get(contract));
                    partner.put("email", emailField.get(contract));
                    partner.put("carId", carIdField.get(contract));
                    partner.put("pricePerDay", pricePerDayField.get(contract));
                    partner.put("deposit", depositField.get(contract));
                    partner.put("status", statusField.get(contract));
                    
                    // Lấy userId từ email
                    String email = (String) emailField.get(contract);
                    Optional<User> user = userRepository.findByEmail(email);
                    if (user.isPresent()) {
                        partner.put("userId", user.get().getUserId());
                    }

                // Lấy thông tin xe
                    String carId = (String) carIdField.get(contract);
                    Car car = carService.getCarById(carId);
                if (car != null) {
                    Map<String, Object> carInfo = new HashMap<>();
                    carInfo.put("brand", car.getBrand());
                    carInfo.put("model", car.getModel());
                    carInfo.put("year", car.getYear());
                    carInfo.put("seats", car.getSeats());
                    carInfo.put("description", car.getDescription());
                    carInfo.put("type", car.getType());
                    carInfo.put("transmission", car.getTransmission());
                    carInfo.put("fuelType", car.getFuelType());
                    carInfo.put("fuelConsumption", car.getFuelConsumption());
                    carInfo.put("location", car.getLocation());

                    // Lấy main image từ table cars
                    carInfo.put("mainImage", car.getMainImage());

                    // Lấy other images từ table car_images
                        List<CarImage> carImages = carImageRepository.findByCarId(carId);
                    List<String> otherImageUrls = new ArrayList<>();
                    for (CarImage image : carImages) {
                        otherImageUrls.add(image.getImageUrl());
                    }
                    carInfo.put("otherImages", otherImageUrls);

                    partner.put("car", carInfo);
                    }
                } catch (Exception e) {
                    System.err.println("Error accessing Contract fields: " + e.getMessage());
                }

                partners.add(partner);
            }

            return ResponseEntity.ok(partners);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching partners: " + e.getMessage());
        }
    }

    @PutMapping("/partners/{id}/status")
    public ResponseEntity<?> updatePartnerStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String status = body.get("status");
        Contract contract = contractService.getContractById(id);
        if (contract == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Contract not found");
        }
        
        try {
            java.lang.reflect.Field statusField = Contract.class.getDeclaredField("status");
            statusField.setAccessible(true);
            statusField.set(contract, status);
        contractService.save(contract);
        return ResponseEntity.ok("Status updated");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error updating status: " + e.getMessage());
        }
    }

    @GetMapping("/check-role/{userId}")
    public ResponseEntity<?> checkUserRole(@PathVariable Long userId) {
        return userRepository.findById(userId).map(user -> {
            Map<String, Object> response = new HashMap<>();
            response.put("role", user.getRole());
            response.put("status", user.getStatus());
            return ResponseEntity.ok(response);
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/check-owner-role/{userId}")
    public ResponseEntity<?> checkOwnerRole(@PathVariable Long userId) {
        return userRepository.findById(userId).map(user -> {
            Map<String, Object> response = new HashMap<>();
            response.put("role", user.getRole());
            response.put("status", user.getStatus());
            return ResponseEntity.ok(response);
        }).orElse(ResponseEntity.notFound().build());
    }

}