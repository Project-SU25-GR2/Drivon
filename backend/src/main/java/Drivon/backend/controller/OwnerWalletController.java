package Drivon.backend.controller;

import Drivon.backend.model.OwnerWallet;
import Drivon.backend.repository.OwnerWalletRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/owner-wallet")
@CrossOrigin(origins = "http://localhost:3000")
public class OwnerWalletController {

    @Autowired
    private OwnerWalletRepository ownerWalletRepository;

    @PostMapping("/update-bank")
    public ResponseEntity<?> updateOwnerBankInfo(@RequestBody Map<String, Object> request) {
        Long ownerId = Long.valueOf(request.get("ownerId").toString());
        String accountNumber = (String) request.get("accountNumber");
        String bankName = (String) request.get("bankName");

        OwnerWallet wallet = ownerWalletRepository.findByOwnerId(ownerId)
            .orElse(new OwnerWallet());
        
        if (wallet.getOwnerId() == null) {
            wallet.setOwnerId(ownerId);
            wallet.setTotalProfit(0.0);
            wallet.setTotalDebt(0.0);
            wallet.setBalance(0.0);
        }
        
        wallet.setAccountNumber(accountNumber);
        wallet.setBankName(bankName);
        wallet.setUpdatedAt(LocalDateTime.now());
        
        ownerWalletRepository.save(wallet);
        return ResponseEntity.ok(wallet);
    }

    @GetMapping("/{ownerId}")
    public ResponseEntity<?> getOwnerWallet(@PathVariable Long ownerId) {
        return ownerWalletRepository.findByOwnerId(ownerId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{ownerId}/bank")
    public ResponseEntity<?> getOwnerBankInfo(@PathVariable Long ownerId) {
        return ownerWalletRepository.findByOwnerId(ownerId)
            .map(wallet -> {
                Map<String, Object> bankInfo = Map.of(
                    "accountNumber", wallet.getAccountNumber() != null ? wallet.getAccountNumber() : "",
                    "bankName", wallet.getBankName() != null ? wallet.getBankName() : ""
                );
                return ResponseEntity.ok(bankInfo);
            })
            .orElse(ResponseEntity.notFound().build());
    }
} 