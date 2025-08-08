/**
 * Test Orchestrator for Complex Workflow Management
 * Coordinates multiple test components, manages execution flow, and handles dependencies
 */

const EventEmitter = require('events');
const AIHelper = require('./aiHelper');
const Crawler = require('./crawler');
const ElementHelper = require('./elementHelper');
const Logger = require('./logger');
const WaitUtils = require('./waitUtils');

class TestOrchestrator extends EventEmitter {
    constructor(page, options = {}) {
        super();
        this.page = page;
        this.options = {
            maxConcurrentTasks: options.maxConcurrentTasks || 3,
            defaultTimeout: options.defaultTimeout || 30000,
            retryAttempts: options.retryAttempts || 3,
            enableAI: options.enableAI !== false,
            enableCrawling: options.enableCrawling !== false,
            logLevel: options.logLevel || 'info',
            ...options
        };

        // Initialize utilities
        this.logger = new Logger({ level: this.options.logLevel });
        this.aiHelper = this.options.enableAI ? new AIHelper() : null;
        this.crawler = this.options.enableCrawling ? new Crawler(page) : null;
        this.elementHelper = new ElementHelper(page);
        this.waitUtils = new WaitUtils(page);

        // Execution state
        this.executionState = {
            currentWorkflow: null,
            runningTasks: new Map(),
            completedTasks: new Map(),
            failedTasks: new Map(),
            taskQueue: [],
            dependencies: new Map(),
            results: new Map(),
            startTime: null,
            endTime: null
        };

        // Performance metrics
        this.metrics = {
            totalTasks: 0,
            successfulTasks: 0,
            failedTasks: 0,
            averageTaskDuration: 0,
            totalExecutionTime: 0,
            memoryUsage: [],
            cpuUsage: []
        };

        this.setupEventHandlers();
    }

    /**
     * Setup event handlers for monitoring
     */
    setupEventHandlers() {
        this.on('taskStart', (taskId, task) => {
            this.logger.testStep(`Task Started: ${taskId}`, { task: task.name, type: task.type });
        });

        this.on('taskComplete', (taskId, result) => {
            this.logger.testStep(`Task Completed: ${taskId}`, { result });
            this.metrics.successfulTasks++;
        });

        this.on('taskFailed', (taskId, error) => {
            this.logger.testError(error, { taskId });
            this.metrics.failedTasks++;
        });

        this.on('workflowComplete', (results) => {
            this.logger.testEnd('Workflow', 'completed', this.getExecutionDuration());
        });
    }

    /**
     * Execute a complete test workflow
     */
    async executeWorkflow(workflow, context = {}) {
        this.logger.testStart('Workflow', { workflow: workflow.name, context });
        this.executionState.currentWorkflow = workflow;
        this.executionState.startTime = Date.now();

        try {
            // Validate workflow
            this.validateWorkflow(workflow);

            // Initialize context
            const executionContext = {
                ...context,
                page: this.page,
                logger: this.logger,
                aiHelper: this.aiHelper,
                crawler: this.crawler,
                elementHelper: this.elementHelper,
                waitUtils: this.waitUtils,
                results: new Map(),
                sharedData: new Map()
            };

            // Build dependency graph
            this.buildDependencyGraph(workflow.tasks);

            // Execute tasks
            const results = await this.executeTasks(workflow.tasks, executionContext);

            // Generate final report
            const report = await this.generateWorkflowReport(results);

            this.executionState.endTime = Date.now();
            this.emit('workflowComplete', report);

            return report;
        } catch (error) {
            this.logger.testError(error, { workflow: workflow.name });
            this.executionState.endTime = Date.now();
            throw error;
        }
    }

    /**
     * Execute tasks with dependency management
     */
    async executeTasks(tasks, context) {
        const taskMap = new Map(tasks.map(task => [task.id, task]));
        const results = new Map();
        const executing = new Set();
        const completed = new Set();

        const executeTask = async (taskId) => {
            if (executing.has(taskId) || completed.has(taskId)) {
                return results.get(taskId);
            }

            const task = taskMap.get(taskId);
            if (!task) {
                throw new Error(`Task not found: ${taskId}`);
            }

            // Wait for dependencies
            if (task.dependencies) {
                await Promise.all(
                    task.dependencies.map(depId => executeTask(depId))
                );
            }

            executing.add(taskId);
            this.emit('taskStart', taskId, task);

            try {
                const result = await this.executeTask(task, context);
                results.set(taskId, result);
                completed.add(taskId);
                executing.delete(taskId);
                
                this.emit('taskComplete', taskId, result);
                return result;
            } catch (error) {
                executing.delete(taskId);
                this.emit('taskFailed', taskId, error);
                throw error;
            }
        };

        // Execute all tasks
        await Promise.all(tasks.map(task => executeTask(task.id)));
        return results;
    }

    /**
     * Execute individual task
     */
    async executeTask(task, context) {
        const startTime = Date.now();
        this.logger.debug(`Executing task: ${task.name}`, { type: task.type, id: task.id });

        try {
            let result;

            switch (task.type) {
                case 'navigation':
                    result = await this.executeNavigationTask(task, context);
                    break;
                case 'interaction':
                    result = await this.executeInteractionTask(task, context);
                    break;
                case 'validation':
                    result = await this.executeValidationTask(task, context);
                    break;
                case 'analysis':
                    result = await this.executeAnalysisTask(task, context);
                    break;
                case 'ai':
                    result = await this.executeAITask(task, context);
                    break;
                case 'wait':
                    result = await this.executeWaitTask(task, context);
                    break;
                case 'custom':
                    result = await this.executeCustomTask(task, context);
                    break;
                default:
                    throw new Error(`Unknown task type: ${task.type}`);
            }

            const duration = Date.now() - startTime;
            this.logger.performance(task.name, duration, { taskId: task.id, type: task.type });

            // Store result in context for other tasks
            context.results.set(task.id, result);
            if (task.storeAs) {
                context.sharedData.set(task.storeAs, result);
            }

            return result;
        } catch (error) {
            const duration = Date.now() - startTime;
            this.logger.error(`Task failed: ${task.name}`, {
                error: error.message,
                duration,
                taskId: task.id,
                type: task.type
            });
            throw error;
        }
    }

    /**
     * Execute navigation task
     */
    async executeNavigationTask(task, context) {
        const { url, waitFor, timeout = this.options.defaultTimeout } = task.params;
        
        this.logger.info(`Navigating to: ${url}`);
        await this.page.goto(url, { timeout });

        if (waitFor) {
            await this.waitUtils.waitForCondition(waitFor, timeout);
        }

        // Analyze page if crawler is enabled
        let pageAnalysis = null;
        if (this.crawler) {
            pageAnalysis = await this.crawler.analyzePage();
        }

        return {
            url: this.page.url(),
            title: await this.page.title(),
            analysis: pageAnalysis,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Execute interaction task
     */
    async executeInteractionTask(task, context) {
        const { selector, action, value, options = {} } = task.params;
        
        // Find element using smart detection
        const elementResult = await this.elementHelper.findElement(selector, options);
        
        // Perform interaction
        const result = await this.elementHelper.safeInteraction(elementResult, action, value, options);
        
        return {
            selector: elementResult.selector,
            strategy: elementResult.strategy,
            action,
            value,
            result,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Execute validation task
     */
    async executeValidationTask(task, context) {
        const { selector, validations, timeout = this.options.defaultTimeout } = task.params;
        
        // Find element
        const elementResult = await this.elementHelper.findElement(selector, { timeout });
        
        // Perform validations
        const validationResults = await this.elementHelper.validateElement(elementResult, validations);
        
        return {
            selector: elementResult.selector,
            strategy: elementResult.strategy,
            validations: validationResults,
            passed: validationResults.overall,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Execute analysis task
     */
    async executeAnalysisTask(task, context) {
        const { type, options = {} } = task.params;
        
        let result;
        
        switch (type) {
            case 'page':
                result = await this.crawler.analyzePage(options);
                break;
            case 'performance':
                result = await this.analyzePerformance();
                break;
            case 'accessibility':
                result = await this.analyzeAccessibility();
                break;
            case 'elements':
                result = await this.crawler.discoverElementsByContext(options.context || 'general');
                break;
            default:
                throw new Error(`Unknown analysis type: ${type}`);
        }
        
        return {
            type,
            result,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Execute AI task
     */
    async executeAITask(task, context) {
        if (!this.aiHelper || !this.aiHelper.isAIAvailable()) {
            throw new Error('AI helper not available or not configured');
        }

        const { operation, input, options = {} } = task.params;
        const startTime = Date.now();
        
        let result;
        
        switch (operation) {
            case 'generateScenarios':
                result = await this.aiHelper.generateTestScenarios(input.pageContent, input.objective);
                break;
            case 'analyzeElement':
                result = await this.aiHelper.analyzeElement(input.elementInfo, input.context);
                break;
            case 'generateAssertions':
                result = await this.aiHelper.generateAssertions(input.testStep, input.expectedBehavior);
                break;
            case 'analyzeFailure':
                result = await this.aiHelper.analyzeTestFailure(input.error, input.context, input.pageState);
                break;
            default:
                throw new Error(`Unknown AI operation: ${operation}`);
        }
        
        const duration = Date.now() - startTime;
        this.logger.aiInteraction(operation, input, result, null, duration);
        
        return {
            operation,
            input,
            result,
            duration,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Execute wait task
     */
    async executeWaitTask(task, context) {
        const { type, condition, timeout = this.options.defaultTimeout } = task.params;
        
        let result;
        
        switch (type) {
            case 'time':
                await this.waitUtils.waitForTime(condition.duration);
                result = { waited: condition.duration };
                break;
            case 'element':
                result = await this.waitUtils.waitForElement(condition.selector, timeout);
                break;
            case 'condition':
                result = await this.waitUtils.waitForCondition(condition, timeout);
                break;
            case 'network':
                result = await this.waitUtils.waitForNetworkIdle(condition.timeout || 5000);
                break;
            default:
                throw new Error(`Unknown wait type: ${type}`);
        }
        
        return {
            type,
            condition,
            result,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Execute custom task
     */
    async executeCustomTask(task, context) {
        const { handler, params = {} } = task.params;
        
        if (typeof handler !== 'function') {
            throw new Error('Custom task handler must be a function');
        }
        
        const result = await handler({
            page: this.page,
            context,
            params,
            logger: this.logger,
            elementHelper: this.elementHelper,
            waitUtils: this.waitUtils
        });
        
        return {
            handler: handler.name || 'anonymous',
            params,
            result,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Validate workflow structure
     */
    validateWorkflow(workflow) {
        if (!workflow.name) {
            throw new Error('Workflow must have a name');
        }
        
        if (!workflow.tasks || !Array.isArray(workflow.tasks)) {
            throw new Error('Workflow must have tasks array');
        }
        
        const taskIds = new Set();
        
        for (const task of workflow.tasks) {
            if (!task.id) {
                throw new Error('Each task must have an id');
            }
            
            if (taskIds.has(task.id)) {
                throw new Error(`Duplicate task id: ${task.id}`);
            }
            
            taskIds.add(task.id);
            
            if (!task.type) {
                throw new Error(`Task ${task.id} must have a type`);
            }
            
            if (!task.params) {
                throw new Error(`Task ${task.id} must have params`);
            }
        }
        
        // Validate dependencies
        for (const task of workflow.tasks) {
            if (task.dependencies) {
                for (const depId of task.dependencies) {
                    if (!taskIds.has(depId)) {
                        throw new Error(`Task ${task.id} depends on non-existent task: ${depId}`);
                    }
                }
            }
        }
    }

    /**
     * Build dependency graph
     */
    buildDependencyGraph(tasks) {
        this.executionState.dependencies.clear();
        
        for (const task of tasks) {
            this.executionState.dependencies.set(task.id, task.dependencies || []);
        }
    }

    /**
     * Generate workflow report
     */
    async generateWorkflowReport(results) {
        const report = {
            workflow: this.executionState.currentWorkflow.name,
            executionTime: this.getExecutionDuration(),
            startTime: new Date(this.executionState.startTime).toISOString(),
            endTime: new Date(this.executionState.endTime).toISOString(),
            totalTasks: results.size,
            successfulTasks: this.metrics.successfulTasks,
            failedTasks: this.metrics.failedTasks,
            successRate: (this.metrics.successfulTasks / results.size) * 100,
            tasks: [],
            summary: {},
            logs: this.logger.generateSummary()
        };

        // Add task details
        for (const [taskId, result] of results) {
            const task = this.executionState.currentWorkflow.tasks.find(t => t.id === taskId);
            report.tasks.push({
                id: taskId,
                name: task.name,
                type: task.type,
                result,
                status: 'completed'
            });
        }

        // Generate AI insights if available
        if (this.aiHelper && this.aiHelper.isAIAvailable()) {
            try {
                const insights = await this.generateAIInsights(report);
                report.aiInsights = insights;
            } catch (error) {
                this.logger.warn('Failed to generate AI insights', { error: error.message });
            }
        }

        return report;
    }

    /**
     * Generate AI insights for the workflow
     */
    async generateAIInsights(report) {
        const context = {
            workflow: report.workflow,
            successRate: report.successRate,
            executionTime: report.executionTime,
            failedTasks: report.tasks.filter(t => t.status === 'failed'),
            logs: report.logs
        };

        return await this.aiHelper.analyzeTestFailure(
            'Workflow analysis',
            context,
            { report }
        );
    }

    /**
     * Get execution duration
     */
    getExecutionDuration() {
        if (!this.executionState.startTime) return 0;
        const endTime = this.executionState.endTime || Date.now();
        return endTime - this.executionState.startTime;
    }

    /**
     * Get current metrics
     */
    getMetrics() {
        return {
            ...this.metrics,
            executionTime: this.getExecutionDuration()
        };
    }

    /**
     * Reset orchestrator state
     */
    reset() {
        this.executionState = {
            currentWorkflow: null,
            runningTasks: new Map(),
            completedTasks: new Map(),
            failedTasks: new Map(),
            taskQueue: [],
            dependencies: new Map(),
            results: new Map(),
            startTime: null,
            endTime: null
        };

        this.metrics = {
            totalTasks: 0,
            successfulTasks: 0,
            failedTasks: 0,
            averageTaskDuration: 0,
            totalExecutionTime: 0,
            memoryUsage: [],
            cpuUsage: []
        };
    }

    /**
     * Cleanup resources
     */
    async cleanup() {
        if (this.logger) {
            this.logger.finalize();
        }
        
        this.removeAllListeners();
        this.reset();
    }
}

module.exports = TestOrchestrator;