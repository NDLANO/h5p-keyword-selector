import './keyword-item.scss';
import Util from '@services/util';

export default class KeywordItem {
  /**
   * @class
   * @param {object} [params] Parameters.
   * @param {string} [params.keyword] Keyword.
   * @param {boolean} [params.checked] If true, start checked.
   */
  constructor(params) {
    this.params = Util.extend({
      keyword: '',
      checked: false
    }, params);

    this.id = H5P.createUUID();

    /*
     * Implementing WAI/ARIA listbox pattern
     * @see https://www.w3.org/WAI/ARIA/apg/patterns/listbox/
     */
    this.dom = document.createElement('li');
    this.dom.id = this.id;
    this.dom.classList.add('h5p-keyword-selector-keyword-item');
    this.dom.setAttribute('role', 'option');
    this.dom.innerText = this.params.keyword;

    this.toggleSelected(this.params.checked);
  }

  /**
   * Get DOM.
   * @returns {HTMLElement} Element DOM.
   */
  getDOM() {
    return this.dom;
  }

  /**
   * Get id.
   * @returns {string} Id.
   */
  getId() {
    return this.id;
  }

  /**
   * Get keyword
   * @returns {string} Keyword.
   */
  getKeyword() {
    return this.params.keyword;
  }

  /**
   * Determine whether item is selected or not.
   * @returns {boolean} True, if item is selected, else false.
   */
  isSelected() {
    return this.isSelectedState;
  }

  /**
   * Toggle selected state.
   * @param {boolean} [state] Optional state to enforce.
   */
  toggleSelected(state) {
    if (this.isDisabled) {
      return;
    }

    this.isSelectedState = (typeof state === 'boolean') ?
      state :
      !this.isSelectedState;

    this.dom.setAttribute(
      'aria-checked', this.isSelectedState ? 'true' : 'false'
    );
  }

  /**
   * Set focus.
   * @param {boolean} state If true, set focus. Else remove.
   */
  toggleFocus(state) {
    if (this.isDisabled) {
      return;
    }

    this.dom.classList.toggle('focused', state);
  }

  /**
   * Enable.
   */
  enable() {
    this.dom.removeAttribute('disabled');
    this.isDisabled = false;
  }

  /**
   * Disable.
   */
  disable() {
    this.dom.setAttribute('disabled', 'disabled');
    this.isDisabled = true;
  }

  /**
   * Reset.
   */
  reset() {
    this.enable();
    this.toggleSelected(false);
  }
}
