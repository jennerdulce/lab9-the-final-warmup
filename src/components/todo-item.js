import { LitElement, html, css } from 'lit';

/**
 * TodoItem - Individual todo item component
 */
export class TodoItem extends LitElement {
  static properties = {
    todo: { type: Object },
    isEditing: { state: true },
    editValue: { state: true },
    showOnlyDelete: { type: Boolean },
    hideCheckbox: { type: Boolean },
    showRevert: { type: Boolean }
  };

  static styles = css`
    :host {
      display: block;
    }

    .todo-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      background: white;
      border-radius: 0.5rem;
      margin-bottom: 0.5rem;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .todo-item:hover {
      box-shadow: 0 0.125rem 0.5rem rgba(0, 0, 0, 0.1);
    }

    .checkbox {
      width: 1.25rem;
      height: 1.25rem;
      cursor: pointer;
    }

    .todo-text {
      flex: 1;
      font-size: 1rem;
      color: #333;
      word-break: break-word;
    }

    .todo-text.completed {
      text-decoration: line-through;
      color: #999;
    }

    .edit-input {
      flex: 1;
      padding: 0.5rem;
      font-size: 1rem;
      border: 0.125rem solid #667eea;
      border-radius: 0.25rem;
      outline: none;
    }

    .button-group {
      display: flex;
      gap: 0.5rem;
    }

    button {
      padding: 0.375rem 0.75rem;
      border: none;
      border-radius: 0.25rem;
      cursor: pointer;
      font-size: 0.875rem;
      transition: background 0.2s;
    }

    .edit-btn {
      background: #4CAF50;
      color: white;
    }

    .edit-btn:hover {
      background: #45a049;
    }

    .delete-btn {
      background: #f44336;
      color: white;
    }

    .delete-btn:hover {
      background: #da190b;
    }

    .save-btn {
      background: #2196F3;
      color: white;
    }

    .save-btn:hover {
      background: #0b7dda;
    }

    .cancel-btn {
      background: #757575;
      color: white;
    }

    .cancel-btn:hover {
      background: #616161;
    }

    .revert-btn {
      background: #2196F3;
      color: white;
    }

    .revert-btn:hover {
      background: #1976D2;
    }
  `;

  constructor() {
    super();
    this.isEditing = false;
    this.editValue = '';
  }

  handleToggle() {
    this.dispatchEvent(new CustomEvent('toggle-todo', {
      detail: { id: this.todo.id },
      bubbles: true,
      composed: true
    }));
  }

  handleDelete() {
    if (confirm('Delete this todo?')) {
      this.dispatchEvent(new CustomEvent('delete-todo', {
        detail: { id: this.todo.id },
        bubbles: true,
        composed: true
      }));
    }
  }

  handleRevert() {
    this.dispatchEvent(new CustomEvent('revert-todo', {
      detail: { id: this.todo.id },
      bubbles: true,
      composed: true
    }));
  }

  handleEdit() {
    this.isEditing = true;
    this.editValue = this.todo.text;
  }

  handleSave() {
    if (this.editValue.trim()) {
      this.dispatchEvent(new CustomEvent('update-todo', {
        detail: { id: this.todo.id, text: this.editValue },
        bubbles: true,
        composed: true
      }));
      this.isEditing = false;
    }
  }

  handleCancel() {
    this.isEditing = false;
    this.editValue = '';
  }

  handleKeyDown(e) {
    if (e.key === 'Enter') {
      this.handleSave();
    } else if (e.key === 'Escape') {
      this.handleCancel();
    }
  }

  render() {
    if (this.isEditing) {
      return html`
        <div class="todo-item">
          <input
            class="edit-input"
            type="text"
            .value=${this.editValue}
            @input=${(e) => this.editValue = e.target.value}
            @keydown=${this.handleKeyDown}
            autofocus
          />
          <div class="button-group">
            <button class="save-btn" @click=${this.handleSave}>Save</button>
            <button class="cancel-btn" @click=${this.handleCancel}>Cancel</button>
          </div>
        </div>
      `;
    }

    return html`
      <div class="todo-item">
        ${!this.hideCheckbox ? html`
          <input
            type="checkbox"
            class="checkbox"
            .checked=${this.todo.completed}
            @change=${this.handleToggle}
            aria-label="Toggle todo"
          />
        ` : ''}
        <span class="todo-text ${this.todo.completed ? 'completed' : ''}">
          ${this.todo.text}
        </span>
        <div class="button-group">
          ${this.showRevert ? html`
            <button
              class="revert-btn"
              @click=${this.handleRevert}
              aria-label="Revert to active">
              Revert
            </button>
            <button
              class="delete-btn"
              @click=${this.handleDelete}
              aria-label="Delete todo">
              Delete
            </button>
          ` : this.showOnlyDelete ? html`
            <button
              class="delete-btn"
              @click=${this.handleDelete}
              aria-label="Delete todo">
              Delete
            </button>
          ` : html`
            <button
              class="edit-btn"
              @click=${this.handleEdit}
              ?disabled=${this.todo.completed}
              aria-label="Edit todo">
              Edit
            </button>
            <button
              class="delete-btn"
              @click=${this.handleDelete}
              aria-label="Delete todo">
              Delete
            </button>
          `}
        </div>
      </div>
    `;
  }
}

customElements.define('todo-item', TodoItem);
