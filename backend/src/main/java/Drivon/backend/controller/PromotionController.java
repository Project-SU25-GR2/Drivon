package Drivon.backend.controller;

import Drivon.backend.model.Promotion;
import Drivon.backend.repository.PromotionRepository;
import Drivon.backend.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/promotions")
public class PromotionController {
    @Autowired
    private PromotionRepository promotionRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @GetMapping
    public List<Map<String, Object>> getAllPromotions() {
        List<Promotion> promotions = promotionRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Promotion promo : promotions) {
            long usedCount = paymentRepository.countByPromotionCode(promo.getCode());
            Integer maxUses = promo.getMaxUses();
            // Ẩn promotion nếu đã hết lượt dùng (maxUses != null và usedCount >= maxUses)
            if (maxUses != null && maxUses > 0 && usedCount >= maxUses) {
                continue;
            }
            Map<String, Object> map = new HashMap<>();
            map.put("promo_id", promo.getPromo_id());
            map.put("code", promo.getCode());
            map.put("discount_percent", promo.getDiscount_percent());
            map.put("valid_until", promo.getValid_until());
            map.put("maxUses", maxUses != null ? maxUses : 0);
            map.put("usedCount", usedCount);
            result.add(map);
        }
        return result;
    }

    @PostMapping
    public Promotion createPromotion(@RequestBody Promotion promotion) {
        return promotionRepository.save(promotion);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePromotion(@PathVariable("id") Long id) {
        if (!promotionRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        promotionRepository.deleteById(id);
        return ResponseEntity.ok().body("Promotion deleted successfully");
    }

    @PutMapping("/{id}")
    public Promotion updatePromotion(@PathVariable("id") Long id, @RequestBody Promotion updatedPromotion) {
        return promotionRepository.findById(id).map(promo -> {
            promo.setCode(updatedPromotion.getCode());
            promo.setDiscount_percent(updatedPromotion.getDiscount_percent());
            promo.setValid_until(updatedPromotion.getValid_until());
            promo.setMaxUses(updatedPromotion.getMaxUses());
            return promotionRepository.save(promo);
        }).orElseThrow(() -> new RuntimeException("Promotion not found"));
    }
}