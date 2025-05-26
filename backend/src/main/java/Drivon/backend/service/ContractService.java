package Drivon.backend.service;

import Drivon.backend.dto.ContractRequest;
import Drivon.backend.model.Contract;
import Drivon.backend.repository.ContractRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.time.LocalDateTime;

@Service
public class ContractService {

    @Autowired
    private ContractRepository contractRepository;

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

    public Contract createContract(ContractRequest request) {
        Contract contract = new Contract();
        contract.setContractNumber(request.getContractNumber());
        contract.setStartDate(request.getStartDate());
        contract.setEndDate(request.getEndDate());
        contract.setCarId(request.getCarId());
        contract.setCustomerId(request.getCustomerId());
        contract.setDeposit(request.getDeposit());
        contract.setTotalAmount(request.getTotalAmount());
        contract.setStatus("PENDING");
        contract.setName(request.getName());
        contract.setPhone(request.getPhone());
        contract.setCccd(request.getCccd());
        contract.setEmail(request.getEmail());

        return contractRepository.save(contract);
    }

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
}