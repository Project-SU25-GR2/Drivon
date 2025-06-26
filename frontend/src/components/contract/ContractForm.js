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
        startDate: contractData?.startDate || '',
        endDate: contractData?.endDate || '',
        carId: contractData?.carId || '',
        customerId: contractData?.customerId || '',
        deposit: contractData?.deposit || '',
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
            // Tự động điền thông tin xe vào form
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
            const response = await axios.post(`${API_URL}/contracts/send-code`, {
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
            const response = await axios.post(`${API_URL}/contracts/verify-code`, {
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
        const docDefinition = {
            content: [
                { text: 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM', style: 'header', alignment: 'center' },
                { text: 'Độc lập – Tự do – Hạnh phúc', style: 'subheader', alignment: 'center' },
                { text: '-------------------------------', alignment: 'center', margin: [0, 0, 0, 10] },
                { text: 'HỢP ĐỒNG THUÊ XE', style: 'title', alignment: 'center', margin: [0, 10, 0, 0] },
                { text: `Ngày: ${new Date().toLocaleDateString('vi-VN')}`, alignment: 'center' },
                { text: `Số HĐ: ${contractData.contractNumber}`, alignment: 'center', margin: [0, 0, 0, 20] },

                { text: 'BÊN A', style: 'section' },
                { text: `Tên: ${contractData.name}` },
                { text: `Số điện thoại: ${contractData.phone}` },
                { text: `CCCD: ${contractData.cccd}` },
                { text: `Mail: ${contractData.email}`, margin: [0, 0, 0, 10] },

                { text: 'BÊN B', style: 'section' },
                { text: 'Tên: Cty TNHH Group2' },
                { text: 'Số điện thoại: 0394672210' },
                { text: 'Mail: Binhvuong221004@gmail.com', margin: [0, 0, 0, 20] },

                { text: 'THÔNG TIN XE', style: 'section' },
                { text: `Hãng xe: ${contractData.carData?.carBrand || 'N/A'}` },
                { text: `Model: ${contractData.carData?.carModel || 'N/A'}` },
                { text: `Năm sản xuất: ${contractData.carData?.year || 'N/A'}` },
                { text: `Biển số xe: ${contractData.carData?.licensePlate || 'N/A'}` },
                { text: `Giá thuê/ngày: ${contractData.carData?.dailyRate?.toLocaleString('vi-VN') || 'N/A'} VND` },
                { text: `Tiền cọc: ${contractData.deposit.toLocaleString('vi-VN')} VNĐ` },
                { text: `Địa điểm: ${contractData.carData?.location || 'N/A'}`, margin: [0, 0, 0, 20] },

                { text: 'THÔNG TIN HỢP ĐỒNG', style: 'section' },
                { text: `Ngày bắt đầu: ${contractData.startDate}` },
                { text: `Ngày kết thúc: ${contractData.endDate}` },

                {
                    columns: [
                        {
                            width: '*',
                            text: [
                                { text: 'BÊN A:\n', style: 'section' },
                                { text: `Tên: ${contractData.name}\n` },
                                { text: 'Đã ký online "verify code"', italics: true }
                            ]
                        },
                        {
                            width: '*',
                            text: [
                                { text: 'BÊN B:\n', style: 'section' },
                                { text: 'Tên: Group2\n' },
                                { text: 'Đã ký!' }
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
            carId: parseInt(formData.carId) || 0,
            customerId: parseInt(formData.customerId) || 0
        };

        try {
            console.log('Sending contract data:', formattedData);
                const response = await axios.post(`${API_URL}/contracts`, formattedData);

            if (response.data) {
                setMessage('Tạo hợp đồng thành công!');
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
                link.download = 'hopdong.pdf';
                link.click();

                // Clean up the Blob URL after a short delay
                setTimeout(() => {
                    API_URL.revokeObjectURL(pdfUrl);
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
            
            {contractData?.carData && (
                <div className="car-info-section">
                    <h3>Thông Tin Xe</h3>
                    <div className="info-grid">
                        <div className="info-item">
                            <label>Hãng xe:</label>
                            <span>{contractData.carData.carBrand}</span>
                        </div>
                        <div className="info-item">
                            <label>Model:</label>
                            <span>{contractData.carData.carModel}</span>
                        </div>
                        <div className="info-item">
                            <label>Năm sản xuất:</label>
                            <span>{contractData.carData.year}</span>
                        </div>
                        <div className="info-item">
                            <label>Biển số xe:</label>
                            <span>{contractData.carData.licensePlate}</span>
                        </div>
                        <div className="info-item">
                            <label>Type:</label>
                            <span>{contractData.carData.type}</span>
                        </div>
                        <div className="info-item">
                            <label>Giá thuê/ngày:</label>
                            <span>{contractData.carData.dailyRate.toLocaleString('vi-VN')} VND</span>
                        </div>
                        <div className="info-item">
                            <label>Địa điểm:</label>
                            <span>{contractData.carData.location}</span>
                        </div>
                    </div>
                    {contractData.carData.images && contractData.carData.images.length > 0 && (
                        <div className="car-images">
                            <h4>Hình ảnh xe:</h4>
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

export default CarRentalContractForm; 