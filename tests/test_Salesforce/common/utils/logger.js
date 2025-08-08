/**
 * Advanced Logger for Test Automation
 * Provides comprehensive logging, monitoring, and debugging capabilities
 */

const fs = require('fs');
const path = require('path');

class Logger {
    constructor(options = {}) {
        this.options = {
            level: options.level || 'info',
            logToFile: options.logToFile !== false,
            logToConsole: options.logToConsole !== false,
            logDir: options.logDir || path.join(process.cwd(), 'logs'),
            maxFileSize: options.maxFileSize || 10 * 1024 * 1024, // 10MB
            maxFiles: options.maxFiles || 5,
            includeTimestamp: options.includeTimestamp !== false,
            includeLevel: options.includeLevel !== false,
            includeStack: options.includeStack || false,
            colorize: options.colorize !== false
        };

        this.levels = {
            error: 0,
            warn: 1,
            info: 2,
            debug: 3,
            trace: 4
        };

        this.colors = {
            error: '\x1b[31m', // Red
            warn: '\x1b[33m',  // Yellow
            info: '\x1b[36m',  // Cyan
            debug: '\x1b[35m', // Magenta
            trace: '\x1b[37m', // White
            reset: '\x1b[0m'
        };

        this.currentLogFile = null;
        this.logBuffer = [];
        this.sessionId = this.generateSessionId();
        this.startTime = Date.now();
        
        this.initializeLogDirectory();
        this.createLogFile();
    }

    /**
     * Initialize logging directory
     */
    initializeLogDirectory() {
        if (this.options.logToFile && !fs.existsSync(this.options.logDir)) {
            fs.mkdirSync(this.options.logDir, { recursive: true });
        }
    }

    /**
     * Create new log file
     */
    createLogFile() {
        if (!this.options.logToFile) return;

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `test-log-${timestamp}-${this.sessionId}.log`;
        this.currentLogFile = path.join(this.options.logDir, filename);
        
        // Write session header
        const header = this.formatLogEntry('info', 'SESSION_START', {
            sessionId: this.sessionId,
            timestamp: new Date().toISOString(),
            pid: process.pid,
            nodeVersion: process.version,
            platform: process.platform
        });
        
        fs.writeFileSync(this.currentLogFile, header + '\n');
    }

    /**
     * Main logging method
     */
    log(level, message, data = null, options = {}) {
        if (!this.shouldLog(level)) return;

        const logEntry = this.formatLogEntry(level, message, data, options);
        
        // Add to buffer
        this.logBuffer.push({
            level,
            message,
            data,
            timestamp: new Date().toISOString(),
            sessionId: this.sessionId
        });

        // Keep buffer size manageable
        if (this.logBuffer.length > 1000) {
            this.logBuffer.shift();
        }

        // Console output
        if (this.options.logToConsole) {
            this.writeToConsole(level, logEntry);
        }

        // File output
        if (this.options.logToFile) {
            this.writeToFile(logEntry);
        }
    }

    /**
     * Convenience methods
     */
    error(message, data = null, options = {}) {
        this.log('error', message, data, { ...options, includeStack: true });
    }

    warn(message, data = null, options = {}) {
        this.log('warn', message, data, options);
    }

    info(message, data = null, options = {}) {
        this.log('info', message, data, options);
    }

    debug(message, data = null, options = {}) {
        this.log('debug', message, data, options);
    }

    trace(message, data = null, options = {}) {
        this.log('trace', message, data, { ...options, includeStack: true });
    }

    /**
     * Test-specific logging methods
     */
    testStart(testName, testData = {}) {
        this.info('TEST_START', {
            testName,
            testData,
            startTime: new Date().toISOString()
        });
    }

    testEnd(testName, result, duration = null) {
        this.info('TEST_END', {
            testName,
            result,
            duration,
            endTime: new Date().toISOString()
        });
    }

    testStep(stepName, stepData = {}) {
        this.debug('TEST_STEP', {
            stepName,
            stepData,
            timestamp: new Date().toISOString()
        });
    }

    testAssertion(assertion, result, expected, actual) {
        const level = result ? 'info' : 'error';
        this.log(level, 'TEST_ASSERTION', {
            assertion,
            result,
            expected,
            actual,
            timestamp: new Date().toISOString()
        });
    }

    testError(error, context = {}) {
        this.error('TEST_ERROR', {
            error: error.message,
            stack: error.stack,
            context,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Performance logging
     */
    performance(operation, duration, metadata = {}) {
        this.info('PERFORMANCE', {
            operation,
            duration,
            metadata,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Network logging
     */
    network(method, url, status, duration, requestData = null, responseData = null) {
        this.debug('NETWORK', {
            method,
            url,
            status,
            duration,
            requestData,
            responseData: responseData ? JSON.stringify(responseData).substring(0, 500) : null,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Browser event logging
     */
    browserEvent(eventType, elementInfo, data = {}) {
        this.debug('BROWSER_EVENT', {
            eventType,
            elementInfo,
            data,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * AI interaction logging
     */
    aiInteraction(operation, input, output, confidence = null, duration = null) {
        this.info('AI_INTERACTION', {
            operation,
            input: typeof input === 'string' ? input.substring(0, 200) : input,
            output: typeof output === 'string' ? output.substring(0, 200) : output,
            confidence,
            duration,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Database operation logging
     */
    database(operation, collection, query = null, result = null, duration = null) {
        this.debug('DATABASE', {
            operation,
            collection,
            query,
            result: result ? 'success' : 'failure',
            duration,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Format log entry
     */
    formatLogEntry(level, message, data = null, options = {}) {
        let entry = '';

        // Timestamp
        if (this.options.includeTimestamp || options.includeTimestamp) {
            entry += `[${new Date().toISOString()}] `;
        }

        // Session ID
        entry += `[${this.sessionId}] `;

        // Level
        if (this.options.includeLevel || options.includeLevel) {
            entry += `[${level.toUpperCase()}] `;
        }

        // Message
        entry += message;

        // Data
        if (data) {
            entry += ` | ${typeof data === 'object' ? JSON.stringify(data, null, 2) : data}`;
        }

        // Stack trace
        if ((this.options.includeStack || options.includeStack) && level === 'error') {
            const stack = new Error().stack;
            entry += `\nStack: ${stack}`;
        }

        return entry;
    }

    /**
     * Write to console with colors
     */
    writeToConsole(level, logEntry) {
        if (this.options.colorize) {
            const color = this.colors[level] || this.colors.reset;
            console.log(`${color}${logEntry}${this.colors.reset}`);
        } else {
            console.log(logEntry);
        }
    }

    /**
     * Write to file
     */
    writeToFile(logEntry) {
        if (!this.currentLogFile) return;

        try {
            // Check file size and rotate if necessary
            if (fs.existsSync(this.currentLogFile)) {
                const stats = fs.statSync(this.currentLogFile);
                if (stats.size > this.options.maxFileSize) {
                    this.rotateLogFile();
                }
            }

            fs.appendFileSync(this.currentLogFile, logEntry + '\n');
        } catch (error) {
            console.error('Failed to write to log file:', error.message);
        }
    }

    /**
     * Rotate log files
     */
    rotateLogFile() {
        try {
            const logFiles = fs.readdirSync(this.options.logDir)
                .filter(file => file.startsWith('test-log-'))
                .map(file => ({
                    name: file,
                    path: path.join(this.options.logDir, file),
                    mtime: fs.statSync(path.join(this.options.logDir, file)).mtime
                }))
                .sort((a, b) => b.mtime - a.mtime);

            // Remove old files if we exceed maxFiles
            if (logFiles.length >= this.options.maxFiles) {
                const filesToDelete = logFiles.slice(this.options.maxFiles - 1);
                filesToDelete.forEach(file => {
                    fs.unlinkSync(file.path);
                });
            }

            // Create new log file
            this.createLogFile();
        } catch (error) {
            console.error('Failed to rotate log files:', error.message);
        }
    }

    /**
     * Check if should log based on level
     */
    shouldLog(level) {
        return this.levels[level] <= this.levels[this.options.level];
    }

    /**
     * Generate unique session ID
     */
    generateSessionId() {
        return Math.random().toString(36).substring(2, 8);
    }

    /**
     * Get log buffer
     */
    getLogBuffer() {
        return this.logBuffer;
    }

    /**
     * Get logs by level
     */
    getLogsByLevel(level) {
        return this.logBuffer.filter(log => log.level === level);
    }

    /**
     * Get logs by time range
     */
    getLogsByTimeRange(startTime, endTime) {
        return this.logBuffer.filter(log => {
            const logTime = new Date(log.timestamp).getTime();
            return logTime >= startTime && logTime <= endTime;
        });
    }

    /**
     * Search logs
     */
    searchLogs(query) {
        const regex = new RegExp(query, 'i');
        return this.logBuffer.filter(log => {
            return regex.test(log.message) || 
                   (log.data && regex.test(JSON.stringify(log.data)));
        });
    }

    /**
     * Generate log summary
     */
    generateSummary() {
        const summary = {
            sessionId: this.sessionId,
            startTime: new Date(this.startTime).toISOString(),
            endTime: new Date().toISOString(),
            duration: Date.now() - this.startTime,
            totalLogs: this.logBuffer.length,
            logsByLevel: {},
            errors: [],
            warnings: [],
            performance: []
        };

        // Count logs by level
        for (const level of Object.keys(this.levels)) {
            summary.logsByLevel[level] = this.logBuffer.filter(log => log.level === level).length;
        }

        // Extract errors and warnings
        summary.errors = this.logBuffer
            .filter(log => log.level === 'error')
            .map(log => ({ message: log.message, data: log.data, timestamp: log.timestamp }));

        summary.warnings = this.logBuffer
            .filter(log => log.level === 'warn')
            .map(log => ({ message: log.message, data: log.data, timestamp: log.timestamp }));

        // Extract performance data
        summary.performance = this.logBuffer
            .filter(log => log.message === 'PERFORMANCE')
            .map(log => log.data);

        return summary;
    }

    /**
     * Export logs to file
     */
    exportLogs(format = 'json', filename = null) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const exportFilename = filename || `logs-export-${timestamp}.${format}`;
        const exportPath = path.join(this.options.logDir, exportFilename);

        try {
            let content;
            
            switch (format.toLowerCase()) {
                case 'json':
                    content = JSON.stringify({
                        summary: this.generateSummary(),
                        logs: this.logBuffer
                    }, null, 2);
                    break;
                case 'csv':
                    content = this.convertToCSV(this.logBuffer);
                    break;
                case 'txt':
                    content = this.logBuffer
                        .map(log => this.formatLogEntry(log.level, log.message, log.data))
                        .join('\n');
                    break;
                default:
                    throw new Error(`Unsupported export format: ${format}`);
            }

            fs.writeFileSync(exportPath, content);
            this.info('LOGS_EXPORTED', { format, filename: exportFilename, path: exportPath });
            return exportPath;
        } catch (error) {
            this.error('EXPORT_FAILED', { error: error.message, format, filename });
            throw error;
        }
    }

    /**
     * Convert logs to CSV format
     */
    convertToCSV(logs) {
        const headers = ['timestamp', 'level', 'message', 'data', 'sessionId'];
        const csvRows = [headers.join(',')];

        logs.forEach(log => {
            const row = [
                log.timestamp,
                log.level,
                `"${log.message.replace(/"/g, '""')}"`,
                `"${JSON.stringify(log.data || {}).replace(/"/g, '""')}"`,
                log.sessionId
            ];
            csvRows.push(row.join(','));
        });

        return csvRows.join('\n');
    }

    /**
     * Cleanup and finalize logging
     */
    finalize() {
        const summary = this.generateSummary();
        this.info('SESSION_END', summary);
        
        if (this.options.logToFile) {
            this.exportLogs('json', `session-${this.sessionId}-summary.json`);
        }
        
        return summary;
    }
}

module.exports = Logger;