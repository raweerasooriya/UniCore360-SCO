package com.unicore360.unicore360_backend.dto;

import com.unicore360.unicore360_backend.model.Priority;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@Data
public class TicketRequestDTO {
    private String title;
    private String description;
    private Priority priority;
    private String location;
    private String category;
    private String contactEmail;
    private List<MultipartFile> attachments; // max 3
}