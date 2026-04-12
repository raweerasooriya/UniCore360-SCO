package com.unicore360.unicore360_backend.service;

import com.unicore360.unicore360_backend.model.*;
import com.unicore360.unicore360_backend.repository.NotificationPreferenceRepository;
import com.unicore360.unicore360_backend.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationPreferenceRepository preferenceRepository;

    public void sendBookingNotification(User user, String title, String message, Long bookingId) {
        if (shouldSend(user.getId(), NotificationType.BOOKING_UPDATE)) {
            createNotification(user.getId(), title, message, NotificationType.BOOKING_UPDATE, bookingId);
        }
    }

    public void sendTicketNotification(User user, String title, String message, Long ticketId) {
        if (shouldSend(user.getId(), NotificationType.TICKET_UPDATE)) {
            createNotification(user.getId(), title, message, NotificationType.TICKET_UPDATE, ticketId);
        }
    }

    public void sendCommentNotification(User user, String title, String message, Long ticketId) {
        if (shouldSend(user.getId(), NotificationType.COMMENT)) {
            createNotification(user.getId(), title, message, NotificationType.COMMENT, ticketId);
        }
    }

    private boolean shouldSend(Long userId, NotificationType type) {
        var pref = preferenceRepository.findByUserId(userId).orElse(null);
        if (pref == null) return true; // default all enabled
        return switch (type) {
            case BOOKING_UPDATE -> pref.isBookingUpdates();
            case TICKET_UPDATE -> pref.isTicketUpdates();
            case COMMENT -> pref.isComments();
            case SYSTEM -> pref.isSystemNotifications();
        };
    }

    private void createNotification(Long userId, String title, String message, NotificationType type, Long refId) {
        Notification notif = new Notification();
        notif.setUserId(userId);
        notif.setTitle(title);
        notif.setMessage(message);
        notif.setType(type);
        notif.setReferenceId(refId);
        notif.setRead(false);
        notificationRepository.save(notif);
    }
}