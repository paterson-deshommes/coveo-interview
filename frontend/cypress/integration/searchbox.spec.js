/// <reference types="Cypress" />

context('Searchbox', () => {
    beforeEach(() => {
        cy.visit('http://localhost:3000//')
    })

    it('should display a searchbox', () => {
        cy.get('input')
            .should('be.visible')
            .should('have.attr', "placeholder", "Search cities")
    });

    it('should display a suggestion', () => {
        cy.get('input')
            .type('Mont');

        cy.get('.suggestions').children('div').should('be.visible');
    });

    it('should trigger a search', () => {
        cy.get('input')
            .type('Mont');

        cy.get('button').click();
        cy.get('.ResultList').children('ol').should('be.visible');
    });
});