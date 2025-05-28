import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useLocation } from 'react-router-dom';
import './ContractForm.css';

const CarLeaseContractForm = ({ user }) => {
    const location = useLocation();
    const contractData = location.state?.contractData;

    const [formData, setFormData] = useState({
        contractNumber: contractData?.contractNumber || '',
        startDate: contractData?.startDate || '',
        endDate: contractData?.endDate || '',
        carId: contractData?.carId || '',
        ownerId: user?.id || '',
        customerId: user?.id || '',
        deposit: contractData?.deposit || '',
        totalAmount: contractData?.totalAmount || '',
        name: contractData?.name || '',
        phone: contractData?.phone || '',
        cccd: contractData?.cccd || '',
        email: contractData?.email || '',
        terms: false
    });

    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState('');
    const [countdown, setCountdown] = useState(0);
    const [isCountingDown, setIsCountingDown] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');

    useEffect(() => {
        if (contractData) {
            setFormData(prev => ({
                ...prev,
                carId: contractData.carId,
                totalAmount: contractData.totalAmount || ''
            }));
        }
    }, [contractData]);

    useEffect(() => {
        if (user?.id) {
            setFormData(prev => ({
                ...prev,
                ownerId: user.id
            }));
        }
    }, [user]);

    useEffect(() => {
        let timer;
        if (isCountingDown && countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        } else if (countdown === 0) {
            setIsCountingDown(false);
        }
        return () => clearTimeout(timer);
    }, [countdown, isCountingDown]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        let newValue = type === 'checkbox' ? checked : value;
        
        if (name === 'phone' && value) {
            if (!/^[0-9]{10,11}$/.test(value)) {
                setErrors(prev => ({ ...prev, [name]: 'Phone number must be 10-11 digits' }));
                return;
            }
        }
        
        if (name === 'cccd' && value) {
            if (!/^[0-9]{12}$/.test(value)) {
                setErrors(prev => ({ ...prev, [name]: 'ID number must be 12 digits' }));
                return;
            }
        }
        
        if (name === 'email' && value) {
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                setErrors(prev => ({ ...prev, [name]: 'Invalid email format' }));
                return;
            }
        }

        setFormData(prev => ({
            ...prev,
            [name]: newValue
        }));
        
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.contractNumber) {
            newErrors.contractNumber = 'Please enter contract number';
        }
        if (!formData.startDate) {
            newErrors.startDate = 'Please select start date';
        }
        if (!formData.endDate) {
            newErrors.endDate = 'Please select end date';
        }
        if (!formData.carId) {
            newErrors.carId = 'Please enter car ID';
        }
        if (!formData.ownerId) {
            newErrors.ownerId = 'Please enter owner ID';
        }
        if (!formData.deposit) {
            newErrors.deposit = 'Please enter deposit amount';
        }
        if (!formData.totalAmount) {
            newErrors.totalAmount = 'Please enter total amount';
        }
        if (!formData.name) {
            newErrors.name = 'Please enter full name';
        }
        if (!formData.phone) {
            newErrors.phone = 'Please enter phone number';
        }
        if (!formData.cccd) {
            newErrors.cccd = 'Please enter ID number';
        }
        if (!formData.email) {
            newErrors.email = 'Please enter email';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const sendVerificationCode = async () => {
        try {
            const response = await axios.post('http://localhost:8080/api/contracts/send-code', {
                email: formData.email
            });
            if (response.data.success) {
                setMessage('Verification code has been sent to your email');
                setCountdown(120);
                setIsCountingDown(true);
            }
        } catch (error) {
            setMessage('Error sending verification code: ' + (error.response?.data?.error || error.message));
        }
    };

    const verifyCode = async () => {
        try {
            const response = await axios.post('http://localhost:8080/api/contracts/verify-code', {
                email: formData.email,
                code: verificationCode
            });
            if (response.data.success) {
                setIsVerified(true);
                setMessage('Verification successful!');
            } else {
                setMessage('Invalid verification code');
            }
        } catch (error) {
            setMessage('Error verifying code: ' + (error.response?.data?.error || error.message));
        }
    };

    const generatePDF = (contractData) => {
        const doc = new jsPDF();
        
        // Add header
        doc.setFontSize(20);
        doc.text('SOCIALIST REPUBLIC OF VIETNAM', 105, 20, { align: 'center' });
        doc.text('Independence - Freedom - Happiness', 105, 30, { align: 'center' });
        doc.text('------------------------------', 105, 40, { align: 'center' });
        doc.text('CAR LEASE AGREEMENT', 105, 50, { align: 'center' });

        // Add date
        const today = new Date();
        doc.setFontSize(12);
        doc.text(`Date: ${today.getDate()} Month: ${today.getMonth() + 1} Year: ${today.getFullYear()}`, 20, 70);
        doc.text(`Contract No: ${contractData.contractNumber}`, 20, 80);

        // Add Party A
        let currentY = 100;
        doc.text('PARTY A', 20, currentY);
        currentY += 10;
        doc.text(`Name: ${contractData.name}`, 20, currentY);
        currentY += 10;
        doc.text(`Phone: ${contractData.phone}`, 20, currentY);
        currentY += 10;
        doc.text(`ID Number: ${contractData.cccd}`, 20, currentY);
        currentY += 10;
        doc.text(`Email: ${contractData.email}`, 20, currentY);

        // Add Party B
        currentY += 20;
        doc.text('PARTY B', 20, currentY);
        currentY += 10;
        doc.text('Name: Group2 LLC', 20, currentY);
        currentY += 10;
        doc.text('Phone: 0394672210', 20, currentY);
        currentY += 10;
        doc.text('Email: Binhvuong221004@gmail.com', 20, currentY);

        // Add agreement section
        currentY += 20;
        doc.text('Agreement Terms:', 20, currentY);
        currentY += 20;

        // Add signatures
        doc.text('PARTY A:', 20, currentY);
        doc.text('PARTY B:', 120, currentY);
        currentY += 10;
        doc.text(`Name: ${contractData.name}`, 20, currentY);
        doc.text('Group2', 120, currentY);
        currentY += 10;
        doc.text(`Verification Code: ${contractData.verificationCode}`, 20, currentY);
        doc.text('Signed!', 120, currentY);

        // Add signature lines
        doc.line(20, currentY + 10, 100, currentY + 10);
        doc.line(120, currentY + 10, 200, currentY + 10);

        return doc.output('blob');
    };

    const generateContractNumber = () => {
        const timestamp = new Date().getTime();
        const random = Math.floor(Math.random() * 1000);
        return `HD${timestamp}${random}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            setMessage('Please fill in all required fields correctly');
            return;
        }

        if (!isVerified) {
            setMessage('Please verify your email before creating the contract');
            return;
        }

        // Generate a new contract number
        const newContractNumber = generateContractNumber();

        // Ensure all required fields are present and properly formatted
        const formattedData = {
            contractNumber: newContractNumber,
            startDate: formData.startDate,
            endDate: formData.endDate,
            carId: formData.carId.toString(),
            customerId: "1", // Use a default customer ID
            deposit: parseFloat(formData.deposit) || 0,
            totalAmount: parseFloat(formData.totalAmount) || 0,
            name: formData.name,
            phone: formData.phone,
            cccd: formData.cccd,
            email: formData.email
        };

        try {
            console.log('Sending data:', formattedData);
            const response = await axios.post('http://localhost:8080/api/contracts/lease', formattedData);

            if (response.data) {
                setMessage('Contract created successfully!');
                
                // Generate PDF using form data and verification code
                const pdfBlob = generatePDF({
                    ...formData,
                    contractNumber: newContractNumber,
                    verificationCode: verificationCode
                });
                const pdfUrl = URL.createObjectURL(pdfBlob);
                window.open(pdfUrl, '_blank');

                const link = document.createElement('a');
                link.href = pdfUrl;
                link.download = 'car_lease_agreement.pdf';
                link.click();

                setTimeout(() => {
                    URL.revokeObjectURL(pdfUrl);
                }, 100);
            }
        } catch (error) {
            console.error('Error details:', error.response?.data);
            if (error.response?.data?.errors) {
                // If there are validation errors, show them
                const errorMessages = Object.values(error.response.data.errors).join(', ');
                setMessage('Validation errors: ' + errorMessages);
            } else {
                setMessage('Error creating contract: ' + (error.response?.data?.error || error.message));
            }
        }
    };

    return (
        <div className="contract-form-container">
            <h2>Car Lease Agreement</h2>
            {message && <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>{message}</div>}
            
            {contractData?.carData && (
                <div className="car-info-section">
                    <h3>Vehicle Information</h3>
                    <div className="info-grid">
                        <div className="info-item">
                            <label>Brand:</label>
                            <span>{contractData.carData.carBrand}</span>
                        </div>
                        <div className="info-item">
                            <label>Model:</label>
                            <span>{contractData.carData.carModel}</span>
                        </div>
                        <div className="info-item">
                            <label>Year:</label>
                            <span>{contractData.carData.year}</span>
                        </div>
                        <div className="info-item">
                            <label>License Plate:</label>
                            <span>{contractData.carData.licensePlate}</span>
                        </div>
                        <div className="info-item">
                            <label>Daily Rate:</label>
                            <span>{contractData.carData.dailyRate.toLocaleString()} VND</span>
                        </div>
                        <div className="info-item">
                            <label>Location:</label>
                            <span>{contractData.carData.location}</span>
                        </div>
                    </div>
                    {contractData.carData.images && contractData.carData.images.length > 0 && (
                        <div className="car-images">
                            <h4>Vehicle Images:</h4>
                            <div className="image-grid">
                                {contractData.carData.images.map((image, index) => (
                                    <img key={index} src={image} alt={`Car ${index + 1}`} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Contract Number:</label>
                    <input
                        type="text"
                        name="contractNumber"
                        value={formData.contractNumber}
                        onChange={handleChange}
                        className={errors.contractNumber ? 'error' : ''}
                        required
                    />
                    {errors.contractNumber && <div className="field-error">{errors.contractNumber}</div>}
                </div>

                <div className="form-group">
                    <label>Start Date:</label>
                    <input
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleChange}
                        className={errors.startDate ? 'error' : ''}
                        required
                    />
                    {errors.startDate && <div className="field-error">{errors.startDate}</div>}
                </div>

                <div className="form-group">
                    <label>End Date:</label>
                    <input
                        type="date"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleChange}
                        className={errors.endDate ? 'error' : ''}
                        required
                    />
                    {errors.endDate && <div className="field-error">{errors.endDate}</div>}
                </div>

                <div className="form-group">
                    <label>Car ID:</label>
                    <input
                        type="text"
                        name="carId"
                        value={formData.carId}
                        onChange={handleChange}
                        className={errors.carId ? 'error' : ''}
                        required
                    />
                    {errors.carId && <div className="field-error">{errors.carId}</div>}
                </div>

                <div className="form-group">
                    <label>Owner ID:</label>
                    <input
                        type="text"
                        name="ownerId"
                        value={formData.ownerId}
                        onChange={handleChange}
                        className={errors.ownerId ? 'error' : ''}
                        required
                    />
                    {errors.ownerId && <div className="field-error">{errors.ownerId}</div>}
                </div>

                <div className="form-group">
                    <label>Deposit:</label>
                    <input
                        type="number"
                        name="deposit"
                        value={formData.deposit}
                        onChange={handleChange}
                        className={errors.deposit ? 'error' : ''}
                        required
                    />
                    {errors.deposit && <div className="field-error">{errors.deposit}</div>}
                </div>

                <div className="form-group">
                    <label>Total Amount:</label>
                    <input
                        type="number"
                        name="totalAmount"
                        value={formData.totalAmount}
                        onChange={handleChange}
                        className={errors.totalAmount ? 'error' : ''}
                        required
                    />
                    {errors.totalAmount && <div className="field-error">{errors.totalAmount}</div>}
                </div>

                <div className="form-group">
                    <label>Full Name:</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={errors.name ? 'error' : ''}
                        required
                    />
                    {errors.name && <div className="field-error">{errors.name}</div>}
                </div>

                <div className="form-group">
                    <label>Phone Number:</label>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        pattern="[0-9]{10,11}"
                        className={errors.phone ? 'error' : ''}
                        required
                    />
                    {errors.phone && <div className="field-error">{errors.phone}</div>}
                </div>

                <div className="form-group">
                    <label>ID Number:</label>
                    <input
                        type="text"
                        name="cccd"
                        value={formData.cccd}
                        onChange={handleChange}
                        pattern="[0-9]{12}"
                        className={errors.cccd ? 'error' : ''}
                        required
                    />
                    {errors.cccd && <div className="field-error">{errors.cccd}</div>}
                </div>

                <div className="form-group">
                    <label>Email:</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={errors.email ? 'error' : ''}
                        required
                    />
                    {errors.email && <div className="field-error">{errors.email}</div>}
                </div>

                <div className="verification-section">
                    <button
                        type="button"
                        onClick={sendVerificationCode}
                        disabled={isCountingDown || !formData.email}
                        className="verification-button"
                    >
                        Send Verification Code
                    </button>
                    {isCountingDown && (
                        <span className="countdown">
                            {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
                        </span>
                    )}
                </div>

                <div className="form-group">
                    <label>Verification Code:</label>
                    <div className="verification-input-group">
                        <input
                            type="text"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            className={errors.verificationCode ? 'error' : ''}
                            required
                        />
                        <button
                            type="button"
                            onClick={verifyCode}
                            className="verify-button"
                        >
                            Verify
                        </button>
                    </div>
                    {errors.verificationCode && (
                        <div className="field-error">{errors.verificationCode}</div>
                    )}
                </div>

                <button
                    type="submit"
                    className="submit-button"
                    disabled={!isVerified}
                >
                    Create Contract
                </button>
            </form>
        </div>
    );
};

export default CarLeaseContractForm; 