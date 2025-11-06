import { LitElement, html, css } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import './todo-item.js';

/**
 * TodoList - Displays a list of todos
 */
export class TodoList extends LitElement {
  static properties = {
    todos: { type: Array },
    showOnlyDelete: { type: Boolean },
    hideCheckbox: { type: Boolean },
    showRevert: { type: Boolean }
  };

  static styles = css`
    :host {
      display: block;
      min-height: 8rem;
    }

    .empty-state {
      text-align: center;
      padding: 2.5rem 1.25rem;
      color: white;
      font-size: 1.125rem;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .empty-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .list-container {
      max-height: 31.25rem;
      min-height: 14rem;
      overflow-y: auto;
    }

    /* Custom scrollbar */
    .list-container::-webkit-scrollbar {
      width: 0.5rem;
    }

    .list-container::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 0.25rem;
    }

    .list-container::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.3);
      border-radius: 0.25rem;
    }

    .list-container::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.5);
    }
  `;

  constructor() {
    super();
    this.todos = [];
  }

  render() {
    if (this.todos.length === 0) {
      return html`
        <div class="empty-state">
          <div class="empty-icon">📝</div>
          <p>No todos yet. Add one above!</p>
        </div>
      `;
    }

    return html`
      <div class="list-container">
        ${repeat(
          this.todos,
          (todo) => todo.id,
          (todo) => html`<todo-item .todo=${todo} .showOnlyDelete=${this.showOnlyDelete} .hideCheckbox=${this.hideCheckbox} .showRevert=${this.showRevert}></todo-item>`
        )}
      </div>
    `;
  }
}

customElements.define('todo-list', TodoList);
