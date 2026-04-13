package com.unicore360.unicore360_backend.controller;

import com.unicore360.unicore360_backend.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/analytics")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AnalyticsController {

    private final BookingRepository bookingRepository;

    @GetMapping("/top-resources")
    public ResponseEntity<List<Map<String, Object>>> getTopResources() {
        List<Map<String, Object>> result = bookingRepository.findTopResources();
        return ResponseEntity.ok(result);
    }

    @GetMapping("/peak-hours")
    public ResponseEntity<List<Map<String, Object>>> getPeakHours() {
        List<Map<String, Object>> result = bookingRepository.findPeakHours();
        return ResponseEntity.ok(result);
    }
}