package com.unicore360.unicore360_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "notification_preferences")
@Data
@NoArgsConstructor
public class NotificationPreference {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long userId;

    private boolean bookingUpdates = true;
    private boolean ticketUpdates = true;
    private boolean comments = true;
    private boolean systemNotifications = true;  // renamed from 'system'
}