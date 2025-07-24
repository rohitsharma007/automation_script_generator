#!/usr/bin/env python3
"""
NLP Processor for Playwright Automation System
Handles natural language processing tasks for test automation
"""

import re
import json
from typing import Dict, List, Any, Optional
from dataclasses import dataclass

@dataclass
class TestStep:
    """Represents a single test step with NLP analysis"""
    step_number: int
    action: str
    selector: Optional[str]
    value: Optional[str]
    description: str
    confidence: float

class NLPProcessor:
    """Natural Language Processing for test automation"""
    
    def __init__(self):
        self.action_patterns = {
            'navigate': r'(go to|navigate to|visit|open)\s+(.+)',
            'click': r'(click|press|tap)\s+(.+)',
            'fill': r'(fill|enter|type|input)\s+(.+?)\s+(with|as)\s+(.+)',
            'verify': r'(verify|check|ensure|confirm)\s+(.+)',
            'wait': r'(wait for|wait until)\s+(.+)',
            'select': r'(select|choose)\s+(.+?)\s+(from|in)\s+(.+)'
        }
        
        self.selector_patterns = {
            'id': r'#([\w-]+)',
            'class': r'\.([\w-]+)',
            'name': r'name="([^"]*)"|name=\'([^\']*)\'',
            'text': r'text="([^"]*)"|text=\'([^\']*)\'',
            'button': r'button|btn',
            'input': r'input|field|textbox',
            'link': r'link|anchor|href'
        }
    
    def parse_natural_language_steps(self, text: str) -> List[TestStep]:
        """Parse natural language text into structured test steps"""
        steps = []
        lines = text.strip().split('\n')
        
        for i, line in enumerate(lines, 1):
            line = line.strip()
            if not line or line.startswith('#'):
                continue
                
            step = self._parse_single_step(i, line)
            if step:
                steps.append(step)
        
        return steps
    
    def _parse_single_step(self, step_num: int, text: str) -> Optional[TestStep]:
        """Parse a single step from natural language"""
        text = text.lower().strip()
        
        for action_type, pattern in self.action_patterns.items():
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return self._create_test_step(step_num, action_type, match, text)
        
        # Fallback: treat as generic action
        return TestStep(
            step_number=step_num,
            action='generic',
            selector=None,
            value=None,
            description=text,
            confidence=0.3
        )
    
    def _create_test_step(self, step_num: int, action_type: str, match, original_text: str) -> TestStep:
        """Create a TestStep object from parsed components"""
        if action_type == 'navigate':
            url = match.group(2).strip()
            return TestStep(
                step_number=step_num,
                action='navigate',
                selector=None,
                value=url,
                description=f"Navigate to {url}",
                confidence=0.9
            )
        
        elif action_type == 'click':
            target = match.group(2).strip()
            selector = self._extract_selector(target)
            return TestStep(
                step_number=step_num,
                action='click',
                selector=selector,
                value=None,
                description=f"Click {target}",
                confidence=0.8
            )
        
        elif action_type == 'fill':
            field = match.group(2).strip()
            value = match.group(4).strip()
            selector = self._extract_selector(field)
            return TestStep(
                step_number=step_num,
                action='fill',
                selector=selector,
                value=value,
                description=f"Fill {field} with {value}",
                confidence=0.85
            )
        
        elif action_type == 'verify':
            target = match.group(2).strip()
            selector = self._extract_selector(target)
            return TestStep(
                step_number=step_num,
                action='verify',
                selector=selector,
                value=None,
                description=f"Verify {target}",
                confidence=0.7
            )
        
        return TestStep(
            step_number=step_num,
            action=action_type,
            selector=None,
            value=None,
            description=original_text,
            confidence=0.5
        )
    
    def _extract_selector(self, text: str) -> str:
        """Extract CSS selector from natural language description"""
        text = text.lower().strip()
        
        # Check for explicit selectors
        for selector_type, pattern in self.selector_patterns.items():
            match = re.search(pattern, text)
            if match:
                if selector_type == 'id':
                    return f"#{match.group(1)}"
                elif selector_type == 'class':
                    return f".{match.group(1)}"
                elif selector_type == 'name':
                    value = match.group(1) if match.group(1) else match.group(2)
                    return f"[name='{value}']"
                elif selector_type == 'text':
                    value = match.group(1) if match.group(1) else match.group(2)
                    return f"text='{value}'"
        
        # Intelligent guessing based on keywords
        if 'login' in text or 'sign in' in text:
            return "[type='submit'], button[type='submit'], .login-btn"
        elif 'email' in text or 'username' in text:
            return "[name='username'], [name='email'], #email, #username"
        elif 'password' in text:
            return "[name='password'], [type='password'], #password"
        elif 'submit' in text or 'send' in text:
            return "[type='submit'], button[type='submit']"
        elif 'button' in text:
            return "button"
        elif 'link' in text:
            return "a"
        
        # Default fallback
        return f"text='{text}'"
    
    def generate_playwright_code(self, steps: List[TestStep]) -> str:
        """Generate Playwright JavaScript code from test steps"""
        code_lines = [
            "// Auto-generated Playwright test from NLP",
            "const { test, expect } = require('@playwright/test');",
            "",
            "test('NLP Generated Test', async ({ page }) => {"
        ]
        
        for step in steps:
            code_lines.append(f"  // Step {step.step_number}: {step.description}")
            
            if step.action == 'navigate':
                code_lines.append(f"  await page.goto('{step.value}');")
            elif step.action == 'click':
                code_lines.append(f"  await page.click('{step.selector}');")
            elif step.action == 'fill':
                code_lines.append(f"  await page.fill('{step.selector}', '{step.value}');")
            elif step.action == 'verify':
                code_lines.append(f"  await expect(page.locator('{step.selector}')).toBeVisible();")
            
            code_lines.append("")
        
        code_lines.append("});")
        return "\n".join(code_lines)
    
    def analyze_test_results(self, results: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze test results using NLP techniques"""
        analysis = {
            'overall_status': 'passed' if results.get('summary', {}).get('failed', 0) == 0 else 'failed',
            'performance_insights': [],
            'failure_patterns': [],
            'recommendations': []
        }
        
        # Analyze step performance
        if 'results' in results:
            for browser_result in results['results']:
                if 'steps' in browser_result:
                    for step in browser_result['steps']:
                        duration = step.get('duration', 0)
                        if duration > 5000:  # > 5 seconds
                            analysis['performance_insights'].append(
                                f"Step {step['step']} ({step['action']}) took {duration}ms - consider optimization"
                            )
        
        # Analyze failure patterns
        failed_steps = []
        if 'logs' in results:
            for log in results['logs']:
                if 'FAILED' in log:
                    failed_steps.append(log)
        
        if failed_steps:
            analysis['failure_patterns'] = failed_steps
            analysis['recommendations'].append("Review failed steps and check element selectors")
        
        # Generate recommendations
        if analysis['overall_status'] == 'passed':
            analysis['recommendations'].append("Test completed successfully - consider adding more assertions")
        
        return analysis
    
    def extract_test_data_from_text(self, text: str) -> Dict[str, Any]:
        """Extract test data and configuration from natural language"""
        data = {
            'test_name': 'Generated Test',
            'url': None,
            'credentials': {},
            'expected_elements': [],
            'test_steps': []
        }
        
        # Extract URL
        url_match = re.search(r'https?://[^\s]+', text)
        if url_match:
            data['url'] = url_match.group()
        
        # Extract credentials
        email_match = re.search(r'email[:\s]+([^\s]+)', text, re.IGNORECASE)
        if email_match:
            data['credentials']['email'] = email_match.group(1)
        
        password_match = re.search(r'password[:\s]+([^\s]+)', text, re.IGNORECASE)
        if password_match:
            data['credentials']['password'] = password_match.group(1)
        
        # Parse steps
        data['test_steps'] = self.parse_natural_language_steps(text)
        
        return data

def main():
    """Example usage of NLP Processor"""
    nlp = NLPProcessor()
    
    # Example natural language test description
    test_description = """
    Navigate to https://opensource-demo.orangehrmlive.com/web/index.php/auth/login
    Fill username field with Admin
    Fill password field with admin123
    Click login button
    Verify dashboard is visible
    """
    
    # Parse steps
    steps = nlp.parse_natural_language_steps(test_description)
    
    # Generate code
    playwright_code = nlp.generate_playwright_code(steps)
    
    print("Generated Playwright Code:")
    print(playwright_code)
    
    # Extract test data
    test_data = nlp.extract_test_data_from_text(test_description)
    print("\nExtracted Test Data:")
    print(json.dumps(test_data, indent=2, default=str))

if __name__ == "__main__":
    main()