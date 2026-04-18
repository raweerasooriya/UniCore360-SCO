package com.unicore360.unicore360_backend.service;

import com.unicore360.unicore360_backend.model.*;
import com.unicore360.unicore360_backend.repository.BookingRepository;
import com.unicore360.unicore360_backend.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;
    private final NotificationService notificationService;

    public List<Booking> getUserBookings(User user) {
        return bookingRepository.findByUserOrderByBookingDateDesc(user);
    }

    // UPDATED: Now uses LocalTime for professional conflict checking
    public Booking createBooking(User user, Long resourceId, LocalDate date, LocalTime startTime, LocalTime endTime, String purpose, Integer attendees) {
        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new RuntimeException("Resource not found"));

        // MEMBER 2 CORE LOGIC: Using the database-level query we wrote in the Repository
        List<Booking> overlapping = bookingRepository.findOverlappingBookings(resourceId, date, startTime, endTime);

        if (!overlapping.isEmpty()) {
            throw new RuntimeException("Time slot already booked for this resource. Please choose another time.");
        }

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setResource(resource);
        booking.setBookingDate(date);
        booking.setStartTime(startTime); // Use new field
        booking.setEndTime(endTime);     // Use new field
        booking.setPurpose(purpose);
        booking.setExpectedAttendees(attendees);
        booking.setStatus(BookingStatus.PENDING);
        Booking saved = bookingRepository.save(booking);

        // Notify all admins about new booking
        notificationService.notifyAllAdmins(
                "New Booking Request",
                "Booking #" + saved.getId() + " for " + resource.getName() + " by " + user.getName(),
                NotificationType.BOOKING_UPDATE,
                saved.getId()
        );

        return saved;
    }

    public Booking cancelBooking(Long bookingId, User user) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You can only cancel your own bookings");
        }

        // Allowed to cancel if it's currently APPROVED or PENDING
        if (booking.getStatus() != BookingStatus.APPROVED && booking.getStatus() != BookingStatus.PENDING) {
            throw new RuntimeException("Booking cannot be cancelled in its current state");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        Booking saved = bookingRepository.save(booking);

        notificationService.sendBookingNotification(user,
                "Booking Cancelled",
                "Your booking for " + booking.getResource().getName() + " on " + booking.getBookingDate() + " has been cancelled.",
                booking.getId());

        return saved;
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAllByOrderByBookingDateDesc();
    }

    public Booking approveBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new RuntimeException("Only pending bookings can be approved");
        }

        booking.setStatus(BookingStatus.APPROVED);
        Booking saved = bookingRepository.save(booking);

        notificationService.sendBookingNotification(booking.getUser(),
                "Booking Approved",
                "Your booking for " + booking.getResource().getName() + " on " + booking.getBookingDate() + " has been approved.",
                booking.getId());

        return saved;
    }

    public Booking rejectBooking(Long id, String reason) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new RuntimeException("Only pending bookings can be rejected");
        }

        booking.setStatus(BookingStatus.REJECTED);
        // If you added rejectionReason to your Booking model, uncomment the line below:
        // booking.setRejectionReason(reason);

        Booking saved = bookingRepository.save(booking);

        notificationService.sendBookingNotification(booking.getUser(),
                "Booking Rejected",
                "Your booking for " + booking.getResource().getName() + " on " + booking.getBookingDate() + " has been rejected. Reason: " + reason,
                booking.getId());

        return saved;
    }

    // NOTE: The messy 'timeRangeOverlap' method was deleted because it's no longer needed!
}