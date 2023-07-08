import Util from '@services/util';
import KeywordSelector from '@components/keyword-selector/selector';
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

    this.globalExtras = this.params.globals.get('extras');
    this.currentState = 'inProgress'; // TODO: Use constants for lookup

    this.dom = document.createElement('div');
    this.dom.classList.add('h5p-keyword-selector-main-wrapper');

    const text = document.createElement('div');
    text.classList.add('h5p-keyword-text');
    // TODO: Check: Does it make sense to have the whole text as ARIA label?
    text.id = `h5p-keyword-text-${this.globalExtras.subContentId}`;
    text.innerHTML = this.params.contentText;
    this.dom.appendChild(text);

    // Initialize validation wrapper
    this.initKewordSelector();

    // Resize content type
    this.params.globals.get('resize')();
  }

  /**
   * Initialize the status bar for remaining characters in the field.
   */
  initKewordSelector() {
    this.keywordSelector = new KeywordSelector(
      {
        globals: this.params.globals,
        keywords: this.params.keywords,
        selectedKeywords: this.params.previousState,
        i10n : {
          errorMessage: this.params.i10n.errorMessage,
        }
      },
      {
        onClick: () => {
          this.callbacks.onProgressed('answered');
        }
      }
    );
    this.dom.append(this.keywordSelector.getDOM());
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
      content: this.keywordSelector
        .getSelectedeKeywords()
        .map((keyword) => keyword.value),
      progress: this.currentState,
    };
  }

  /**
   * Used for contracts.
   * Resets the complete task back to its' initial state.
   */
  resetTask() {
    this.keywordSelector.resetKeywords();
  }

  /**
   * Get response.
   * @returns {string} Response.
   */
  getResponse() {
    return this.keywordSelector.getSelectedeKeywords();
  }

  /**
   * Calculate score on based of selection.
   * @returns {boolean} Score.
   */
  calculateScore() {
    return this.keywordSelector.getSelectedeKeywords().length > 0
      ? this.params.maxScore : 0;
  }
}
