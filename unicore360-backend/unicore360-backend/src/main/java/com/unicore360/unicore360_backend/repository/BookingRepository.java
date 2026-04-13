package com.unicore360.unicore360_backend.repository;

import com.unicore360.unicore360_backend.model.Booking;
import com.unicore360.unicore360_backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    // Get bookings for a specific user, ordered by date descending
    List<Booking> findByUserOrderByBookingDateDesc(User user);

    // Get all bookings ordered by date descending (for admin)
    List<Booking> findAllByOrderByBookingDateDesc();

    // Analytics: Top 5 most booked resources
    @Query(value = "SELECT r.name as resourceName, COUNT(b.id) as bookingCount " +
            "FROM bookings b JOIN resources r ON b.resource_id = r.id " +
            "GROUP BY r.id ORDER BY bookingCount DESC LIMIT 5", nativeQuery = true)
    List<Map<String, Object>> findTopResources();

    // Analytics: Peak booking hours (extract start hour from time_range)
    @Query(value = "SELECT SUBSTRING_INDEX(b.time_range, '-', 1) as hourSlot, COUNT(b.id) as bookingCount " +
            "FROM bookings b GROUP BY hourSlot ORDER BY bookingCount DESC", nativeQuery = true)
    List<Map<String, Object>> findPeakHours();
}