package Drivon.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Data
@Getter
@Setter
public class ContractRequest {
    @NotBlank(message = "Contract number is required")
    private String contractNumber;

    @NotBlank(message = "Car ID is required")
    private String carId;

    @NotBlank(message = "Customer ID is required")
    private String customerId;

    @NotNull(message = "Deposit amount is required")
    private Double deposit;

    private String status;

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[0-9]{10,15}$", message = "Phone number must be 10-15 digits")
    private String phone;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotNull(message = "Price per day is required")
    private Double pricePerDay;

    private CarData carData;
}