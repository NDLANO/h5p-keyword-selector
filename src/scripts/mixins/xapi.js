import Util from '@services/util';

/**
 * Mixin containing methods for xapi stuff.
 */
export default class XAPI {
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
      const response = this.getResponse()
        .map((response, index) => `${index}`)
        .join('[,]');

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

    // TODO: Yes, we can know the language at runtime. Use it.

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
}
