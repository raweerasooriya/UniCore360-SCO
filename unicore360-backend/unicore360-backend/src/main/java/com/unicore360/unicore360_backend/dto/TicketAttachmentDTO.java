package com.unicore360.unicore360_backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TicketAttachmentDTO {
    private Long id;
    private String fileName;
    private String fileUrl;   // e.g., "/uploads/tickets/xxx.jpg"
    private String fileType;
    private long fileSize;
}