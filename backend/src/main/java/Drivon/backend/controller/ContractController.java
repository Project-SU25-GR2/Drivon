package Drivon.backend.controller;

import Drivon.backend.dto.ContractRequest;
import Drivon.backend.model.Contract;
import Drivon.backend.service.ContractService;
import Drivon.backend.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.Map;
import java.util.HashMap;
import java.util.List;

@RestController
@RequestMapping("/api/contracts")
@CrossOrigin(origins = "http://localhost:3000")
public class ContractController {

    @Autowired
    private ContractService contractService;

    @Autowired
    private EmailService emailService;

    //  tạo contract khi đăng ký chủ xe
    @PostMapping
    public ResponseEntity<?> createContract(@Valid @RequestBody ContractRequest contractRequest) {
        try {
            Contract contract = contractService.createContract(contractRequest);
            return ResponseEntity.ok(contract);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    //  tạo lease contract
    @PostMapping("/lease")
    public ResponseEntity<?> createLeaseContract(@Valid @RequestBody ContractRequest contractRequest) {
        try {
            Contract contract = contractService.createLeaseContract(contractRequest);
            return ResponseEntity.ok(contract);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    //  gửi PDF contract qua email
    @PostMapping("/send-pdf")
    public ResponseEntity<?> sendContractPDF(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String contractId = request.get("contractId");
            emailService.sendContractPDF(email, contractId);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    //  kiểm tra xe có tồn tại không
    @GetMapping("/check-car/{carId}")
    public ResponseEntity<?> checkCarExists(@PathVariable String carId) {
        try {
            boolean exists = contractService.checkCarExists(carId);
            return ResponseEntity.ok(Map.of("exists", exists));
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    //  lấy contract mới nhất của xe
    @GetMapping("/by-car/{carId}")
    public ResponseEntity<?> getLatestContractByCar(@PathVariable String carId) {
        var contractOpt = contractService.getLatestContractByCar(carId);
        if (contractOpt.isPresent()) {
            return ResponseEntity.ok(contractOpt.get());
        } else {
            return ResponseEntity.status(404).body("No contract found for this car");
        }
    }

    //  lấy contracts theo userId
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getContractsByUserId(@PathVariable String userId) {
        try {
            List<Map<String, Object>> contracts = contractService.getContractsByUserId(userId);
            return ResponseEntity.ok(contracts);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}