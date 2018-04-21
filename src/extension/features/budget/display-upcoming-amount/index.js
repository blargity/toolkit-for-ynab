import { Feature } from 'toolkit/extension/features/feature';
import { getCurrentRouteName } from 'toolkit/extension/utils/ynab';
import { getEmberView } from 'toolkit/extension/utils/ember';
import { formatCurrency } from 'toolkit/extension/utils/currency';

export class DisplayUpcomingAmount extends Feature {
  injectCSS() { return require('./index.css'); }

  shouldInvoke() {
    return getCurrentRouteName().indexOf('budget') !== -1;
  }

  invoke() {
    $('.budget-table-row.is-sub-category').each((_, element) => {
      const { monthlySubCategoryBudgetCalculation } = getEmberView(element.id).data;

      if (monthlySubCategoryBudgetCalculation && monthlySubCategoryBudgetCalculation.upcomingTransactions) {
        $('.budget-table-cell-activity', element)
          .addClass('toolkit-activity-upcoming')
          .prepend($('<div>', {
            class: 'toolkit-activity-upcoming-amount',
            text: formatCurrency(monthlySubCategoryBudgetCalculation.upcomingTransactions)
          }));
      }
    });
  }

  onRouteChanged() {
    if (!this.shouldInvoke()) return;
    this.invoke();
  }
}
