export const formatRupiah = (amount) => `Rp ${Number.parseInt(amount || 0, 10).toLocaleString('id-ID')}`;

export const getPaymentStatus = (status) => String(status || '').toLowerCase();
