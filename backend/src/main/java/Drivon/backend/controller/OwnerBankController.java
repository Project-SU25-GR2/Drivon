package Drivon.backend.controller;

import Drivon.backend.model.OwnerBank;
import Drivon.backend.repository.OwnerBankRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/owner-bank")
@CrossOrigin(origins = "http://localhost:3000")
public class OwnerBankController {

    @Autowired
    private OwnerBankRepository ownerBankRepository;

    @PostMapping("/update")
    public ResponseEntity<?> updateOwnerBank(@RequestBody OwnerBank bankInfo) {
        OwnerBank bank = ownerBankRepository.findByOwnerId(bankInfo.getOwnerId())
            .orElse(new OwnerBank());
        bank.setOwnerId(bankInfo.getOwnerId());
        bank.setAccountNumber(bankInfo.getAccountNumber());
        bank.setBankName(bankInfo.getBankName());
        ownerBankRepository.save(bank);
        return ResponseEntity.ok(bank);
    }

    @GetMapping("/{ownerId}")
    public ResponseEntity<?> getOwnerBank(@PathVariable Long ownerId) {
        return ownerBankRepository.findByOwnerId(ownerId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
} 