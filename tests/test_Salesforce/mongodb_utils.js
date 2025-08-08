/**
 * MongoDB Utility Module for Agentforce Validation
 * Handles database operations for storing validation results
 */

const { MongoClient } = require('mongodb');
require('dotenv').config();

class MongoDBUtils {
    constructor() {
        this.uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
        this.dbName = process.env.MONGODB_DATABASE || 'agentforce_validation';
        this.collectionName = process.env.MONGODB_COLLECTION || 'validation_results';
        this.client = null;
        this.db = null;
        this.collection = null;
        this.isEnabled = process.env.ENABLE_MONGODB === 'true';
    }

    /**
     * Connect to MongoDB
     */
    async connect() {
        if (!this.isEnabled) {
            console.log('📊 MongoDB integration disabled');
            return false;
        }

        try {
            console.log('🔌 Connecting to MongoDB...');
            this.client = new MongoClient(this.uri, {
                serverSelectionTimeoutMS: 5000, // 5 second timeout
                connectTimeoutMS: 5000,
                socketTimeoutMS: 5000
            });
            await this.client.connect();
            this.db = this.client.db(this.dbName);
            this.collection = this.db.collection(this.collectionName);
            console.log('✅ Connected to MongoDB successfully');
            return true;
        } catch (error) {
            console.error('❌ MongoDB connection failed:', error.message);
            this.client = null;
            return false;
        }
    }

    /**
     * Store validation result in MongoDB
     */
    async storeValidationResult(validationData) {
        if (!this.isEnabled || !this.collection) {
            return null;
        }

        try {
            const document = {
                ...validationData,
                createdAt: new Date(),
                sessionId: this.generateSessionId()
            };

            const result = await this.collection.insertOne(document);
            console.log('💾 Validation result stored in MongoDB:', result.insertedId);
            return result.insertedId;
        } catch (error) {
            console.error('❌ Failed to store validation result:', error.message);
            return null;
        }
    }

    /**
     * Store chat interaction data
     */
    async storeChatInteraction(interactionData) {
        if (!this.isEnabled || !this.collection) {
            return null;
        }

        try {
            const chatCollection = this.db.collection('chat_interactions');
            const document = {
                ...interactionData,
                timestamp: new Date(),
                sessionId: this.generateSessionId()
            };

            const result = await chatCollection.insertOne(document);
            console.log('💬 Chat interaction stored in MongoDB:', result.insertedId);
            return result.insertedId;
        } catch (error) {
            console.error('❌ Failed to store chat interaction:', error.message);
            return null;
        }
    }

    /**
     * Get validation statistics
     */
    async getValidationStats() {
        if (!this.isEnabled || !this.collection) {
            return null;
        }

        try {
            const stats = await this.collection.aggregate([
                {
                    $group: {
                        _id: null,
                        totalValidations: { $sum: 1 },
                        passedValidations: {
                            $sum: { $cond: [{ $eq: ['$overallStatus', 'PASS'] }, 1, 0] }
                        },
                        averageScore: { $avg: '$agentforceValidation.validationScore' },
                        lastValidation: { $max: '$timestamp' }
                    }
                }
            ]).toArray();

            return stats[0] || {
                totalValidations: 0,
                passedValidations: 0,
                averageScore: 0,
                lastValidation: null
            };
        } catch (error) {
            console.error('❌ Failed to get validation stats:', error.message);
            return null;
        }
    }

    /**
     * Get recent validation results
     */
    async getRecentValidations(limit = 10) {
        if (!this.isEnabled || !this.collection) {
            return [];
        }

        try {
            const results = await this.collection
                .find({})
                .sort({ timestamp: -1 })
                .limit(limit)
                .toArray();

            return results;
        } catch (error) {
            console.error('❌ Failed to get recent validations:', error.message);
            return [];
        }
    }

    /**
     * Close MongoDB connection
     */
    async disconnect() {
        if (this.client) {
            try {
                await this.client.close();
                console.log('🔌 Disconnected from MongoDB');
            } catch (error) {
                console.error('❌ Error disconnecting from MongoDB:', error.message);
            }
        }
    }

    /**
     * Generate unique session ID
     */
    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Test MongoDB connection
     */
    async testConnection() {
        if (!this.isEnabled) {
            console.log('📊 MongoDB integration is disabled');
            return false;
        }

        try {
            const connected = await this.connect();
            if (connected) {
                // Test write operation
                const testDoc = {
                    test: true,
                    timestamp: new Date(),
                    message: 'Connection test successful'
                };
                
                await this.collection.insertOne(testDoc);
                await this.collection.deleteOne({ test: true });
                
                console.log('✅ MongoDB connection test passed');
                await this.disconnect();
                return true;
            }
            return false;
        } catch (error) {
            console.error('❌ MongoDB connection test failed:', error.message);
            return false;
        }
    }
}

module.exports = MongoDBUtils;