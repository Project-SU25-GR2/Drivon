package Drivon.backend.service;

import Drivon.backend.dto.ContractRequest;
import Drivon.backend.model.Contract;
import Drivon.backend.model.Car;
import Drivon.backend.repository.ContractRepository;
import Drivon.backend.repository.CarRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.time.LocalDateTime;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ContractService {

    @Autowired
    private ContractRepository contractRepository;

    @Autowired
    private CarRepository carRepository;

    /* Comment out verification code storage
    // Store verification codes with expiration time
    private final Map<String, VerificationCode> verificationCodes = new ConcurrentHashMap<>();

    private static class VerificationCode {
        String code;
        LocalDateTime expirationTime;

        VerificationCode(String code) {
            this.code = code;
            this.expirationTime = LocalDateTime.now().plusMinutes(2);
        }

        boolean isExpired() {
            return LocalDateTime.now().isAfter(expirationTime);
        }
    }
    */

    public Contract createContract(ContractRequest request) {
        Contract contract = new Contract();
        contract.setContractNumber(request.getContractNumber());
        contract.setStartDate(request.getStartDate());
        contract.setEndDate(request.getEndDate());
        contract.setCarId(request.getCarId());
        contract.setCustomerId(request.getCustomerId());
        contract.setDeposit(request.getDeposit());
        contract.setStatus("PENDING");
        contract.setName(request.getName());
        contract.setPhone(request.getPhone());
        contract.setCccd(request.getCccd());
        contract.setEmail(request.getEmail());
        contract.setPricePerDay(request.getPricePerDay());
        contract.setPdfUrl(request.getPdfUrl());

        Contract savedContract = contractRepository.save(contract);
        generateContractFile(savedContract);
        return savedContract;
    }

    public Contract createLeaseContract(ContractRequest request) {
        // Lưu xe nếu chưa có
        if (request.getCarData() != null) {
            String licensePlate = request.getCarData().getLicensePlate();
            if (!carRepository.existsById(licensePlate)) {
                Car car = new Car();
                car.setLicensePlate(licensePlate);
                car.setOwnerId(Integer.parseInt(request.getCustomerId()));
                car.setBrand(request.getCarData().getBrand());
                car.setModel(request.getCarData().getModel());
                car.setYear(request.getCarData().getYear());
                car.setDescription(request.getCarData().getDescription());
                car.setType(request.getCarData().getType());
                car.setStatus("available");
                car.setLocation(request.getCarData().getLocation());
                System.out.println("new car added: " + car);
                carRepository.save(car);
            }
        }
        Contract contract = new Contract();
        contract.setContractNumber(request.getContractNumber());
        contract.setStartDate(request.getStartDate());
        contract.setEndDate(request.getEndDate());
        contract.setCarId(request.getCarId());
        contract.setCustomerId(request.getCustomerId());
        contract.setDeposit(request.getDeposit());
        contract.setStatus("PENDING_LEASE");
        contract.setName(request.getName());
        contract.setPhone(request.getPhone());
        contract.setCccd(request.getCccd());
        contract.setEmail(request.getEmail());
        contract.setPricePerDay(request.getPricePerDay());
        contract.setPdfUrl(request.getPdfUrl());

        Contract savedContract = contractRepository.save(contract);
        return savedContract;
    }

    /* Comment out verification code methods
    public String generateVerificationCode(String email) {
        String code = String.format("%06d", (int) (Math.random() * 1000000));
        verificationCodes.put(email, new VerificationCode(code));
        return code;
    }

    public boolean verifyCode(String email, String code) {
        VerificationCode storedCode = verificationCodes.get(email);
        if (storedCode == null || storedCode.isExpired()) {
            verificationCodes.remove(email);
            return false;
        }

        boolean isValid = storedCode.code.equals(code);
        if (isValid) {
            verificationCodes.remove(email);
        }
        return isValid;
    }
    */

    private void generateContractFile(Contract contract) {
        try {
            // Tạo thư mục contracts nếu chưa tồn tại
            File contractsDir = new File("contracts");
            if (!contractsDir.exists()) {
                contractsDir.mkdir();
            }

            // Tạo file hợp đồng
            File contractFile = new File(contractsDir, contract.getId() + ".txt");
            FileWriter writer = new FileWriter(contractFile);

            // Ghi nội dung hợp đồng
            writer.write("CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\n");
            writer.write("Độc lập – Tự do – Hạnh phúc\n");
            writer.write("------------------------------\n");
            writer.write("HỢP ĐỒNG CHO THUÊ XE\n");
            writer.write("Ngày " + contract.getStartDate().format(DateTimeFormatter.ofPattern("d")) +
                    " tháng " + contract.getStartDate().format(DateTimeFormatter.ofPattern("M")) +
                    " năm " + contract.getStartDate().format(DateTimeFormatter.ofPattern("yyyy")) + "\n");
            writer.write("Số: " + contract.getContractNumber() + "\n\n");

            writer.write("BÊN A\n");
            writer.write("Tên: " + contract.getName() + "\n");
            writer.write("Số điện thoại: " + contract.getPhone() + "\n");
            writer.write("CCCD: " + contract.getCccd() + "\n");
            writer.write("Email: " + contract.getEmail() + "\n\n");

            writer.write("BÊN B\n");
            writer.write("Tên: Cty TNHH Group2\n");
            writer.write("Số điện thoại: 0394672210\n");
            writer.write("Email: Binhvuong221004@gmail.com\n\n");

            writer.write("Đồng ý với điều khoản:\n");
            writer.write("BÊN A:                                                          BÊN B:\n");
            writer.write("Tên: " + contract.getName() + "                                Group2\n");
            writer.write("Mã xác nhận:                                                    Đã ký!\n");

            writer.close();
        } catch (IOException e) {
            throw new RuntimeException("Không thể tạo file hợp đồng", e);
        }
    }

    public boolean checkCarExists(String carId) {
        return carRepository.existsById(carId);
    }

    public List<Contract> getAllContracts() {
        return contractRepository.findAll();
    }
    
    public Contract getContractById(Long id) {
        return contractRepository.findById(id).orElse(null);
    }

    public Contract save(Contract contract) {
        return contractRepository.save(contract);
    }
}