package com.unicore360.unicore360_backend.dto;

import com.unicore360.unicore360_backend.model.TicketStatus;
import lombok.Data;

@Data
public class StatusUpdateRequest {
    private TicketStatus status;
}