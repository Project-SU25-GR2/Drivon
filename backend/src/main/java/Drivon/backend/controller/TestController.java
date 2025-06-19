package Drivon.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

@RestController
@CrossOrigin(origins = "*")
public class TestController {

    @GetMapping("/api/test")
    public String test() {
        return "Backend API is working! Server time: " + new java.util.Date();
    }

    @GetMapping("/api/test/hello")
    public String hello() {
        return "Hello from Drivon Backend!";
    }
}