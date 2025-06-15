package Drivon.backend.service;

import Drivon.backend.model.Car;
import Drivon.backend.repository.CarRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CarService {

    @Autowired
    private CarRepository carRepository;

    public Car getCarById(String carId) {
        return carRepository.findById(carId).orElse(null);
    }

    public List<Car> getAllCars() {
        return carRepository.findAll();
    }

    public List<Car> getCarsByOwnerId(Long ownerId) {
        List<Car> cars = carRepository.findCarsByOwnerIdAndContractStatus(ownerId, "ACTIVE_LEASE");
        System.out.println("Cars found for owner " + ownerId + " with ACTIVE_LEASE status: " + cars);
        return cars;
    }

    public List<Car> getActiveLeaseCars() {
        return carRepository.findCarsByContractStatus("ACTIVE_LEASE");
    }

    public Car updateCar(Car car) {
        return carRepository.save(car);
    }
}