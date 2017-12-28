import { Feature } from 'toolkit/core/extension/feature';
import { getCurrentRouteName } from 'toolkit/extension/helpers/toolkit';

export class EnableRetroCalculator extends Feature {
  onRouteChanged(route) {
    // Remove our handler no matter what, because if they move between
    // months, we'll end up attaching multiple, which would be bad.
    // Let's always remove and then reattach if needed.
    const selector = 'li.budget-table-cell-budgeted div.currency-input, ' +
     'div.ynab-grid-cell-outflow div.currency-input, ' +
     'div.ynab-grid-cell-inflow div.currency-input';

    $(document).off('keypress', selector, this.handleKeypress);

    if (route === 'budget.select') {
      $(document).on('keypress', selector, this.handleKeypress);
    }
  }

  shouldInvoke() {
    // If we're loading up on the budget page, then we should trigger
    // our listener on startup. Let's pretend we switched routes
    // so that the normal handling happens.
    return getCurrentRouteName() === 'budget.select';
  }

  invoke() {
    this.onRouteChanged(getCurrentRouteName());
  }

  handleKeypress(e) {
    e = e || window.event;
    const charCode = e.which || e.keyCode;
    const charTyped = String.fromCharCode(charCode);

    if (charTyped === '+' || charTyped === '-' || charTyped === '*' || charTyped === '/') {
      const input = $(this).find('input');
      const length = input.val().length;

      // This moves the caret to the end of the input.
      input[0].focus();
      input[0].setSelectionRange(length, length);
    }

    // Make sure we allow the event to bubble up so we don't mess with anything
    // that YNAB is doing.
  }
}
