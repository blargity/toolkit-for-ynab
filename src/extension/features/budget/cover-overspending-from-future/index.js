import { Feature } from 'toolkit/extension/features/feature';
import { getSelectedMonth, getEntityManager, isCurrentRouteBudgetPage } from 'toolkit/extension/utils/ynab';
import { formatCurrency } from 'toolkit/extension/utils/currency';
import { l10n } from 'toolkit/extension/utils/toolkit';
import { controllerLookup } from 'toolkit/extension/utils/ember';

const BUTTON_CLASS = 'tk-button-cover-from-future';

export class CoverOverspendingFromFuture extends Feature {

  injectCSS() {
    return require('./index.css');
  }

  shouldInvoke() {
    return isCurrentRouteBudgetPage();
  }

  invoke() {
    this.verifyButtonDisplay();
  }

  observe(changedNodes) {
    if (!this.shouldInvoke()) return;
    if (changedNodes.has('budget-table-row is-sub-category is-checked')) {
      this.invoke();
    }
  }

  verifyButtonDisplay() {
    const checkedRows = controllerLookup('budget').get('checkedRows');

    // Do nothing with the button if more than one row is selected. (maybe change in the future)
    if (checkedRows.length !== 1) {
      return this.removeButton();
    }

    const category = checkedRows[0];
    const { isMasterCategory, available, budgeted } = category.getProperties('isMasterCategory', 'available', 'budgeted');

    // We can't budget for master categories
    // We don't need this if available is not negative
    if (isMasterCategory || available >= 0) {
      return this.removeButton();
    }

    // Search for the button
    let button = $(`.${BUTTON_CLASS}`);

    // Create button if it doesn't exist already
    if (!button.length) {
      button = $('<button>', {
        class: `budget-inspector-button ${BUTTON_CLASS}`
      }).click(this.coverFromFuture.bind(this, category));

      // Add the button at the top.
      $('.inspector-quick-budget button').first().before(button);
    }

    const coverAmount = Math.abs(available);
    const fCoverAmount = '+' + formatCurrency(coverAmount);

    // Update content
    button
      .empty()
      .data('coverAmount', coverAmount)
      .append(l10n('toolkit.budget.coff.coverFromFuture', 'Cover From Future'))
      .append(': ')
      .append($('<strong>', { class: 'user-data', title: fCoverAmount })
        .append($('<span>', { class: 'user-data currency positive' })
          .text(fCoverAmount)));

    return true;
  }

  coverFromFuture(category) {
    // TODO
    console.log('Yeah, cover from future clicked!');
    console.log(category);
    const categories = this.getRowsForCategory(category);
    console.log(categories);
  }

  removeButton() {
    const button = $(`.${BUTTON_CLASS}`);

    if (!button.length) return false;

    button.remove();
    return true;
  }

  getRowsForCategory(category) {
    // Extract relevant parts from entity id
    const entityId = category.monthlySubCategoryBudgetCalculation.entityId;
    const { path, id } = this.splitEntityId(entityId);

    const { monthlySubCategoryBudgetCalculationsCollection } = getEntityManager();

    // Get the current month
    const today = new ynab.utilities.DateWithoutTime();
    const currentMonth = today.startOfMonth();

    // Initialize return collection
    const categories = [category.monthlySubCategoryBudgetCalculation];

    // Loop and find every future month after the current one
    let findMonth = currentMonth;

    const funcFindInDirection = function (future) {
      while (findMonth) {
        // Go to next month, depending on future or past
        findMonth = findMonth.addMonths(future ? 1 : -1);

        // Find next category based on it's entityId
        const nextEntityId = this.buildEntityId(path, findMonth, id);
        console.log('nextEntityId: ', nextEntityId);
        const nextCategory = monthlySubCategoryBudgetCalculationsCollection.findItemByEntityId(nextEntityId);

        // Break if there is no next category
        if (nextCategory === null) {
          findMonth = null;
          break;
        }

        categories.push({
          month: findMonth,
          category: nextCategory
        });
      }
    };

    // Now find all categories in future and past
    funcFindInDirection(true);
    funcFindInDirection(false);

    return categories.sort(function (a, b) { return a.month - b.month; });
  }

  splitEntityId(entityId) {
    const split = entityId.split('/');
    const dateSplit = split[1].split('-');
    return {
      path: split[0],
      year: dateSplit[0],
      month: dateSplit[1],
      id: split[2]
    };
  }


  buildEntityId(path, dateTime, id) {
    return this.buildEntityIdFromParts(path, dateTime.getYear(), dateTime.getMonth(), id);
  }
  buildEntityIdFromParts(path, year, month, id) {
    return `${path}/${year}-${month}/${id}`;
  }
}
