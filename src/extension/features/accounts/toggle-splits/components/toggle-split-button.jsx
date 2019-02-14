import * as React from 'react';
import * as PropTypes from 'prop-types';
import { getToolkitStorageKey, setToolkitStorageKey } from 'toolkit/extension/utils/toolkit';
import { l10n } from 'toolkit/extension/utils/toolkit';
import { getEmberView } from 'toolkit/extension/utils/ember';
import { getEntityManager } from 'toolkit/extension/utils/ynab';

export class ToggleSplitButton extends React.Component {
  static propTypes = {
    toggleSplits: PropTypes.func.isRequired
  }

  state = {
    areAllSplitsExpanded: getToolkitStorageKey('are-all-splits-expanded', true)
  }

  componentDidMount() {
    if (this.state.areAllSplitsExpanded) {
      this.hideAllSplits();
    }
  }

  render() {
    return (
      <button className="button tk-toggle-splits" onClick={this.toggleSplits}>
        {this.state.areAllSplitsExpanded && <i className="flaticon stroke down"></i>}
        {!this.state.areAllSplitsExpanded && <i className="flaticon stroke right"></i>}
        {l10n('toolkit.toggleSplits', 'Toggle Splits')}
      </button>
    );
  }

  toggleSplits = () => {
    let newAreAllSplitsExpanded = !this.state.areAllSplitsExpanded;
    if (newAreAllSplitsExpanded) {
      this.showAllSplits();
    } else {
      this.hideAllSplits();
    }

    setToolkitStorageKey('are-all-splits-expanded', newAreAllSplitsExpanded);
    this.setState({ areAllSplitsExpanded: newAreAllSplitsExpanded });
  }

  hideAllSplits = () => {
    const collapsedSplitsMap = getEntityManager().transactionsCollection.reduce((reduced, transaction) => {
      if (transaction.getIsSplit()) {
        reduced[transaction.get('entityId')] = true;
      }

      return reduced;
    }, {});

    getEmberView($('.ynab-grid').attr('id')).set('collapsedSplits', collapsedSplitsMap);
  }

  showAllSplits = () => {
    getEmberView($('.ynab-grid').attr('id')).set('collapsedSplits', {});
  }
}
