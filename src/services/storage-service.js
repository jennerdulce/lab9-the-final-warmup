/**
 * @fileoverview StorageService - Handles localStorage operations for the TODO app
 * @author Lab 9 Team
 * @version 1.0.0
 */

/**
 * StorageService - Handles localStorage operations for the TODO app
 * Provides a simple interface for saving, loading, and managing persistent data
 * 
 * @class StorageService
 * @description Service class that manages localStorage operations with error handling
 *              and namespacing to avoid conflicts with other applications
 * 
 * @example
 * const storage = new StorageService('myapp');
 * storage.save('todos', [{ id: 1, text: 'Test todo' }]);
 * const todos = storage.load('todos', []);
 */
export class StorageService {
  /**
   * Creates a new StorageService instance
   * 
   * @param {string} [storageKey='todos'] - Namespace prefix for localStorage keys
   * @constructor
   */
  constructor(storageKey = 'todos') {
    /** @type {string} Namespace prefix for localStorage keys */
    this.storageKey = storageKey;
  }

  /**
   * Save data to localStorage with error handling
   * 
   * @param {string} k - Key identifier for the data
   * @param {*} d - Data to be saved (will be JSON stringified)
   * @returns {void}
   * @throws {void} Logs error to console if save fails
   * @example
   * storage.save('todos', [{ id: 1, text: 'Buy milk' }]);
   */
  save(k, d) {
    try {
      const fk = `${this.storageKey}_${k}`;
      localStorage.setItem(fk, JSON.stringify(d));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }

  /**
   * Load data from localStorage with error handling
   * 
   * @param {string} key - Key identifier for the data
   * @param {*} [defaultValue=null] - Default value to return if key doesn't exist or loading fails
   * @returns {*} Parsed data from localStorage or defaultValue
   * @example
   * const todos = storage.load('todos', []);
   * const settings = storage.load('settings', { theme: 'light' });
   */
  load(key, defaultValue = null) {
    try {
      const fullKey = `${this.storageKey}_${key}`;
      const item = localStorage.getItem(fullKey);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return defaultValue;
    }
  }

  /**
   * Remove specific data from localStorage
   * 
   * @param {string} k - Key identifier for the data to remove
   * @returns {void}
   * @throws {void} Logs error to console if removal fails
   * @example
   * storage.remove('todos');
   */
  remove(k) {
    try {
      const fullK = `${this.storageKey}_${k}`;
      localStorage.removeItem(fullK);
    } catch (e) {
      console.error('Failed to remove from localStorage:', e);
    }
  }

  /**
   * Clear all data for this app from localStorage
   * Removes all keys that start with the storage prefix
   * 
   * @returns {void}
   * @throws {void} Logs error to console if clearing fails
   * @warning This will remove all data associated with this storage instance
   * @example
   * storage.clear(); // Removes all app data
   */
  clear() {
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.storageKey)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }
}
