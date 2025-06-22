package Drivon.backend.controller;

import Drivon.backend.dto.EarningsReportDto;
import Drivon.backend.service.EarningsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.YearMonth;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/earnings")
@CrossOrigin(origins = "http://localhost:3000")
public class EarningsController {

    @Autowired
    private EarningsService earningsService;

    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<EarningsReportDto> getEarningsReport(
            @PathVariable Long ownerId,
            @RequestParam(required = false) String month) {
        
        YearMonth yearMonth;
        if (month != null && !month.isEmpty()) {
            try {
                yearMonth = YearMonth.parse(month, DateTimeFormatter.ofPattern("yyyy-MM"));
            } catch (Exception e) {
                return ResponseEntity.badRequest().build();
            }
        } else {
            yearMonth = YearMonth.now();
        }

        EarningsReportDto report = earningsService.getEarningsReport(ownerId, yearMonth);
        return ResponseEntity.ok(report);
    }
} 