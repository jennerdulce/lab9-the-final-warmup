import { LitElement, html, css } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import './todo-item.js';

/**
 * @fileoverview TodoList - Component for displaying a list of todo items
 * @author Lab 9 Team
 * @version 1.0.0
 */

/**
 * TodoList - Displays a list of todos with configurable behavior
 * Renders todo items using efficient repeat directive for performance
 * 
 * @class TodoList
 * @extends {LitElement}
 * @description A container component that renders multiple todo items
 *              with support for different display modes (active, completed)
 * 
 * @example
 * <todo-list 
 *   .todos=${this.todos}
 *   .showOnlyDelete=${false}
 *   .hideCheckbox=${false}
 *   .showRevert=${false}>
 * </todo-list>
 */
export class TodoList extends LitElement {
  /**
   * Define reactive properties for LitElement
   * 
   * @static
   * @readonly
   * @type {Object}
   */
  static properties = {
    /** @type {Array} Array of todo objects to display */
    todos: { type: Array },
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

  /**
   * Creates a new TodoList instance
   * Initializes the todos array to empty
   * 
   * @constructor
   */
  constructor() {
    super();
    
    /** @type {Array} Array of todo objects to display */
    this.todos = [];
  }

  /**
   * Render the todo list UI
   * Shows either an empty state or a scrollable list of todo items
   * 
   * @returns {TemplateResult} LitElement template for the todo list
   * @description Uses the repeat directive for efficient rendering of todo items
   */
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
