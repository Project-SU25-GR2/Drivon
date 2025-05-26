import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ContractForm = () => {
    const [formData, setFormData] = useState({
        contractNumber: '',
        startDate: '',
        endDate: '',
        carId: '',
        customerId: '',
        deposit: '',
        totalAmount: '',
        name: '',
        phone: '',
        cccd: '',
        email: '',
        terms: false
    });

    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState('');
    const [countdown, setCountdown] = useState(0);
    const [isCountingDown, setIsCountingDown] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');

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
                setErrors(prev => ({ ...prev, [name]: 'Số điện thoại phải có 10-11 chữ số' }));
                return;
            }
        }
        
        if (name === 'cccd' && value) {
            if (!/^[0-9]{12}$/.test(value)) {
                setErrors(prev => ({ ...prev, [name]: 'CCCD phải có 12 chữ số' }));
                return;
            }
        }
        
        if (name === 'email' && value) {
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                setErrors(prev => ({ ...prev, [name]: 'Email không hợp lệ' }));
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
            newErrors.contractNumber = 'Vui lòng nhập số hợp đồng';
        }
        if (!formData.startDate) {
            newErrors.startDate = 'Vui lòng chọn ngày bắt đầu';
        }
        if (!formData.endDate) {
            newErrors.endDate = 'Vui lòng chọn ngày kết thúc';
        }
        if (!formData.carId) {
            newErrors.carId = 'Vui lòng nhập mã xe';
        }
        if (!formData.customerId) {
            newErrors.customerId = 'Vui lòng nhập mã khách hàng';
        }
        if (!formData.deposit) {
            newErrors.deposit = 'Vui lòng nhập tiền cọc';
        }
        if (!formData.totalAmount) {
            newErrors.totalAmount = 'Vui lòng nhập tổng tiền';
        }
        if (!formData.name) {
            newErrors.name = 'Vui lòng nhập họ tên';
        }
        if (!formData.phone) {
            newErrors.phone = 'Vui lòng nhập số điện thoại';
        }
        if (!formData.cccd) {
            newErrors.cccd = 'Vui lòng nhập CCCD';
        }
        if (!formData.email) {
            newErrors.email = 'Vui lòng nhập email';
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
                setMessage('Mã xác thực đã được gửi đến email của bạn');
                setCountdown(120); // 2 minutes
                setIsCountingDown(true);
            }
        } catch (error) {
            setMessage('Lỗi khi gửi mã xác thực: ' + (error.response?.data?.error || error.message));
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
                setMessage('Xác thực thành công!');
            } else {
                setMessage('Mã xác thực không đúng');
            }
        } catch (error) {
            setMessage('Lỗi khi xác thực: ' + (error.response?.data?.error || error.message));
        }
    };

    const generatePDF = (contractData) => {
        const doc = new jsPDF();
        
        // Add title
        doc.setFontSize(20);
        doc.text('HỢP ĐỒNG THUÊ XE', 105, 20, { align: 'center' });
        
        // Add contract details
        doc.setFontSize(12);
        const details = [
            ['Số hợp đồng:', contractData.contractNumber],
            ['Ngày bắt đầu:', contractData.startDate],
            ['Ngày kết thúc:', contractData.endDate],
            ['Mã xe:', contractData.carId],
            ['Mã khách hàng:', contractData.customerId],
            ['Tiền cọc:', contractData.deposit.toLocaleString('vi-VN') + ' VNĐ'],
            ['Tổng tiền:', contractData.totalAmount.toLocaleString('vi-VN') + ' VNĐ'],
            ['Họ tên:', contractData.name],
            ['Số điện thoại:', contractData.phone],
            ['CCCD:', contractData.cccd],
            ['Email:', contractData.email]
        ];

        autoTable(doc, {
            startY: 30,
            head: [['Thông tin', 'Chi tiết']],
            body: details,
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185] }
        });

        // Add signature section
        doc.text('Chữ ký bên A', 50, doc.lastAutoTable.finalY + 20);
        doc.text('Chữ ký bên B', 150, doc.lastAutoTable.finalY + 20);

        // Return the PDF as a Blob instead of saving directly
        return doc.output('blob');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            setMessage('Vui lòng điền đầy đủ thông tin hợp lệ');
            return;
        }

        if (!isVerified) {
            setMessage('Vui lòng xác thực email trước khi tạo hợp đồng');
            return;
        }

        const formattedData = {
            ...formData,
            deposit: parseFloat(formData.deposit) || 0,
            totalAmount: parseFloat(formData.totalAmount) || 0,
            carId: parseInt(formData.carId) || 0,
            customerId: parseInt(formData.customerId) || 0
        };

        try {
            console.log('Sending contract data:', formattedData);
            const response = await axios.post('http://localhost:8080/api/contracts', formattedData);

            if (response.data) {
                setMessage('Tạo hợp đồng thành công!');
                console.log('Response data received:', response.data);
                
                // Generate PDF Blob
                const pdfBlob = generatePDF(response.data);

                // Create a URL for the Blob
                const pdfUrl = URL.createObjectURL(pdfBlob);

                // Open PDF in a new tab
                window.open(pdfUrl, '_blank');

                // Create a temporary link to trigger download
                const link = document.createElement('a');
                link.href = pdfUrl;
                link.download = 'hopdong.pdf'; // Set the desired filename
                link.click(); // Programmatically click the link to trigger download

                // Clean up the Blob URL after a short delay
                setTimeout(() => {
                    URL.revokeObjectURL(pdfUrl);
                }, 100);

            } else {
                 setMessage('Tạo hợp đồng thành công, nhưng không nhận được dữ liệu trả về.');
            }
        } catch (error) {
            console.error('Contract creation error:', error.response?.data);
            setMessage('Lỗi khi tạo hợp đồng: ' + (error.response?.data?.error || error.message));
        }
    };

    return (
        <div className="contract-form-container">
            <h2>Tạo Hợp Đồng</h2>
            {message && <div className={`message ${message.includes('thành công') ? 'success' : 'error'}`}>{message}</div>}
            
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Số hợp đồng:</label>
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
                    <label>Ngày bắt đầu:</label>
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
                    <label>Ngày kết thúc:</label>
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
                    <label>Mã xe:</label>
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
                    <label>Mã khách hàng:</label>
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
                    <label>Tiền cọc:</label>
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
                    <label>Tổng tiền:</label>
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
                    <label>Họ tên:</label>
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
                    <label>Số điện thoại:</label>
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
                    <label>CCCD:</label>
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
                        Gửi mã xác nhận
                    </button>
                    {isCountingDown && (
                        <span className="countdown">
                            {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
                        </span>
                    )}
                </div>

                <div className="form-group">
                    <label>Mã xác nhận:</label>
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
                            Xác nhận
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
                    Tạo Hợp Đồng
                </button>
            </form>
        </div>
    );
};

export default ContractForm; 