/**
 * Types for server actions responses
 */

/**
 * Generic response type for server actions
 * Includes success/error state and optional data
 */
export type ActionResponse<T = void> = {
  success: boolean;
  data?: T;
  error?: string;
}; 