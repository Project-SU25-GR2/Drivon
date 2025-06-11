package Drivon.backend.service;

import Drivon.backend.model.Car;
import Drivon.backend.repository.CarRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CarService {
    
    @Autowired
    private CarRepository carRepository;
    
    public Car getCarById(String carId) {
        return carRepository.findById(carId).orElse(null);
    }
} 