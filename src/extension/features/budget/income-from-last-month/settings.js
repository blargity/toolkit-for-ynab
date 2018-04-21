module.exports = {
  name: 'IncomeFromLastMonth',
  type: 'select',
  default: '0',
  section: 'budget',
  title: 'Income From Last Month',
  description: 'Show total of incoming transactions for last month in the header.',
  options: [
    { name: 'Default', value: '0' },
    { name: 'Previous month (easy)', value: '1' },
    { name: 'The month before last (medium)', value: '2' },
    { name: '2 months before last (hard)', value: '3' },
    { name: '3 months before last (impossibru)', value: '4' }
  ]
};
