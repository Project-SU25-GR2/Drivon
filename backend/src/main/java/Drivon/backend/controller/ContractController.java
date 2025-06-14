package Drivon.backend.controller;

import Drivon.backend.dto.ContractRequest;
import Drivon.backend.model.Contract;
import Drivon.backend.service.ContractService;
import Drivon.backend.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/contracts")
@CrossOrigin(origins = "http://localhost:3000")
public class ContractController {

    @Autowired
    private ContractService contractService;

    @Autowired
    private EmailService emailService;

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

    /* Comment out verification code endpoints
    @PostMapping("/send-code")
    public ResponseEntity<?> sendVerificationCode(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String code = contractService.generateVerificationCode(email);
            emailService.sendVerificationCode(email, code);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/verify-code")
    public ResponseEntity<?> verifyCode(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String code = request.get("code");
            boolean isValid = contractService.verifyCode(email, code);
            return ResponseEntity.ok(Map.of("success", isValid));
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    */

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

    @GetMapping("/by-car/{carId}")
    public ResponseEntity<?> getLatestContractByCar(@PathVariable String carId) {
        var contractOpt = contractService.getLatestContractByCar(carId);
        if (contractOpt.isPresent()) {
            return ResponseEntity.ok(contractOpt.get());
        } else {
            return ResponseEntity.status(404).body("No contract found for this car");
        }
    }
}