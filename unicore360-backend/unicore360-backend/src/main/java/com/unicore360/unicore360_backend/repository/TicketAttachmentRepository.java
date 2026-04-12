package com.unicore360.unicore360_backend.repository;

import com.unicore360.unicore360_backend.model.TicketAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TicketAttachmentRepository extends JpaRepository<TicketAttachment, Long> {
    List<TicketAttachment> findByTicketId(Long ticketId);
}