import { LitElement, html, css } from 'lit';

/**
 * @fileoverview TodoItem - Individual todo item component with CRUD operations
 * @author Lab 9 Team
 * @version 1.0.0
 */

/**
 * TodoItem - Individual todo item component
 * Displays a single todo with options to toggle, edit, delete, or revert
 * 
 * @class TodoItem
 * @extends {LitElement}
 * @description A component representing a single todo item with interactive features
 *              including completion toggling, inline editing, and various actions
 * 
 * @fires toggle-todo - Fired when todo completion status is toggled
 * @fires delete-todo - Fired when todo is deleted
 * @fires update-todo - Fired when todo text is updated
 * @fires revert-todo - Fired when completed todo is reverted from history
 * 
 * @example
 * <todo-item 
 *   .todo=${todoObject}
 *   .showOnlyDelete=${false}
 *   .hideCheckbox=${false}
 *   .showRevert=${false}>
 * </todo-item>
 */
export class TodoItem extends LitElement {
  /**
   * Define reactive properties for LitElement
   * 
   * @static
   * @readonly
   * @type {Object}
   */
  static properties = {
    /** @type {Object} The todo object containing id, text, completed, etc. */
    todo: { type: Object },
    /** @type {boolean} Whether the item is currently in edit mode */
    isEditing: { state: true },
    /** @type {string} Current value during editing */
    editValue: { state: true },
    /** @type {boolean} Whether to show only delete button (no edit/toggle) */
    showOnlyDelete: { type: Boolean },
    /** @type {boolean} Whether to hide the completion checkbox */
    hideCheckbox: { type: Boolean },
    /** @type {boolean} Whether to show the revert button for completed todos */
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

    .todo-item.completed-item {
      box-shadow: 0 0.0625rem 0.1875rem rgba(0, 0, 0, 0.08);
    }

    .todo-item.completed-item:hover {
      box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.15);
      transform: translateY(-0.0625rem);
    }

    .checkbox {
      width: 1.25rem;
      height: 1.25rem;
      cursor: pointer;
    }

    .todo-text {
      font-size: 1rem;
      color: #333;
      word-break: break-word;
    }

    .todo-content {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .todo-text.completed {
      text-decoration: line-through;
      color: #999;
    }

    .completion-date {
      font-size: 0.75rem;
      color: #999;
      font-style: italic;
      margin-top: 0.25rem;
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

  /**
   * Creates a new TodoItem instance
   * Initializes editing state to false and empty edit value
   * 
   * @constructor
   */
  constructor() {
    super();
    
    /** @type {boolean} Whether the item is currently in edit mode */
    this.isEditing = false;
    
    /** @type {string} Current value during editing */
    this.editValue = '';
  }

  /**
   * Handle toggle completion status of the todo
   * Dispatches toggle-todo event to parent component
   * 
   * @returns {void}
   * @fires toggle-todo - Custom event with todo ID in detail.id
   */
  handleToggle() {
    this.dispatchEvent(new CustomEvent('toggle-todo', {
      detail: { id: this.todo.id },
      bubbles: true,
      composed: true
    }));
  }

  /**
   * Handle delete todo action with user confirmation
   * Dispatches delete-todo event to parent component
   * 
   * @returns {void}
   * @fires delete-todo - Custom event with todo ID in detail.id
   */
  handleDelete() {
    if (confirm('Delete this todo?')) {
      this.dispatchEvent(new CustomEvent('delete-todo', {
        detail: { id: this.todo.id },
        bubbles: true,
        composed: true
      }));
    }
  }

  /**
   * Handle revert todo from completed history back to active
   * Dispatches revert-todo event to parent component
   * 
   * @returns {void}
   * @fires revert-todo - Custom event with todo ID in detail.id
   */
  handleRevert() {
    this.dispatchEvent(new CustomEvent('revert-todo', {
      detail: { id: this.todo.id },
      bubbles: true,
      composed: true
    }));
  }

  /**
   * Enter edit mode for the todo item
   * Sets editing state and initializes edit value with current text
   * 
   * @returns {void}
   */
  handleEdit() {
    this.isEditing = true;
    this.editValue = this.todo.text;
  }

  /**
   * Save edited todo text
   * Validates input and dispatches update-todo event if valid
   * 
   * @returns {void}
   * @fires update-todo - Custom event with todo ID and new text in detail
   */
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

  /**
   * Cancel edit mode without saving changes
   * Reverts to display mode and discards edit value
   * 
   * @returns {void}
   */
  /**
   * Cancel edit mode without saving changes
   * Reverts to display mode and discards edit value
   * 
   * @returns {void}
   */
  handleCancel() {
    this.isEditing = false;
    this.editValue = '';
  }

  /**
   * Handle keyboard shortcuts during editing
   * Enter saves changes, Escape cancels editing
   * 
   * @param {KeyboardEvent} e - Keyboard event
   * @returns {void}
   */
  handleKeyDown(e) {
    if (e.key === 'Enter') {
      this.handleSave();
    } else if (e.key === 'Escape') {
      this.handleCancel();
    }
  }

  /**
   * Render the todo item UI
   * Shows either edit mode or display mode based on editing state
   * 
   * @returns {TemplateResult} LitElement template for the todo item
   * @description Conditionally renders edit form or todo display based on isEditing state
   */
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
      <div class="todo-item ${this.showRevert ? 'completed-item' : ''}">
        ${!this.hideCheckbox ? html`
          <input
            type="checkbox"
            class="checkbox"
            .checked=${this.todo.completed}
            @change=${this.handleToggle}
            aria-label="Toggle todo"
          />
        ` : ''}
        <div class="todo-content">
          <span class="todo-text ${this.todo.completed ? 'completed' : ''}">
            ${this.todo.text}
          </span>
          ${this.todo.completedAt ? html`
            <div class="completion-date">
              Completed: ${new Date(this.todo.completedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          ` : ''}
        </div>
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
