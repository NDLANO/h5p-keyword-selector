import './keyword-list.scss';
import KeywordItem from '@components/keyword-list/keyword-item';
import Util from '@services/util';

export default class KeywordList {
  /**
   * @class
   * @param {object} [params] Parameters.
   * @param {string[]} [params.keywords] Keywords.
   * @param {number[]} [params.previouslySeletedIndexes] Previously selected.
   * @param {object} [params.a11y] Phrases for a11y.
   * @param {object} [callbacks] Callbacks.
   * @param {function} [callbacks.onChanged] Callback when selection changed.
   */
  constructor(params, callbacks) {
    this.params = Util.extend({
      keywords: [],
      previouslySeletedIndexes: [],
      disabled: false,
      a11y: {}
    }, params);

    this.callbacks = Util.extend({
      onChanged: () => {}
    }, callbacks);

    this.currentPosition = 0;

    /*
     * Implementing WAI/ARIA listbox pattern
     * @see https://www.w3.org/WAI/ARIA/apg/patterns/listbox/
     */
    this.dom = document.createElement('ul');
    this.dom.classList.add('h5p-keyword-selector-keyword-list');
    this.dom.setAttribute('role', 'listbox');
    this.dom.setAttribute('tabindex', '0');
    this.dom.setAttribute('aria-label', this.params.a11y.keywordsList);
    this.dom.setAttribute('aria-multiselectable', 'true');

    this.keywordItems = this.params.keywords.map((keyword, index) => {
      const keywordItem = new KeywordItem({
        keyword: keyword,
        checked: this.params.previouslySeletedIndexes?.includes(index) ?? false
      });

      this.dom.append(keywordItem.getDOM());

      return keywordItem;
    });

    if (this.params.disabled) {
      this.disable();
    }

    if (!this.keywordItems.length) {
      return;
    }

    this.dom.addEventListener('keydown', (event) => {
      this.handleKeydown(event);
    });
    this.dom.addEventListener('click', (event) => {
      this.handleClicked(event);
    });
    this.dom.addEventListener('focus', () => {
      this.handleFocusChanged();
    });
    this.dom.addEventListener('blur', () => {
      this.handleFocusChanged();
    });

    this.setActiveDescendant(this.keywordItems[this.currentPosition].getId());
  }

  /**
   * Get DOM.
   * @returns {HTMLElement} Element DOM.
   */
  getDOM() {
    return this.dom;
  }

  /**
   * Set active descendant for listbox.
   * @param {string} id Id of element to set as active descendant.
   */
  setActiveDescendant(id) {
    if (typeof id !== 'string') {
      return;
    }
    this.dom.setAttribute('aria-activedescendant', id);
  }

  /**
   * Handle click.
   * @param {PointerEvent} event Pointer event.
   */
  handleClicked(event) {
    const item = this.keywordItems
      .find((item) => item.getDOM() === event.target);

    if (!item) {
      return;
    }

    item.toggleSelected();

    this.callbacks.onChanged();
  }

  /**
   * Handle key down.
   * @param {KeyboardEvent} event Keyboard event.
   */
  handleKeydown(event) {
    if (event.code === 'ArrowLeft' || event.code === 'ArrowUp') {
      this.moveButtonFocus(-1);
    }
    else if (event.code === 'ArrowRight' || event.code === 'ArrowDown') {
      this.moveButtonFocus(1);
    }
    else if (event.code === 'Home') {
      this.moveButtonFocus(0 - this.currentPosition);
    }
    else if (event.code === 'End') {
      this.moveButtonFocus(
        this.keywordItems.length - 1 - this.currentPosition
      );
    }
    else if (event.code === 'Enter' || event.code === 'Space') {
      this.handleClicked(
        { target: this.keywordItems[this.currentPosition].getDOM() }
      );
    }
    else if (event.code === 'KeyA' && event.ctrlKey) {
      this.handleSelectedAll();
    }
    else {
      return;
    }

    event.preventDefault();
  }

  /**
   * Handle focus changed.
   */
  handleFocusChanged() {
    this.moveButtonFocus(document.activeElement === this.dom ? 0 : null);
  }

  /**
   * Handle all items selected.
   */
  handleSelectedAll() {
    // If all items are selected, select none. Else select all.
    this.selectAll(
      this.getSelectedIndexes().length !== this.keywordItems.length
    );
  }

  /**
   * Select all or no tags.
   * @param {boolean} all True to select all, false to select none.
   */
  selectAll(all) {
    if (typeof all !== 'boolean') {
      return;
    }

    this.keywordItems.forEach((item) => {
      item.toggleSelected(all);
    });

  }

  /**
   * Move button focus
   * @param {number|null} offset Offset to move position by. Null removes all focus.
   */
  moveButtonFocus(offset) {
    if (offset === null) {
      this.keywordItems.forEach((item) => {
        item.toggleFocus(false);
      });

      return;
    }

    if (typeof offset !== 'number') {
      return;
    }

    if (
      this.currentPosition + offset < 0 ||
      this.currentPosition + offset > this.keywordItems.length - 1
    ) {
      return; // Don't cycle
    }

    this.currentPosition = this.currentPosition + offset;

    this.keywordItems.forEach((item, index) => {
      item.toggleFocus(index === this.currentPosition);
    });

    this.setActiveDescendant(this.keywordItems[this.currentPosition].getId());
  }

  /**
   * Get responses
   * @returns {string[]} Responses.
   */
  getResponses() {
    return this.keywordItems
      .filter((item) => item.isSelected())
      .map((item) => item.getKeyword());
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
   * Determine whether keyword list is disabled or not.
   * @returns {boolean} True, if disabled, else false.
   */
  isDisabled() {
    return this.isDisabledState;
  }

  /**
   * Enable.
   */
  enable() {
    this.keywordItems.forEach((item) => {
      item.enable();
    });

    this.isDisabledState = false;
  }

  /**
   * Disable.
   */
  disable() {
    this.keywordItems.forEach((item) => {
      item.disable();
    });

    this.isDisabledState = true;
  }

  /**
   * Reset keywords.
   */
  reset() {
    this.enable();
    this.keywordItems.forEach((item) => {
      item.reset();
    });
  }
}
