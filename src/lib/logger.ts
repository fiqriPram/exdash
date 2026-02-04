/**
 * Logger utility for consistent logging across the application
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string;
  error?: unknown;
}

class Logger {
  private context: string;

  constructor(context: string = "app") {
    this.context = context;
  }

  /**
   * Create a child logger with a sub-context
   */
  child(subContext: string): Logger {
    return new Logger(`${this.context}:${subContext}`);
  }

  /**
   * Log debug message
   */
  debug(message: string, meta?: Record<string, unknown>): void {
    this.log("debug", message, meta);
  }

  /**
   * Log info message
   */
  info(message: string, meta?: Record<string, unknown>): void {
    this.log("info", message, meta);
  }

  /**
   * Log warning message
   */
  warn(message: string, meta?: Record<string, unknown>): void {
    this.log("warn", message, meta);
  }

  /**
   * Log error message
   */
  error(message: string, error?: unknown, meta?: Record<string, unknown>): void {
    this.log("error", message, meta, error);
  }

  /**
   * Internal log method
   */
  private log(
    level: LogLevel,
    message: string,
    meta?: Record<string, unknown>,
    error?: unknown
  ): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: this.context,
      error,
    };

    // In production, you might want to send this to a logging service
    if (process.env.NODE_ENV === "production") {
      // Send to logging service (e.g., Sentry, LogRocket, etc.)
      // loggerService.send(entry);
    }

    // Console output with formatting
    const prefix = `[${entry.timestamp}] [${level.toUpperCase()}] [${this.context}]`;
    
    switch (level) {
      case "debug":
        console.debug(prefix, message, meta || "");
        break;
      case "info":
        console.info(prefix, message, meta || "");
        break;
      case "warn":
        console.warn(prefix, message, meta || "");
        break;
      case "error":
        console.error(prefix, message, error || "", meta || "");
        break;
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Export factory function for creating loggers with specific contexts
export function createLogger(context: string): Logger {
  return new Logger(context);
}
