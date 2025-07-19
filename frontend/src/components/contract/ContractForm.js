import React, { useState, useEffect } from 'react';
import axios from 'axios';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { useLocation } from 'react-router-dom';
import { API_URL } from '../../api/configApi';
// Initialize pdfMake with fonts
pdfMake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts.vfs;
const CarRentalContractForm = () => {
    const location = useLocation();
    const contractData = location.state?.contractData;

    const [formData, setFormData] = useState({
        contractNumber: contractData?.contractNumber || '',
        carId: contractData?.carId || '',
        customerId: contractData?.customerId || '',
        deposit: contractData?.deposit || '',
        name: contractData?.name || '',
        phone: contractData?.phone || '',
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
            // Automatically fill car information into form
            setFormData(prev => ({
                ...prev,
                carId: contractData.carId,
            }));
        }
    }, [contractData]);

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
        
        // Validate input based on field type
        if (name === 'phone' && value) {
            if (!/^[0-9]{10,11}$/.test(value)) {
                setErrors(prev => ({ ...prev, [name]: 'Phone number must have 10-11 digits' }));
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
        
        // Clear error when input is valid
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.contractNumber) {
            newErrors.contractNumber = 'Please enter contract number';
        }
        if (!formData.carId) {
            newErrors.carId = 'Please enter car ID';
        }
        if (!formData.customerId) {
            newErrors.customerId = 'Please enter customer ID';
        }
        if (!formData.deposit) {
            newErrors.deposit = 'Please enter deposit amount';
        }
        if (!formData.name) {
            newErrors.name = 'Please enter full name';
        }
        if (!formData.phone) {
            newErrors.phone = 'Please enter phone number';
        }
        if (!formData.email) {
            newErrors.email = 'Please enter email';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const sendVerificationCode = async () => {
        try {
            const response = await axios.post(`${API_URL}/contracts/send-code`, {
                email: formData.email
            });
            if (response.data.success) {
                setMessage('Verification code has been sent to your email');
                setCountdown(120); // 2 minutes
                setIsCountingDown(true);
            }
        } catch (error) {
            setMessage('Error sending verification code: ' + (error.response?.data?.error || error.message));
        }
    };

    const verifyCode = async () => {
        try {
            const response = await axios.post(`${API_URL}/contracts/verify-code`, {
                email: formData.email,
                code: verificationCode
            });
            if (response.data.success) {
                setIsVerified(true);
                setMessage('Verification successful!');
            } else {
                setMessage('Incorrect verification code');
            }
        } catch (error) {
            setMessage('Verification error: ' + (error.response?.data?.error || error.message));
        }
    };

    const generatePDF = (contractData) => {
        const docDefinition = {
            content: [
                { text: 'SOCIALIST REPUBLIC OF VIETNAM', style: 'header', alignment: 'center' },
                { text: 'Independence – Freedom – Happiness', style: 'subheader', alignment: 'center' },
                { text: '-------------------------------', alignment: 'center', margin: [0, 0, 0, 10] },
                { text: 'CAR RENTAL CONTRACT', style: 'title', alignment: 'center', margin: [0, 10, 0, 0] },
                { text: `Date: ${new Date().toLocaleDateString('en-US')}`, alignment: 'center' },
                { text: `Contract No: ${contractData.contractNumber}`, alignment: 'center', margin: [0, 0, 0, 20] },

                { text: 'PARTY A', style: 'section' },
                { text: `Name: ${contractData.name}` },
                { text: `Phone: ${contractData.phone}` },
                { text: `Email: ${contractData.email}`, margin: [0, 0, 0, 10] },

                { text: 'PARTY B', style: 'section' },
                { text: 'Name: Group2 Co., Ltd' },
                { text: 'Phone: 0394672210' },
                { text: 'Email: Binhvuong221004@gmail.com', margin: [0, 0, 0, 20] },

                { text: 'VEHICLE INFORMATION', style: 'section' },
                { text: `Brand: ${contractData.carData?.carBrand || 'N/A'}` },
                { text: `Model: ${contractData.carData?.carModel || 'N/A'}` },
                { text: `Year: ${contractData.carData?.year || 'N/A'}` },
                { text: `License Plate: ${contractData.carData?.licensePlate || 'N/A'}` },
                { text: `Daily Rate: ${contractData.carData?.dailyRate?.toLocaleString('en-US') || 'N/A'} VND` },
                { text: `Deposit: ${contractData.deposit.toLocaleString('en-US')} VND` },
                { text: `Location: ${contractData.carData?.location || 'N/A'}`, margin: [0, 0, 0, 20] },

                { text: 'CONTRACT INFORMATION', style: 'section' },
                { text: `Start Date: ${contractData.startDate}` },
                { text: `End Date: ${contractData.endDate}` },

                {
                    columns: [
                        {
                            width: '*',
                            text: [
                                { text: 'PARTY A:\n', style: 'section' },
                                { text: `Name: ${contractData.name}\n` },
                                { text: 'Signed online "verify code"', italics: true }
                            ]
                        },
                        {
                            width: '*',
                            text: [
                                { text: 'PARTY B:\n', style: 'section' },
                                { text: 'Name: Group2\n' },
                                { text: 'Signed!' }
                            ]
                        }
                    ]
                }
            ],
            styles: {
                header: { fontSize: 14, bold: true },
                subheader: { fontSize: 12, italics: true },
                title: { fontSize: 16, bold: true },
                section: { fontSize: 13, bold: true, margin: [0, 10, 0, 5] }
            },
            defaultStyle: {
                font: 'Roboto'
            }
        };

        return new Promise((resolve) => {
            pdfMake.createPdf(docDefinition).getBlob((blob) => {
                resolve(blob);
            });
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            setMessage('Please fill in all required information correctly');
            return;
        }

        if (!isVerified) {
            setMessage('Please verify your email before creating the contract');
            return;
        }

        const formattedData = {
            ...formData,
            deposit: parseFloat(formData.deposit) || 0,
            carId: parseInt(formData.carId) || 0,
            customerId: parseInt(formData.customerId) || 0
        };

        try {
            console.log('Sending contract data:', formattedData);
                const response = await axios.post(`${API_URL}/contracts`, formattedData);

            if (response.data) {
                setMessage('Contract created successfully!');
                console.log('Response data received:', response.data);
                
                // Generate PDF Blob
                const pdfBlob = await generatePDF(response.data);

                // Create a URL for the Blob
                const pdfUrl = API_URL.createObjectURL(pdfBlob);

                // Open PDF in a new tab
                window.open(pdfUrl, '_blank');

                // Create a temporary link to trigger download
                const link = document.createElement('a');
                link.href = pdfUrl;
                link.download = 'contract.pdf';
                link.click();

                // Clean up the Blob URL after a short delay
                setTimeout(() => {
                    API_URL.revokeObjectURL(pdfUrl);
                }, 100);

            } else {
                setMessage('Contract created successfully, but no response data received.');
            }
        } catch (error) {
            console.error('Contract creation error:', error.response?.data);
            setMessage('Error creating contract: ' + (error.response?.data?.error || error.message));
        }
    };

    return (
        <div className="contract-form-container">
            <h2>Create Contract</h2>
            {message && <div className={`message ${message.includes('successful') ? 'success' : 'error'}`}>{message}</div>}
            
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
                            <label>Type:</label>
                            <span>{contractData.carData.type}</span>
                        </div>
                        <div className="info-item">
                            <label>Daily Rate:</label>
                            <span>{contractData.carData.dailyRate.toLocaleString('en-US')} VND</span>
                        </div>
                        <div className="info-item">
                            <label>Location:</label>
                            <span>{contractData.carData.location}</span>
                        </div>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="contract-form">
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
                    <label>Customer ID:</label>
                    <input
                        type="text"
                        name="customerId"
                        value={formData.customerId}
                        onChange={handleChange}
                        className={errors.customerId ? 'error' : ''}
                        required
                    />
                    {errors.customerId && <div className="field-error">{errors.customerId}</div>}
                </div>

                <div className="form-group">
                    <label>Deposit (VND):</label>
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
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={errors.phone ? 'error' : ''}
                        required
                    />
                    {errors.phone && <div className="field-error">{errors.phone}</div>}
                </div>

                <div className="form-group">
                    <label>Email:</label>
                    <div className="email-verification-group">
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={errors.email ? 'error' : ''}
                            required
                        />
                        <button
                            type="button"
                            onClick={sendVerificationCode}
                            disabled={!formData.email || isCountingDown || isVerified}
                        >
                            {isCountingDown ? `Resend (${countdown}s)` : isVerified ? 'Verified' : 'Send Code'}
                        </button>
                    </div>
                    {errors.email && <div className="field-error">{errors.email}</div>}
                </div>

                {isCountingDown && (
                    <div className="verification-code-group">
                        <input
                            type="text"
                            placeholder="Enter verification code"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={verifyCode}
                            disabled={!verificationCode || isVerified}
                        >
                            Verify
                        </button>
                    </div>
                )}

                <div className="form-group checkbox-group">
                    <label>
                        <input
                            type="checkbox"
                            name="terms"
                            checked={formData.terms}
                            onChange={handleChange}
                            required
                        />
                        I agree to the terms and conditions
                    </label>
                </div>

                <button type="submit" className="submit-button" disabled={!isVerified}>
                    Create Contract
                </button>
            </form>
        </div>
    );
};

export default CarRentalContractForm; 