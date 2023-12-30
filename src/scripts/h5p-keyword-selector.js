import Util from '@services/util';
import Dictionary from '@services/dictionary';
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
      behaviour: {
        enableSolutionsButton: false,
        enableRetry: false,
      },
      behaviour: {
        requireDoneConfirmation: false,
        allowEditingAfterDone: true
      },
      l10n: {
        noKeywords: 'There are no keywords to select from.',
        done: 'Done',
        edit: 'Edit'
      },
      a11y: {
        keywordsList: 'List of keywords to select from'
      }
    }, params);

    this.params.behaviour.allowEditingAfterDone =
      this.params.behaviour.allowEditingAfterDone &&
      this.params.behaviour.requireDoneConfirmation;

    this.contentId = contentId;
    this.extras = extras;

    // Fill dictionary
    this.dictionary = new Dictionary();
    this.dictionary.fill({ l10n: this.params.l10n, a11y: this.params.a11y });

    this.previousState = this.extras?.previousState || {};

    this.isDone = this.previousState?.done || false;

    const defaultLanguage = extras?.metadata?.defaultLanguage || 'en';
    this.languageTag = Util.formatLanguageCode(defaultLanguage);

    this.dom = this.buildDOM();

    // Initialize main component
    this.main = new Main(
      {
        contentText: this.params.keywordExtractorGroup.contentText,
        keywords: this.params.keywordExtractorGroup.keywords?.split(','),
        behaviour: this.params.behaviour,
        previousState: this.previousState.content,
        l10n: this.params.l10n,
        a11y: this.params.a11y
      },
      {
        onAnswered: () => {
          this.handleDone();
        },
        onResized: () => {
          this.trigger('resize');
        }
      }
    );
    this.dom.appendChild(this.main.getDOM());

    this.trigger('resize');
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
    dom.classList.add('h5p-keyword-selector-container');

    if (this.params.showTitle) {
      const introduction = document.createElement('div');
      introduction.classList.add('h5p-keyword-selector-title');
      introduction.innerText = this.getTitle();
      dom.appendChild(introduction);
    }

    return dom;
  }

  /**
   * Handle user is done.
   */
  handleDone() {
    this.isDone = true;
    this.triggerXAPIEvent('completed'); // To notify parent and save state
  }

  /**
   * Return H5P core's call to store current state.
   * @returns {object|undefined} Current state.
   */
  getCurrentState() {
    if (!this.params.keywordExtractorGroup.keywords) {
      return;
    }

    if (!this.getAnswerGiven()) {
      return; // User has not chosen anything
    }

    return {
      done: this.isDone,
      content: this.main.getCurrentState()
    };
  }

  /**
   * Get response as comma separated strings.
   * @returns {string} Response as comma separated strings.
   */
  getResponse() {
    return this.main.getResponse();
  }

  /**
   * Get task title.
   * @returns {string} Title.
   */
  getTitle() {
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
}

/** @constant {string} DEFAULT_DESCRIPTION Default description. */
KeywordSelector.DEFAULT_DESCRIPTION = 'Keyword Selector';
