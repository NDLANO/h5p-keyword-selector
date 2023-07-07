import './selector.scss';
import Globals from '@services/globals';
import Util from '@services/util';

export default class Selector {
  /**
   * @class
   * @param {object} params Parameter from editor.
   * @param {object} params.i10n Localization strings.
   * @param {object} [callbacks] Callbacks.
   */
  constructor(params, callbacks) {
    // Set missing params
    this.params = params;

    // Sanitize callbacks
    this.callbacks = Util.extend({
      onClick: () => {},
      onkeydown: () => {}
    }, callbacks);

    this.globalExtras = Globals.get('extras');

    if (!this.params.keywords) {
      // Create error message
      this.dom = document.createElement('div');
      this.dom.classList.add('h5p-keyword-selector-error');
      this.dom.innerHTML = this.params.i10n.errorMessage;
      return;
    }
    this.params.keywords = this.params.keywords.split(',');

    // Create div element that wrapper checkbox
    this.dom = document.createElement('ul');
    this.dom.classList.add('h5p-keyword-selector-selector-container');
    this.dom.setAttribute(
      'aria-describedby',
      `h5p-keyword-text-${this.globalExtras.subContentId}`
    );

    // add event listeners for the keyword selection
    ['click', 'keydown'].forEach((event) => {
      this.dom.addEventListener(event, (e) => {
        this.handleSelection(e);
        this.callbacks.onClick(e);
      });
    });

    // Create keyword checkboxes
    this.checkboxes = [];
    this.params.keywords.forEach((keyword) => {
      const checkboxContainer = document.createElement('li');
      checkboxContainer.classList.add('h5p-keyword-selector-selector');
      checkboxContainer.setAttribute('role', 'checkbox');
      checkboxContainer.setAttribute('tabindex', 0);

      // Create keyword checkboxes
      const checkbox = this.initKeywordDom(checkboxContainer, keyword);
      checkboxContainer.appendChild(checkbox);
      checkboxContainer.appendChild(document.createTextNode(keyword));
      this.dom.appendChild(checkboxContainer);
    });
  }

  /**
   * Create keyword checkboxes.
   * @param {HTMLDivElement} container container for keyword checkboxes.
   * @param {string} keyword value for checkbox.
   * @returns {HTMLElement} checkbox DOM element.
   */
  initKeywordDom(container, keyword) {
    const checkbox = document.createElement('input');
    checkbox.setAttribute('type', 'checkbox');
    checkbox.setAttribute('tabindex', -1);
    checkbox.ariaHidden = true;

    // Maintiain previous state of checkbox
    if (
      this.params.selectedKeywords?.content &&
      this.params.selectedKeywords.content.includes(keyword)
    ) {
      checkbox.checked = true;
      container.classList.add('active');
      container.setAttribute('aria-checked', true);
    }
    checkbox.value = keyword;
    checkbox.classList.add('h5p-keyword-selector-selector-checkbox');
    this.checkboxes.push(checkbox);

    return checkbox;
  }

  /**
   * Return the DOM for this class.
   * @returns {HTMLElement} DOM for this class.
   */
  getDOM() {
    return this.dom;
  }

  /**
   * Handle keyword selection.
   * @param {*} event Event.
   * @returns {void}
   */
  handleSelection(event) {
    if (event.type === 'keydown' && !['Space', 'Enter'].includes(event.code)) {
      return;
    }

    const origin = event.target;
    // Do not handle parent originated event
    if (origin === this) {
      return;
    }
    origin.classList.toggle('active');
    origin.querySelector('input').checked = origin.classList.contains('active');
  }

  /**
   * Get selected keywords.
   * @returns {void}
   */
  getSelectedeKeywords() {
    let selectedKeywords = [];
    this.checkboxes?.map((item, index) => ({ item, index }))
      .filter(({ item }) => item.checked)
      .forEach(({ item, index }) => {
        selectedKeywords.push({
          value: item.value,
          index: index
        });
      });

    return selectedKeywords;
  }

  /**
   * Reset keywords selection.
   * @returns {void}
   */
  resetKeywords() {
    // Deselect all the keywords
    this.checkboxes.forEach((checkbox) => {
      checkbox.checked = false;
      checkbox.parentNode.classList.remove('active');
    });
  }
}
