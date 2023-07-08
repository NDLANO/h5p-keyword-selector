import Util from '@services/util';
import Dictionary from '@services/dictionary';
import Globals from '@services/globals';
import Main from '@components/main';
import '@styles/h5p-keyword-selector.scss';
import QuestionTypeContract from './mixins/question-type-contract';
import XAPI from './mixins/xapi';

export default class KeywordSelector extends H5P.EventDispatcher {
  /**
   * @class
   * @param {object} params Parameters passed by the editor.
   * @param {number} contentId Content's id.
   * @param {object} [extras] Saved state, metadata, etc.
   */
  constructor(params, contentId, extras = {}) {
    super();

    Util.addMixins(
      KeywordSelector, [XAPI, QuestionTypeContract]
    );

    // Sanitize parameters
    this.params = Util.extend({
      showTitle: false,
      keywordExtractorGroup: {
        contentText: ''
      },
      maxScore: 1,
      score: 0,
      behaviour: {
        enableSolutionsButton: false,
        enableRetry: false,
      },
      i10n: {
        errorMessage: 'There are no keywords to select.'
      }
    }, params);

    this.isAnswered = false;
    this.contentId = contentId;
    this.extras = extras;

    // Fill dictionary
    this.dictionary = new Dictionary();
    this.dictionary.fill({ l10n: this.params.l10n, a11y: this.params.a11y });

    this.previousState = this.extras?.previousState || {};

    this.dom = this.buildDOM();

    // Set globals
    this.globals = new Globals();
    this.globals.set('params', this.params);
    this.globals.set('extras', this.extras);
    this.globals.set('resize', () => {
      this.trigger('resize');
    });

    // Initialize main component
    this.main = new Main(
      {
        globals: this.globals,
        contentText: this.params.keywordExtractorGroup.contentText,
        keywords: this.params.keywordExtractorGroup.keywords,
        maxScore: this.params.maxScore,
        previousState: this.previousState,
        i10n : {
          errorMessage: this.params.i10n.errorMessage,
        }
      },
      {
        onProgressed: (verb) => {
          this.handleProgressed(verb);
        },
      }
    );
    this.dom.appendChild(this.main.getDOM());

    this.globals.get('resize')();
  }

  /**
   * Attach library to wrapper.
   * @param {H5P.jQuery} $wrapper Content's container.
   */
  attach($wrapper) {
    $wrapper.get(0).classList.add('h5p-keyword-selector');
    $wrapper.get(0).appendChild(this.dom);
  }

  /**
   * Build main DOM.
   * @returns {HTMLElement} Main DOM.
   */
  buildDOM() {
    const dom = document.createElement('div');
    dom.classList.add('h5p-keyword-selector-main');

    if (this.params.showTitle) {
      const introduction = document.createElement('div');
      introduction.classList.add('h5p-keyword-selector-introduction');
      introduction.innerText = this.getTitle();
      dom.appendChild(introduction);
    }

    return dom;
  }

  /**
   * Get task title.
   * @returns {string} Title.
   */
  getTitle() {
    // H5P Core function: createTitle
    return H5P.createTitle(
      this.extras?.metadata?.title || KeywordSelector.DEFAULT_DESCRIPTION
    );
  }

  /**
   * Get description.
   * @returns {string} Description.
   */
  getDescription() {
    return KeywordSelector.DEFAULT_DESCRIPTION;
  }

  /**
   * Handle progressed.
   * @param {string} verb Verb id.
   */
  handleProgressed(verb) {
    this.isAnswered = true;
    this.triggerXAPIEvent(verb);
  }

  /**
   * Get response.
   * @returns {string} Response.
   */
  getResponse() {
    return this.main.getResponse();
  }

  /**
   * Return H5P core's call to store current state.
   * @returns {object} Current state.
   */
  getCurrentState() {
    return this.main.getCurrentState();
  }
}

/** @constant {string} Default description */
KeywordSelector.DEFAULT_DESCRIPTION = 'Keyword selector';
