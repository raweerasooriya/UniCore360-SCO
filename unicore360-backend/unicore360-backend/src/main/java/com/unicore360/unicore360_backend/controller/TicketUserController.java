package com.unicore360.unicore360_backend.controller;

import com.unicore360.unicore360_backend.dto.*;
import com.unicore360.unicore360_backend.model.User;
import com.unicore360.unicore360_backend.service.TicketService;
import com.unicore360.unicore360_backend.service.UserService;  // ADD THIS IMPORT
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tickets")
@RequiredArgsConstructor
public class TicketUserController {

    private final TicketService ticketService;
    private final UserService userService;

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<TicketResponseDTO> createTicket(
            @ModelAttribute TicketRequestDTO request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByEmail(userDetails.getUsername());  // FIXED method name
        try {
            TicketResponseDTO created = ticketService.createTicket(user, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/my")
    public ResponseEntity<List<TicketResponseDTO>> getMyTickets(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByEmail(userDetails.getUsername());  // FIXED
        return ResponseEntity.ok(ticketService.getTicketsForUser(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketResponseDTO> getTicketById(@PathVariable Long id,
                                                           @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByEmail(userDetails.getUsername());  // FIXED
        return ResponseEntity.ok(ticketService.getTicketById(id, user));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<TicketCommentDTO> addComment(@PathVariable Long id,
                                                       @RequestBody CommentRequest request,
                                                       @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByEmail(userDetails.getUsername());  // FIXED
        return ResponseEntity.ok(ticketService.addComment(id, request.getText(), user));
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long commentId,
                                              @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByEmail(userDetails.getUsername());  // FIXED
        ticketService.deleteComment(commentId, user);
        return ResponseEntity.noContent().build();
    }
}