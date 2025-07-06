package Drivon.backend.controller;

import Drivon.backend.model.Promotion;
import Drivon.backend.repository.PromotionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/promotions")
public class PromotionController {
    @Autowired
    private PromotionRepository promotionRepository;

    @GetMapping
    public List<Promotion> getAllPromotions() {
        return promotionRepository.findAll();
    }

    @PostMapping
    public Promotion createPromotion(@RequestBody Promotion promotion) {
        return promotionRepository.save(promotion);
    }

    @DeleteMapping("/{id}")
    public void deletePromotion(@PathVariable("id") Long id) {
        promotionRepository.deleteById(id);
    }
}