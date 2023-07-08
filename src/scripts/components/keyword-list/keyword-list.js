import './keyword-list.scss';
import KeywordItem from '@components/keyword-list/keyword-item';
import Util from '@services/util';

export default class KeywordList {
  /**
   * @class
   * @param {object} [params] Parameters.
   * @param {object} [callbacks] Callbacks.
   */
  constructor(params, callbacks) {
    this.params = Util.extend({
      keywords: [],
      previouslySeletedIndexes: []
    }, params);

    this.callbacks = Util.extend({
      onChanged: () => {}
    }, callbacks);

    this.dom = document.createElement('div');
    this.dom.classList.add('h5p-keyword-selector-keyword-list');
    this.dom.setAttribute('role', 'group');
    this.dom.setAttribute('aria-label', 'TODO');
    this.dom.addEventListener('click', (event) => {
      this.handleClick(event);
    });

    this.keywordItems = this.params.keywords.map((keyword, index) => {
      const keywordItem = new KeywordItem({
        keyword: keyword,
        checked: this.params.previouslySeletedIndexes?.includes(index) ?? false
      });

      this.dom.append(keywordItem.getDOM());

      return keywordItem;
    });
  }

  /**
   * Get DOM.
   * @returns {HTMLElement} Element DOM.
   */
  getDOM() {
    return this.dom;
  }

  /**
   * Handle click.
   * @param {PointerEvent} event Pointer event.
   */
  handleClick(event) {
    const item = this.keywordItems
      .find((item) => item.getDOM() === event.target);

    item?.toggleSelected();

    this.callbacks.onChanged();
  }

  /**
   * Get responses
   * @returns {string[]} Responses.
   */
  getResponses() {
    return this.keywordItems
      .filter((item) => item.isSelected())
      .map((item).getKeyword());
  }

  /**
   * Get indexes of selected keywords.
   * @returns {number[]} Indexes of selected keywords.
   */
  getSelectedIndexes() {
    return this.keywordItems
      .map((item, index) => item.isSelected() ? index : null)
      .filter((item) => item !== null);
  }

  /**
   * Reset keywords.
   */
  reset() {
    this.keywordItems.forEach((item) => {
      item.reset();
    });
  }
}
