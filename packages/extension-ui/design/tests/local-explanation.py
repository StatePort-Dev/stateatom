from browser_support import launch_browser
from pathlib import Path
from playwright.sync_api import sync_playwright
r=Path(__file__).resolve().parents[1]
with sync_playwright() as p:
 b=launch_browser(p);page=b.new_page(viewport={'width':1440,'height':1000});page.set_content((r/'index.html').read_text(encoding='utf-8'));page.evaluate('StatePortV3.loadSettings("localai")');assert page.locator('.settings-title h2').inner_text()=='Local explanation';assert not page.locator('#local-ai-enabled').is_checked();assert 'No cloud fallback' in page.locator('.settings-content').inner_text();page.locator('#local-ai-state').select_option('available');page.locator('#local-ai-enabled').check();page.locator('[data-action="x:settings-close"]').click();page.locator('[data-action="x:surface:actions"]').click();assert page.locator('[data-action="x:explain-local"]').is_visible();page.locator('[data-action="x:explain-local"]').click();assert 'Template preview' in page.locator('#dialog').inner_text();b.close();print('PASS 4 local explanation UX checks')
