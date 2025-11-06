/**
 * @typedef {Object} Todo
 * @property {number} id - Unique identifier for the todo
 * @property {string} text - The todo text content
 * @property {boolean} completed - Whether the todo is completed
 * @property {string} createdAt - ISO string of when the todo was created
 * @property {string} [completedAt] - ISO string of when the todo was completed (only for history items)
 */

/**
 * TodoModel - Manages the todo list data and business logic
 * Implements the Observer pattern for reactive updates
 * 
 * @class TodoModel
 * @description Handles all todo CRUD operations, state management, and persistence
 */
export class TodoModel {
  /**
   * Creates a new TodoModel instance
   * 
   * @param {Object} storageService - The storage service for persistence
   * @constructor
   */
  constructor(storageService) {
    /** @type {Object} The storage service instance */
    this.storage = storageService;
    
    /** @type {Todo[]} Array of active todos */
    this.todos = this.storage.load('items', []);
    
    /** @type {Todo[]} Array of completed todos moved to history */
    this.completedTodos = this.storage.load('completedItems', []);
    
    /** @type {Function[]} Array of observer callback functions */
    this.listeners = [];
    
    /** @type {number} Next available todo ID */
    this.nextId = this.storage.load('nextId', 1);
  }

  /**
   * Subscribe to model changes using the observer pattern
   * 
   * @param {Function} listener - Callback function to be called when model changes
   * @returns {void}
   * @example
   * model.subscribe(() => {
   *   console.log('Model updated!');
   * });
   */
  subscribe(listener) {
    this.listeners.push(listener);
  }

  /**
   * Notify all subscribers of model changes
   * 
   * @private
   * @returns {void}
   */
  notify() {
    this.listeners.forEach(listener => listener());
  }

  /**
   * Add a new todo to the active list
   * 
   * @param {string} text - The text content for the new todo
   * @returns {void}
   * @throws {void} Silently ignores empty or whitespace-only text
   * @example
   * model.addTodo('Buy groceries');
   */
  addTodo(text) {
    if (!text || text.trim() === '') {
      return;
    }

    const todo = {
      id: this.nextId++,
      text: text.trim(),
      completed: false,
      createdAt: new Date().toISOString()
    };

    this.todos.push(todo);
    this.save();
    this.notify();
  }

  /**
   * Toggle the completion status of a todo
   * Handles both active todos and completed todos (for reverting)
   * 
   * @param {number} id - The unique identifier of the todo to toggle
   * @returns {void}
   * @description For active todos, toggles the completed flag.
   *              For completed todos in history, moves them back to active list.
   * @example
   * model.toggleComplete(123); // Toggles todo with ID 123
   */
  toggleComplete(id) {
    // Only toggle completion status in active todos (don't move to completed array yet)
    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      this.save();
      this.notify();
      return;
    }

    // If todo is in completed array, move it back to active todos and mark as incomplete
    const completedIndex = this.completedTodos.findIndex(t => t.id === id);
    if (completedIndex !== -1) {
      const completedTodo = this.completedTodos[completedIndex];
      const activeTodo = {
        ...completedTodo,
        completed: false
      };
      delete activeTodo.completedAt;
      this.todos.push(activeTodo);
      this.completedTodos.splice(completedIndex, 1);
      this.save();
      this.notify();
    }
  }

  /**
   * Delete a todo from either active or completed list
   * 
   * @param {number} id - The unique identifier of the todo to delete
   * @returns {void}
   * @description Searches first in active todos, then in completed todos
   * @example
   * model.deleteTodo(123); // Deletes todo with ID 123
   */
  deleteTodo(id) {
    // Try to delete from active todos first
    const activeCount = this.todos.length;
    this.todos = this.todos.filter(t => t.id !== id);
    
    // If not found in active todos, try completed todos
    if (this.todos.length === activeCount) {
      this.completedTodos = this.completedTodos.filter(t => t.id !== id);
    }
    
    this.save();
    this.notify();
  }

  /**
   * Update the text content of an existing todo
   * 
   * @param {number} id - The unique identifier of the todo to update
   * @param {string} newText - The new text content for the todo
   * @returns {void}
   * @throws {void} Silently ignores empty or whitespace-only text
   * @example
   * model.updateTodo(123, 'Updated task description');
   */
  updateTodo(id, newText) {
    const todo = this.todos.find(t => t.id === id);
    if (todo && newText && newText.trim() !== '') {
      todo.text = newText.trim();
      this.save();
      this.notify();
    }
  }

  /**
   * Move all completed todos from active list to history
   * This is the second step of the two-phase completion process
   * 
   * @returns {void}
   * @description Finds all todos marked as completed, adds completion timestamp,
   *              moves them to completedTodos array, and removes from active list
   * @example
   * model.clearCompleted(); // Moves all completed todos to history
   */
  clearCompleted() {
    const completedTodos = this.todos.filter(t => t.completed);
    
    // Move completed todos to completed array with completion timestamp
    completedTodos.forEach(todo => {
      const completedTodo = {
        ...todo,
        completedAt: new Date().toISOString()
      };
      this.completedTodos.push(completedTodo);
    });
    
    // Remove completed todos from active list
    this.todos = this.todos.filter(t => !t.completed);
    
    this.save();
    this.notify();
  }

  /**
   * Clear all todos from both active and completed lists
   * 
   * @returns {void}
   * @warning This action cannot be undone
   * @example
   * model.clearAll(); // Removes all todos permanently
   */
  clearAll() {
    this.todos = [];
    this.completedTodos = [];
    this.save();
    this.notify();
  }

  /**
   * Clear all todos from the completed history
   * 
   * @returns {void}
   * @warning This action cannot be undone
   * @description Removes all items from the completedTodos array
   * @example
   * model.clearCompletedHistory(); // Clears all completed history
   */
  clearCompletedHistory() {
    this.completedTodos = [];
    this.save();
    this.notify();
  }

  /**
   * Revert a completed todo from history back to the active list
   * 
   * @param {number} id - The unique identifier of the completed todo to revert
   * @returns {void}
   * @description Moves todo from completedTodos back to todos array,
   *              removes completion timestamp, and marks as incomplete
   * @example
   * model.revertTodo(123); // Reverts completed todo with ID 123
   */
  revertTodo(id) {
    const completedIndex = this.completedTodos.findIndex(t => t.id === id);
    if (completedIndex !== -1) {
      const completedTodo = this.completedTodos[completedIndex];
      // Move back to active todos and mark as incomplete
      const activeTodo = {
        ...completedTodo,
        completed: false
      };
      delete activeTodo.completedAt;
      this.todos.push(activeTodo);
      this.completedTodos.splice(completedIndex, 1);
      this.save();
      this.notify();
    }
  }

  /**
   * Get the count of active (non-completed) todos
   * 
   * @returns {number} Number of todos that are not marked as completed
   * @readonly
   * @example
   * const activeCount = model.activeCount; // Returns number of active todos
   */
  get activeCount() {
    return this.todos.filter(t => !t.completed).length;
  }

  /**
   * Get the count of completed todos that haven't been moved to history yet
   * 
   * @returns {number} Number of todos marked as completed but still in active list
   * @readonly
   * @description Used to show count in "Move Completed to History" button
   * @example
   * const completedCount = model.completedCount; // Returns number of completed todos
   */
  get completedCount() {
    return this.todos.filter(t => t.completed).length;
  }

  /**
   * Get the count of todos in the completed history
   * 
   * @returns {number} Number of todos that have been moved to history
   * @readonly
   * @description Returns the count of todos in the completedTodos array
   * @example
   * const historyCount = model.completedHistoryCount; // Returns history count
   */
  get completedHistoryCount() {
    return this.completedTodos.length;
  }

  /**
   * Save the current state to persistent storage
   * 
   * @private
   * @returns {void}
   * @description Persists todos, completedTodos, and nextId to storage
   */
  save() {
    this.storage.save('items', this.todos);
    this.storage.save('completedItems', this.completedTodos);
    this.storage.save('nextId', this.nextId);
  }
}
