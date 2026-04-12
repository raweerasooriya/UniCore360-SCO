package com.unicore360.unicore360_backend.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class TicketCommentDTO {
    private Long id;
    private String text;
    private UserDTO user;
    private LocalDateTime createdAt;
}