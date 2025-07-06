import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../api/configApi';
import { showErrorToast, showSuccessToast } from '../toast/notification';
import './PromotionPage.css';

const PromotionPage = () => {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newCode, setNewCode] = useState('');
    const [newDiscount, setNewDiscount] = useState('');
    const [newValidUntil, setNewValidUntil] = useState('');
    const [newMaxUsers, setNewMaxUsers] = useState('');

    useEffect(() => {
        fetchPromotions();
    }, []);

    const fetchPromotions = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/promotions`);
            setPromotions(res.data);
        } catch (err) {
            setError('Không thể tải danh sách mã giảm giá');
        } finally {
            setLoading(false);
        }
    };

    const handleAddPromotion = async (e) => {
        e.preventDefault();
        if (!newCode || !newDiscount || !newValidUntil) {
            showErrorToast('Vui lòng nhập đầy đủ thông tin');
            return;
        }
        try {
            await axios.post(`${API_URL}/promotions`, {
                code: newCode,
                discount_percent: parseInt(newDiscount),
                valid_until: newValidUntil,
                maxUses: newMaxUsers ? parseInt(newMaxUsers) : null
            });
            showSuccessToast('Thêm mã giảm giá thành công!');
            setNewCode(''); setNewDiscount(''); setNewValidUntil(''); setNewMaxUsers('');
            fetchPromotions();
        } catch (err) {
            showErrorToast('Không thể thêm mã giảm giá');
        }
    };

    const handleDeletePromotion = async (promo_id) => {
        if (!window.confirm('Bạn có chắc muốn xóa mã này?')) return;
        try {
            await axios.delete(`${API_URL}/promotions/${promo_id}`);
            showSuccessToast('Đã xóa mã giảm giá!');
            fetchPromotions();
        } catch (err) {
            showErrorToast('Không thể xóa mã giảm giá');
        }
    };

    return (
        <div className="promotion-management-container">
            <h2>Quản lý mã giảm giá</h2>
            <form className="add-promotion-form" onSubmit={handleAddPromotion}>
                <input type="text" placeholder="Mã code" value={newCode} onChange={e => setNewCode(e.target.value)} />
                <input type="number" placeholder="% giảm" value={newDiscount} onChange={e => setNewDiscount(e.target.value)} min={1} max={100} />
                <input type="date" value={newValidUntil} onChange={e => setNewValidUntil(e.target.value)} />
                <input type="number" placeholder="Số lượt tối đa" value={newMaxUsers} onChange={e => setNewMaxUsers(e.target.value)} min={1} />
                <button type="submit">Thêm mã</button>
            </form>
            {loading ? <p>Đang tải...</p> : error ? <p style={{color:'red'}}>{error}</p> : (
                <table className="promotion-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Code</th>
                            <th>% Giảm</th>
                            <th>Hạn dùng</th>
                            <th>Số lượt tối đa</th>
                            <th>Số lần đã sử dụng</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {promotions.map(promo => (
                            <tr key={promo.promo_id}>
                                <td>{promo.promo_id}</td>
                                <td>{promo.code}</td>
                                <td>{promo.discount_percent}%</td>
                                <td>{promo.valid_until ? new Date(promo.valid_until).toLocaleDateString() : ''}</td>
                                <td>{promo.maxUses ?? ''}</td>
                                <td>{promo.usedCount ?? ''}</td>
                                <td>
                                    <button className="delete-promotion-button" onClick={() => handleDeletePromotion(promo.promo_id)}>Xóa</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default PromotionPage; 