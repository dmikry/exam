import { DashboardPage } from '../support/pages/DashboardPage';

describe('LLM Aggregator Cypress Tests with POM', () => {
  const dashboard = new DashboardPage();

  beforeEach(() => {
    dashboard.visit();
  });

  it('should display the main title and sub-branding', () => {
    dashboard.heading.should('have.text', 'LLM Aggregator');
    dashboard.subtitle.should('contain', 'model comparison');
  });

  it('should update price when a new model is selected', () => {
    // Check initial price
    dashboard.inputPrice.should('have.text', '$5.00');
    
    // Select Claude 3.5 Sonnet
    dashboard.selectModel('Claude 3.5 Sonnet');
    
    // Check updated prices
    dashboard.inputPrice.should('have.text', '$3.00');
    dashboard.outputPrice.should('have.text', '$15.00');
  });

  it('should show success toast after assigning a model', () => {
    dashboard.assignModelToUser('Alice Smith', 'Gemini 1.5 Pro');
    dashboard.toast.should('be.visible').and('contain', 'Successfully assigned!');
  });
});
