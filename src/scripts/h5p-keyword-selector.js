import Util from '@services/util';
import Dictionary from '@services/dictionary';
import Globals from '@services/globals';
import Main from '@components/main';
import '@styles/h5p-keyword-selector.scss';

export default class KeywordSelector extends H5P.EventDispatcher {
  /**
   * @class
   * @param {object} params Parameters passed by the editor.
   * @param {number} contentId Content's id.
   * @param {object} [extras] Saved state, metadata, etc.
   */
  constructor(params, contentId, extras = {}) {
    super();

    // Sanitize parameters
    this.params = Util.extend({
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
    Globals.set('params', this.params);
    Globals.set('extras', this.extras);
    Globals.set('resize', () => {
      this.trigger('resize');
    });

    // Initialize main component
    this.main = new Main(
      {
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

    Globals.get('resize')();
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

    const introduction = document.createElement('div');
    introduction.classList.add('h5p-introduction');
    introduction.innerText = this.getTitle();
    dom.appendChild(introduction);

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
   * Trigger xAPI event.
   * @param {string} verb Short id of the verb we want to trigger.
   */
  triggerXAPIEvent(verb) {
    const xAPIEvent = this.createXAPIEvent(verb);
    this.trigger(xAPIEvent);
  }

  /**
   * Create an xAPI event.
   * @param {string} verb Short id of the verb we want to trigger.
   * @returns {H5P.XAPIEvent} Event template.
   */
  createXAPIEvent(verb) {
    const xAPIEvent = this.createXAPIEventTemplate(verb);
    Util.extend(
      xAPIEvent.getVerifiedStatementValue(['object', 'definition']),
      this.getXAPIDefinition(this.params.question)
    );

    // Build response for report
    if (verb === 'answered') {
      this.params.score = this.params.maxScore;
      xAPIEvent.setScoredResult(
        this.params.maxScore,
        this.params.maxScore,
        this
      );
      xAPIEvent.data.statement.result.score.raw = this.params.maxScore;

      // Add the response
      let response = '';
      const userResponse = this.getResponse();
      for (let i = 0; i < userResponse.length; i++) {
        if (response !== '') {
          response += '[,]';
        }
        response += userResponse[i].index;
      }
      xAPIEvent.data.statement.result.response = response;
    }

    return xAPIEvent;
  }

  /**
   * Create a definition template
   * @param {string} question Question text
   * @returns {object} XAPI definition template
   */
  getXAPIDefinition(question) {
    let definition = {};

    definition.interactionType = 'choice';
    definition.type = 'http://adlnet.gov/expapi/activities/cmi.interaction';
    definition.description = {
      'en-US': question, // We don't know the language at runtime
    };

    definition.correctResponsesPattern = [];
    definition.choices = [];
    const userResponse = this.params.keywordExtractorGroup.keywords.split(',');

    definition.choices = userResponse.map((response, index) => {
      return {
        id: `${index}`,
        description: { 'en-US': `'<div>${response}</div>'` },
      };
    });

    definition.correctResponsesPattern =
      userResponse.map((response, index) => `${index}`).join('[,]');

    return definition;
  }

  /**
   * Get current score.
   * @returns {number} Current score.
   * @see contract at
   * {@link https://h5p.org/documentation/developers/contracts#guides-header-2}
   */
  getScore() {
    return this.main.calculateScore();
  }

  /**
   * Get maximum possible score.
   * @returns {number} Score necessary for mastering.
   * @see contract at
   * {@link https://h5p.org/documentation/developers/contracts#guides-header-3}
   */
  getMaxScore() {
    return this.params.maxScore;
  }

  /**
   * Get response.
   * @returns {string} Response.
   */
  getResponse() {
    return this.main.getResponse();
  }

  /**
   * Used for contracts.
   * Resets the complete task back to its' initial state.
   */
  resetTask() {
    this.isAnswered = false;
    this.main.resetTask();
  }

  /**
   * Get xAPI data.
   * @returns {object} XAPI statement.
   * @see contract at
   * {@link https://h5p.org/documentation/developers/contracts#guides-header-6}
   */
  getXAPIData() {
    const xAPIEvent = this.createXAPIEvent('answered');
    return {
      statement: xAPIEvent.data.statement,
    };
  }

  /**
   * Return H5P core's call to store current state.
   * @returns {object} Current state.
   */
  getCurrentState() {
    return this.main.getCurrentState();
  }

  /**
   * Return H5P core's call to store current state.
   * @returns {boolean} true if answers have been given.
   */
  getAnswerGiven() {
    return this.isAnswered;
  }
}

/** @constant {string} Default description */
KeywordSelector.DEFAULT_DESCRIPTION = 'Keyword selector';
