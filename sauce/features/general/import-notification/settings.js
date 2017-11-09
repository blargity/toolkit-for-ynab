module.exports = {
  name: 'ImportNotification',
  type: 'select',
  default: '0',
  section: 'general',
  title: 'Show Import Notifications in Sidebar',
  description: 'Display a notification in the sidebar when there are transactions to be imported.',
  options: [
    { name: 'Off', value: '0' },
    { name: 'On - Default Indicator Color', value: '1', style: 'background-color: #227e99' },
    { name: 'On - Red Indicator Color', value: '2', style: 'background-color: #FF0000' }
  ]
};
