/**
 * Intelligent Web Crawler for Test Automation
 * Provides advanced page crawling, analysis, and element discovery
 */

class Crawler {
    constructor(page) {
        this.page = page;
        this.discoveredElements = new Map();
        this.pageStructure = {};
        this.crawlHistory = [];
    }

    /**
     * Perform comprehensive page analysis
     */
    async analyzePage(options = {}) {
        const analysis = {
            url: this.page.url(),
            title: await this.page.title(),
            timestamp: new Date().toISOString(),
            elements: {},
            forms: [],
            links: [],
            images: [],
            scripts: [],
            styles: [],
            performance: {},
            accessibility: {},
            seo: {}
        };

        try {
            // Analyze page structure
            analysis.elements = await this.analyzePageStructure();
            
            // Discover forms
            analysis.forms = await this.discoverForms();
            
            // Discover interactive elements
            analysis.links = await this.discoverLinks();
            analysis.images = await this.discoverImages();
            
            // Analyze performance
            if (options.includePerformance) {
                analysis.performance = await this.analyzePerformance();
            }
            
            // Analyze accessibility
            if (options.includeAccessibility) {
                analysis.accessibility = await this.analyzeAccessibility();
            }
            
            // SEO analysis
            if (options.includeSEO) {
                analysis.seo = await this.analyzeSEO();
            }

            this.crawlHistory.push(analysis);
            return analysis;
        } catch (error) {
            console.error('Page analysis error:', error);
            return analysis;
        }
    }

    /**
     * Analyze page structure and element hierarchy
     */
    async analyzePageStructure() {
        return await this.page.evaluate(() => {
            const structure = {
                headings: [],
                sections: [],
                navigation: [],
                content: [],
                interactive: []
            };

            // Analyze headings
            document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(heading => {
                structure.headings.push({
                    level: heading.tagName.toLowerCase(),
                    text: heading.textContent.trim(),
                    id: heading.id,
                    classes: Array.from(heading.classList)
                });
            });

            // Analyze sections
            document.querySelectorAll('section, article, aside, main').forEach(section => {
                structure.sections.push({
                    tag: section.tagName.toLowerCase(),
                    id: section.id,
                    classes: Array.from(section.classList),
                    childCount: section.children.length
                });
            });

            // Analyze navigation
            document.querySelectorAll('nav, [role="navigation"]').forEach(nav => {
                structure.navigation.push({
                    id: nav.id,
                    classes: Array.from(nav.classList),
                    linkCount: nav.querySelectorAll('a').length
                });
            });

            // Analyze interactive elements
            document.querySelectorAll('button, input, select, textarea, [role="button"]').forEach(element => {
                structure.interactive.push({
                    tag: element.tagName.toLowerCase(),
                    type: element.type || element.getAttribute('role'),
                    id: element.id,
                    classes: Array.from(element.classList),
                    text: element.textContent?.trim() || element.value || element.placeholder,
                    visible: element.offsetParent !== null
                });
            });

            return structure;
        });
    }

    /**
     * Discover and analyze forms on the page
     */
    async discoverForms() {
        return await this.page.evaluate(() => {
            const forms = [];
            
            document.querySelectorAll('form').forEach((form, index) => {
                const formData = {
                    index,
                    id: form.id,
                    classes: Array.from(form.classList),
                    action: form.action,
                    method: form.method,
                    fields: []
                };

                // Analyze form fields
                form.querySelectorAll('input, select, textarea').forEach(field => {
                    formData.fields.push({
                        tag: field.tagName.toLowerCase(),
                        type: field.type,
                        name: field.name,
                        id: field.id,
                        placeholder: field.placeholder,
                        required: field.required,
                        value: field.value,
                        classes: Array.from(field.classList)
                    });
                });

                forms.push(formData);
            });

            return forms;
        });
    }

    /**
     * Discover all links on the page
     */
    async discoverLinks() {
        return await this.page.evaluate(() => {
            const links = [];
            
            document.querySelectorAll('a[href]').forEach(link => {
                links.push({
                    href: link.href,
                    text: link.textContent.trim(),
                    id: link.id,
                    classes: Array.from(link.classList),
                    target: link.target,
                    external: link.hostname !== window.location.hostname
                });
            });

            return links;
        });
    }

    /**
     * Discover images and media elements
     */
    async discoverImages() {
        return await this.page.evaluate(() => {
            const images = [];
            
            document.querySelectorAll('img').forEach(img => {
                images.push({
                    src: img.src,
                    alt: img.alt,
                    id: img.id,
                    classes: Array.from(img.classList),
                    width: img.width,
                    height: img.height,
                    loading: img.loading
                });
            });

            return images;
        });
    }

    /**
     * Analyze page performance metrics
     */
    async analyzePerformance() {
        try {
            const metrics = await this.page.evaluate(() => {
                const navigation = performance.getEntriesByType('navigation')[0];
                const paint = performance.getEntriesByType('paint');
                
                return {
                    loadTime: navigation?.loadEventEnd - navigation?.loadEventStart,
                    domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart,
                    firstPaint: paint.find(p => p.name === 'first-paint')?.startTime,
                    firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime,
                    resourceCount: performance.getEntriesByType('resource').length
                };
            });

            return metrics;
        } catch (error) {
            console.error('Performance analysis error:', error);
            return {};
        }
    }

    /**
     * Analyze accessibility features
     */
    async analyzeAccessibility() {
        return await this.page.evaluate(() => {
            const accessibility = {
                hasSkipLinks: !!document.querySelector('a[href^="#"]'),
                hasHeadingStructure: document.querySelectorAll('h1, h2, h3, h4, h5, h6').length > 0,
                hasAltTexts: Array.from(document.querySelectorAll('img')).every(img => img.alt),
                hasAriaLabels: document.querySelectorAll('[aria-label], [aria-labelledby]').length,
                hasFormLabels: Array.from(document.querySelectorAll('input, select, textarea')).filter(field => {
                    return field.labels?.length > 0 || field.getAttribute('aria-label');
                }).length,
                colorContrast: 'requires-manual-testing',
                keyboardNavigation: 'requires-manual-testing'
            };

            return accessibility;
        });
    }

    /**
     * Analyze SEO elements
     */
    async analyzeSEO() {
        return await this.page.evaluate(() => {
            const seo = {
                title: document.title,
                metaDescription: document.querySelector('meta[name="description"]')?.content,
                metaKeywords: document.querySelector('meta[name="keywords"]')?.content,
                h1Count: document.querySelectorAll('h1').length,
                hasCanonical: !!document.querySelector('link[rel="canonical"]'),
                hasRobots: !!document.querySelector('meta[name="robots"]'),
                hasViewport: !!document.querySelector('meta[name="viewport"]'),
                hasOpenGraph: !!document.querySelector('meta[property^="og:"]'),
                hasTwitterCard: !!document.querySelector('meta[name^="twitter:"]'),
                internalLinks: document.querySelectorAll('a[href^="/"], a[href*="' + window.location.hostname + '"]').length,
                externalLinks: document.querySelectorAll('a[href^="http"]').length
            };

            return seo;
        });
    }

    /**
     * Smart element discovery with context awareness
     */
    async discoverElementsByContext(context) {
        const contextMap = {
            'login': ['input[type="email"]', 'input[type="password"]', 'button[type="submit"]', '[role="button"]'],
            'search': ['input[type="search"]', '[placeholder*="search"]', 'button[type="submit"]'],
            'navigation': ['nav a', '[role="navigation"] a', '.menu a', '.navbar a'],
            'form': ['form input', 'form select', 'form textarea', 'form button'],
            'content': ['article', 'main', '.content', '[role="main"]'],
            'chat': ['[class*="chat"]', '[id*="chat"]', '[data-testid*="chat"]', 'iframe[src*="chat"]']
        };

        const selectors = contextMap[context] || ['*'];
        const elements = [];

        for (const selector of selectors) {
            try {
                const found = await this.page.$$(selector);
                for (const element of found) {
                    const elementInfo = await element.evaluate(el => ({
                        tagName: el.tagName,
                        id: el.id,
                        className: el.className,
                        textContent: el.textContent?.trim().substring(0, 100),
                        visible: el.offsetParent !== null,
                        attributes: Array.from(el.attributes).reduce((acc, attr) => {
                            acc[attr.name] = attr.value;
                            return acc;
                        }, {})
                    }));
                    
                    elements.push({ selector, element: elementInfo });
                }
            } catch (error) {
                console.warn(`Error discovering elements with selector ${selector}:`, error.message);
            }
        }

        return elements;
    }

    /**
     * Get crawl history and analytics
     */
    getCrawlHistory() {
        return this.crawlHistory;
    }

    /**
     * Generate crawl report
     */
    generateCrawlReport() {
        return {
            totalPages: this.crawlHistory.length,
            crawlDuration: this.crawlHistory.length > 0 ? 
                new Date(this.crawlHistory[this.crawlHistory.length - 1].timestamp) - new Date(this.crawlHistory[0].timestamp) : 0,
            pagesAnalyzed: this.crawlHistory,
            summary: {
                totalForms: this.crawlHistory.reduce((sum, page) => sum + page.forms.length, 0),
                totalLinks: this.crawlHistory.reduce((sum, page) => sum + page.links.length, 0),
                totalImages: this.crawlHistory.reduce((sum, page) => sum + page.images.length, 0),
                avgLoadTime: this.crawlHistory.reduce((sum, page) => sum + (page.performance.loadTime || 0), 0) / this.crawlHistory.length
            }
        };
    }
}

module.exports = Crawler;