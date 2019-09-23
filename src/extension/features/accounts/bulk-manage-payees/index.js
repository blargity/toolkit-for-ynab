import { Feature } from 'toolkit/extension/features/feature';
import { controllerLookup } from 'toolkit/extension/utils/ember';

export class BulkManagePayees extends Feature {
  observe = changedNodes => {
    if (
      changedNodes.has(
        'ynab-u modal-popup modal-account-edit-transaction-list ember-view modal-overlay active'
      )
    ) {
      this.invoke();
    }
  };

  invoke() {
    const menuText =
      (ynabToolKit.l10nData && ynabToolKit.l10nData['toolkit.accountsBulkManagePayees']) ||
      'Manage Payees';

    // Note that ${menuText} was intentionally placed on the same line as the <i> tag to
    // prevent the leading space that occurs as a result of using a multi-line string.
    // Using a dedent function would allow it to be placed on its own line which would be
    // more natural.
    //
    // The second <li> functions as a separator on the menu after the feature menu item.
    $('.modal-account-edit-transaction-move').before(
      $(`<li>
            <button class="toolkit-modal-select-budget-manage-payees">
            <i class="ember-view flaticon stroke group"><!----></i>${menuText}
            </button>
          </li>
          <li><hr /><li>`).click(() => {
        controllerLookup('accounts').send('openPayeeModal');
      })
    );
  }
}
