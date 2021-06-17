import { Feature } from 'toolkit/extension/features/feature';
import { getToolkitStorageKey, setToolkitStorageKey } from 'toolkit/extension/utils/toolkit';

const YNAB_THEME_SWITCHER = 'js-ynab-new-theme-switcher-themes';
const TK_COLOUR_BLIND_OPTION_MENU = 'tk-colour-blind-option';

/*
MIT License

Copyright (c) 2014 Kevin Kwok <antimatter15@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

function lab2rgb(lab) {
  var y = (lab[0] + 16) / 116;
  var x = lab[1] / 500 + y;
  var z = y - lab[2] / 200;
  var r;
  var g;
  var b;

  x = 0.95047 * (x * x * x > 0.008856 ? x * x * x : (x - 16 / 116) / 7.787);
  y = 1.0 * (y * y * y > 0.008856 ? y * y * y : (y - 16 / 116) / 7.787);
  z = 1.08883 * (z * z * z > 0.008856 ? z * z * z : (z - 16 / 116) / 7.787);

  r = x * 3.2406 + y * -1.5372 + z * -0.4986;
  g = x * -0.9689 + y * 1.8758 + z * 0.0415;
  b = x * 0.0557 + y * -0.204 + z * 1.057;

  r = r > 0.0031308 ? 1.055 * Math.pow(r, 1 / 2.4) - 0.055 : 12.92 * r;
  g = g > 0.0031308 ? 1.055 * Math.pow(g, 1 / 2.4) - 0.055 : 12.92 * g;
  b = b > 0.0031308 ? 1.055 * Math.pow(b, 1 / 2.4) - 0.055 : 12.92 * b;

  return [
    Math.max(0, Math.min(1, r)) * 255,
    Math.max(0, Math.min(1, g)) * 255,
    Math.max(0, Math.min(1, b)) * 255,
  ];
}

function rgb2lab(rgb) {
  var r = rgb[0] / 255;
  var g = rgb[1] / 255;
  var b = rgb[2] / 255;
  var x;
  var y;
  var z;

  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

  x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
  y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.0;
  z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;

  x = x > 0.008856 ? Math.pow(x, 1 / 3) : 7.787 * x + 16 / 116;
  y = y > 0.008856 ? Math.pow(y, 1 / 3) : 7.787 * y + 16 / 116;
  z = z > 0.008856 ? Math.pow(z, 1 / 3) : 7.787 * z + 16 / 116;

  return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
}

/* END OF LICENSE */

function hex2rgb(hex) {
  if (hex.length !== 7) {
    return [0, 0, 0];
  }

  var r = parseInt(hex.slice(1, 3), 16);
  var g = parseInt(hex.slice(3, 5), 16);
  var b = parseInt(hex.slice(5, 7), 16);

  return [Number.isNaN(r) ? 0 : r, Number.isNaN(g) ? 0 : g, Number.isNaN(b) ? 0 : b];
}

function rgb2hex(rgb) {
  var r = Math.round(rgb[0]).toString(16);
  var g = Math.round(rgb[1]).toString(16);
  var b = Math.round(rgb[2]).toString(16);

  return (
    '#' +
    (r.length === 2 ? r : '0' + r) +
    (g.length === 2 ? g : '0' + g) +
    (b.length === 2 ? b : '0' + b)
  );
}

function lab2lch(lab) {
  var c = Math.sqrt(lab[1] * lab[1] + lab[2] * lab[2]);
  var h = Math.atan2(lab[2], lab[1]);
  if (h > 0) {
    h = (h / Math.PI) * 180;
  } else {
    h = 360 - (Math.abs(h) / Math.PI) * 180;
  }
  return [lab[0], c, h];
}

function lch2lab(lch) {
  var a = Math.cos((lch[2] / 180) * Math.PI) * lch[1];
  var b = Math.sin((lch[2] / 180) * Math.PI) * lch[1];
  return [lch[0], a, b];
}

function hexToLch(hex) {
  return lab2lch(rgb2lab(hex2rgb(hex)));
}

function lchToHex(l, c, h) {
  return rgb2hex(lab2rgb(lch2lab([l, c, h])));
}

export class ColourBlindMode extends Feature {
  injectCSS() {
    return require('./index.css');
  }

  shouldInvoke() {
    var optionMenu = $(`.${TK_COLOUR_BLIND_OPTION_MENU}`);
    return optionMenu.length === 0;
  }

  calculateAccents(hex) {
    var lch = hexToLch(hex);

    var accents = [
      'l025c020',
      'l030c045',
      'l045c055',
      'l090c090',
      'l100c100',
      'l110c100',
      'l120c050',
      'l125c065',
      'l140c060',
      'l140c075',
      'l150c060',
      'l160c015',
    ];
    var out = {};

    accents.forEach((val) => {
      var l = parseInt(val.substr(1, 3)) / 100;
      var c = parseInt(val.substr(5, 3)) / 100;
      out[val] = lchToHex(lch[0] * l, lch[1] * c, lch[2]);
    });

    return out;
  }

  setColour(name, hex) {
    if (!hex) {
      return;
    }

    document.body.style.setProperty(`--tk-colour-blind-${name}`, hex);

    var accents = this.calculateAccents(hex);

    var keys = Object.keys(accents);
    keys.forEach((key) => {
      document.body.style.setProperty(`--tk-colour-blind-${name}-${key}`, accents[key]);
    });
  }

  getColour(name) {
    return getComputedStyle(document.body).getPropertyValue(`--tk-colour-blind-${name}`).trim();
  }

  resetColour(name) {
    document.body.style.removeProperty(`--tk-colour-blind-${name}`);
  }

  saveColour(name) {
    setToolkitStorageKey(`colour-blind-${name}`, this.getColour(name));
  }

  loadColour(name, def) {
    return getToolkitStorageKey(`colour-blind-${name}`, def);
  }

  setSquare(name, value) {
    if (value) {
      if (!this.getSquare(name)) {
        document.body.setAttribute(`tk-colour-blind-${name}-square`, true);
      }
    } else if (this.getSquare(name)) {
      document.body.removeAttribute(`tk-colour-blind-${name}-square`);
    }
  }

  getSquare(name) {
    return !!document.body.getAttribute(`tk-colour-blind-${name}-square`);
  }

  saveSquare(name) {
    setToolkitStorageKey(`colour-blind-${name}-square`, this.getSquare(name));
  }

  loadSquare(name, def) {
    return getToolkitStorageKey(`colour-blind-${name}-square`, def);
  }

  loadSettings() {
    // Load colours from storage - otherwise use values from style sheet
    var positive = this.loadColour('positive', this.getColour('positive'));
    var warning = this.loadColour('warning', this.getColour('warning'));
    var negative = this.loadColour('negative', this.getColour('negative'));

    this.setColour('positive', positive);
    this.setColour('warning', warning);
    this.setColour('negative', negative);

    this.setSquare('positive', this.loadSquare('positive', false));
    this.setSquare('warning', this.loadSquare('warning', false));
    this.setSquare('negative', this.loadSquare('negative', true)); // On by default
  }

  saveSettings() {
    this.saveColour('positive');
    this.saveColour('warning');
    this.saveColour('negative');

    this.saveSquare('positive');
    this.saveSquare('warning');
    this.saveSquare('negative');
  }

  cancelChanges() {
    // Reset the live colour preview - this is necessary because if the user has
    // no saved settings the default colour otherwise can't be read
    this.resetColour('positive');
    this.resetColour('warning');
    this.resetColour('negative');

    this.loadSettings();
  }

  invoke() {
    this.loadSettings();
  }

  createColourOption(name, label) {
    var value = this.getColour(name);

    var button = $(
      `<button>
        <div class="tk-colour-blind-${name}">
          <input type="color" value="${value}" class="tk-colour-blind-picker" style="background-color: ${value};"></input>
        </div>
        <div class="ynab-new-theme-switcher-label">${label}</div>
      </button>`
    );

    // Live update colours as they are selected
    $('input', button).on('input', (e) => {
      this.setColour(name, e.target.value);
    });

    // If the user clicks on the button, redirect it to the input
    button.on('click', (e) => {
      let input = $('input', button);
      if (e.target !== input.get(0)) {
        input.trigger('click');
      }
    });

    return button;
  }

  createSquareOption(name) {
    var square = this.getSquare(name);

    var option = $(
      `<div>
        <input type="checkbox" id="tk-colour-blind-${name}-square" ${square ? 'checked' : ''}>
        <label for="tk-colour-blind-${name}-square">Square Corners</label>
      </div>`
    );
    $('input', option).on('click', (e) => {
      this.setSquare(name, e.target.checked);
    });
    return option;
  }

  buildOptionsMenu() {
    let themeSwitcher = $(`.${YNAB_THEME_SWITCHER}`);
    if (themeSwitcher.length === 0) {
      return;
    }

    let optionsMenu = $(
      `<div class="ynab-new-theme-switcher-option ${TK_COLOUR_BLIND_OPTION_MENU}">
        <h3>Colour Blind Mode</h3>
      </div>`
    );

    let pickerGrid = $(`<div class="ynab-new-theme-switcher-grid"></div>`);
    pickerGrid.append(this.createColourOption('positive', 'Positive'));
    pickerGrid.append(this.createColourOption('warning', 'Warning'));
    pickerGrid.append(this.createColourOption('negative', 'Negative'));

    let squareGrid = $(`<div class="ynab-new-theme-switcher-grid tk-colour-blind-square"></div>`);
    squareGrid.append(this.createSquareOption('positive'));
    squareGrid.append(this.createSquareOption('warning'));
    squareGrid.append(this.createSquareOption('negative'));

    optionsMenu.append(pickerGrid);
    optionsMenu.append(squareGrid);
    themeSwitcher.append(optionsMenu);

    // Trigger a resize event so the modal adjusts position for its new height
    $(window).trigger('resize');

    // Todo: not this
    $('.ynab-new-theme-switcher .modal-actions .button-primary').on('click', () => {
      this.saveSettings();
    });
    $('.ynab-new-theme-switcher .modal-actions button:last-child').on('click', () => {
      this.cancelChanges();
    });
    $('.ynab-new-theme-switcher .modal-close').on('click', () => {
      this.cancelChanges();
    });
  }

  observe(changedNodes) {
    if (!this.shouldInvoke()) {
      return;
    }

    if (changedNodes.has(`modal-content ${YNAB_THEME_SWITCHER}`)) {
      this.buildOptionsMenu();
    }
  }
}
