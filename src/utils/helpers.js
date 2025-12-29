export const formatCurrency = (val) => {
  return new Intl.NumberFormat('ro-RO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(val) + ' Lei';
};

export const getLastMonthDate = () => {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return d.toISOString();
};