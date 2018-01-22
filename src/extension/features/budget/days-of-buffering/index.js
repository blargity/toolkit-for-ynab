import { getEntityManager } from 'toolkit/extension/utils/ynab';
import { Feature } from 'toolkit/extension/features/feature';
import { getCurrentRouteName } from 'toolkit/extension/utils/ynab';
import { generateReport, outflowTransactionsFilter } from './helpers';
import { render, shouldRender } from './render';

export class DaysOfBuffering extends Feature {
  injectCSS() { return require('./index.css'); }

  transactionFilter = null;

  constructor() {
    super();
    this.historyLookup = parseInt(ynabToolKit.options.DaysOfBufferingHistoryLookup);
    this.lastRenderTime = 0;
    this.observe = this.invoke;
  }

  invoke() {
    if (!this.shouldInvoke() || !shouldRender(this.lastRenderTime)) return;

    if (this.transactionFilter === null) {
      this.transactionFilter = outflowTransactionsFilter(this.historyLookup);
    }

    const transactions = getEntityManager().getAllTransactions().filter(this.transactionFilter);
    const report = generateReport(transactions, this.accountBalance());

    this.render(report);
  }

  shouldInvoke() {
    return getCurrentRouteName().indexOf('budget') > -1;
  }

  render(report) {
    render(report);
    this.lastRenderTime = Date.now();
  }

  accountBalance() {
    return ynab.YNABSharedLib.getBudgetViewModel_SidebarViewModel()._result.getOnBudgetAccountsBalance();
  }
}
