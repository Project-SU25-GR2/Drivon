package Drivon.backend.controller;

import Drivon.backend.dto.EarningsReportDto;
import Drivon.backend.service.EarningsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

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

    @GetMapping("/admin/system-statistics")
    public ResponseEntity<Map<String, Object>> getSystemStatistics() {
        Map<String, Object> statistics = earningsService.getSystemStatistics();
        return ResponseEntity.ok(statistics);
    }

    @GetMapping("/admin/monthly-revenue")
    public ResponseEntity<List<Map<String, Object>>> getMonthlyRevenue(@RequestParam(required = false) Integer year) {
        int queryYear = (year != null) ? year : java.time.Year.now().getValue();
        List<Map<String, Object>> stats = earningsService.getMonthlyRevenueStats(queryYear);
        return ResponseEntity.ok(stats);
    }
} 