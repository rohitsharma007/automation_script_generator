#!/usr/bin/env python3
"""
Smart Automation Model with Rule-Based AI Element Detection
Combines Playwright and intelligent element detection for test automation
"""

import json
import asyncio
import re
import os
from datetime import datetime
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
from pathlib import Path

# Core libraries
try:
    from playwright.async_api import async_playwright, Page, Browser, BrowserContext
except ImportError:
    print("Please install playwright: pip install playwright")
    exit(1)

@dataclass
class ElementInfo:
    """Information about a detected web element"""
    selector: str
    element_type: str
    confidence: float
    attributes: Dict[str, str]
    text_content: str
    position: Tuple[int, int, int, int]  # x, y, width, height
    
@dataclass
class PageObject:
    """Page Object Model representation"""
    page_name: str
    url_pattern: str
    elements: Dict[str, ElementInfo]
    actions: List[str]
    
class SmartElementDetector:
    """Smart element detection using rule-based AI"""
    
    def __init__(self):
        self.element_patterns = {
            'email': {
                'selectors': [
                    'input[type="email"]',
                    'input[name*="email" i]',
                    'input[name*="username" i]',
                    'input[name*="user" i]',
                    'input[placeholder*="email" i]',
                    'input[placeholder*="username" i]',
                    'input[id*="email" i]',
                    'input[id*="username" i]',
                    'input[id*="user" i]'
                ],
                'keywords': ['email', 'username', 'user', 'login', 'account', 'signin'],
                'weight': 0.9
            },
            'password': {
                'selectors': [
                    'input[type="password"]',
                    'input[name*="password" i]',
                    'input[name*="pass" i]',
                    'input[placeholder*="password" i]',
                    'input[id*="password" i]',
                    'input[id*="pass" i]'
                ],
                'keywords': ['password', 'pass', 'pwd', 'secret', 'auth'],
                'weight': 0.95
            },
            'submit': {
                'selectors': [
                    'button[type="submit"]',
                    'input[type="submit"]',
                    'button:has-text("Sign in")',
                    'button:has-text("Login")',
                    'button:has-text("Log in")',
                    'button:has-text("Submit")',
                    '[data-testid*="login"]',
                    '[data-testid*="signin"]',
                    '[data-testid*="submit"]'
                ],
                'keywords': ['submit', 'login', 'signin', 'sign-in', 'enter', 'go', 'continue'],
                'weight': 0.85
            },
            'link': {
                'selectors': [
                    'a[href]',
                    '[role="link"]',
                    'button[onclick]'
                ],
                'keywords': ['link', 'href', 'navigate', 'goto', 'click'],
                'weight': 0.7
            }
        }
    
    def classify_element(self, element_data: Dict[str, Any]) -> Tuple[str, float]:
        """Classify element type using smart rule-based detection"""
        best_type = 'other'
        best_confidence = 0.0
        
        # Get all text content for analysis
        text_content = ' '.join([
            element_data.get('text', ''),
            element_data.get('placeholder', ''),
            element_data.get('name', ''),
            element_data.get('id', ''),
            element_data.get('className', ''),
            element_data.get('ariaLabel', ''),
            element_data.get('dataTestId', '')
        ]).lower()
        
        for element_type, patterns in self.element_patterns.items():
            confidence = 0.0
            
            # Check if element matches type-specific selectors
            elem_type = element_data.get('type', '').lower()
            tag_name = element_data.get('tagName', '').lower()
            
            # Direct type match (highest confidence)
            if elem_type == element_type:
                confidence = patterns['weight']
            
            # Keyword matching in text content
            keyword_matches = sum(1 for keyword in patterns['keywords'] 
                                if keyword in text_content)
            if keyword_matches > 0:
                confidence = max(confidence, patterns['weight'] * 0.8 * (keyword_matches / len(patterns['keywords'])))
            
            # Special rules for better detection
            if element_type == 'email':
                if elem_type in ['email', 'text'] and any(kw in text_content for kw in ['email', 'username', 'user']):
                    confidence = max(confidence, 0.9)
            
            elif element_type == 'password':
                if elem_type == 'password':
                    confidence = 0.95
            
            elif element_type == 'submit':
                if tag_name == 'button' and any(kw in text_content for kw in ['login', 'signin', 'submit']):
                    confidence = max(confidence, 0.85)
                elif elem_type == 'submit':
                    confidence = max(confidence, 0.9)
            
            # Update best match
            if confidence > best_confidence:
                best_confidence = confidence
                best_type = element_type
        
        return best_type, best_confidence

class SmartPageObjectGenerator:
    """Generate Page Object Models from web pages using smart detection"""
    
    def __init__(self):
        self.detector = SmartElementDetector()
    
    async def analyze_page(self, page: Page, url: str) -> PageObject:
        """Analyze a web page and generate page object model"""
        print(f"🔍 Analyzing page: {url}")
        
        # Get page title for naming
        title = await page.title()
        page_name = self._sanitize_name(title or "UnknownPage")
        
        # Extract all interactive elements
        elements = await self._extract_elements(page)
        
        # Generate actions based on detected elements
        actions = self._generate_actions(elements)
        
        return PageObject(
            page_name=page_name,
            url_pattern=self._extract_url_pattern(url),
            elements=elements,
            actions=actions
        )
    
    async def _extract_elements(self, page: Page) -> Dict[str, ElementInfo]:
        """Extract and classify all interactive elements"""
        elements = {}
        
        # Define comprehensive selectors
        selectors = [
            'input[type="email"]',
            'input[type="password"]', 
            'input[type="text"]',
            'input[type="submit"]',
            'button',
            'a[href]',
            'select',
            'textarea',
            '[data-testid]',
            '[id]',
            '[name]',
            '[role="button"]',
            '[role="link"]',
            '.btn',
            '.button',
            '.login',
            '.signin'
        ]
        
        for selector in selectors:
            try:
                element_handles = await page.query_selector_all(selector)
                
                for i, handle in enumerate(element_handles):
                    try:
                        # Get element properties
                        element_data = await self._get_element_data(handle)
                        
                        if not element_data or not element_data.get('isVisible'):
                            continue
                        
                        # Classify element using smart detection
                        element_type, confidence = self.detector.classify_element(element_data)
                        
                        # Skip low-confidence detections
                        if confidence < 0.3:
                            continue
                        
                        # Generate unique element name
                        element_name = self._generate_element_name(element_type, element_data, i)
                        
                        # Avoid duplicates
                        if element_name in elements:
                            element_name = f"{element_name}_{i}"
                        
                        # Create ElementInfo
                        elements[element_name] = ElementInfo(
                            selector=self._generate_robust_selector(element_data),
                            element_type=element_type,
                            confidence=confidence,
                            attributes=element_data,
                            text_content=element_data.get('text', ''),
                            position=self._extract_position(element_data.get('boundingBox', {}))
                        )
                        
                    except Exception as e:
                        print(f"Warning: Could not process element {i}: {e}")
                        continue
                        
            except Exception as e:
                print(f"Warning: Could not query selector {selector}: {e}")
                continue
        
        return elements
    
    async def _get_element_data(self, handle) -> Dict[str, Any]:
        """Extract comprehensive data from an element handle"""
        try:
            data = await handle.evaluate('''
                element => {
                    const rect = element.getBoundingClientRect();
                    const computedStyle = window.getComputedStyle(element);
                    return {
                        tagName: element.tagName.toLowerCase(),
                        type: element.type || '',
                        id: element.id || '',
                        name: element.name || '',
                        className: element.className || '',
                        placeholder: element.placeholder || '',
                        text: element.textContent?.trim() || '',
                        value: element.value || '',
                        href: element.href || '',
                        role: element.getAttribute('role') || '',
                        ariaLabel: element.getAttribute('aria-label') || '',
                        dataTestId: element.getAttribute('data-testid') || '',
                        title: element.title || '',
                        alt: element.alt || '',
                        boundingBox: {
                            x: rect.x,
                            y: rect.y,
                            width: rect.width,
                            height: rect.height
                        },
                        isVisible: rect.width > 0 && rect.height > 0 && computedStyle.visibility !== 'hidden' && computedStyle.display !== 'none',
                        isEnabled: !element.disabled && !element.readOnly
                    };
                }
            ''')
            
            return data if data.get('isVisible') and data.get('isEnabled') else None
            
        except Exception as e:
            print(f"Error extracting element data: {e}")
            return None
    
    def _generate_robust_selector(self, element_data: Dict[str, Any]) -> str:
        """Generate the most robust CSS selector for an element"""
        selectors = []
        
        # Priority order: data-testid > id > name > type + attributes > class
        if element_data.get('dataTestId'):
            selectors.append(f'[data-testid="{element_data["dataTestId"]}"]')
        
        if element_data.get('id'):
            selectors.append(f'#{element_data["id"]}')
        
        if element_data.get('name'):
            selectors.append(f'[name="{element_data["name"]}"]')
        
        if element_data.get('type'):
            selectors.append(f'{element_data["tagName"]}[type="{element_data["type"]}"]')
        
        # Fallback to tag name with class (first 2 classes only)
        if element_data.get('className'):
            classes = element_data['className'].split()[:2]
            if classes:
                class_selector = '.'.join(classes)
                selectors.append(f'{element_data["tagName"]}.{class_selector}')
        
        # Text-based selector for buttons/links
        if element_data.get('text') and len(element_data['text']) < 50:
            clean_text = element_data['text'].replace('"', '\\"')
            if element_data['tagName'] in ['button', 'a']:
                selectors.append(f'{element_data["tagName"]}:has-text("{clean_text}")')
        
        # Return the first (most specific) selector
        return selectors[0] if selectors else element_data.get('tagName', 'unknown')
    
    def _generate_element_name(self, element_type: str, element_data: Dict[str, Any], index: int) -> str:
        """Generate a meaningful name for the element"""
        # Use data-testid if available
        if element_data.get('dataTestId'):
            return self._sanitize_name(element_data['dataTestId'])
        
        # Use id if available
        if element_data.get('id'):
            return self._sanitize_name(element_data['id'])
        
        # Use name if available
        if element_data.get('name'):
            return self._sanitize_name(element_data['name'])
        
        # Use text content for buttons/links
        if element_data.get('text') and len(element_data['text']) < 30:
            clean_text = re.sub(r'[^a-zA-Z0-9]', '_', element_data['text']).strip('_')
            if clean_text:
                return f"{element_type}_{clean_text}"
        
        # Fallback to type + index
        return f"{element_type}_{index}"
    
    def _extract_position(self, bbox: Dict[str, float]) -> Tuple[int, int, int, int]:
        """Extract position tuple from bounding box"""
        return (
            int(bbox.get('x', 0)),
            int(bbox.get('y', 0)),
            int(bbox.get('width', 0)),
            int(bbox.get('height', 0))
        )
    
    def _generate_actions(self, elements: Dict[str, ElementInfo]) -> List[str]:
        """Generate possible actions based on detected elements"""
        actions = []
        
        for name, element in elements.items():
            if element.element_type == 'email':
                actions.append(f"fill_{name}(username: str)")
            elif element.element_type == 'password':
                actions.append(f"fill_{name}(password: str)")
            elif element.element_type == 'submit':
                actions.append(f"click_{name}()")
            elif element.element_type == 'link':
                actions.append(f"click_{name}()")
        
        return actions
    
    def _sanitize_name(self, name: str) -> str:
        """Sanitize name for use as identifier"""
        # Remove special characters and convert to camelCase
        clean_name = re.sub(r'[^a-zA-Z0-9]', '_', name)
        clean_name = re.sub(r'_+', '_', clean_name).strip('_')
        return clean_name if clean_name else 'element'
    
    def _extract_url_pattern(self, url: str) -> str:
        """Extract URL pattern for page matching"""
        # Remove query parameters and fragments
        base_url = url.split('?')[0].split('#')[0]
        return base_url

class SmartAutomationModel:
    """Main automation model with smart element detection"""
    
    def __init__(self):
        self.page_generator = SmartPageObjectGenerator()
        self.browser: Optional[Browser] = None
        self.context: Optional[BrowserContext] = None
        self.page: Optional[Page] = None
        self.page_objects: Dict[str, PageObject] = {}
        
    async def process_test_case(self, test_config: Dict[str, Any]) -> Dict[str, Any]:
        """Process a test case and generate automation script"""
        print("🤖 Starting Smart Automation Model")
        print(f"Test Case ID: {test_config.get('test_case_id')}")
        
        results = {
            'test_case_id': test_config.get('test_case_id'),
            'status': 'running',
            'page_objects': {},
            'generated_script': '',
            'execution_log': [],
            'screenshots': []
        }
        
        try:
            # Initialize browser
            await self._initialize_browser(test_config.get('headless', False))
            
            # Execute test steps and analyze pages
            await self._execute_smart_steps(test_config, results)
            
            # Generate comprehensive automation script
            script_content = await self._generate_automation_script(test_config, results)
            results['generated_script'] = script_content
            
            # Save generated files
            await self._save_generated_files(test_config, results)
            
            results['status'] = 'completed'
            print("✅ Test case completed successfully")
            
        except Exception as e:
            results['status'] = 'failed'
            results['error'] = str(e)
            print(f"❌ Test case failed: {e}")
            
        finally:
            await self._cleanup()
        
        return results
    
    async def _initialize_browser(self, headless: bool = False):
        """Initialize Playwright browser"""
        playwright = await async_playwright().start()
        self.browser = await playwright.chromium.launch(headless=headless)
        self.context = await self.browser.new_context()
        self.page = await self.context.new_page()
        
        # Enable console logging
        self.page.on('console', lambda msg: print(f"Console: {msg.text}"))
    
    async def _execute_smart_steps(self, test_config: Dict[str, Any], results: Dict[str, Any]):
        """Execute test steps with smart analysis"""
        test_data = test_config.get('test_data', {})
        test_steps = test_config.get('test_steps', [])
        
        for i, step in enumerate(test_steps, 1):
            print(f"\n🔄 Step {i}: {step}")
            results['execution_log'].append(f"Step {i}: {step}")
            
            try:
                if "navigate" in step.lower() or "url" in step.lower():
                    await self._smart_navigate(test_data.get('url'), results)
                    
                elif "email" in step.lower() and "fill" in step.lower():
                    await self._smart_fill_email(test_data.get('username'), results)
                    
                elif "password" in step.lower() and "fill" in step.lower():
                    await self._smart_fill_password(test_data.get('password'), results)
                    
                elif "sign in" in step.lower() or "login" in step.lower() or "click" in step.lower():
                    await self._smart_click_submit(results)
                    
                elif "verify" in step.lower() or "dashboard" in step.lower():
                    await self._smart_verify_success(results)
                
                # Take screenshot after each step
                screenshot_path = f"step_{i}_screenshot.png"
                await self.page.screenshot(path=screenshot_path)
                results['screenshots'].append(screenshot_path)
                
                # Analyze current page and update page objects
                await self._analyze_current_page(results)
                
            except Exception as e:
                error_msg = f"Step {i} failed: {str(e)}"
                results['execution_log'].append(error_msg)
                print(f"⚠️ {error_msg}")
    
    async def _smart_navigate(self, url: str, results: Dict[str, Any]):
        """Navigate with smart page analysis"""
        print(f"  → Navigating to: {url}")
        await self.page.goto(url)
        await self.page.wait_for_load_state('networkidle')
        
        # Analyze the landing page
        page_obj = await self.page_generator.analyze_page(self.page, url)
        self.page_objects[page_obj.page_name] = page_obj
        results['page_objects'][page_obj.page_name] = self._serialize_page_object(page_obj)
        
        print(f"  ✅ Page analyzed: {page_obj.page_name} ({len(page_obj.elements)} elements detected)")
    
    async def _smart_fill_email(self, username: str, results: Dict[str, Any]):
        """Fill email using smart-detected elements"""
        email_elements = self._find_elements_by_type('email')
        
        if not email_elements:
            raise Exception("No email field detected by smart model")
        
        # Use the highest confidence email element
        best_element = max(email_elements, key=lambda x: x[1].confidence)
        element_name, element_info = best_element
        
        print(f"  → Filling email field: {element_name} (confidence: {element_info.confidence:.2f})")
        await self.page.fill(element_info.selector, username)
        print(f"  ✅ Email filled successfully")
    
    async def _smart_fill_password(self, password: str, results: Dict[str, Any]):
        """Fill password using smart-detected elements"""
        password_elements = self._find_elements_by_type('password')
        
        if not password_elements:
            raise Exception("No password field detected by smart model")
        
        # Use the highest confidence password element
        best_element = max(password_elements, key=lambda x: x[1].confidence)
        element_name, element_info = best_element
        
        print(f"  → Filling password field: {element_name} (confidence: {element_info.confidence:.2f})")
        await self.page.fill(element_info.selector, password)
        print(f"  ✅ Password filled successfully")
    
    async def _smart_click_submit(self, results: Dict[str, Any]):
        """Click submit using smart-detected elements"""
        submit_elements = self._find_elements_by_type('submit')
        
        if not submit_elements:
            raise Exception("No submit button detected by smart model")
        
        # Use the highest confidence submit element
        best_element = max(submit_elements, key=lambda x: x[1].confidence)
        element_name, element_info = best_element
        
        print(f"  → Clicking submit button: {element_name} (confidence: {element_info.confidence:.2f})")
        await self.page.click(element_info.selector)
        await self.page.wait_for_load_state('networkidle')
        print(f"  ✅ Submit button clicked successfully")
    
    async def _smart_verify_success(self, results: Dict[str, Any]):
        """Verify success using smart page analysis"""
        current_url = self.page.url
        print(f"  → Current URL: {current_url}")
        
        # Analyze the current page for success indicators
        page_obj = await self.page_generator.analyze_page(self.page, current_url)
        
        # Look for dashboard/success indicators
        success_indicators = ['dashboard', 'welcome', 'home', 'profile', 'logout', 'menu']
        found_indicators = []
        
        for element_name, element_info in page_obj.elements.items():
            for indicator in success_indicators:
                if indicator in element_name.lower() or indicator in element_info.text_content.lower():
                    found_indicators.append(f"{element_name}: {element_info.text_content}")
        
        if found_indicators:
            print(f"  ✅ Success verified - Found indicators: {', '.join(found_indicators[:3])}")
        else:
            print(f"  ⚠️ Success verification inconclusive - proceeding")
    
    def _find_elements_by_type(self, element_type: str) -> List[Tuple[str, ElementInfo]]:
        """Find elements of a specific type across all page objects"""
        elements = []
        
        for page_obj in self.page_objects.values():
            for name, element_info in page_obj.elements.items():
                if element_info.element_type == element_type:
                    elements.append((name, element_info))
        
        return elements
    
    async def _analyze_current_page(self, results: Dict[str, Any]):
        """Analyze current page and update page objects"""
        current_url = self.page.url
        page_obj = await self.page_generator.analyze_page(self.page, current_url)
        
        if page_obj.page_name not in self.page_objects:
            self.page_objects[page_obj.page_name] = page_obj
            results['page_objects'][page_obj.page_name] = self._serialize_page_object(page_obj)
    
    def _serialize_page_object(self, page_obj: PageObject) -> Dict[str, Any]:
        """Serialize page object for JSON output"""
        return {
            'page_name': page_obj.page_name,
            'url_pattern': page_obj.url_pattern,
            'elements': {
                name: {
                    'selector': elem.selector,
                    'type': elem.element_type,
                    'confidence': elem.confidence,
                    'text': elem.text_content,
                    'position': elem.position
                }
                for name, elem in page_obj.elements.items()
            },
            'actions': page_obj.actions
        }
    
    async def _generate_automation_script(self, test_config: Dict[str, Any], results: Dict[str, Any]) -> str:
        """Generate comprehensive automation script with page objects"""
        script_template = f'''#!/usr/bin/env python3
"""
Generated Smart Automation Script with Page Objects
Generated on: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
Test Case ID: {test_config.get('test_case_id')}
"""

from playwright.async_api import async_playwright
import asyncio
import json
from typing import Optional

# Generated Page Object Models
'''
        
        # Generate page object classes
        for page_name, page_data in results['page_objects'].items():
            script_template += self._generate_page_object_class(page_name, page_data)
        
        # Generate main test class
        script_template += f'''
class SmartTestAutomation:
    def __init__(self, headless: bool = {test_config.get('headless', False)}):
        self.headless = headless
        self.browser = None
        self.context = None
        self.page = None
        
        # Initialize page objects
'''
        
        for page_name in results['page_objects'].keys():
            script_template += f"        self.{page_name.lower()}_page = None\n"
        
        script_template += '''
    
    async def setup(self):
        """Setup browser and page objects"""
        playwright = await async_playwright().start()
        self.browser = await playwright.chromium.launch(headless=self.headless)
        self.context = await self.browser.new_context()
        self.page = await self.context.new_page()
        
        # Initialize page objects with page instance
'''
        
        for page_name in results['page_objects'].keys():
            script_template += f"        self.{page_name.lower()}_page = {page_name}Page(self.page)\n"
        
        # Generate test method
        script_template += f'''
    
    async def run_test(self):
        """Execute the generated test case"""
        try:
            await self.setup()
            
            # Test execution based on smart detection
'''
        
        test_steps = test_config.get('test_steps', [])
        test_data = test_config.get('test_data', {})
        
        for i, step in enumerate(test_steps, 1):
            script_template += f"            # Step {i}: {step}\n"
            
            if "navigate" in step.lower():
                script_template += f"            await self.page.goto('{test_data.get('url')}')\n"
                script_template += "            await self.page.wait_for_load_state('networkidle')\n"
                
            elif "email" in step.lower() and "fill" in step.lower():
                email_elements = self._find_elements_by_type('email')
                if email_elements:
                    best_element = max(email_elements, key=lambda x: x[1].confidence)
                    script_template += f"            await self.page.fill('{best_element[1].selector}', '{test_data.get('username')}')\n"
                    
            elif "password" in step.lower() and "fill" in step.lower():
                password_elements = self._find_elements_by_type('password')
                if password_elements:
                    best_element = max(password_elements, key=lambda x: x[1].confidence)
                    script_template += f"            await self.page.fill('{best_element[1].selector}', '{test_data.get('password')}')\n"
                    
            elif "sign in" in step.lower() or "click" in step.lower():
                submit_elements = self._find_elements_by_type('submit')
                if submit_elements:
                    best_element = max(submit_elements, key=lambda x: x[1].confidence)
                    script_template += f"            await self.page.click('{best_element[1].selector}')\n"
                    script_template += "            await self.page.wait_for_load_state('networkidle')\n"
            
            script_template += "\n"
        
        script_template += '''
            print("✅ Test completed successfully")
            return True
            
        except Exception as e:
            print(f"❌ Test failed: {e}")
            return False
            
        finally:
            await self.cleanup()
    
    async def cleanup(self):
        """Cleanup browser resources"""
        if self.browser:
            await self.browser.close()

async def main():
    """Main execution function"""
    test = SmartTestAutomation()
    success = await test.run_test()
    return success

if __name__ == "__main__":
    result = asyncio.run(main())
    exit(0 if result else 1)
'''
        
        return script_template
    
    def _generate_page_object_class(self, page_name: str, page_data: Dict[str, Any]) -> str:
        """Generate a page object class"""
        class_template = f'''
class {page_name}Page:
    """Smart Page Object for {page_name}"""
    
    def __init__(self, page):
        self.page = page
        self.url_pattern = "{page_data['url_pattern']}"
        
        # Smart-detected element selectors (with confidence scores)
'''
        
        for element_name, element_data in page_data['elements'].items():
            confidence = element_data['confidence']
            class_template += f"        self.{element_name} = '{element_data['selector']}'  # Confidence: {confidence:.2f}\n"
        
        class_template += "\n    # Generated action methods\n"
        
        for action in page_data['actions']:
            method_name = action.split('(')[0]
            if 'fill_' in method_name:
                element_name = method_name.replace('fill_', '')
                class_template += f'''
    async def {method_name}(self, value: str):
        """Fill {element_name} field"""
        await self.page.fill(self.{element_name}, value)
'''
            elif 'click_' in method_name:
                element_name = method_name.replace('click_', '')
                class_template += f'''
    async def {method_name}(self):
        """Click {element_name} element"""
        await self.page.click(self.{element_name})
'''
        
        class_template += "\n"
        return class_template
    
    async def _save_generated_files(self, test_config: Dict[str, Any], results: Dict[str, Any]):
        """Save all generated files"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        test_id = test_config.get('test_case_id', 'unknown')
        
        # Save automation script
        script_filename = f"smart_generated_test_{test_id}_{timestamp}.py"
        with open(script_filename, 'w') as f:
            f.write(results['generated_script'])
        
        # Save page objects as JSON
        page_objects_filename = f"smart_page_objects_{test_id}_{timestamp}.json"
        with open(page_objects_filename, 'w') as f:
            json.dump(results['page_objects'], f, indent=2)
        
        # Save execution report
        report_filename = f"smart_execution_report_{test_id}_{timestamp}.json"
        with open(report_filename, 'w') as f:
            json.dump({
                'test_case_id': results['test_case_id'],
                'status': results['status'],
                'execution_log': results['execution_log'],
                'screenshots': results['screenshots'],
                'generated_files': {
                    'script': script_filename,
                    'page_objects': page_objects_filename,
                    'report': report_filename
                }
            }, f, indent=2)
        
        print(f"\n📁 Generated Files:")
        print(f"  • Smart Automation Script: {script_filename}")
        print(f"  • Page Objects: {page_objects_filename}")
        print(f"  • Execution Report: {report_filename}")
    
    async def _cleanup(self):
        """Cleanup browser resources"""
        if self.browser:
            await self.browser.close()

# Example usage and testing
async def main():
    """Example usage of the Smart Automation Model"""
    
    # Load test configuration from sample.json
    try:
        with open('sample.json', 'r') as f:
            test_config = json.load(f)
    except FileNotFoundError:
        # Fallback configuration
        test_config = {
            "test_case_id": "SMART_TEST_001",
            "test_steps": [
                "Step 1: Navigate to URL",
                "Step 2: fill the email",
                "Step 3: fill the password",
                "Step 4: click on Sign in",
                "Step 5: Verify dashboard loads successfully"
            ],
            "test_data": {
                "username": "Admin",
                "password": "admin123",
                "url": "https://opensource-demo.orangehrmlive.com/web/index.php/auth/login"
            },
            "headless": False,
            "language": "python"
        }
    
    # Create and run the smart automation model
    model = SmartAutomationModel()
    results = await model.process_test_case(test_config)
    
    print("\n🎯 Final Results:")
    print(f"Status: {results['status']}")
    print(f"Page Objects Generated: {len(results['page_objects'])}")
    print(f"Execution Steps: {len(results['execution_log'])}")
    
    return results

if __name__ == "__main__":
    asyncio.run(main())