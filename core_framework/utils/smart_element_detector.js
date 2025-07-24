// Smart Element Detection Engine
// Automatically identifies form elements without hardcoded selectors

class SmartElementDetector {
  constructor(page) {
    this.page = page;
    this.elementPatterns = {
      username: {
        selectors: ['#username', '#user', '#email', '#login', '[name="username"]', '[name="user"]', '[name="email"]', '[type="email"]'],
        attributes: ['username', 'user', 'email', 'login', 'account'],
        labels: ['username', 'user name', 'email', 'login', 'account', 'user id'],
        placeholders: ['username', 'user name', 'email', 'enter username', 'your email']
      },
      password: {
        selectors: ['#password', '#pass', '[name="password"]', '[name="pass"]', '[type="password"]'],
        attributes: ['password', 'pass', 'pwd'],
        labels: ['password', 'pass', 'pwd', 'enter password'],
        placeholders: ['password', 'enter password', 'your password']
      },
      loginButton: {
        selectors: ['#login', '#signin', '#submit', '[type="submit"]', 'button[type="submit"]'],
        text: ['login', 'sign in', 'log in', 'submit', 'enter', 'go'],
        values: ['login', 'sign in', 'log in', 'submit']
      },
      successIndicator: {
        selectors: ['.dashboard', '.home', '.main', '.content', '.welcome', '.profile', '.menu', '.nav'],
        text: ['dashboard', 'welcome', 'home', 'profile', 'logout', 'menu'],
        classes: ['dashboard', 'main-content', 'user-menu', 'navigation', 'sidebar']
      }
    };
  }

  // Main method to detect elements intelligently
  async detectElement(elementType, fallbackSelector = null) {
    console.log(`🔍 Smart detecting ${elementType} element...`);
    
    const strategies = [
      () => this.detectByDirectSelectors(elementType),
      () => this.detectByAttributes(elementType),
      () => this.detectByLabels(elementType),
      () => this.detectByPlaceholders(elementType),
      () => this.detectByText(elementType),
      () => this.detectBySemanticAnalysis(elementType),
      () => this.detectByVisualPatterns(elementType)
    ];

    for (const strategy of strategies) {
      try {
        const element = await strategy();
        if (element) {
          const selector = await this.getElementSelector(element);
          console.log(`✅ Found ${elementType} using smart detection: ${selector}`);
          return { element, selector };
        }
      } catch (error) {
        console.log(`⚠️ Strategy failed for ${elementType}:`, error.message);
      }
    }

    // Fallback to provided selector
    if (fallbackSelector) {
      try {
        const element = await this.page.$(fallbackSelector);
        if (element) {
          console.log(`🔄 Using fallback selector for ${elementType}: ${fallbackSelector}`);
          return { element, selector: fallbackSelector };
        }
      } catch (error) {
        console.log(`❌ Fallback selector failed: ${error.message}`);
      }
    }

    throw new Error(`Could not detect ${elementType} element using any strategy`);
  }

  // Strategy 1: Direct selector matching
  async detectByDirectSelectors(elementType) {
    const patterns = this.elementPatterns[elementType];
    if (!patterns || !patterns.selectors) return null;

    for (const selector of patterns.selectors) {
      const element = await this.page.$(selector);
      if (element && await this.isElementVisible(element)) {
        return element;
      }
    }
    return null;
  }

  // Strategy 2: Attribute-based detection
  async detectByAttributes(elementType) {
    const patterns = this.elementPatterns[elementType];
    if (!patterns || !patterns.attributes) return null;

    for (const attr of patterns.attributes) {
      const selectors = [
        `[name*="${attr}"]`,
        `[id*="${attr}"]`,
        `[class*="${attr}"]`,
        `[data-*="${attr}"]`
      ];

      for (const selector of selectors) {
        const element = await this.page.$(selector);
        if (element && await this.isElementVisible(element)) {
          return element;
        }
      }
    }
    return null;
  }

  // Strategy 3: Label-based detection
  async detectByLabels(elementType) {
    const patterns = this.elementPatterns[elementType];
    if (!patterns || !patterns.labels) return null;

    for (const labelText of patterns.labels) {
      const element = await this.page.evaluateHandle((text) => {
        const labels = Array.from(document.querySelectorAll('label'));
        const matchingLabel = labels.find(label => 
          label.textContent.toLowerCase().includes(text.toLowerCase())
        );
        
        if (matchingLabel) {
          const forAttr = matchingLabel.getAttribute('for');
          if (forAttr) {
            return document.getElementById(forAttr);
          }
          // Look for input within or after the label
          return matchingLabel.querySelector('input') || 
                 matchingLabel.nextElementSibling?.querySelector('input') ||
                 matchingLabel.parentElement?.querySelector('input');
        }
        return null;
      }, labelText);

      if (element && await this.isElementVisible(element)) {
        return element;
      }
    }
    return null;
  }

  // Strategy 4: Placeholder-based detection
  async detectByPlaceholders(elementType) {
    const patterns = this.elementPatterns[elementType];
    if (!patterns || !patterns.placeholders) return null;

    for (const placeholder of patterns.placeholders) {
      const element = await this.page.$(`[placeholder*="${placeholder}"]`);
      if (element && await this.isElementVisible(element)) {
        return element;
      }
    }
    return null;
  }

  // Strategy 5: Text-based detection (for buttons)
  async detectByText(elementType) {
    const patterns = this.elementPatterns[elementType];
    if (!patterns || !patterns.text) return null;

    for (const text of patterns.text) {
      const element = await this.page.evaluateHandle((searchText) => {
        const buttons = Array.from(document.querySelectorAll('button, input[type="submit"], input[type="button"], a'));
        return buttons.find(btn => 
          btn.textContent?.toLowerCase().includes(searchText.toLowerCase()) ||
          btn.value?.toLowerCase().includes(searchText.toLowerCase())
        );
      }, text);

      if (element && await this.isElementVisible(element)) {
        return element;
      }
    }
    return null;
  }

  // Strategy 6: Semantic analysis
  async detectBySemanticAnalysis(elementType) {
    return await this.page.evaluateHandle((type) => {
      const inputs = Array.from(document.querySelectorAll('input, button, select, textarea'));
      
      const semanticScore = (element) => {
        let score = 0;
        const text = (element.textContent || element.value || element.placeholder || '').toLowerCase();
        const attrs = (element.id + ' ' + element.name + ' ' + element.className).toLowerCase();
        
        switch (type) {
          case 'username':
            if (element.type === 'email') score += 10;
            if (text.includes('user') || text.includes('email')) score += 8;
            if (attrs.includes('user') || attrs.includes('email')) score += 6;
            break;
          case 'password':
            if (element.type === 'password') score += 10;
            if (text.includes('pass')) score += 8;
            if (attrs.includes('pass')) score += 6;
            break;
          case 'loginButton':
            if (element.type === 'submit') score += 8;
            if (text.includes('login') || text.includes('sign')) score += 6;
            if (attrs.includes('login') || attrs.includes('submit')) score += 4;
            break;
        }
        
        return score;
      };
      
      const scored = inputs.map(el => ({ element: el, score: semanticScore(el) }));
      const best = scored.reduce((max, current) => current.score > max.score ? current : max, { score: 0 });
      
      return best.score > 0 ? best.element : null;
    }, elementType);
  }

  // Strategy 7: Visual pattern detection
  async detectByVisualPatterns(elementType) {
    // This would use computer vision techniques in a real implementation
    // For now, we'll use DOM structure patterns
    return await this.page.evaluateHandle((type) => {
      const forms = Array.from(document.querySelectorAll('form'));
      
      for (const form of forms) {
        const inputs = form.querySelectorAll('input');
        if (inputs.length >= 2) { // Likely a login form
          const inputArray = Array.from(inputs);
          
          switch (type) {
            case 'username':
              return inputArray.find(input => 
                input.type !== 'password' && 
                input.type !== 'hidden' &&
                input.type !== 'submit'
              );
            case 'password':
              return inputArray.find(input => input.type === 'password');
            case 'loginButton':
              return form.querySelector('button[type="submit"], input[type="submit"]');
          }
        }
      }
      return null;
    }, elementType);
  }

  // Helper method to check if element is visible
  async isElementVisible(element) {
    return await this.page.evaluate((el) => {
      if (!el) return false;
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && 
             style.visibility !== 'hidden' && 
             style.opacity !== '0' &&
             el.offsetWidth > 0 && 
             el.offsetHeight > 0;
    }, element);
  }

  // Helper method to get a reliable selector for an element
  async getElementSelector(element) {
    return await this.page.evaluate((el) => {
      if (!el) return null;
      
      // Try ID first
      if (el.id) return `#${el.id}`;
      
      // Try name attribute
      if (el.name) return `[name="${el.name}"]`;
      
      // Try unique class
      if (el.className) {
        const classes = el.className.split(' ').filter(c => c.trim());
        for (const cls of classes) {
          if (document.querySelectorAll(`.${cls}`).length === 1) {
            return `.${cls}`;
          }
        }
      }
      
      // Generate CSS selector path
      const path = [];
      let current = el;
      
      while (current && current.nodeType === Node.ELEMENT_NODE) {
        let selector = current.nodeName.toLowerCase();
        
        if (current.id) {
          selector += `#${current.id}`;
          path.unshift(selector);
          break;
        }
        
        if (current.className) {
          const classes = current.className.split(' ').filter(c => c.trim());
          if (classes.length > 0) {
            selector += `.${classes[0]}`;
          }
        }
        
        // Add nth-child if needed
        const siblings = Array.from(current.parentNode?.children || []);
        const index = siblings.indexOf(current);
        if (siblings.length > 1) {
          selector += `:nth-child(${index + 1})`;
        }
        
        path.unshift(selector);
        current = current.parentElement;
        
        if (path.length > 5) break; // Prevent overly long selectors
      }
      
      return path.join(' > ');
    }, element);
  }

  // Method to learn from successful detections
  async learnFromSuccess(elementType, selector, context = {}) {
    // In a real implementation, this would update ML models
    console.log(`📚 Learning: ${elementType} successfully found with ${selector}`);
    
    // Store successful patterns for future use
    if (!this.learnedPatterns) {
      this.learnedPatterns = {};
    }
    
    if (!this.learnedPatterns[elementType]) {
      this.learnedPatterns[elementType] = [];
    }
    
    this.learnedPatterns[elementType].push({
      selector,
      context,
      timestamp: new Date().toISOString(),
      success: true
    });
  }

  // Method to get confidence score for detection
  async getConfidenceScore(element, elementType) {
    return await this.page.evaluate(([el, type]) => {
      if (!el) return 0;
      
      let confidence = 0;
      const text = (el.textContent || el.value || el.placeholder || '').toLowerCase();
      const attrs = (el.id + ' ' + el.name + ' ' + el.className).toLowerCase();
      
      // Type-specific confidence scoring
      switch (type) {
        case 'username':
          if (el.type === 'email') confidence += 30;
          if (el.type === 'text') confidence += 20;
          if (text.includes('user') || text.includes('email')) confidence += 25;
          if (attrs.includes('user') || attrs.includes('email')) confidence += 20;
          break;
          
        case 'password':
          if (el.type === 'password') confidence += 40;
          if (text.includes('pass')) confidence += 25;
          if (attrs.includes('pass')) confidence += 20;
          break;
          
        case 'loginButton':
          if (el.type === 'submit') confidence += 30;
          if (el.tagName === 'BUTTON') confidence += 25;
          if (text.includes('login') || text.includes('sign')) confidence += 20;
          break;
      }
      
      // General visibility and accessibility checks
      const style = window.getComputedStyle(el);
      if (style.display !== 'none') confidence += 10;
      if (el.offsetWidth > 0 && el.offsetHeight > 0) confidence += 10;
      
      return Math.min(confidence, 100); // Cap at 100%
    }, [element, elementType]);
  }
}

module.exports = SmartElementDetector;