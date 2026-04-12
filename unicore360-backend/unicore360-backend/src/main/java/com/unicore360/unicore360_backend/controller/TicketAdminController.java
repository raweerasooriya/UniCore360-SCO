package com.unicore360.unicore360_backend.controller;

import com.unicore360.unicore360_backend.dto.*;
import com.unicore360.unicore360_backend.model.User;
import com.unicore360.unicore360_backend.service.TicketService;
import com.unicore360.unicore360_backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/tickets")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class TicketAdminController {

    private final TicketService ticketService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<TicketResponseDTO>> getAllTickets(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        User admin = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ticketService.getAllTickets(admin));
    }

    @PutMapping("/{id}/assign")
    public ResponseEntity<TicketResponseDTO> assignTechnician(@PathVariable Long id,
                                                              @RequestBody AssignTechnicianRequest request,
                                                              @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        User admin = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ticketService.assignTechnician(id, request.getTechnicianId(), admin));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<TicketResponseDTO> updateStatus(@PathVariable Long id,
                                                          @RequestBody StatusUpdateRequest request,
                                                          @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        User admin = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ticketService.updateStatus(id, request.getStatus(), admin));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<TicketResponseDTO> rejectTicket(@PathVariable Long id,
                                                          @RequestBody RejectTicketRequest request,
                                                          @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        User admin = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ticketService.rejectTicket(id, request.getReason(), admin));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketResponseDTO> getTicketById(@PathVariable Long id,
                                                           @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        User admin = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ticketService.getTicketById(id, admin));
    }
}