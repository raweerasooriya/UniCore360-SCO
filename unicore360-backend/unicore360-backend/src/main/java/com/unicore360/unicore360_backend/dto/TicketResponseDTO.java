package com.unicore360.unicore360_backend.dto;

import com.unicore360.unicore360_backend.model.Priority;
import com.unicore360.unicore360_backend.model.TicketStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class TicketResponseDTO {
    private Long id;
    private String title;
    private String description;
    private Priority priority;
    private TicketStatus status;
    private String location;
    private String category;
    private String contactEmail;
    private String rejectionReason;
    private UserDTO user;
    private UserDTO assignedTechnician;
    private List<TicketAttachmentDTO> attachments;
    private List<TicketCommentDTO> comments;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}