"""Actual offline file:// play in Chromium. No policy bypass if file access is blocked.
Generate /tmp/tamatem-dina-offline.html with make-offline.mjs first.
"""
import json
import os
import subprocess
from pathlib import Path
from playwright.sync_api import sync_playwright

GAME_KEY = 'tamatem-dina-prolog-v1'
seed = json.loads(subprocess.check_output(['node', '--input-type=module', '-e', "import {levelOne} from './tests/support.mjs'; const state=levelOne(); state.version=4; delete state.case; console.log(JSON.stringify({state}));"]))
with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=os.environ.get('TD_CHROMIUM', '/usr/bin/chromium'), headless=True, args=['--no-sandbox'])
    for locale in ['de', 'en', 'ar-EG']:
        context = browser.new_context(viewport={'width': 390, 'height': 844}, has_touch=True, accept_downloads=True)
        context.add_init_script(f"if(!localStorage.getItem('{GAME_KEY}'))localStorage.setItem('{GAME_KEY}',{json.dumps(json.dumps(seed))});localStorage.setItem('tamatem-dina-language',{json.dumps(locale)});")
        context.set_offline(True)
        page = context.new_page()
        errors, external = [], []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.on('request', lambda r: external.append(r.url) if r.url.startswith(('http:', 'https:')) else None)
        try:
            page.goto(Path('/tmp/tamatem-dina-offline.html').as_uri())
        except Exception as error:
            if 'ERR_BLOCKED_BY_ADMINISTRATOR' in str(error):
                print('BLOCKED: direct file access rejected by browser policy; no bypass attempted', flush=True)
                browser.close()
                raise SystemExit(0)
            raise
        def saved():
            return page.evaluate('(key)=>JSON.parse(localStorage.getItem(key)).state', GAME_KEY)
        def action(name, item=None):
            selector = f'[data-action="{name}"]' + (f'[data-id="{item}"]' if item else '')
            page.locator(selector).last.tap()
        def checkpoint():
            before = saved()
            page.reload()
            assert saved() == before
            assert page.locator('html').get_attribute('dir') == ('rtl' if locale == 'ar-EG' else 'ltr')
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
            page.wait_for_function('[...document.images].every(image=>image.complete && image.naturalWidth>0)')
        action('case-start')
        action('case-begin')
        for item in ['letter', 'address', 'sale']:
            action('case-read', item)
            action('case-select', item)
        checkpoint()
        action('case-address')
        action('case-interviews')
        action('case-consent', 'anonymous' if locale == 'de' else 'name')
        action('case-nora')
        page.keyboard.press('Escape')
        action('case-emil')
        action('case-withdraw', 'omit' if locale == 'en' else 'document')
        checkpoint()
        action('case-meet')
        for index, item in enumerate(['sale', 'rent', 'complaint']):
            page.locator(f'[data-action="case-order"][data-index="{index}"]').select_option(item)
        action('case-link')
        checkpoint()
        action('case-response-start')
        for item in ['owner', 'office']:
            action('case-read', item)
            page.keyboard.press('Escape')
        action('case-editor')
        for item, value in [('abduction', 'false'), ('complaints', 'verified'), ('motive', 'open')]:
            page.locator(f'[data-action="case-claim"][data-id="{item}"][value="{value}"]').check()
        action('case-check')
        action('case-correct')
        checkpoint()
        action('case-print')
        action('case-finish')
        checkpoint()
        assert saved()['stage'] == 'case-complete'
        page.locator('#notebook-button').tap()
        assert page.locator('#modal').evaluate('(el)=>el.open')
        page.keyboard.press('Escape')
        assert not external, external
        assert not errors, errors
        print(f'PASS standalone {locale}: actual file://, offline Level 2, touch, reload, v4 migration, no external requests', flush=True)
        context.close()
    browser.close()
