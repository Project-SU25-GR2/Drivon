package Drivon.backend.service;

import Drivon.backend.dto.BookingRequest;
import Drivon.backend.model.Booking;
import Drivon.backend.model.Car;
import Drivon.backend.model.User;
import Drivon.backend.repository.BookingRepository;
import Drivon.backend.repository.CarRepository;
import Drivon.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

        private static final Logger log = LoggerFactory.getLogger(BookingService.class);
        private final BookingRepository bookingRepository;
        private final UserRepository userRepository;
        private final CarRepository carRepository;

        public Booking createBooking(BookingRequest bookingRequest) {
                User renter = userRepository.findById(bookingRequest.getRenterId())
                                .orElseThrow(() -> new RuntimeException(
                                                "User not found with id: " + bookingRequest.getRenterId()));
                Car car = carRepository.findById(bookingRequest.getCarId())
                                .orElseThrow(() -> new RuntimeException(
                                                "Car not found with id: " + bookingRequest.getCarId()));

                Booking booking = Booking.builder()
                                .renter(renter)
                                .car(car)
                                .startTime(bookingRequest.getStartTime())
                                .endTime(bookingRequest.getEndTime())
                                .pickupLocation(bookingRequest.getPickupLocation())
                                .dropoffLocation(bookingRequest.getDropoffLocation())
                                .totalPrice(bookingRequest.getTotalPrice())
                                .status(Booking.BookingStatus.pending)
                                .build();

                log.info("Attempting to save booking: {}", booking);

                try {
                        Booking savedBooking = bookingRepository.saveAndFlush(booking);
                        log.info("Saved and flushed booking successfully with ID: {}", savedBooking.getId());
                        return savedBooking;
                } catch (Exception e) {
                        log.error("Error saving booking to database", e);
                        throw new RuntimeException("Could not save booking: " + e.getMessage(), e);
                }
        }

        public List<Booking> getBookingsByOwnerId(Integer ownerId) {
                return bookingRepository.findByCarOwnerId(ownerId);
        }
}