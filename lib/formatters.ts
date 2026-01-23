// Currency and number formatting utilities

export const formatCurrencyWhole = (val: number) => {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);
};

export const formatCurrencyDecimals = (val: number) => {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
};

export const formatHourlyRate = (val: number, hours: number) => {
  return formatCurrencyDecimals(val / hours);
};
