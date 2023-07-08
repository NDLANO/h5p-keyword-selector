import './selector.scss';
import Util from '@services/util';

// TODO: Split into components, cmp. KeywordExtractor widget

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
      onClick: () => {}
    }, callbacks);

    this.globalExtras = this.params.globals.get('extras');

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
    this.dom.addEventListener('click', (event) => {
      this.handleSelection(event);
      this.callbacks.onClick(event);
    });

    // Create keyword checkboxes
    this.checkboxes = [];
    this.params.keywords.forEach((keyword) => {
      // TODO: Use proper elements and pattern, https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/
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
   * @param {PointerEvent} event Event.
   * @returns {void}
   */
  handleSelection(event) {
    const origin = event.target;

    // Do not handle parent originated event
    if (origin === this.dom) {
      return;
    }

    origin.classList.toggle('active');
    origin.querySelector('input').checked = origin.classList.contains('active');
  }

  /**
   * Get selected keywords.
   * @returns {object[]} Selected keywords.
   */
  getSelectedeKeywords() {
    return this.checkboxes?.reduce((result, checkbox, index) => {
      return (checkbox.checked) ?
        [...result, { value: checkbox.value, index: index }] :
        result;
    }, []);
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
