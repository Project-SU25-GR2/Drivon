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
        doc.text('CONG HOA XA HOI CHU NGHIA VIET NAM', 105, 20, { align: 'center' });
        doc.text('Doc lap - Tu do - Hanh phuc', 105, 30, { align: 'center' });
        doc.text('------------------------------', 105, 40, { align: 'center' });
        doc.text('HOP DONG CHO THUE XE', 105, 50, { align: 'center' });

        // Add date
        const today = new Date();
        doc.setFontSize(12);
        doc.text(`Ngay ${today.getDate()} thang ${today.getMonth() + 1} nam ${today.getFullYear()}`, 20, 70);
        doc.text(`So: ${contractData.contractNumber}`, 20, 80);

        // Add Party A
        let currentY = 100;
        doc.text('BEN A', 20, currentY);
        currentY += 10;
        doc.text(`Ten: ${contractData.name}`, 20, currentY);
        currentY += 10;
        doc.text(`So dien thoai: ${contractData.phone}`, 20, currentY);
        currentY += 10;
        doc.text(`CCCD: ${contractData.cccd}`, 20, currentY);
        currentY += 10;
        doc.text(`Mail: ${contractData.email}`, 20, currentY);

        // Add Party B
        currentY += 20;
        doc.text('BEN B', 20, currentY);
        currentY += 10;
        doc.text('Ten: Cty TNHH Group2', 20, currentY);
        currentY += 10;
        doc.text('So dien thoai: 0394672210', 20, currentY);
        currentY += 10;
        doc.text('Mail: Binhvuong221004@gmail.com', 20, currentY);

        // Add agreement section
        currentY += 20;
        doc.text('Dong y voi dieu khoan:', 20, currentY);
        currentY += 20;

        // Add signatures
        doc.text('BEN A:', 20, currentY);
        doc.text('BEN B:', 120, currentY);
        currentY += 10;
        doc.text(`Ten: ${contractData.name}`, 20, currentY);
        doc.text('Group2', 120, currentY);
        currentY += 10;
        doc.text(`Ma xac nhan: ${contractData.verificationCode}`, 20, currentY);
        doc.text('Da ki!', 120, currentY);

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
        <div className="admin-dashboard">
            <div className="sidebar">
                <div className="sidebar-header">
                    {/* Logo and Adminator text */}
                    <img src="/path/to/your/logo.png" alt="Logo" className="logo"/> {/* Replace with actual path */}
                    <span>Adminator</span>
                </div>
                <ul className="sidebar-nav">
                    <li><a href="#"><i className="fas fa-tachometer-alt"></i> Dashboard</a></li> {/* Replace i classes with actual icon classes */}
                    <li><a href="#"><i className="fas fa-envelope"></i> Email</a></li>
                    <li><a href="#"><i className="fas fa-edit"></i> Compose</a></li>
                    <li><a href="#"><i className="fas fa-calendar-alt"></i> Calendar</a></li>
                    <li><a href="#"><i className="fas fa-comments"></i> Chat</a></li>
                    <li><a href="#"><i className="fas fa-chart-bar"></i> Charts</a></li>
                    <li><a href="#"><i className="fas fa-file-alt"></i> Forms</a></li>
                    <li><a href="#"><i className="fas fa-cube"></i> UI Elements</a></li>
                    <li><a href="#"><i className="fas fa-table"></i> Tables</a></li>
                    <li><a href="#"><i className="fas fa-map"></i> Maps</a></li>
                    <li><a href="#"><i className="fas fa-file"></i> Pages</a></li>
                    <li><a href="#"><i className="fas fa-layer-group"></i> Multiple Levels</a></li>
                </ul>
            </div>
            <div className="main-content">
                {/* Header will go here */}
                <div className="header">
                    <div className="header-left">
                        <i className="fas fa-bars"></i> {/* Menu icon */}
                        <i className="fas fa-search"></i> {/* Search icon */}
                    </div>
                    <div className="header-right">
                        <div className="header-icons">
                            <i className="fas fa-bell"></i> {/* Notification icon */}
                            <i className="fas fa-envelope"></i> {/* Message icon */}
                        </div>
                        <div className="user-profile">
                            <img src="/path/to/user/avatar.jpg" alt="User Avatar" className="user-avatar"/> {/* Replace with actual path */}
                            <span>John Doe</span> {/* Replace with actual user name */}
                            <i className="fas fa-chevron-down"></i> {/* Dropdown icon */}
                        </div>
                    </div>
                </div>
                {/* Dashboard content will go here */}
                <div className="dashboard-content">
                    {/* This is where the cards, map, charts etc. will be added */}
                    {/* The existing user table will be moved or adapted later */}
                    <h3>Dashboard Overview</h3>
                    {/* Placeholder for dashboard content */}
                    <p>Content will be added here according to the image.</p>
                </div>
            </div>
        </div>
    );
};

export default CarLeaseContractForm; 