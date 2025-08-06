/**
 * Abort Controller Utilities
 *
 * Provides a centralized way to manage abort controllers for async operations,
 * preventing race conditions and memory leaks.
 */

export class AbortControllerManager {
  private controllers: Map<string, AbortController> = new Map();

  /**
   * Creates or replaces an abort controller for a given key
   * Automatically aborts any existing controller with the same key
   */
  create(key: string): AbortController {
    // Abort existing controller if it exists
    this.abort(key);

    // Create new controller
    const controller = new AbortController();
    this.controllers.set(key, controller);

    return controller;
  }

  /**
   * Gets an existing abort controller by key
   */
  get(key: string): AbortController | undefined {
    return this.controllers.get(key);
  }

  /**
   * Aborts and removes a controller by key
   */
  abort(key: string): void {
    const controller = this.controllers.get(key);
    if (controller && !controller.signal.aborted) {
      controller.abort();
    }
    this.controllers.delete(key);
  }

  /**
   * Aborts all controllers and clears the map
   */
  abortAll(): void {
    this.controllers.forEach(controller => {
      if (!controller.signal.aborted) {
        controller.abort();
      }
    });
    this.controllers.clear();
  }

  /**
   * Checks if a signal is aborted
   */
  isAborted(key: string): boolean {
    const controller = this.controllers.get(key);
    return controller?.signal.aborted ?? false;
  }

  /**
   * Cleans up aborted controllers
   */
  cleanup(): void {
    const abortedKeys: string[] = [];

    this.controllers.forEach((controller, key) => {
      if (controller.signal.aborted) {
        abortedKeys.push(key);
      }
    });

    abortedKeys.forEach(key => this.controllers.delete(key));
  }
}

/**
 * Creates a promise that rejects when the abort signal is triggered
 */
export function createAbortablePromise<T>(
  promise: Promise<T>,
  signal: AbortSignal,
  errorMessage = 'Operation aborted'
): Promise<T> {
  return new Promise((resolve, reject) => {
    // Check if already aborted
    if (signal.aborted) {
      reject(new DOMException(errorMessage, 'AbortError'));
      return;
    }

    // Setup abort listener
    const abortHandler = () => {
      reject(new DOMException(errorMessage, 'AbortError'));
    };

    signal.addEventListener('abort', abortHandler);

    // Handle the original promise
    promise
      .then(result => {
        signal.removeEventListener('abort', abortHandler);
        if (!signal.aborted) {
          resolve(result);
        }
      })
      .catch(error => {
        signal.removeEventListener('abort', abortHandler);
        if (!signal.aborted) {
          reject(error);
        }
      });
  });
}

import React from 'react';

/**
 * Hook to use abort controller in React components
 */
export function useAbortController(key: string) {
  const [manager] = React.useState(() => new AbortControllerManager());

  React.useEffect(() => {
    return () => {
      // Cleanup on unmount
      manager.abort(key);
    };
  }, [key, manager]);

  return {
    create: () => manager.create(key),
    abort: () => manager.abort(key),
    isAborted: () => manager.isAborted(key),
    signal: manager.get(key)?.signal,
  };
}
