describe('API Status Component', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should show checking status initially', () => {
    cy.get('[role="status"]')
      .should('be.visible')
      .and('contain.text', 'Checking API key...');
  });

  it('should show valid status and hide after timeout', () => {
    cy.intercept('POST', 'https://openrouter.ai/api/v1/chat/completions', {
      statusCode: 200,
      body: {
        choices: [{ message: 'Hello' }]
      }
    }).as('validateApi');

    // Wait for the API call to complete
    cy.wait('@validateApi');

    // Check valid status is shown
    cy.get('[role="status"]')
      .should('be.visible')
      .and('contain.text', 'API key verified');

    // Wait for 5 seconds and verify the status is hidden
    cy.wait(5000);
    cy.get('[role="status"]').should('not.exist');
  });

  it('should show invalid status for invalid API key', () => {
    cy.intercept('POST', 'https://openrouter.ai/api/v1/chat/completions', {
      statusCode: 401,
      body: {
        error: 'Invalid API key'
      }
    }).as('validateApi');

    // Wait for the API call to complete
    cy.wait('@validateApi');

    // Check invalid status is shown
    cy.get('[role="status"]')
      .should('be.visible')
      .and('contain.text', 'Invalid API key');
  });
});
