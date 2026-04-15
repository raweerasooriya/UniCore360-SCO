package com.unicore360.unicore360_backend.service;

import com.unicore360.unicore360_backend.dto.*;
import com.unicore360.unicore360_backend.model.*;
import com.unicore360.unicore360_backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TicketService {

    private final TicketRepository ticketRepository;
    private final TicketCommentRepository commentRepository;
    private final TicketAttachmentRepository attachmentRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Value("${ticket.upload.dir:uploads/tickets}")
    private String uploadDir;

    @Transactional
    public TicketResponseDTO createTicket(User user, TicketRequestDTO request) throws IOException {
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        Ticket ticket = new Ticket();
        ticket.setTitle(request.getTitle());
        ticket.setDescription(request.getDescription());
        ticket.setPriority(request.getPriority());
        ticket.setLocation(request.getLocation());
        ticket.setCategory(request.getCategory());
        ticket.setContactEmail(request.getContactEmail());
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setUser(user);

        ticket = ticketRepository.save(ticket);

        if (request.getAttachments() != null) {
            int count = 0;
            for (MultipartFile file : request.getAttachments()) {
                if (count >= 3) break;
                if (!file.isEmpty()) {
                    String originalName = file.getOriginalFilename();
                    String extension = originalName.substring(originalName.lastIndexOf("."));
                    String fileName = UUID.randomUUID().toString() + extension;
                    Path filePath = uploadPath.resolve(fileName);
                    Files.copy(file.getInputStream(), filePath);

                    TicketAttachment attachment = new TicketAttachment();
                    attachment.setFileName(originalName);
                    attachment.setFilePath("/uploads/tickets/" + fileName);
                    attachment.setFileType(file.getContentType());
                    attachment.setFileSize(file.getSize());
                    attachment.setTicket(ticket);
                    attachmentRepository.save(attachment);
                    ticket.getAttachments().add(attachment);
                    count++;
                }
            }
        }

        // Notify all admins about new ticket
        notificationService.notifyAllAdmins(
                "New Ticket Created",
                "Ticket #" + ticket.getId() + ": " + ticket.getTitle() + " created by " + user.getName(),
                NotificationType.TICKET_UPDATE,
                ticket.getId()
        );

        return convertToDTO(ticket);
    }

    @Transactional
    public TicketResponseDTO assignTechnician(Long ticketId, Long technicianId, User admin) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        User technician = userRepository.findById(technicianId)
                .orElseThrow(() -> new RuntimeException("Technician not found"));
        if (technician.getRole() != Role.TECHNICIAN) {
            throw new RuntimeException("User is not a technician");
        }
        ticket.setAssignedTechnician(technician);
        ticket = ticketRepository.save(ticket);

        // Notify the technician
        notificationService.sendTicketNotification(technician,
                "New Ticket Assigned",
                "You have been assigned to ticket #" + ticketId + ": " + ticket.getTitle(),
                ticketId);

        // Notify the ticket owner
        notificationService.sendTicketNotification(ticket.getUser(),
                "Technician Assigned",
                "A technician has been assigned to your ticket #" + ticketId,
                ticketId);

        // Notify all admins
        notificationService.notifyAllAdmins(
                "Technician Assigned",
                "Ticket #" + ticketId + " assigned to " + technician.getName() + " by " + admin.getName(),
                NotificationType.TICKET_UPDATE,
                ticketId
        );

        return convertToDTO(ticket);
    }

    @Transactional
    public TicketResponseDTO updateStatus(Long ticketId, TicketStatus newStatus, User actor) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        if (actor.getRole() != Role.ADMIN &&
                (ticket.getAssignedTechnician() == null || !ticket.getAssignedTechnician().getId().equals(actor.getId()))) {
            throw new RuntimeException("Not authorized to update this ticket");
        }

        TicketStatus oldStatus = ticket.getStatus();
        ticket.setStatus(newStatus);
        ticket = ticketRepository.save(ticket);

        // Notify the ticket owner
        notificationService.sendTicketNotification(ticket.getUser(),
                "Ticket Status Updated",
                "Your ticket #" + ticketId + " status changed from " + oldStatus + " to " + newStatus,
                ticketId);

        // Notify the assigned technician if different from actor and not admin (already notified owner)
        if (actor.getRole() == Role.ADMIN && ticket.getAssignedTechnician() != null) {
            notificationService.sendTicketNotification(ticket.getAssignedTechnician(),
                    "Ticket Status Updated",
                    "Ticket #" + ticketId + " status changed to " + newStatus + " by admin.",
                    ticketId);
        }

        // Notify all admins (useful for monitoring)
        notificationService.notifyAllAdmins(
                "Ticket Status Updated",
                "Ticket #" + ticketId + " status changed from " + oldStatus + " to " + newStatus + " by " + actor.getName(),
                NotificationType.TICKET_UPDATE,
                ticketId
        );

        return convertToDTO(ticket);
    }

    @Transactional
    public TicketResponseDTO rejectTicket(Long ticketId, String reason, User admin) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        ticket.setStatus(TicketStatus.REJECTED);
        ticket.setRejectionReason(reason);
        ticket = ticketRepository.save(ticket);

        // Notify the ticket owner
        notificationService.sendTicketNotification(ticket.getUser(),
                "Ticket Rejected",
                "Your ticket #" + ticketId + " has been rejected. Reason: " + reason,
                ticketId);

        // Notify all admins
        notificationService.notifyAllAdmins(
                "Ticket Rejected",
                "Ticket #" + ticketId + " rejected by " + admin.getName() + ". Reason: " + reason,
                NotificationType.TICKET_UPDATE,
                ticketId
        );

        return convertToDTO(ticket);
    }

    public List<TicketResponseDTO> getAllTickets(User admin) {
        return ticketRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<TicketResponseDTO> getTicketsForTechnician(User technician) {
        return ticketRepository.findByAssignedTechnician(technician).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<TicketResponseDTO> getTicketsForUser(User user) {
        return ticketRepository.findByUser(user).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public TicketResponseDTO getTicketById(Long id, User viewer) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        if (viewer.getRole() == Role.ADMIN ||
                ticket.getUser().getId().equals(viewer.getId()) ||
                (ticket.getAssignedTechnician() != null && ticket.getAssignedTechnician().getId().equals(viewer.getId()))) {
            return convertToDTO(ticket);
        }
        throw new RuntimeException("Not authorized to view this ticket");
    }

    @Transactional
    public TicketCommentDTO addComment(Long ticketId, String text, User user) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        TicketComment comment = new TicketComment();
        comment.setText(text);
        comment.setTicket(ticket);
        comment.setUser(user);
        comment = commentRepository.save(comment);

        // Notify ticket owner if not the commenter
        if (!ticket.getUser().getId().equals(user.getId())) {
            notificationService.sendCommentNotification(ticket.getUser(),
                    "New comment on ticket #" + ticketId,
                    user.getName() + " commented: " + (text.length() > 50 ? text.substring(0, 50) + "..." : text),
                    ticketId);
        }

        // Notify assigned technician if exists and not the commenter
        if (ticket.getAssignedTechnician() != null && !ticket.getAssignedTechnician().getId().equals(user.getId())) {
            notificationService.sendCommentNotification(ticket.getAssignedTechnician(),
                    "New comment on ticket #" + ticketId,
                    user.getName() + " commented: " + (text.length() > 50 ? text.substring(0, 50) + "..." : text),
                    ticketId);
        }

        // Notify all admins
        notificationService.notifyAllAdmins(
                "New Comment on Ticket",
                "Ticket #" + ticketId + " – " + user.getName() + " commented: " + (text.length() > 80 ? text.substring(0, 80) + "..." : text),
                NotificationType.COMMENT,
                ticketId
        );

        return convertToCommentDTO(comment);
    }

    @Transactional
    public void deleteComment(Long commentId, User user) {
        TicketComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        if (!comment.getUser().getId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
            throw new RuntimeException("Not authorized to delete this comment");
        }
        commentRepository.delete(comment);
    }

    // NEW: Delete a ticket and all its associated data (attachments, comments)
    @Transactional
    public void deleteTicket(Long ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        // Cascade will remove attachments and comments automatically
        ticketRepository.delete(ticket);
    }

    @Transactional
    public TicketCommentDTO updateComment(Long commentId, String newText, User user) {
        TicketComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        if (!comment.getUser().getId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
            throw new RuntimeException("Not authorized to edit this comment");
        }
        comment.setText(newText);
        comment = commentRepository.save(comment);
        return convertToCommentDTO(comment);
    }

    // Helper conversion methods
    private TicketResponseDTO convertToDTO(Ticket ticket) {
        return TicketResponseDTO.builder()
                .id(ticket.getId())
                .title(ticket.getTitle())
                .description(ticket.getDescription())
                .priority(ticket.getPriority())
                .status(ticket.getStatus())
                .location(ticket.getLocation())
                .category(ticket.getCategory())
                .contactEmail(ticket.getContactEmail())
                .rejectionReason(ticket.getRejectionReason())
                .user(convertToUserDTO(ticket.getUser()))
                .assignedTechnician(ticket.getAssignedTechnician() != null ? convertToUserDTO(ticket.getAssignedTechnician()) : null)
                .attachments(ticket.getAttachments().stream().map(this::convertToAttachmentDTO).collect(Collectors.toList()))
                .comments(ticket.getComments().stream().map(this::convertToCommentDTO).collect(Collectors.toList()))
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .build();
    }

    private UserDTO convertToUserDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole().name())
                .build();
    }

    private TicketAttachmentDTO convertToAttachmentDTO(TicketAttachment att) {
        return TicketAttachmentDTO.builder()
                .id(att.getId())
                .fileName(att.getFileName())
                .fileUrl(att.getFilePath())
                .fileType(att.getFileType())
                .fileSize(att.getFileSize())
                .build();
    }

    private TicketCommentDTO convertToCommentDTO(TicketComment comment) {
        return TicketCommentDTO.builder()
                .id(comment.getId())
                .text(comment.getText())
                .user(convertToUserDTO(comment.getUser()))
                .createdAt(comment.getCreatedAt())
                .build();
    }
}