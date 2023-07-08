import Util from '@services/util';
import KeywordList from '@components/keyword-list/keyword-list';
import './main.scss';

/**
 * Main DOM component incl. main controller.
 */
export default class Main {
  /**
   * @class
   * @param {object} [params] Parameters.
   * @param {string[]} [params.keywords] Keywords.
   * @param {object} [params.previousState] Previous state.
   * @param {object} [callbacks] Callbacks.
   * @param {function} [callbacks.onAnswered] Callback when user answered.
   */
  constructor(params = {}, callbacks = {}) {
    this.params = Util.extend({
      keywords: [],
      l10n: {},
      a11y: {}
    }, params);

    this.callbacks = Util.extend({
      onAnswered: () => {}
    }, callbacks);

    this.dom = document.createElement('div');
    this.dom.classList.add('h5p-keyword-selector-main');

    const text = document.createElement('div');
    text.classList.add('h5p-keyword-selector-main-text');
    text.innerHTML = this.params.contentText;
    this.dom.appendChild(text);

    if (!this.params.keywords) {
      const message = document.createElement('div');
      message.classList.add('h5p-keyword-selector-main-message');
      message.innerText = this.params.l10n.noKeywords;
      this.dom.append(message);

      return;
    }

    this.keywordList = new KeywordList(
      {
        keywords: this.params.keywords,
        previouslySeletedIndexes: this.params.previousState?.selected,
        a11y: {
          keywordsList: this.params.a11y.keywordsList
        }
      },
      {
        onChanged: () => {
          this.callbacks.onAnswered();
        }
      }
    );
    this.dom.append(this.keywordList.getDOM());
  }

  /**
   * Get DOM.
   * @returns {HTMLElement} Content DOM.
   */
  getDOM() {
    return this.dom;
  }

  /**
   * Return H5P core's call to store current state.
   * @returns {object} Current state.
   */
  getCurrentState() {
    return {
      selected: this.keywordList.getSelectedIndexes(),
    };
  }

  /**
   * Reset.
   */
  reset() {
    this.keywordList.reset();
  }

  /**
   * Get response.
   * @returns {string} Response.
   */
  getResponses() {
    return this.keywordList.getResponses();
  }

  /**
   * Get number of selected keywords.
   * @returns {number} Number of selected keywords.
   */
  getSelectedCount() {
    return this.keywordList.getSelectedIndexes().length;
  }
}
