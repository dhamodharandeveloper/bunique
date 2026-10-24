export const formatPrice = (value) => {
  const n = Number(value || 0);
  return `₹ ${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const imageUrl = (image, folder = 'products') => {
  if (!image) return 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200';
  if (String(image).startsWith('http')) return image;
  return `http://localhost:8080/uploads/${folder}/${image}`;
};

export const formatDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const formatDateTime = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

export const titleCase = (value) => {
  if (!value) return '';
  return String(value).charAt(0).toUpperCase() + String(value).slice(1);
};

export const toDateInput = (value) => {
  if (!value) return '';
  return String(value).slice(0, 10);
};
