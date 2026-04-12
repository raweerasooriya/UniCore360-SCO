package com.unicore360.unicore360_backend.controller;

import com.unicore360.unicore360_backend.dto.StatusUpdateRequest;
import com.unicore360.unicore360_backend.dto.TicketResponseDTO;
import com.unicore360.unicore360_backend.model.User;
import com.unicore360.unicore360_backend.service.TicketService;
import com.unicore360.unicore360_backend.service.UserService;  // ADD THIS IMPORT
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/technician/tickets")
@RequiredArgsConstructor
public class TicketTechnicianController {

    private final TicketService ticketService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<TicketResponseDTO>> getMyAssignedTickets(@AuthenticationPrincipal UserDetails userDetails) {
        User technician = userService.getUserByEmail(userDetails.getUsername());  // FIXED method name
        return ResponseEntity.ok(ticketService.getTicketsForTechnician(technician));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<TicketResponseDTO> updateStatus(@PathVariable Long id,
                                                          @RequestBody StatusUpdateRequest request,
                                                          @AuthenticationPrincipal UserDetails userDetails) {
        User technician = userService.getUserByEmail(userDetails.getUsername());  // FIXED
        return ResponseEntity.ok(ticketService.updateStatus(id, request.getStatus(), technician));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketResponseDTO> getTicketById(@PathVariable Long id,
                                                           @AuthenticationPrincipal UserDetails userDetails) {
        User technician = userService.getUserByEmail(userDetails.getUsername());  // FIXED
        return ResponseEntity.ok(ticketService.getTicketById(id, technician));
    }
}