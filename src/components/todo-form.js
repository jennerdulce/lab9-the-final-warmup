import { LitElement, html, css } from 'lit';

/**
 * @fileoverview TodoForm - Input form component for adding new todos to the list
 * @author Lab 9 Team
 * @version 1.0.0
 */

/**
 * TodoForm - Input form for adding new todos
 * Provides a text input and submit button for creating new todo items
 * 
 * @class TodoForm
 * @extends {LitElement}
 * @description A form component that handles todo creation with validation
 * 
 * @fires add-todo - Fired when a new todo is submitted with valid text
 * 
 * @example
 * <todo-form @add-todo=${this.handleAddTodo}></todo-form>
 */
export class TodoForm extends LitElement {
  /**
   * Define reactive properties for LitElement
   * 
   * @static
   * @readonly
   * @type {Object}
   */
  static properties = {
    /** @type {string} Current value of the input field */
    inputValue: { state: true }
  };

  static styles = css`
    :host {
      display: block;
      margin-bottom: 1.25rem;
    }

    form {
      display: flex;
      gap: 0.5rem;
    }

    input {
      flex: 1;
      padding: 0.75rem 1rem;
      font-size: 1rem;
      border: 0.125rem solid #e0e0e0;
      border-radius: 0.5rem;
      outline: none;
      transition: border-color 0.3s;
    }

    input:focus {
      border-color: #667eea;
    }

    button {
      padding: 0.75rem 1.5rem;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 0.5rem;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.3s;
    }

    button:hover {
      background: #5568d3;
    }

    button:active {
      transform: translateY(0.0625rem);
    }

    button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
  `;

  /**
   * Creates a new TodoForm instance
   * Initializes the input value to empty string
   * 
   * @constructor
   */
  constructor() {
    super();
    
    /** @type {string} Current value of the input field */
    this.inputValue = '';
  }

  /**
   * Handle form submission
   * Validates input and dispatches add-todo event if text is not empty
   * 
   * @param {Event} e - Form submit event
   * @returns {void}
   * @fires add-todo - Custom event with todo text in detail.text
   */
  handleSubmit(e) {
    e.preventDefault();
    const text = this.inputValue.trim();

    if (text) {
      this.dispatchEvent(new CustomEvent('add-todo', {
        detail: { text },
        bubbles: true,
        composed: true
      }));

      this.inputValue = '';
    }
  }

  /**
   * Handle input field changes
   * Updates the internal input value state
   * 
   * @param {Event} e - Input change event
   * @returns {void}
   */
  handleInput(e) {
    this.inputValue = e.target.value;
  }

  /**
   * Render the todo form UI
   * 
   * @returns {TemplateResult} LitElement template for the form
   */
  render() {
    return html`
      <form @submit=${this.handleSubmit}>
        <input
          type="text"
          placeholder="What needs to be done?"
          .value=${this.inputValue}
          @input=${this.handleInput}
          aria-label="New todo"
          autofocus
        />
        <button type="submit" ?disabled=${!this.inputValue.trim()}>
          Add
        </button>
      </form>
    `;
  }
}

customElements.define('todo-form', TodoForm);
