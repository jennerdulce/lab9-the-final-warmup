import { LitElement, html, css } from 'lit';
import { TodoModel } from '../models/todo-model.js';
import { StorageService } from '../services/storage-service.js';
import './todo-form.js';
import './todo-list.js';

/**
 * @fileoverview TodoApp - Main application component that coordinates the entire todo application
 * @author Lab 9 Team
 * @version 1.0.0
 */

/**
 * TodoApp - Main application component
 * Coordinates between Model and View components using the MVC pattern
 * 
 * @class TodoApp
 * @extends {LitElement}
 * @description The root component that manages the todo application state,
 *              handles user interactions, and renders the UI
 * 
 * @fires add-todo - Fired when a new todo is added
 * @fires toggle-todo - Fired when a todo completion status is toggled
 * @fires delete-todo - Fired when a todo is deleted
 * @fires update-todo - Fired when a todo text is updated
 * @fires revert-todo - Fired when a completed todo is reverted from history
 * 
 * @example
 * <todo-app></todo-app>
 */
export class TodoApp extends LitElement {
  /**
   * Define reactive properties for LitElement
   * 
   * @static
   * @readonly
   * @type {Object}
   */
  static properties = {
    /** @type {Array} Array of active todos */
    todos: { state: true },
    /** @type {Array} Array of completed todos in history */
    completedTodos: { state: true },
    /** @type {string} Currently active tab ('active' or 'completed') */
    activeTab: { state: true }
  };

  static styles = css`
    :host {
      display: block;
    }

    .app-container {
      background: white;
      border-radius: 1rem;
      box-shadow: 0 0.625rem 2.5rem rgba(0, 0, 0, 0.2);
      padding: 2rem;
      min-height: 25rem;
      display: flex;
      flex-direction: column;
    }

    h1 {
      margin: 0 0 0.5rem 0;
      color: #333;
      font-size: 2rem;
      font-weight: 700;
    }

    .subtitle {
      color: #666;
      margin-bottom: 1.5rem;
      font-size: 0.875rem;
    }

    .stats {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: #f5f5f5;
      border-radius: 0.5rem;
      margin-bottom: 1.25rem;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #667eea;
    }

    .stat-label {
      font-size: 0.75rem;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.03125rem;
    }

    .actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 1.25rem;
    }

    button {
      flex: 1;
      padding: 0.625rem 1rem;
      border: none;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .clear-completed {
      background: #ff9800;
      color: white;
    }

    .clear-completed:hover {
      background: #f57c00;
    }

    .clear-all {
      background: #f44336;
      color: white;
    }

    .clear-all:hover {
      background: #da190b;
    }

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .tabs {
      display: flex;
      gap: 0.25rem;
      margin-bottom: 1.25rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 0.5rem;
      padding: 0.25rem;
      box-shadow: 0 0.125rem 0.5rem rgba(102, 126, 234, 0.3);
    }

    .tab {
      flex: 1;
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      background: transparent;
      color: rgba(255, 255, 255, 0.8);
      text-shadow: 0 0.0625rem 0.125rem rgba(0, 0, 0, 0.2);
    }

    .tab.active {
      background: white;
      color: #667eea;
      box-shadow: 0 0.125rem 0.5rem rgba(0, 0, 0, 0.15);
      text-shadow: none;
      transform: translateY(-0.0625rem);
    }

    .tab:hover:not(.active) {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      transform: translateY(-0.03125rem);
    }

    .tab-content {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .completed-empty-state {
      text-align: center;
      padding: 2.5rem 1.25rem;
      color: #666;
      font-style: italic;
      min-height: 14rem;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .completed-list-container {
      min-height: 14rem;
    }

    .footer {
      margin-top: 1.25rem;
      padding-top: 1.25rem;
      border-top: 0.0625rem solid #e0e0e0;
      text-align: center;
      color: #666;
      font-size: 0.75rem;
    }
  `;

  /**
   * Creates a new TodoApp instance
   * Initializes the storage service, model, and sets up reactive state
   * 
   * @constructor
   */
  constructor() {
    super();
    
    /** @type {StorageService} Service for persisting data to localStorage */
    this.storageService = new StorageService();
    
    /** @type {TodoModel} The data model managing todo state and operations */
    this.model = new TodoModel(this.storageService);
    
    /** @type {Array} Local copy of active todos for reactive updates */
    this.todos = this.model.todos;
    
    /** @type {Array} Local copy of completed todos for reactive updates */
    this.completedTodos = this.model.completedTodos;
    
    /** @type {string} Currently active tab ('active' or 'completed') */
    this.activeTab = 'active'; // 'active' or 'completed'

    // Subscribe to model changes for reactive UI updates
    this.model.subscribe(() => {
      this.todos = [...this.model.todos];
      this.completedTodos = [...this.model.completedTodos];
    });
  }

  /**
   * Handle add todo event from todo-form component
   * 
   * @param {CustomEvent} e - Event containing todo text in detail.text
   * @returns {void}
   */
  handleAddTodo(e) {
    this.model.addTodo(e.detail.text);
  }

  /**
   * Handle toggle todo completion event from todo-item component
   * 
   * @param {CustomEvent} e - Event containing todo ID in detail.id
   * @returns {void}
   */
  handleToggleTodo(e) {
    this.model.toggleComplete(e.detail.id);
  }

  /**
   * Handle delete todo event from todo-item component
   * 
   * @param {CustomEvent} e - Event containing todo ID in detail.id
   * @returns {void}
   */
  handleDeleteTodo(e) {
    this.model.deleteTodo(e.detail.id);
  }

  /**
   * Handle update todo text event from todo-item component
   * 
   * @param {CustomEvent} e - Event containing todo ID and new text in detail
   * @returns {void}
   */
  handleUpdateTodo(e) {
    this.model.updateTodo(e.detail.id, e.detail.text);
  }

  /**
   * Handle clear completed todos action with user confirmation
   * Moves all completed todos from active list to history
   * 
   * @returns {void}
   */
  handleClearCompleted() {
    if (confirm('Move all completed todos to history?')) {
      this.model.clearCompleted();
    }
  }

  /**
   * Handle clear all todos action with user confirmation
   * Removes all todos from both active and completed lists
   * 
   * @returns {void}
   * @warning This action cannot be undone
   */
  handleClearAll() {
    if (confirm('Clear ALL todos? This cannot be undone.')) {
      this.model.clearAll();
    }
  }

  /**
   * Handle clear completed history action with user confirmation
   * Removes all todos from the completed history
   * 
   * @returns {void}
   * @warning This action cannot be undone
   */
  handleClearCompletedHistory() {
    if (confirm('Clear all completed todo history? This cannot be undone.')) {
      this.model.clearCompletedHistory();
    }
  }

  /**
   * Handle revert todo event from completed todo items
   * Moves a completed todo back to the active list
   * 
   * @param {CustomEvent} e - Event containing todo ID in detail.id
   * @returns {void}
   */
  handleRevertTodo(e) {
    this.model.revertTodo(e.detail.id);
  }

  /**
   * Handle tab change between active and completed views
   * 
   * @param {string} tab - The tab to switch to ('active' or 'completed')
   * @returns {void}
   */
  handleTabChange(tab) {
    this.activeTab = tab;
  }

  /**
   * Get filtered list of active (non-completed) todos
   * 
   * @returns {Array} Array of todos that are not marked as completed
   * @readonly
   */
  get activeTodos() {
    return this.todos.filter(todo => !todo.completed);
  }

  /**
   * Get the completed todos array
   * 
   * @returns {Array} Array of completed todos in history
   * @readonly
   */
  get completedTodosArray() {
    return this.completedTodos;
  }

  /**
   * Get the todos to display based on the current active tab
   * 
   * @returns {Array} Array of todos for the currently active tab
   * @readonly
   */
  get displayedTodos() {
    return this.activeTab === 'active' ? this.todos : this.completedTodosArray;
  }

  /**
   * Render the todo application UI
   * 
   * @returns {TemplateResult} LitElement template for the todo app
   */
  render() {
    return html`
      <div class="app-container">
        <h1>My Tasks</h1>
        <p class="subtitle">Stay organized and productive</p>

        <div class="stats">
          <div class="stat-item">
            <div class="stat-value">${this.todos.length + this.completedTodos.length}</div>
            <div class="stat-label">Total</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${this.model.activeCount}</div>
            <div class="stat-label">Active</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${this.model.completedHistoryCount}</div>
            <div class="stat-label">History</div>
          </div>
        </div>

        <div class="tabs">
          <button 
            class="tab ${this.activeTab === 'active' ? 'active' : ''}"
            @click=${() => this.handleTabChange('active')}>
            Active Tasks
          </button>
          <button 
            class="tab ${this.activeTab === 'completed' ? 'active' : ''}"
            @click=${() => this.handleTabChange('completed')}>
            Completed
          </button>
        </div>

        <div class="tab-content">
          ${this.activeTab === 'active' ? this.renderActiveTab() : this.renderCompletedTab()}
        </div>

        <div class="footer">
          Lab 9: The final battle!
        </div>
      </div>
    `;
  }

  /**
   * Render the active tab content
   * Shows the todo form, active todo list, and action buttons
   * 
   * @returns {TemplateResult} LitElement template for the active tab
   * @private
   */
  renderActiveTab() {
    return html`
      <todo-form
        @add-todo=${this.handleAddTodo}>
      </todo-form>

      <todo-list
        .todos=${this.todos}
        @toggle-todo=${this.handleToggleTodo}
        @delete-todo=${this.handleDeleteTodo}
        @update-todo=${this.handleUpdateTodo}>
      </todo-list>

      <div class="actions">
        <button
          class="clear-completed"
          @click=${this.handleClearCompleted}
          ?disabled=${this.model.completedCount === 0}>
          Move Completed to History (${this.model.completedCount})
        </button>
        <button
          class="clear-all"
          @click=${this.handleClearAll}
          ?disabled=${this.todos.length + this.completedTodos.length === 0}>
          Clear All
        </button>
      </div>
    `;
  }

  /**
   * Render the completed tab content
   * Shows completed todos from history with revert and delete options
   * 
   * @returns {TemplateResult} LitElement template for the completed tab
   * @private
   */
  renderCompletedTab() {
    if (this.completedTodosArray.length === 0) {
      return html`
        <div class="completed-empty-state">
          No completed todos yet. Complete some tasks to see them here!
        </div>
      `;
    }

    return html`
      <div class="completed-list-container">
        <todo-list
          .todos=${this.completedTodosArray}
          .showOnlyDelete=${false}
          .hideCheckbox=${true}
          .showRevert=${true}
          @toggle-todo=${this.handleToggleTodo}
          @delete-todo=${this.handleDeleteTodo}
          @update-todo=${this.handleUpdateTodo}
          @revert-todo=${this.handleRevertTodo}>
        </todo-list>
      </div>

      <div class="actions">
        <button
          class="clear-completed"
          @click=${this.handleClearCompletedHistory}
          style="max-width: 200px; margin: 0 auto;">
          Clear History
        </button>
      </div>
    `;
  }
}

customElements.define('todo-app', TodoApp);
