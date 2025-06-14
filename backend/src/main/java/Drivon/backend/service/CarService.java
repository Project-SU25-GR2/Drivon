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
        return carRepository.findByOwnerId(ownerId);
    }
}