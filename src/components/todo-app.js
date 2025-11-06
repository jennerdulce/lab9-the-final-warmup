import { LitElement, html, css } from 'lit';
import { TodoModel } from '../models/todo-model.js';
import { StorageService } from '../services/storage-service.js';
import './todo-form.js';
import './todo-list.js';

/**
 * TodoApp - Main application component
 * Coordinates between Model and View components
 */
export class TodoApp extends LitElement {
  static properties = {
    todos: { state: true },
    completedTodos: { state: true },
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

  constructor() {
    super();
    this.storageService = new StorageService();
    this.model = new TodoModel(this.storageService);
    this.todos = this.model.todos;
    this.completedTodos = this.model.completedTodos;
    this.activeTab = 'active'; // 'active' or 'completed'

    // Subscribe to model changes
    this.model.subscribe(() => {
      this.todos = [...this.model.todos];
      this.completedTodos = [...this.model.completedTodos];
    });
  }

  handleAddTodo(e) {
    this.model.addTodo(e.detail.text);
  }

  handleToggleTodo(e) {
    this.model.toggleComplete(e.detail.id);
  }

  handleDeleteTodo(e) {
    this.model.deleteTodo(e.detail.id);
  }

  handleUpdateTodo(e) {
    this.model.updateTodo(e.detail.id, e.detail.text);
  }

  handleClearCompleted() {
    if (confirm('Move all completed todos to history?')) {
      this.model.clearCompleted();
    }
  }

  handleClearAll() {
    if (confirm('Clear ALL todos? This cannot be undone.')) {
      this.model.clearAll();
    }
  }

  handleClearCompletedHistory() {
    if (confirm('Clear all completed todo history? This cannot be undone.')) {
      this.model.clearCompletedHistory();
    }
  }

  handleRevertTodo(e) {
    this.model.revertTodo(e.detail.id);
  }

  handleTabChange(tab) {
    this.activeTab = tab;
  }

  get activeTodos() {
    return this.todos.filter(todo => !todo.completed);
  }

  get completedTodosArray() {
    return this.completedTodos;
  }

  get displayedTodos() {
    return this.activeTab === 'active' ? this.todos : this.completedTodosArray;
  }

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
