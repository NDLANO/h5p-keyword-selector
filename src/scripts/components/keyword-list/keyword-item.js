import './keyword-item.scss';
import Util from '@services/util';

export default class KeywordItem {
  /**
   * @class
   * @param {object} [params] Parameters.
   */
  constructor(params) {
    this.params = Util.extend({
      keyword: '',
      checked: false
    }, params);

    this.dom = document.createElement('button');
    this.dom.classList.add('h5p-keyword-selector-keyword-item');
    this.dom.setAttribute('role', 'checkbox');
    this.dom.setAttribute('tabindex', '0');
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
    this.isSelectedState = (typeof state === 'boolean') ?
      state :
      !this.isSelectedState;

    this.dom.setAttribute(
      'aria-checked', this.isSelectedState ? 'true' : 'false'
    );
  }

  /**
   * Reset.
   */
  reset() {
    this.toggleSelected(false);
  }
}
