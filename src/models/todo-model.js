/**
 * TodoModel - Manages the todo list data and business logic
 * Implements the Observer pattern for reactive updates
 */
export class TodoModel {
  constructor(storageService) {
    this.storage = storageService;
    this.todos = this.storage.load('items', []);
    this.completedTodos = this.storage.load('completedItems', []);
    this.listeners = [];
    this.nextId = this.storage.load('nextId', 1);
  }

  /**
   * Subscribe to model changes
   */
  subscribe(listener) {
    this.listeners.push(listener);
  }

  /**
   * Notify all subscribers of changes
   */
  notify() {
    this.listeners.forEach(listener => listener());
  }

  /**
   * Add a new todo
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
   * Toggle todo completion status
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
   * Delete a todo
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
   * Update todo text
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
   * Clear all completed todos - moves them from active list to completed array
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
   * Clear all todos
   */
  clearAll() {
    this.todos = [];
    this.completedTodos = [];
    this.save();
    this.notify();
  }

  /**
   * Clear completed history (items in completedTodos array)
   */
  clearCompletedHistory() {
    this.completedTodos = [];
    this.save();
    this.notify();
  }

  /**
   * Get count of active todos
   */
  get activeCount() {
    return this.todos.filter(t => !t.completed).length;
  }

  /**
   * Get count of completed todos (checked but not yet moved)
   */
  get completedCount() {
    return this.todos.filter(t => t.completed).length;
  }

  /**
   * Get count of todos in completed history
   */
  get completedHistoryCount() {
    return this.completedTodos.length;
  }

  /**
   * Save todos to storage
   */
  save() {
    this.storage.save('items', this.todos);
    this.storage.save('completedItems', this.completedTodos);
    this.storage.save('nextId', this.nextId);
  }
}
