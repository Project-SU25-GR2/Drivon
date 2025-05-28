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
        if (!formData.ownerId) {
            newErrors.ownerId = 'Vui lòng nhập mã chủ xe';
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
                setCountdown(120);
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
        
        // Add header
        doc.setFontSize(20);
        doc.text('CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM', 105, 20, { align: 'center' });
        doc.setFontSize(16);
        doc.text('Độc lập - Tự do - Hạnh phúc', 105, 30, { align: 'center' });
        doc.setFontSize(20);
        doc.text('HỢP ĐỒNG CHO THUÊ XE', 105, 45, { align: 'center' });

        // Add contract number and date
        doc.setFontSize(12);
        doc.text(`Số: ${contractData.contractNumber}`, 20, 60);
        doc.text(`Ngày: ${new Date().toLocaleDateString('vi-VN')}`, 150, 60);

        // Add parties
        let currentY = 80;
        doc.setFontSize(12);
        doc.text('BÊN CHO THUÊ (BÊN A):', 20, currentY);
        currentY += 10;
        doc.text('CÔNG TY TNHH DRIVON', 20, currentY);
        currentY += 10;
        doc.text('Địa chỉ: 123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh', 20, currentY);
        currentY += 10;
        doc.text('Mã số thuế: 0123456789', 20, currentY);
        currentY += 10;
        doc.text('Đại diện: Nguyễn Văn A - Chức vụ: Giám đốc', 20, currentY);

        currentY += 30;
        doc.text('BÊN THUÊ (BÊN B):', 20, currentY);
        currentY += 10;
        doc.text(`Họ và tên: ${contractData.name}`, 20, currentY);
        currentY += 10;
        doc.text(`Số CCCD: ${contractData.cccd}`, 20, currentY);
        currentY += 10;
        doc.text(`Địa chỉ: ${contractData.address || 'Chưa cập nhật'}`, 20, currentY);
        currentY += 10;
        doc.text(`Số điện thoại: ${contractData.phone}`, 20, currentY);
        currentY += 10;
        doc.text(`Email: ${contractData.email}`, 20, currentY);

        // Add car information
        currentY += 20;
        doc.text('THÔNG TIN XE CHO THUÊ:', 20, currentY);
        currentY += 10;
        doc.text(`Hãng xe: ${contractData.carData.carBrand}`, 20, currentY);
        currentY += 10;
        doc.text(`Model: ${contractData.carData.carModel}`, 20, currentY);
        currentY += 10;
        doc.text(`Năm sản xuất: ${contractData.carData.year}`, 20, currentY);
        currentY += 10;
        doc.text(`Biển số xe: ${contractData.carData.licensePlate}`, 20, currentY);
        currentY += 10;
        doc.text(`Giá thuê/ngày: ${contractData.carData.dailyRate.toLocaleString('vi-VN')} VND`, 20, currentY);
        currentY += 10;
        doc.text(`Địa điểm: ${contractData.carData.location}`, 20, currentY);
        currentY += 10;

        // Add car images
        if (contractData.carData.images && contractData.carData.images.length > 0) {
            currentY += 10;
            doc.text('Hình ảnh xe:', 20, currentY);
            currentY += 10;
            const imageWidth = 60; // Max width for each image
            const imageHeight = 40; // Max height for each image
            let startX = 20;
            const imageGap = 5;

            for (const imageUrl of contractData.carData.images) {
                const img = new Image();
                img.crossOrigin = 'Anonymous'; // To avoid CORS issues
                img.onload = () => {
                    const aspectRatio = img.width / img.height;
                    let displayWidth = imageWidth;
                    let displayHeight = imageHeight;

                    if (aspectRatio > 1) { // Wide image
                        displayHeight = imageWidth / aspectRatio;
                    } else { // Tall or square image
                        displayWidth = imageHeight * aspectRatio;
                    }
                    
                    // Add image, center vertically within the allocated height if needed
                    const imageY = currentY + (imageHeight - displayHeight) / 2;

                    // Check if adding image goes beyond page bottom
                    if (imageY + displayHeight > doc.internal.pageSize.height - 20) {
                        doc.addPage();
                        currentY = 20; // Reset Y position for new page
                        startX = 20; // Reset X position for new page
                        // Recalculate imageY for the new page
                        const imageY = currentY + (imageHeight - displayHeight) / 2;
                         doc.addImage(img, 'JPEG', startX, imageY, displayWidth, displayHeight);
                         startX += displayWidth + imageGap; // Move X for next image
                    } else {
                        doc.addImage(img, 'JPEG', startX, imageY, displayWidth, displayHeight);
                         startX += displayWidth + imageGap; // Move X for next image
                    }
                   
                };
                 img.onerror = () => {
                     console.error('Error loading image for PDF:', imageUrl);
                     // Optionally add a placeholder text
                     doc.text('Image failed to load', startX, currentY + imageHeight / 2);
                      startX += imageWidth + imageGap; // Move X even if image fails
                 };
                img.src = imageUrl;
            }
            currentY += imageHeight + 10; // Move Y down after adding images
        }

        // Add contract terms
        currentY += 10;
        doc.text('ĐIỀU KHOẢN HỢP ĐỒNG:', 20, currentY);
        currentY += 10;
        doc.setFontSize(11);
        doc.text('1. Thời hạn hợp đồng:', 20, currentY);
        currentY += 10;
        doc.text(`- Ngày bắt đầu: ${contractData.startDate}`, 30, currentY);
        currentY += 10;
        doc.text(`- Ngày kết thúc: ${contractData.endDate}`, 30, currentY);

        currentY += 20;
        doc.text('2. Giá trị hợp đồng:', 20, currentY);
        currentY += 10;
        doc.text(`- Tiền cọc: ${contractData.deposit.toLocaleString('vi-VN')} VND`, 30, currentY);
        currentY += 10;
        doc.text(`- Tổng tiền: ${contractData.totalAmount.toLocaleString('vi-VN')} VND`, 30, currentY);

        currentY += 20;
        doc.text('3. Quyền và nghĩa vụ của bên A:', 20, currentY);
        currentY += 10;
        doc.text('- Cung cấp xe đúng thông tin đã cam kết', 30, currentY);
        currentY += 10;
        doc.text('- Bảo dưỡng, sửa chữa xe định kỳ', 30, currentY);
        currentY += 10;
        doc.text('- Hỗ trợ khách hàng 24/7', 30, currentY);

        currentY += 20;
        doc.text('4. Quyền và nghĩa vụ của bên B:', 20, currentY);
        currentY += 10;
        doc.text('- Sử dụng xe đúng mục đích', 30, currentY);
        currentY += 10;
        doc.text('- Bảo quản xe cẩn thận', 30, currentY);
        currentY += 10;
        doc.text('- Thanh toán đầy đủ theo thỏa thuận', 30, currentY);
        currentY += 20; // Add space before signatures

        // Add signatures
        const signatureY = currentY + 30; // Position signatures below terms
        doc.text('Đại diện bên A', 50, signatureY);
        doc.text('Đại diện bên B', 150, signatureY);

        // Add signature lines
        doc.line(30, signatureY + 10, 100, signatureY + 10);
        doc.line(130, signatureY + 10, 200, signatureY + 10);

        // Add stamp and seal (adjust positions as needed)
        const stampImage = new Image();
        stampImage.crossOrigin = 'Anonymous';
        stampImage.onload = () => {
             doc.addImage(stampImage, 'PNG', 40, signatureY - 25, 30, 30);
        };
        stampImage.onerror = () => {
            console.error('Error loading stamp image for PDF');
        };
        stampImage.src = '/images/stamp.png';
        
        const sealImage = new Image();
        sealImage.crossOrigin = 'Anonymous';
         sealImage.onload = () => {
            doc.addImage(sealImage, 'PNG', 140, signatureY - 25, 30, 30);
        };
        sealImage.onerror = () => {
            console.error('Error loading seal image for PDF');
        };
        sealImage.src = '/images/seal.png';


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
            ownerId: parseInt(formData.ownerId) || 0
        };

        try {
            // Get auth token from localStorage
            const user = JSON.parse(localStorage.getItem('user'));
            const authToken = user?.token;

            console.log('User data from localStorage:', user);
            console.log('Auth Token:', authToken);

            if (!authToken) {
                setMessage('Vui lòng đăng nhập để tạo hợp đồng.');
                console.error('Auth token is missing or invalid.');
                return;
            }

            const response = await axios.post('http://localhost:8080/api/contracts/lease', formattedData, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            if (response.data) {
                setMessage('Tạo hợp đồng thành công!');
                
                const pdfBlob = generatePDF(response.data);
                const pdfUrl = URL.createObjectURL(pdfBlob);
                window.open(pdfUrl, '_blank');

                const link = document.createElement('a');
                link.href = pdfUrl;
                link.download = 'hopdong_chothuexe.pdf';
                link.click();

                setTimeout(() => {
                    URL.revokeObjectURL(pdfUrl);
                }, 100);
            }
        } catch (error) {
            setMessage('Lỗi khi tạo hợp đồng: ' + (error.response?.data?.error || error.message));
        }
    };

    return (
        <div className="contract-form-container">
            <h2>Hợp Đồng Cho Thuê Xe</h2>
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
                    <label>Mã chủ xe:</label>
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
                    <label>Họ tên chủ xe:</label>
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

export default CarLeaseContractForm; 