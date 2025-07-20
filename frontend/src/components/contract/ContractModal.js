import React, { useState } from 'react';
import { Modal, Checkbox, Button, message } from 'antd';
import { DownloadOutlined, EyeOutlined, CloseOutlined } from '@ant-design/icons';
import './ContractModal.css';

const ContractModal = ({ visible, onClose, onContinue, contractData }) => {
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);

    const handleDownload = async () => {
        try {
            // Kiểm tra xem PDFMake đã được load chưa
            if (!window.pdfMake) {
                throw new Error('PDFMake chưa được load. Vui lòng refresh trang và thử lại.');
            }

            const docDefinition = {
                content: [
                    // Header
                    {
                        text: 'HỢP ĐỒNG THUÊ XE Ô TÔ',
                        style: 'header',
                        alignment: 'center'
                    },
                    {
                        text: '(Số: ......................./HĐTX)',
                        style: 'normal',
                        alignment: 'center'
                    },
                    { text: '\n' },
                    
                    // Date and location
                    {
                        text: 'Hôm nay, ngày ....................... tháng ....................... năm ......................., tại ........................',
                        style: 'normal'
                    },
                    { text: 'Chúng tôi gồm có:\n' },
                    
                    // Party A
                    {
                        text: 'BÊN CHO THUÊ (BÊN A):',
                        style: 'sectionHeader'
                    },
                    {
                        ul: [
                            'Cá nhân: Ông/Bà .......................',
                            'Sinh ngày: .......................',
                            'CMND/CCCD số: ....................... do ....................... cấp ngày .......................',
                            'Địa chỉ thường trú: .......................',
                            'Số điện thoại liên hệ: .......................',
                            'Email: .......................',
                            'Số tài khoản ngân hàng: ....................... tại Ngân hàng .......................'
                        ],
                        style: 'list'
                    },
                    { text: '\n' },
                    
                    // Party B
                    {
                        text: 'BÊN THUÊ (BÊN B):',
                        style: 'sectionHeader'
                    },
                    {
                        ul: [
                            'Cá nhân: Ông/Bà .......................',
                            'Sinh ngày: .......................',
                            'CMND/CCCD số: ....................... do ....................... cấp ngày .......................',
                            'Giấy phép lái xe hạng: ....................... số ....................... có giá trị đến .......................',
                            'Địa chỉ thường trú: .......................',
                            'Số điện thoại liên hệ: .......................',
                            'Email: .......................'
                        ],
                        style: 'list'
                    },
                    { text: '\n' },
                    
                    // Contract content
                    {
                        text: 'Sau khi bàn bạc, hai bên thống nhất ký kết Hợp đồng thuê xe ô tô (sau đây gọi tắt là "Hợp đồng") với các điều khoản và điều kiện chi tiết như sau:\n',
                        style: 'normal'
                    },
                    
                    // Article 1
                    {
                        text: 'ĐIỀU 1: ĐỐI TƯỢNG CỦA HỢP ĐỒNG',
                        style: 'sectionHeader'
                    },
                    {
                        text: '1.1. Bên A đồng ý cho Bên B thuê và Bên B đồng ý thuê 01 (một) xe ô tô (sau đây gọi là "Xe") với các đặc điểm sau:',
                        style: 'normal'
                    },
                    {
                        ul: [
                            `Loại xe: ${contractData?.carBrand || '.......................'} ${contractData?.carModel || '.......................'}`,
                            `Màu sơn: ${contractData?.carColor || '.......................'}`,
                            `Biển số đăng ký: ${contractData?.carPlate || '.......................'}`,
                            `Số khung: ${contractData?.carVin || '.......................'}`,
                            `Số máy: ${contractData?.carEngine || '.......................'}`
                        ],
                        style: 'list'
                    },
                    {
                        text: '1.2. Tình trạng Xe khi bàn giao được mô tả chi tiết tại Biên bản bàn giao xe (Phụ lục 01 đính kèm Hợp đồng này và là một phần không thể tách rời của Hợp đồng).',
                        style: 'normal'
                    },
                    
                    // Article 2
                    {
                        text: 'ĐIỀU 2: THỜI HẠN THUÊ VÀ MỤC ĐÍCH SỬ DỤNG',
                        style: 'sectionHeader'
                    },
                    {
                        text: '2.1. Thời hạn thuê:',
                        style: 'normal'
                    },
                    {
                        ul: [
                            `Thời gian thuê là: ${contractData?.rentalDays || '.......................'} ngày/tháng`,
                            `Bắt đầu từ: ${formatDate(contractData?.startDate)}`,
                            `Kết thúc vào: ${formatDate(contractData?.endDate)}`
                        ],
                        style: 'list'
                    },
                    {
                        text: '2.2. Gia hạn: Nếu Bên B có nhu cầu gia hạn Hợp đồng, phải thông báo cho Bên A trước ít nhất ....................... giờ/ngày trước khi Hợp đồng hết hạn.',
                        style: 'normal'
                    },
                    {
                        text: '2.3. Mục đích sử dụng: Bên B thuê xe để ........................ Bên B cam kết không sử dụng xe vào các mục đích vi phạm pháp luật.',
                        style: 'normal'
                    },
                    
                    // Article 3
                    {
                        text: 'ĐIỀU 3: GIÁ THUÊ, ĐẶT CỌC VÀ PHƯƠNG THỨC THANH TOÁN',
                        style: 'sectionHeader'
                    },
                    {
                        text: '3.1. Giá thuê:',
                        style: 'normal'
                    },
                    {
                        ul: [
                            `Đơn giá thuê là: ${formatPrice(contractData?.dailyPrice)}/ngày (Bằng chữ: .......................)`,
                            `Tổng giá trị Hợp đồng (tạm tính): ${formatPrice(contractData?.totalPrice)} (Bằng chữ: .......................)`,
                            'Giá thuê trên chưa bao gồm thuế GTGT (nếu có), chi phí nhiên liệu, phí cầu đường, phí đỗ xe, và các khoản phạt vi phạm giao thông (nếu có).',
                            'Phụ phí vượt giờ: Nếu Bên B trả xe muộn so với thời gian quy định tại Điều 2, Bên B sẽ phải thanh toán thêm một khoản phí vượt giờ là ....................... VNĐ/giờ. Nếu quá ....................... giờ sẽ được tính tròn 01 (một) ngày thuê.',
                            'Phụ phí vượt km (nếu có): Hợp đồng giới hạn số km di chuyển là ....................... km/ngày. Nếu vượt quá, Bên B phải trả thêm ....................... VNĐ/km.'
                        ],
                        style: 'list'
                    },
                    {
                        text: '3.2. Tiền đặt cọc:',
                        style: 'normal'
                    },
                    {
                        ul: [
                            `Bên B phải đặt cọc cho Bên A một khoản tiền là ${formatPrice(contractData?.deposit)} (Bằng chữ: .......................) VÀ/HOẶC tài sản thế chấp là ........................`,
                            'Khoản tiền/tài sản đặt cọc này sẽ được Bên A hoàn trả đầy đủ cho Bên B sau khi Bên B đã thanh toán toàn bộ tiền thuê và các chi phí phát sinh (nếu có), đồng thời bàn giao lại xe trong tình trạng như lúc nhận.'
                        ],
                        style: 'list'
                    },
                    {
                        text: '3.3. Phương thức thanh toán:',
                        style: 'normal'
                    },
                    {
                        ul: [
                            'Thanh toán tiền thuê: Bên B thanh toán cho Bên A ....................... tổng giá trị Hợp đồng ngay khi ký kết. Số tiền còn lại sẽ được thanh toán khi Bên B trả xe.',
                            'Hình thức thanh toán: Tiền mặt hoặc chuyển khoản vào tài khoản ngân hàng của Bên A tại thông tin nêu trên.'
                        ],
                        style: 'list'
                    },
                    
                    // Article 4
                    {
                        text: 'ĐIỀU 4: QUYỀN VÀ NGHĨA VỤ CỦA BÊN A',
                        style: 'sectionHeader'
                    },
                    {
                        text: '4.1. Quyền của Bên A:',
                        style: 'normal'
                    },
                    {
                        ul: [
                            'Nhận đủ tiền thuê và tiền đặt cọc theo thỏa thuận tại Điều 3.',
                            'Yêu cầu Bên B bồi thường thiệt hại nếu xe bị hư hỏng, mất mát do lỗi của Bên B.',
                            'Đơn phương chấm dứt Hợp đồng và thu hồi xe ngay lập tức nếu Bên B vi phạm nghiêm trọng các nghĩa vụ nêu trong Hợp đồng (sử dụng xe sai mục đích, không trả tiền thuê, tự ý sửa chữa, cầm cố xe...).'
                        ],
                        style: 'list'
                    },
                    {
                        text: '4.2. Nghĩa vụ của Bên A:',
                        style: 'normal'
                    },
                    {
                        ul: [
                            'Bàn giao Xe và toàn bộ giấy tờ liên quan (bản sao công chứng Giấy đăng ký xe, bản gốc Giấy chứng nhận kiểm định, bản gốc Giấy bảo hiểm TNDS) cho Bên B đúng thời gian, địa điểm và trong tình trạng kỹ thuật tốt, đảm bảo an toàn vận hành.',
                            'Chịu trách nhiệm pháp lý về nguồn gốc và quyền sở hữu của Xe.',
                            'Hướng dẫn Bên B các tính năng cơ bản của Xe.',
                            'Hoàn trả tiền/tài sản đặt cọc cho Bên B sau khi đã trừ các chi phí hợp lý (nếu có) khi kết thúc Hợp đồng.',
                            'Chịu trách nhiệm chi trả chi phí bảo dưỡng, sửa chữa các hư hỏng do lỗi kỹ thuật của bản thân chiếc xe.'
                        ],
                        style: 'list'
                    },
                    
                    // Article 5
                    {
                        text: 'ĐIỀU 5: QUYỀN VÀ NGHĨA VỤ CỦA BÊN B',
                        style: 'sectionHeader'
                    },
                    {
                        text: '5.1. Quyền của Bên B:',
                        style: 'normal'
                    },
                    {
                        ul: [
                            'Nhận xe và giấy tờ đúng theo thỏa thuận.',
                            'Được toàn quyền sử dụng Xe trong thời hạn thuê và đúng mục đích đã thỏa thuận.',
                            'Yêu cầu Bên A sửa chữa kịp thời các hư hỏng không do lỗi của mình gây ra.'
                        ],
                        style: 'list'
                    },
                    {
                        text: '5.2. Nghĩa vụ của Bên B:',
                        style: 'normal'
                    },
                    {
                        ul: [
                            'Thanh toán đầy đủ tiền thuê và các chi phí phát sinh (nếu có).',
                            'Xuất trình đầy đủ CMND/CCCD, Giấy phép lái xe hợp lệ.',
                            'Chịu trách nhiệm quản lý, bảo quản xe và các giấy tờ liên quan trong suốt thời gian thuê.',
                            'Tự chi trả toàn bộ chi phí nhiên liệu, phí cầu đường, bến bãi, và các chi phí khác phát sinh trong quá trình sử dụng xe.',
                            'Chịu hoàn toàn trách nhiệm trước pháp luật nếu gây ra tai nạn giao thông, vi phạm luật giao thông đường bộ (bao gồm cả phạt nguội). Bên A sẽ cung cấp thông tin của Bên B cho cơ quan chức năng khi có yêu cầu.',
                            'Không được cho thuê lại, giao xe cho người không có trong Hợp đồng điều khiển (trừ khi có sự đồng ý bằng văn bản của Bên A).',
                            'Không được sử dụng xe để cầm cố, thế chấp, bán hoặc thực hiện các hành vi trái pháp luật khác.',
                            'Không được tự ý tháo dỡ, thay đổi kết cấu, phụ kiện của xe. Nếu xe gặp sự cố kỹ thuật, phải báo ngay cho Bên A để phối hợp giải quyết. Không tự ý sửa chữa trừ trường hợp khẩn cấp và có sự đồng ý của Bên A.',
                            'Bàn giao lại xe đúng thời gian, địa điểm, với tình trạng kỹ thuật và vệ sinh như khi nhận.'
                        ],
                        style: 'list'
                    },
                    
                    // Article 6
                    {
                        text: 'ĐIỀU 6: TRÁCH NHIỆM BỒI THƯỜNG THIỆT HẠI',
                        style: 'sectionHeader'
                    },
                    {
                        text: '6.1. Trường hợp tai nạn, hư hỏng:',
                        style: 'normal'
                    },
                    {
                        ul: [
                            'Bên B phải có trách nhiệm giữ nguyên hiện trường, báo ngay cho cơ quan công an nơi gần nhất và thông báo cho Bên A để cùng giải quyết.',
                            'Nếu lỗi thuộc về Bên B, Bên B phải chịu toàn bộ chi phí sửa chữa, khắc phục thiệt hại. Trong trường hợp xe được bảo hiểm chi trả, Bên B phải chịu phần chi phí mà bảo hiểm không chi trả (mức miễn thường) và toàn bộ chi phí thiệt hại về giá trị của xe (nếu có) và tiền thuê xe trong những ngày xe phải vào xưởng sửa chữa.',
                            'Nếu lỗi không thuộc về Bên B, Bên B không phải chịu trách nhiệm bồi thường.'
                        ],
                        style: 'list'
                    },
                    {
                        text: '6.2. Trường hợp mất mát:',
                        style: 'normal'
                    },
                    {
                        ul: [
                            'Nếu Bên B làm mất xe hoặc các phụ kiện, giấy tờ đi kèm, Bên B phải bồi thường 100% giá trị của xe/phụ kiện/giấy tờ tại thời điểm mất mát. Giá trị xe được xác định theo giá thị trường.'
                        ],
                        style: 'list'
                    },
                    
                    // Article 7
                    {
                        text: 'ĐIỀU 7: CHẤM DỨT HỢP ĐỒNG',
                        style: 'sectionHeader'
                    },
                    {
                        text: '7.1. Hợp đồng này chấm dứt khi:',
                        style: 'normal'
                    },
                    {
                        ul: [
                            'Hết thời hạn thuê và hai bên đã hoàn thành mọi nghĩa vụ.',
                            'Hai bên thỏa thuận chấm dứt trước hạn.',
                            'Một trong hai bên đơn phương chấm dứt Hợp đồng do có sự vi phạm của bên còn lại theo quy định tại Hợp đồng này.'
                        ],
                        style: 'list'
                    },
                    
                    // Article 8
                    {
                        text: 'ĐIỀU 8: GIẢI QUYẾT TRANH CHẤP',
                        style: 'sectionHeader'
                    },
                    {
                        text: 'Mọi tranh chấp phát sinh từ Hợp đồng này sẽ được giải quyết trước hết thông qua thương lượng, hòa giải. Nếu không thể giải quyết được, một trong hai bên có quyền khởi kiện tại Tòa án nhân dân có thẩm quyền để giải quyết theo quy định của pháp luật.',
                        style: 'normal'
                    },
                    
                    // Article 9
                    {
                        text: 'ĐIỀU 9: CAM KẾT CHUNG',
                        style: 'sectionHeader'
                    },
                    {
                        text: '9.1. Hai bên cam kết thực hiện đúng và đầy đủ các điều khoản đã thỏa thuận trong Hợp đồng.',
                        style: 'normal'
                    },
                    {
                        text: '9.2. Mọi sửa đổi, bổ sung Hợp đồng phải được lập thành văn bản và có chữ ký của cả hai bên.',
                        style: 'normal'
                    },
                    {
                        text: '9.3. Hợp đồng này được lập thành 02 (hai) bản, có giá trị pháp lý như nhau, mỗi bên giữ 01 (một) bản.',
                        style: 'normal'
                    },
                    {
                        text: '9.4. Hợp đồng có hiệu lực kể từ thời điểm ký kết.',
                        style: 'normal'
                    },
                    
                    // Chữ ký
                    { text: '\n\n' },
                    {
                        text: 'BÊN GIAO (BÊN A)                    BÊN NHẬN (BÊN B)',
                        style: 'normal',
                        alignment: 'center'
                    },
                    {
                        text: '(Ký, ghi rõ họ tên)                 (Ký, ghi rõ họ tên)',
                        style: 'normal',
                        alignment: 'center'
                    },
                    { text: '\n' },
                    
                    // Phụ lục
                    { text: '\n\n' },
                    {
                        text: 'PHỤ LỤC 01: BIÊN BẢN BÀN GIAO XE',
                        style: 'appendixHeader',
                        alignment: 'center'
                    },
                    {
                        text: `(Đính kèm Hợp đồng thuê xe số: ${new Date().toLocaleDateString('vi-VN').replace(/\//g, '')}/HĐTX)`,
                        style: 'normal',
                        alignment: 'left'
                    },
                    { text: '\n' },
                    
                    // I. THÔNG TIN BÀN GIAO
                    {
                        text: 'I. THÔNG TIN BÀN GIAO',
                        style: 'sectionHeader'
                    },
                    {
                        ul: [
                            `Thời gian bàn giao: ${formatDate(contractData?.startDate)}`,
                            `Thời gian nhận lại (dự kiến): ${formatDate(contractData?.endDate)}`,
                            `Địa điểm bàn giao: ${contractData?.pickupLocation || '.......................'}`,
                            `Số km hiện tại (ODO): ${contractData?.currentKm || '.......................'}`,
                            `Tình trạng nhiên liệu: ${contractData?.fuelStatus || '.......................'}`
                        ],
                        style: 'list'
                    },
                    { text: '\n' },
                    
                    // II. KIỂM TRA TÌNH TRẠNG XE
                    {
                        text: 'II. KIỂM TRA TÌNH TRẠNG XE (Đánh dấu x vào ô tương ứng)',
                        style: 'sectionHeader'
                    },
                    {
                        table: {
                            headerRows: 1,
                            widths: ['*', '*', '*', '*'],
                            body: [
                                [
                                    { text: 'Hạng mục', style: 'tableHeader' },
                                    { text: 'Tình trạng lúc giao', style: 'tableHeader' },
                                    { text: 'Tình trạng lúc nhận', style: 'tableHeader' },
                                    { text: 'Ghi chú', style: 'tableHeader' }
                                ],
                                [
                                    'Ngoại thất - Sơn xe',
                                    '[ ] Tốt / [ ] Có xước',
                                    '[ ] Tốt / [ ] Có xước',
                                    '(Mô tả vị trí)'
                                ],
                                [
                                    'Đèn pha, đèn hậu',
                                    '[ ] Tốt',
                                    '[ ] Tốt',
                                    ''
                                ],
                                [
                                    'Gương chiếu hậu',
                                    '[ ] Tốt',
                                    '[ ] Tốt',
                                    ''
                                ],
                                [
                                    'Lốp xe (4 bánh)',
                                    '[ ] Tốt',
                                    '[ ] Tốt',
                                    ''
                                ],
                                [
                                    'Lốp dự phòng & dụng cụ',
                                    '[ ] Có đủ',
                                    '[ ] Có đủ',
                                    ''
                                ],
                                [
                                    'Nội thất - Ghế ngồi',
                                    '[ ] Sạch / [ ] Bẩn',
                                    '[ ] Sạch / [ ] Bẩn',
                                    ''
                                ],
                                [
                                    'Hệ thống điều hòa',
                                    '[ ] Hoạt động tốt',
                                    '[ ] Hoạt động tốt',
                                    ''
                                ],
                                [
                                    'Hệ thống âm thanh',
                                    '[ ] Hoạt động tốt',
                                    '[ ] Hoạt động tốt',
                                    ''
                                ],
                                [
                                    'Thảm lót sàn',
                                    '[ ] Sạch',
                                    '[ ] Sạch',
                                    ''
                                ],
                                [
                                    'Giấy đăng ký xe (bản sao)',
                                    '[ ] Có',
                                    '[ ] Có',
                                    ''
                                ],
                                [
                                    'Giấy kiểm định',
                                    '[ ] Có',
                                    '[ ] Có',
                                    ''
                                ],
                                [
                                    'Giấy bảo hiểm TNDS',
                                    '[ ] Có',
                                    '[ ] Có',
                                    ''
                                ]
                            ]
                        },
                        layout: {
                            hLineWidth: function (i, node) {
                                return 0.5;
                            },
                            vLineWidth: function (i, node) {
                                return 0.5;
                            },
                            hLineColor: function (i, node) {
                                return '#aaa';
                            },
                            vLineColor: function (i, node) {
                                return '#aaa';
                            }
                        }
                    },
                    { text: '\n' },
                    
                    // III. XÁC NHẬN
                    {
                        text: 'III. XÁC NHẬN',
                        style: 'sectionHeader'
                    },
                    {
                        text: 'Bên B xác nhận đã nhận xe với đầy đủ giấy tờ và tình trạng như mô tả ở trên.',
                        style: 'normal'
                    },
                    { text: '\n' },
                    
                    // Chữ ký phụ lục
                    {
                        text: 'BÊN GIAO (BÊN A)                    BÊN NHẬN (BÊN B)',
                        style: 'normal',
                        alignment: 'center'
                    },
                    {
                        text: '(Ký, ghi rõ họ tên)                 (Ký, ghi rõ họ tên)',
                        style: 'normal',
                        alignment: 'center'
                    }
                ],
                styles: {
                    header: {
                        fontSize: 18,
                        bold: true,
                        margin: [0, 0, 0, 10]
                    },
                    sectionHeader: {
                        fontSize: 14,
                        bold: true,
                        margin: [0, 10, 0, 5]
                    },
                    appendixHeader: {
                        fontSize: 16,
                        bold: true,
                        margin: [0, 20, 0, 10]
                    },
                    normal: {
                        fontSize: 12,
                        margin: [0, 5, 0, 5]
                    },
                    list: {
                        fontSize: 12,
                        margin: [0, 5, 0, 5]
                    },
                    tableHeader: {
                        bold: true,
                        fontSize: 11,
                        color: 'black',
                        fillColor: '#f0f0f0'
                    }
                },
                defaultStyle: {
                    font: 'Roboto'
                }
            };

            const pdfDoc = window.pdfMake.createPdf(docDefinition);
            pdfDoc.download('hop-dong-thue-xe.pdf');
            message.success('Đã tải xuống hợp đồng thành công!');
        } catch (error) {
            console.error('Lỗi khi tạo PDF:', error);
            message.error('Có lỗi xảy ra khi tải xuống hợp đồng: ' + error.message);
        }
    };

    const handleConfirm = () => {
        if (agreedToTerms) {
            onContinue();
        } else {
            message.warning('Vui lòng đồng ý với điều khoản trước khi tiếp tục');
        }
    };

    const handleAgreeToTerms = () => {
        setAgreedToTerms(true);
        setShowTermsModal(false);
        message.success('Đã đồng ý với điều khoản!');
    };

    const formatDate = (dateString) => {
        if (!dateString) return '.......................';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };

    const formatPrice = (price) => {
        if (!price) return '.......................';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    const getValueOrDefault = (value) => {
        return value || '.......................';
    };

    return (
        <>
            <Modal
                title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>HỢP ĐỒNG THUÊ XE Ô TÔ</span>
                        <Button 
                            type="text" 
                            icon={<CloseOutlined />} 
                            onClick={onClose}
                            style={{ border: 'none', padding: 0 }}
                        />
                    </div>
                }
                open={visible}
                onCancel={onClose}
                closable={false}
                footer={[
                    <Button key="download" type="primary" onClick={handleDownload}>
                        <DownloadOutlined /> Tải xuống hợp đồng
                    </Button>,
                    <Button 
                        key="agree" 
                        type="primary" 
                        disabled={!agreedToTerms}
                        onClick={handleConfirm}
                        style={{ marginLeft: 8 }}
                    >
                        Đồng ý và tiếp tục
                    </Button>
                ]}
                width={800}
                style={{ top: 20 }}
                styles={{ body: { maxHeight: '70vh', overflow: 'auto' } }}
            >
                <div className="contract-content">
                    <div className="contract-header">
                        <h2>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h2>
                        <h3>Độc lập - Tự do - Hạnh phúc</h3>
                        <h2>HỢP ĐỒNG THUÊ XE Ô TÔ</h2>
                        <p>(Số: ......................./HĐTX)</p>
                    </div>

                    <div className="contract-body">
                        <p>
                            Hôm nay, ngày ....................... tháng ....................... năm ......................., tại ........................
                        </p>
                        <p>Chúng tôi gồm có:</p>

                        <div className="party-section">
                            <h4>BÊN CHO THUÊ (BÊN A):</h4>
                            <ul>
                                <li>Cá nhân: Ông/Bà .......................</li>
                                <li>Sinh ngày: .......................</li>
                                <li>CMND/CCCD số: ....................... do ....................... cấp ngày .......................</li>
                                <li>Địa chỉ thường trú: .......................</li>
                                <li>Số điện thoại liên hệ: .......................</li>
                                <li>Email: .......................</li>
                                <li>Số tài khoản ngân hàng: ....................... tại Ngân hàng .......................</li>
                            </ul>
                        </div>

                        <div className="party-section">
                            <h4>BÊN THUÊ (BÊN B):</h4>
                            <ul>
                                <li>Cá nhân: Ông/Bà .......................</li>
                                <li>Sinh ngày: .......................</li>
                                <li>CMND/CCCD số: ....................... do ....................... cấp ngày .......................</li>
                                <li>Giấy phép lái xe hạng: ....................... số ....................... có giá trị đến .......................</li>
                                <li>Địa chỉ thường trú: .......................</li>
                                <li>Số điện thoại liên hệ: .......................</li>
                                <li>Email: .......................</li>
                            </ul>
                        </div>

                        <p>Sau khi bàn bạc, hai bên thống nhất ký kết Hợp đồng thuê xe ô tô (sau đây gọi tắt là "Hợp đồng") với các điều khoản và điều kiện chi tiết như sau:</p>

                        <div className="contract-article">
                            <h4>ĐIỀU 1: ĐỐI TƯỢNG CỦA HỢP ĐỒNG</h4>
                            <p>1.1. Bên A đồng ý cho Bên B thuê và Bên B đồng ý thuê 01 (một) xe ô tô (sau đây gọi là "Xe") với các đặc điểm sau:</p>
                            <ul>
                                <li>Loại xe: {getValueOrDefault(contractData?.carBrand)} {getValueOrDefault(contractData?.carModel)}</li>
                                <li>Màu sơn: {getValueOrDefault(contractData?.carColor)}</li>
                                <li>Biển số đăng ký: {getValueOrDefault(contractData?.carPlate)}</li>
                                <li>Số khung: {getValueOrDefault(contractData?.carVin)}</li>
                                <li>Số máy: {getValueOrDefault(contractData?.carEngine)}</li>
                                <li>Giấy chứng nhận đăng ký xe số: {getValueOrDefault(contractData?.carRegistrationNumber)} do {getValueOrDefault(contractData?.carRegistrationAuthority)} cấp ngày {getValueOrDefault(contractData?.carRegistrationDate)}, đứng tên {getValueOrDefault(contractData?.carOwnerName)}</li>
                                <li>Giấy chứng nhận kiểm định an toàn kỹ thuật và bảo vệ môi trường có hiệu lực đến ngày: {getValueOrDefault(contractData?.carInspectionExpiry)}</li>
                                <li>Giấy chứng nhận bảo hiểm TNDS bắt buộc có hiệu lực đến ngày: {getValueOrDefault(contractData?.carInsuranceExpiry)}</li>
                            </ul>
                            <p>1.2. Tình trạng Xe khi bàn giao được mô tả chi tiết tại Biên bản bàn giao xe (Phụ lục 01 đính kèm Hợp đồng này và là một phần không thể tách rời của Hợp đồng).</p>
                        </div>

                        <div className="contract-article">
                            <h4>ĐIỀU 2: THỜI HẠN THUÊ VÀ MỤC ĐÍCH SỬ DỤNG</h4>
                            <p>2.1. Thời hạn thuê:</p>
                            <ul>
                                <li>Thời gian thuê là: {getValueOrDefault(contractData?.rentalDays)} ngày/tháng.</li>
                                <li>Bắt đầu từ: {formatDate(contractData?.startDate)}</li>
                                <li>Kết thúc vào: {formatDate(contractData?.endDate)}</li>
                            </ul>
                            <p>2.2. Gia hạn: Nếu Bên B có nhu cầu gia hạn Hợp đồng, phải thông báo cho Bên A trước ít nhất ....................... giờ/ngày trước khi Hợp đồng hết hạn.</p>
                            <p>2.3. Mục đích sử dụng: Bên B thuê xe để ........................ Bên B cam kết không sử dụng xe vào các mục đích vi phạm pháp luật.</p>
                        </div>

                        <div className="contract-article">
                            <h4>ĐIỀU 3: GIÁ THUÊ, ĐẶT CỌC VÀ PHƯƠNG THỨC THANH TOÁN</h4>
                            <p>3.1. Giá thuê:</p>
                            <ul>
                                <li>Đơn giá thuê là: {formatPrice(contractData?.dailyPrice)}/ngày (Bằng chữ: .......................).</li>
                                <li>Tổng giá trị Hợp đồng (tạm tính): {formatPrice(contractData?.totalPrice)} (Bằng chữ: .......................).</li>
                                <li>Giá thuê trên chưa bao gồm thuế GTGT (nếu có), chi phí nhiên liệu, phí cầu đường, phí đỗ xe, và các khoản phạt vi phạm giao thông (nếu có).</li>
                                <li>Phụ phí vượt giờ: Nếu Bên B trả xe muộn so với thời gian quy định tại Điều 2, Bên B sẽ phải thanh toán thêm một khoản phí vượt giờ là ....................... VNĐ/giờ. Nếu quá ....................... giờ sẽ được tính tròn 01 (một) ngày thuê.</li>
                                <li>Phụ phí vượt km (nếu có): Hợp đồng giới hạn số km di chuyển là ....................... km/ngày. Nếu vượt quá, Bên B phải trả thêm ....................... VNĐ/km.</li>
                            </ul>
                            <p>3.2. Tiền đặt cọc:</p>
                            <ul>
                                <li>Bên B phải đặt cọc cho Bên A một khoản tiền là {formatPrice(contractData?.deposit)} (Bằng chữ: .......................) VÀ/HOẶC tài sản thế chấp là ........................</li>
                                <li>Khoản tiền/tài sản đặt cọc này sẽ được Bên A hoàn trả đầy đủ cho Bên B sau khi Bên B đã thanh toán toàn bộ tiền thuê và các chi phí phát sinh (nếu có), đồng thời bàn giao lại xe trong tình trạng như lúc nhận.</li>
                            </ul>
                            <p>3.3. Phương thức thanh toán:</p>
                            <ul>
                                <li>Thanh toán tiền thuê: Bên B thanh toán cho Bên A ....................... tổng giá trị Hợp đồng ngay khi ký kết. Số tiền còn lại sẽ được thanh toán khi Bên B trả xe.</li>
                                <li>Hình thức thanh toán: Tiền mặt hoặc chuyển khoản vào tài khoản ngân hàng của Bên A tại thông tin nêu trên.</li>
                            </ul>
                        </div>

                        <div className="contract-article">
                            <h4>ĐIỀU 4: QUYỀN VÀ NGHĨA VỤ CỦA BÊN A</h4>
                            <p>4.1. Quyền của Bên A:</p>
                            <ul>
                                <li>Nhận đủ tiền thuê và tiền đặt cọc theo thỏa thuận tại Điều 3.</li>
                                <li>Yêu cầu Bên B bồi thường thiệt hại nếu xe bị hư hỏng, mất mát do lỗi của Bên B.</li>
                                <li>Đơn phương chấm dứt Hợp đồng và thu hồi xe ngay lập tức nếu Bên B vi phạm nghiêm trọng các nghĩa vụ nêu trong Hợp đồng (sử dụng xe sai mục đích, không trả tiền thuê, tự ý sửa chữa, cầm cố xe...).</li>
                            </ul>
                            <p>4.2. Nghĩa vụ của Bên A:</p>
                            <ul>
                                <li>Bàn giao Xe và toàn bộ giấy tờ liên quan (bản sao công chứng Giấy đăng ký xe, bản gốc Giấy chứng nhận kiểm định, bản gốc Giấy bảo hiểm TNDS) cho Bên B đúng thời gian, địa điểm và trong tình trạng kỹ thuật tốt, đảm bảo an toàn vận hành.</li>
                                <li>Chịu trách nhiệm pháp lý về nguồn gốc và quyền sở hữu của Xe.</li>
                                <li>Hướng dẫn Bên B các tính năng cơ bản của Xe.</li>
                                <li>Hoàn trả tiền/tài sản đặt cọc cho Bên B sau khi đã trừ các chi phí hợp lý (nếu có) khi kết thúc Hợp đồng.</li>
                                <li>Chịu trách nhiệm chi trả chi phí bảo dưỡng, sửa chữa các hư hỏng do lỗi kỹ thuật của bản thân chiếc xe.</li>
                            </ul>
                        </div>

                        <div className="contract-article">
                            <h4>ĐIỀU 5: QUYỀN VÀ NGHĨA VỤ CỦA BÊN B</h4>
                            <p>5.1. Quyền của Bên B:</p>
                            <ul>
                                <li>Nhận xe và giấy tờ đúng theo thỏa thuận.</li>
                                <li>Được toàn quyền sử dụng Xe trong thời hạn thuê và đúng mục đích đã thỏa thuận.</li>
                                <li>Yêu cầu Bên A sửa chữa kịp thời các hư hỏng không do lỗi của mình gây ra.</li>
                            </ul>
                            <p>5.2. Nghĩa vụ của Bên B:</p>
                            <ul>
                                <li>Thanh toán đầy đủ tiền thuê và các chi phí phát sinh (nếu có).</li>
                                <li>Xuất trình đầy đủ CMND/CCCD, Giấy phép lái xe hợp lệ.</li>
                                <li>Chịu trách nhiệm quản lý, bảo quản xe và các giấy tờ liên quan trong suốt thời gian thuê.</li>
                                <li>Tự chi trả toàn bộ chi phí nhiên liệu, phí cầu đường, bến bãi, và các chi phí khác phát sinh trong quá trình sử dụng xe.</li>
                                <li>Chịu hoàn toàn trách nhiệm trước pháp luật nếu gây ra tai nạn giao thông, vi phạm luật giao thông đường bộ (bao gồm cả phạt nguội). Bên A sẽ cung cấp thông tin của Bên B cho cơ quan chức năng khi có yêu cầu.</li>
                                <li>Không được cho thuê lại, giao xe cho người không có trong Hợp đồng điều khiển (trừ khi có sự đồng ý bằng văn bản của Bên A).</li>
                                <li>Không được sử dụng xe để cầm cố, thế chấp, bán hoặc thực hiện các hành vi trái pháp luật khác.</li>
                                <li>Không được tự ý tháo dỡ, thay đổi kết cấu, phụ kiện của xe. Nếu xe gặp sự cố kỹ thuật, phải báo ngay cho Bên A để phối hợp giải quyết. Không tự ý sửa chữa trừ trường hợp khẩn cấp và có sự đồng ý của Bên A.</li>
                                <li>Bàn giao lại xe đúng thời gian, địa điểm, với tình trạng kỹ thuật và vệ sinh như khi nhận.</li>
                            </ul>
                        </div>

                        <div className="contract-article">
                            <h4>ĐIỀU 6: TRÁCH NHIỆM BỒI THƯỜNG THIỆT HẠI</h4>
                            <p>6.1. Trường hợp tai nạn, hư hỏng:</p>
                            <ul>
                                <li>Bên B phải có trách nhiệm giữ nguyên hiện trường, báo ngay cho cơ quan công an nơi gần nhất và thông báo cho Bên A để cùng giải quyết.</li>
                                <li>Nếu lỗi thuộc về Bên B, Bên B phải chịu toàn bộ chi phí sửa chữa, khắc phục thiệt hại. Trong trường hợp xe được bảo hiểm chi trả, Bên B phải chịu phần chi phí mà bảo hiểm không chi trả (mức miễn thường) và toàn bộ chi phí thiệt hại về giá trị của xe (nếu có) và tiền thuê xe trong những ngày xe phải vào xưởng sửa chữa.</li>
                                <li>Nếu lỗi không thuộc về Bên B, Bên B không phải chịu trách nhiệm bồi thường.</li>
                            </ul>
                            <p>6.2. Trường hợp mất mát:</p>
                            <ul>
                                <li>Nếu Bên B làm mất xe hoặc các phụ kiện, giấy tờ đi kèm, Bên B phải bồi thường 100% giá trị của xe/phụ kiện/giấy tờ tại thời điểm mất mát. Giá trị xe được xác định theo giá thị trường.</li>
                            </ul>
                        </div>

                        <div className="contract-article">
                            <h4>ĐIỀU 7: CHẤM DỨT HỢP ĐỒNG</h4>
                            <p>7.1. Hợp đồng này chấm dứt khi:</p>
                            <ul>
                                <li>Hết thời hạn thuê và hai bên đã hoàn thành mọi nghĩa vụ.</li>
                                <li>Hai bên thỏa thuận chấm dứt trước hạn.</li>
                                <li>Một trong hai bên đơn phương chấm dứt Hợp đồng do có sự vi phạm của bên còn lại theo quy định tại Hợp đồng này.</li>
                            </ul>
                        </div>

                        <div className="contract-article">
                            <h4>ĐIỀU 8: GIẢI QUYẾT TRANH CHẤP</h4>
                            <p>Mọi tranh chấp phát sinh từ Hợp đồng này sẽ được giải quyết trước hết thông qua thương lượng, hòa giải. Nếu không thể giải quyết được, một trong hai bên có quyền khởi kiện tại Tòa án nhân dân có thẩm quyền để giải quyết theo quy định của pháp luật.</p>
                        </div>

                        <div className="contract-article">
                            <h4>ĐIỀU 9: CAM KẾT CHUNG</h4>
                            <p>9.1. Hai bên cam kết thực hiện đúng và đầy đủ các điều khoản đã thỏa thuận trong Hợp đồng.</p>
                            <p>9.2. Mọi sửa đổi, bổ sung Hợp đồng phải được lập thành văn bản và có chữ ký của cả hai bên.</p>
                            <p>9.3. Hợp đồng này được lập thành 02 (hai) bản, có giá trị pháp lý như nhau, mỗi bên giữ 01 (một) bản.</p>
                            <p>9.4. Hợp đồng có hiệu lực kể từ thời điểm ký kết.</p>
                        </div>

                        <div className="contract-signature">
                            <div className="signature-section">
                                <p><strong>BÊN GIAO (BÊN A)</strong></p>
                                <p>(Ký, ghi rõ họ tên)</p>
                            </div>
                            <div className="signature-section">
                                <p><strong>BÊN NHẬN (BÊN B)</strong></p>
                                <p>(Ký, ghi rõ họ tên)</p>
                            </div>
                        </div>

                        <div className="contract-appendix">
                            <h4>PHỤ LỤC 01: BIÊN BẢN BÀN GIAO XE</h4>
                            <p>(Đính kèm Hợp đồng thuê xe số: {new Date().toLocaleDateString('vi-VN').replace(/\//g, '')}/HĐTX)</p>
                            
                            <h5>I. THÔNG TIN BÀN GIAO</h5>
                            <ul>
                                <li>Thời gian bàn giao: {formatDate(contractData?.startDate)}</li>
                                <li>Thời gian nhận lại (dự kiến): {formatDate(contractData?.endDate)}</li>
                                <li>Địa điểm bàn giao: {getValueOrDefault(contractData?.pickupLocation)}</li>
                                <li>Số km hiện tại (ODO): {getValueOrDefault(contractData?.currentKm)}</li>
                                <li>Tình trạng nhiên liệu: {getValueOrDefault(contractData?.fuelStatus)}</li>
                            </ul>

                            <h5>II. KIỂM TRA TÌNH TRẠNG XE (Đánh dấu x vào ô tương ứng)</h5>
                            <div className="inspection-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Hạng mục</th>
                                            <th>Tình trạng lúc giao</th>
                                            <th>Tình trạng lúc nhận</th>
                                            <th>Ghi chú</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>Ngoại thất - Sơn xe</td>
                                            <td>[ ] Tốt / [ ] Có xước</td>
                                            <td>[ ] Tốt / [ ] Có xước</td>
                                            <td>(Mô tả vị trí)</td>
                                        </tr>
                                        <tr>
                                            <td>Đèn pha, đèn hậu</td>
                                            <td>[ ] Tốt</td>
                                            <td>[ ] Tốt</td>
                                            <td></td>
                                        </tr>
                                        <tr>
                                            <td>Gương chiếu hậu</td>
                                            <td>[ ] Tốt</td>
                                            <td>[ ] Tốt</td>
                                            <td></td>
                                        </tr>
                                        <tr>
                                            <td>Lốp xe (4 bánh)</td>
                                            <td>[ ] Tốt</td>
                                            <td>[ ] Tốt</td>
                                            <td></td>
                                        </tr>
                                        <tr>
                                            <td>Lốp dự phòng & dụng cụ</td>
                                            <td>[ ] Có đủ</td>
                                            <td>[ ] Có đủ</td>
                                            <td></td>
                                        </tr>
                                        <tr>
                                            <td>Nội thất - Ghế ngồi</td>
                                            <td>[ ] Sạch / [ ] Bẩn</td>
                                            <td>[ ] Sạch / [ ] Bẩn</td>
                                            <td></td>
                                        </tr>
                                        <tr>
                                            <td>Hệ thống điều hòa</td>
                                            <td>[ ] Hoạt động tốt</td>
                                            <td>[ ] Hoạt động tốt</td>
                                            <td></td>
                                        </tr>
                                        <tr>
                                            <td>Hệ thống âm thanh</td>
                                            <td>[ ] Hoạt động tốt</td>
                                            <td>[ ] Hoạt động tốt</td>
                                            <td></td>
                                        </tr>
                                        <tr>
                                            <td>Thảm lót sàn</td>
                                            <td>[ ] Sạch</td>
                                            <td>[ ] Sạch</td>
                                            <td></td>
                                        </tr>
                                        <tr>
                                            <td>Giấy đăng ký xe (bản sao)</td>
                                            <td>[ ] Có</td>
                                            <td>[ ] Có</td>
                                            <td></td>
                                        </tr>
                                        <tr>
                                            <td>Giấy kiểm định</td>
                                            <td>[ ] Có</td>
                                            <td>[ ] Có</td>
                                            <td></td>
                                        </tr>
                                        <tr>
                                            <td>Giấy bảo hiểm TNDS</td>
                                            <td>[ ] Có</td>
                                            <td>[ ] Có</td>
                                            <td></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <h5>III. XÁC NHẬN</h5>
                            <p>Bên B xác nhận đã nhận xe với đầy đủ giấy tờ và tình trạng như mô tả ở trên.</p>

                            <div className="signature-section">
                                <p><strong>BÊN GIAO (BÊN A)</strong>                    <strong>BÊN NHẬN (BÊN B)</strong></p>
                                <p>(Ký, ghi rõ họ tên)                 (Ký, ghi rõ họ tên)</p>
                            </div>
                        </div>
                    </div>

                    <div className="terms-section">
                        <div className="terms-checkbox">
                            <Checkbox 
                                checked={agreedToTerms} 
                                onChange={(e) => setAgreedToTerms(e.target.checked)}
                            >
                                Tôi đã đọc và đồng ý với{' '}
                                <Button 
                                    type="link" 
                                    onClick={() => setShowTermsModal(true)}
                                    style={{ padding: 0, height: 'auto', fontSize: 'inherit' }}
                                >
                                    Điều khoản và Chính sách sử dụng
                                </Button>
                                {' '}của nền tảng Drivon
                            </Checkbox>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Modal điều khoản riêng biệt */}
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ marginRight: 8 }}>📄</span>
                        <span>ĐIỀU KHOẢN VÀ CHÍNH SÁCH SỬ DỤNG</span>
                    </div>
                }
                open={showTermsModal}
                onCancel={() => setShowTermsModal(false)}
                footer={[
                    <Button key="close" onClick={() => setShowTermsModal(false)}>
                        Đóng
                    </Button>,
                    <Button 
                        key="agree" 
                        type="primary" 
                        onClick={handleAgreeToTerms}
                        style={{ marginLeft: 8 }}
                    >
                        Tôi đồng ý
                    </Button>
                ]}
                width={800}
                style={{ top: 20 }}
                styles={{ body: { maxHeight: '70vh', overflow: 'auto' } }}
            >
                <div className="terms-content">
                    <p><strong>(Áp dụng cho người dùng nền tảng Drivon)</strong></p>
                    <p>Cập nhật ngày: [●]</p>
                    <hr />
                    
                    <h5>1. ĐỊNH NGHĨA</h5>
                    <ul>
                        <li><strong>Drivon:</strong> Nền tảng trực tuyến (bao gồm website và ứng dụng) cung cấp dịch vụ kết nối giữa người thuê xe tự lái và chủ xe.</li>
                        <li><strong>Người thuê:</strong> Cá nhân hoặc tổ chức sử dụng nền tảng để tìm và thuê xe từ chủ xe.</li>
                        <li><strong>Chủ xe (Owner):</strong> Cá nhân hoặc tổ chức sở hữu phương tiện và đăng xe lên nền tảng để cho thuê.</li>
                        <li><strong>Giao dịch thuê xe:</strong> Bao gồm quá trình đặt xe, thanh toán, bàn giao, sử dụng và hoàn trả xe giữa người thuê và chủ xe.</li>
                    </ul>
                    <hr />
                    
                    <h5>2. VAI TRÒ CỦA DRIVON</h5>
                    <ul>
                        <li>Drivon là nền tảng trung gian kết nối, không phải là bên cho thuê xe, không sở hữu xe, không đại diện cho bất kỳ người thuê hoặc chủ xe nào.</li>
                        <li>Drivon không tham gia vào giao dịch thuê xe, bao gồm: đàm phán giá, bàn giao xe, xác minh người thuê, hoặc ký hợp đồng thuê xe.</li>
                        <li>Mọi thông tin về phương tiện, giá thuê, điều kiện thuê… là do chủ xe cung cấp, Drivon không chịu trách nhiệm về tính xác thực hoặc chất lượng của thông tin này.</li>
                    </ul>
                    <hr />
                    
                    <h5>3. ĐIỀU KHOẢN DÀNH CHO NGƯỜI THUÊ</h5>
                    <p>Người thuê khi sử dụng nền tảng Drivon đồng ý rằng:</p>
                    <ul>
                        <li>Cung cấp thông tin cá nhân chính xác và chịu trách nhiệm với các thông tin đã khai báo.</li>
                        <li>Tự chịu trách nhiệm với quá trình thuê, sử dụng và hoàn trả xe đúng thời hạn, đúng tình trạng.</li>
                        <li>Tuân thủ luật giao thông và các quy định pháp luật khi điều khiển phương tiện.</li>
                        <li>Chủ động liên hệ, đàm phán và giải quyết các vấn đề phát sinh trực tiếp với chủ xe.</li>
                        <li>Drivon không chịu trách nhiệm đối với bất kỳ sự cố nào xảy ra trong giao dịch thuê xe.</li>
                    </ul>
                    <hr />
                    
                    <h5>4. ĐIỀU KHOẢN DÀNH CHO CHỦ XE (OWNER)</h5>
                    <p>Chủ xe khi sử dụng nền tảng Drivon đồng ý rằng:</p>
                    <ul>
                        <li>Là chủ sở hữu hợp pháp của xe hoặc có đủ quyền hợp pháp để cho thuê.</li>
                        <li>Cung cấp thông tin chính xác, cập nhật về phương tiện và chịu trách nhiệm với thông tin đó.</li>
                        <li>Tự quyết định điều kiện cho thuê, giá thuê, quy trình đặt cọc, giấy tờ và yêu cầu với người thuê.</li>
                        <li>Tự chịu trách nhiệm giải quyết mọi rủi ro phát sinh từ việc cho thuê xe (tai nạn, hư hỏng, vi phạm pháp luật, tranh chấp...).</li>
                        <li>Drivon không chịu trách nhiệm tài chính, pháp lý hay bồi thường trong bất kỳ trường hợp nào liên quan đến xe đã cho thuê.</li>
                    </ul>
                    
                    <p><strong>📌 Khuyến nghị quan trọng:</strong></p>
                    <p>Chủ xe nên lập hợp đồng thuê xe riêng bằng văn bản với người thuê trước khi bàn giao xe, bao gồm:</p>
                    <ul>
                        <li>Điều kiện sử dụng xe</li>
                        <li>Quy định về trách nhiệm khi xảy ra sự cố, mất mát</li>
                        <li>Quy trình xử lý tranh chấp, mức bồi thường, và các nghĩa vụ cụ thể</li>
                    </ul>
                    <p>Drivon không cung cấp, không xác nhận và không lưu trữ hợp đồng này.</p>
                    <hr />
                    
                    <h5>5. MIỄN TRỪ TRÁCH NHIỆM PHÁP LÝ</h5>
                    <p>Bằng việc sử dụng nền tảng, người dùng xác nhận rằng:</p>
                    <ul>
                        <li>Drivon không chịu trách nhiệm pháp lý, tài chính hoặc hình sự với bất kỳ sự cố nào phát sinh từ giao dịch thuê hoặc cho thuê xe.</li>
                        <li>Drivon không đại diện, không bảo đảm, không bảo lãnh cho chất lượng xe, hành vi người thuê hay chủ xe.</li>
                        <li>Drivon không chịu trách nhiệm trong các trường hợp tai nạn, vi phạm giao thông, gian lận, lừa đảo hoặc tranh chấp cá nhân giữa hai bên.</li>
                        <li>Trong trường hợp xảy ra sự cố, người dùng có trách nhiệm tự thương lượng, xử lý với bên còn lại. Drivon chỉ hỗ trợ cung cấp lịch sử giao dịch, nhật ký truy cập khi cần thiết.</li>
                    </ul>
                    <hr />
                    
                    <h5>6. GIẢI QUYẾT TRANH CHẤP</h5>
                    <ul>
                        <li>Mọi tranh chấp giữa người thuê và chủ xe phải được giải quyết trực tiếp giữa hai bên.</li>
                        <li>Drivon không tham gia tố tụng, hòa giải hay đứng ra đại diện cho bất kỳ bên nào.</li>
                        <li>Trong trường hợp được yêu cầu bởi cơ quan nhà nước, Drivon sẽ cung cấp dữ liệu liên quan như lịch sử giao dịch, hồ sơ tài khoản… trong phạm vi pháp luật cho phép.</li>
                    </ul>
                    <hr />
                    
                    <h5>7. CAM KẾT VÀ RÀNG BUỘC</h5>
                    <ul>
                        <li>Việc đăng ký tài khoản, đăng xe hoặc thuê xe thông qua nền tảng được xem là người dùng đã đọc, hiểu, đồng ý và ràng buộc với toàn bộ nội dung của bản điều khoản này.</li>
                        <li>Drivon có quyền cập nhật, chỉnh sửa nội dung chính sách và điều khoản này mà không cần thông báo trước.</li>
                        <li>Phiên bản mới sẽ được công bố công khai trên nền tảng và có hiệu lực kể từ thời điểm đăng tải.</li>
                    </ul>
                    <hr />
                    
                    <h5>8. HIỆU LỰC PHÁP LÝ</h5>
                    <ul>
                        <li>Chính sách và Điều khoản sử dụng này có hiệu lực kể từ ngày công bố và áp dụng cho toàn bộ người dùng nền tảng Drivon.</li>
                        <li>Đây là một thỏa thuận sử dụng dịch vụ có giá trị pháp lý giữa người dùng và Drivon, có thể được sử dụng làm căn cứ giải trình với cơ quan chức năng hoặc trong tranh chấp dân sự (nếu có).</li>
                        <li>Người dùng có trách nhiệm đọc và cập nhật chính sách định kỳ.</li>
                    </ul>
                </div>
            </Modal>
        </>
    );
};

export default ContractModal; 