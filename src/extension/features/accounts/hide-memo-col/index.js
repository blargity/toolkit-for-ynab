import { Feature } from 'toolkit/extension/features/feature';

export class HideMemoCol extends Feature {
  injectCSS() {
    return require('./index.css');
  }

  shouldInvoke() {
    return true;
  }

  invoke() {
    $('body').addClass('toolkit-hide-memo');
  }
}
