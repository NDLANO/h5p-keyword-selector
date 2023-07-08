import Util from '@services/util';
import KeywordList from '@components/keyword-list/keyword-list';
import '@styles/main.scss';

/**
 * Main DOM component incl. main controller.
 */
export default class Main {
  /**
   * @class
   * @param {object} [params] Parameters.
   * @param {object} [callbacks] Callbacks.
   * @param {object} [callbacks.onProgressed] Callback when user progressed.
   */
  constructor(params = {}, callbacks = {}) {
    this.params = Util.extend({
    }, params);

    this.callbacks = Util.extend({
      onProgressed: () => {}
    }, callbacks);

    this.dom = document.createElement('div');
    this.dom.classList.add('h5p-keyword-selector-main-wrapper');

    const text = document.createElement('div');
    text.classList.add('h5p-keyword-text');
    text.innerHTML = this.params.contentText;
    this.dom.appendChild(text);

    this.keywordList = new KeywordList(
      {
        keywords: this.params.keywords,
        previouslySeletedIndexes: this.params.previousState?.selected
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
    this.wasAnswered = false;
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
   * Get score based on selection.
   * @returns {number} Score.
   */
  getScore() {
    return this.keywordList.getSelectedIndexes().length > 0
      ? this.params.maxScore
      : 0;
  }
}
