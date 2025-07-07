import React, { useState } from 'react';

const CalendarPage = () => {
    const [newCode, setNewCode] = useState('');
    const [newDiscount, setNewDiscount] = useState('');
    const [newValidUntil, setNewValidUntil] = useState('');
    const [newMaxUsers, setNewMaxUsers] = useState('');
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleAddPromotion = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/promotions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    code: newCode,
                    discount_percent: newDiscount,
                    valid_until: newValidUntil,
                    max_users: newMaxUsers
                })
            });

            if (response.ok) {
                const data = await response.json();
                setPromotions([...promotions, data]);
                setNewCode('');
                setNewDiscount('');
                setNewValidUntil('');
                setNewMaxUsers('');
            } else {
                setError('Có lỗi xảy ra khi thêm mã khuyến mãi');
            }
        } catch (err) {
            setError('Có lỗi xảy ra khi thêm mã khuyến mãi');
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePromotion = async (id) => {
        try {
            const response = await fetch(`/api/promotions/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                setPromotions(promotions.filter(promo => promo.promo_id !== id));
            } else {
                setError('Có lỗi xảy ra khi xóa mã khuyến mãi');
            }
        } catch (err) {
            setError('Có lỗi xảy ra khi xóa mã khuyến mãi');
        }
    };

    return (
        <div>
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
                                <td>{promo.max_users ?? ''}</td>
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

export default CalendarPage; 