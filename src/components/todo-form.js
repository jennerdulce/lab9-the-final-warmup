import { LitElement, html, css } from 'lit';

/**
 * TodoForm - Input form for adding new todos
 */
export class TodoForm extends LitElement {
  static properties = {
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

  constructor() {
    super();
    this.inputValue = '';
  }

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

  handleInput(e) {
    this.inputValue = e.target.value;
  }

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
