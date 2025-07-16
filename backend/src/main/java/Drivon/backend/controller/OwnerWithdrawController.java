package Drivon.backend.controller;

import Drivon.backend.model.OwnerWithdrawRequest;
import Drivon.backend.repository.OwnerWithdrawRequestRepository;
import Drivon.backend.repository.UserRepository;
import Drivon.backend.model.User;
import Drivon.backend.repository.OwnerWalletRepository;
import Drivon.backend.model.OwnerWallet;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.Date;
import java.util.List;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/owner-withdraw")
public class OwnerWithdrawController {
    @Autowired
    private OwnerWithdrawRequestRepository withdrawRepo;
    @Autowired
    private UserRepository userRepo;
    @Autowired
    private OwnerWalletRepository ownerWalletRepository;

    @PostMapping
    public OwnerWithdrawRequest createWithdrawRequest(@RequestBody OwnerWithdrawRequest req) {
        req.setStatus("pending");
        req.setRequestedAt(new Date());
        return withdrawRepo.save(req);
    }

    @GetMapping("/{ownerId}")
    public List<OwnerWithdrawRequest> getWithdrawRequests(@PathVariable Long ownerId) {
        return withdrawRepo.findByOwnerIdOrderByRequestedAtDesc(ownerId);
    }

    @GetMapping
    public List<Map<String, Object>> getAllWithdrawRequestsWithUser() {
        List<OwnerWithdrawRequest> requests = withdrawRepo.findAll();
        List<Map<String, Object>> result = new ArrayList<>();
        for (OwnerWithdrawRequest req : requests) {
            Map<String, Object> map = new HashMap<>();
            map.put("requestId", req.getRequestId());
            map.put("ownerId", req.getOwnerId());
            map.put("amount", req.getAmount());
            map.put("status", req.getStatus());
            map.put("requestedAt", req.getRequestedAt());
            map.put("processedAt", req.getProcessedAt());
            map.put("note", req.getNote());
            map.put("sign", req.getSign()); // Thêm dòng này
            // Lấy thông tin user
            User user = userRepo.findById(req.getOwnerId()).orElse(null);
            if (user != null) {
                map.put("ownerFullName", user.getFullName());
                map.put("ownerEmail", user.getEmail());
            }
            result.add(map);
        }
        return result;
    }

    @PatchMapping("/{requestId}/status")
    public OwnerWithdrawRequest updateWithdrawStatus(@PathVariable Long requestId, @RequestBody Map<String, String> body) {
        String status = body.get("status");
        OwnerWithdrawRequest req = withdrawRepo.findById(requestId).orElseThrow();
        String oldStatus = req.getStatus();
        req.setStatus(status);
        if ("approved".equalsIgnoreCase(status) || "completed".equalsIgnoreCase(status)) {
            req.setProcessedAt(new Date());
        }
        Long ownerId = req.getOwnerId();
        Double amount = req.getAmount();
        if (ownerId != null && amount != null && amount > 0) {
            OwnerWallet wallet = ownerWalletRepository.findByOwnerId(ownerId).orElse(null);
            if (wallet != null) {
                double currentProfit = wallet.getTotalProfit() != null ? wallet.getTotalProfit() : 0.0;
                double currentDebt = wallet.getTotalDebt() != null ? wallet.getTotalDebt() : 0.0;
                double currentBalance = wallet.getBalance() != null ? wallet.getBalance() : 0.0;
                // Nếu chuyển từ completed sang trạng thái khác, cộng lại tiền
                if ("completed".equalsIgnoreCase(oldStatus) && (status == null || !"completed".equalsIgnoreCase(status))) {
                    wallet.setTotalProfit(currentProfit + amount);
                    wallet.setBalance(currentBalance + amount);
                    wallet.setUpdatedAt(java.time.LocalDateTime.now());
                    ownerWalletRepository.save(wallet);
                }
                // Nếu chuyển sang completed và trước đó chưa phải completed, trừ tiền như trước
                else if ("completed".equalsIgnoreCase(status) && (oldStatus == null || !"completed".equalsIgnoreCase(oldStatus))) {
                    // Không cho phép rút quá balance
                    if (amount > currentBalance) {
                        throw new IllegalArgumentException("Số tiền rút vượt quá tổng tiền thu qua hệ thống!");
                    }
                    // Nếu rút hết balance, set profit và debt về 0
                    if (Math.abs(amount - currentBalance) < 1e-6) {
                        wallet.setTotalProfit(0.0);
                        wallet.setTotalDebt(0.0);
                        wallet.setBalance(0.0);
                    } else {
                        // Trừ tiền từ profit và balance (ưu tiên trừ profit)
                        double newProfit = currentProfit - amount;
                        if (newProfit < 0) newProfit = 0.0;
                        double newBalance = currentBalance - amount;
                        if (newBalance < 0) newBalance = 0.0;
                        wallet.setTotalProfit(newProfit);
                        wallet.setBalance(newBalance);
                        // debt giữ nguyên
                    }
                    wallet.setUpdatedAt(java.time.LocalDateTime.now());
                    ownerWalletRepository.save(wallet);
                }
            }
        }
        return withdrawRepo.save(req);
    }

    @PatchMapping("/{requestId}/sign")
    public OwnerWithdrawRequest updateSign(@PathVariable Long requestId, @RequestBody Map<String, Boolean> body) {
        Boolean sign = body.get("sign");
        OwnerWithdrawRequest req = withdrawRepo.findById(requestId).orElseThrow();
        
        // Chỉ cho phép ký xác nhận nếu status = "completed" và chưa ký
        if (sign != null && sign && "completed".equalsIgnoreCase(req.getStatus()) && 
            (req.getSign() == null || !req.getSign())) {
            
            req.setSign(true);
            
            // RESET WALLET: Owner đã xác nhận nhận được tiền rồi
            Long ownerId = req.getOwnerId();
            if (ownerId != null) {
                OwnerWallet wallet = ownerWalletRepository.findByOwnerId(ownerId).orElse(null);
                if (wallet != null) {
                    // Reset tất cả về 0 vì owner đã rút và xác nhận nhận tiền
                    wallet.setTotalProfit(0.0);
                    wallet.setTotalDebt(0.0);
                    wallet.setBalance(0.0);
                    wallet.setUpdatedAt(java.time.LocalDateTime.now());
                    ownerWalletRepository.save(wallet);
                }
            }
            
            return withdrawRepo.save(req);
        }
        return req;
    }
} 