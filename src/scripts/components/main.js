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
      behaviour: {
        requireDoneConfirmation: false,
        allowRevertDone: true
      },
      l10n: {},
      a11y: {}
    }, params);

    this.callbacks = Util.extend({
      onAnswered: () => {},
      onResized: () => {}
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
        disabled: this.params.previousState?.disabled,
        a11y: {
          keywordsList: this.params.a11y.keywordsList
        }
      },
      {
        onChanged: () => {
          if (this.params.behaviour.requireDoneConfirmation) {
            return; // User needs to actively confirm being done
          }

          this.callbacks.onAnswered();
        }
      }
    );
    this.dom.append(this.keywordList.getDOM());

    if (this.params.behaviour.requireDoneConfirmation) {
      this.buttonDone = document.createElement('button');
      this.buttonDone.classList.add('h5p-joubelui-button');
      this.buttonDone.classList.add('h5p-keyword-selector-done-button');
      this.buttonDone.classList.toggle(
        'display-none', this.params.previousState?.disabled === true
      );
      this.buttonDone.innerText = this.params.l10n.done;
      this.buttonDone.addEventListener('click', () => {
        this.buttonDone.classList.add('display-none');
        if (this.params.behaviour.allowEditingAfterDone) {
          this.buttonEdit.classList.remove('display-none');
        }

        this.keywordList.disable();
        this.callbacks.onAnswered();
        this.callbacks.onResized();
      });
      this.dom.append(this.buttonDone);

      this.buttonEdit = document.createElement('button');
      this.buttonEdit.classList.add('h5p-joubelui-button');
      this.buttonEdit.classList.add('h5p-keyword-selector-edit-button');
      this.buttonEdit.classList.toggle(
        'display-none',
        this.params.previousState?.disabled !== true ||
          !this.params.behaviour.allowEditingAfterDone
      );
      this.buttonEdit.innerText = this.params.l10n.edit;
      this.buttonEdit.addEventListener('click', () => {
        this.buttonEdit.classList.add('display-none');
        this.buttonDone.classList.remove('display-none');
        this.keywordList.enable();
        this.callbacks.onResized();
      });
      this.dom.append(this.buttonEdit);
    }
  }

  /**
   * Get DOM.
   * @returns {HTMLElement} Content DOM.
   */
  getDOM() {
    return this.dom;
  }

  /**
   * Get response as comma separated strings.
   * @returns {string} Response as comma separated strings.
   */
  getResponse() {
    return this.keywordList.getResponses().join(', ');
  }

  /**
   * Return H5P core's call to store current state.
   * @returns {object} Current state.
   */
  getCurrentState() {
    return {
      disabled: this.keywordList.isDisabled(),
      selected: this.getSelectedIndexes()
    };
  }

  /**
   * Reset.
   */
  reset() {
    this.buttonDone?.classList.remove('display-none');
    this.keywordList?.reset();
  }

  /**
   * Get selected indexes.
   * @returns {number[]} Selectes indexes.
   */
  getSelectedIndexes() {
    if (!this.keywordList) {
      return [];
    }

    return this.keywordList.getSelectedIndexes();
  }

  /**
   * Get number of selected keywords.
   * @returns {number} Number of selected keywords.
   */
  getSelectedCount() {
    if (!this.keywordList) {
      return 0;
    }

    return this.keywordList.getSelectedIndexes().length;
  }
}
