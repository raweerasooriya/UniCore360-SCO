package com.unicore360.unicore360_backend.controller;

import com.unicore360.unicore360_backend.model.Notification;
import com.unicore360.unicore360_backend.model.NotificationPreference;
import com.unicore360.unicore360_backend.model.NotificationType;
import com.unicore360.unicore360_backend.repository.NotificationPreferenceRepository;
import com.unicore360.unicore360_backend.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final NotificationPreferenceRepository preferenceRepository;

    @GetMapping("/user/{userId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Notification>> getUserNotifications(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationRepository.findByUserIdOrderByCreatedAtDesc(userId));
    }

    @GetMapping("/unread-count")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Long> getUnreadCount(@RequestParam Long userId) {
        return ResponseEntity.ok(notificationRepository.countByUserIdAndIsReadFalse(userId));
    }

    @PutMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setRead(true);
        notificationRepository.save(notification);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/read-all")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> markAllAsRead(@RequestParam Long userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndIsReadFalse(userId);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/preferences")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<NotificationPreference> getPreferences(@RequestParam Long userId) {
        NotificationPreference pref = preferenceRepository.findByUserId(userId)
                .orElseGet(() -> {
                    NotificationPreference np = new NotificationPreference();
                    np.setUserId(userId);
                    return preferenceRepository.save(np);
                });
        return ResponseEntity.ok(pref);
    }

    @PutMapping("/preferences")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<NotificationPreference> updatePreferences(
            @RequestParam Long userId,
            @RequestBody NotificationPreference incoming) {

        // Find the existing preference for this user
        NotificationPreference pref = preferenceRepository.findByUserId(userId)
                .orElseGet(() -> {
                    NotificationPreference newPref = new NotificationPreference();
                    newPref.setUserId(userId);
                    return newPref;
                });

        // Explicitly set the values from the request body
        pref.setBookingUpdates(incoming.isBookingUpdates());
        pref.setTicketUpdates(incoming.isTicketUpdates());
        pref.setComments(incoming.isComments());
        pref.setSystemNotifications(incoming.isSystemNotifications());

        // Save will now perform an UPDATE because the ID is preserved
        NotificationPreference saved = preferenceRepository.save(pref);
        return ResponseEntity.ok(saved);
    }

    @RequestMapping(value = "/create-test", method = {RequestMethod.GET, RequestMethod.POST})
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Notification> createTestNotification(@RequestParam Long userId) {
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setTitle("Test Notification");
        notification.setMessage("This is a test notification");
        notification.setType(NotificationType.SYSTEM);
        notification.setRead(false);
        Notification saved = notificationRepository.save(notification);
        return ResponseEntity.ok(saved);
    }
}