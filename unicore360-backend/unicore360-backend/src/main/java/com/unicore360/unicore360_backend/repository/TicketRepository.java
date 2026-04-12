package com.unicore360.unicore360_backend.repository;

import com.unicore360.unicore360_backend.model.Ticket;
import com.unicore360.unicore360_backend.model.TicketStatus;
import com.unicore360.unicore360_backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByUser(User user);
    List<Ticket> findByAssignedTechnician(User technician);
    List<Ticket> findByStatus(TicketStatus status);

    @Query("SELECT t FROM Ticket t WHERE t.status != 'REJECTED' AND t.status != 'CLOSED'")
    List<Ticket> findAllActive();
}