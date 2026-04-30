export class DashboardPage {
  get heading() { return cy.get('h1'); }
  get subtitle() { return cy.get('.subtitle'); }
  get modelSelect() { return cy.get('#modelSelect'); }
  get inputPrice() { return cy.get('#inputPrice'); }
  get outputPrice() { return cy.get('#outputPrice'); }
  get userSelect() { return cy.get('#userSelect'); }
  get assignModelSelect() { return cy.get('#assignModelSelect'); }
  get assignButton() { return cy.contains('button', 'Assign Model Now'); }
  get toast() { return cy.get('#toast'); }

  visit() {
    cy.visit('/');
  }

  selectModel(label) {
    this.modelSelect.select(label);
  }

  assignModelToUser(user, model) {
    this.userSelect.select(user);
    this.assignModelSelect.select(model);
    this.assignButton.click();
  }
}
