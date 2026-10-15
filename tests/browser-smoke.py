"""Optional real Chromium checks. Requires Python Playwright and a running node server.mjs.
Run: python tests/browser-smoke.py
No Playwright package is needed by the game itself. Screenshots/downloads stay in /tmp.
"""
import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE = os.environ.get('TD_TEST_URL', 'http://127.0.0.1:4173')
GAME_KEY = 'tamatem-dina-prolog-v1'
CATALOG = json.loads(Path('dist/messages.js').read_text().split('export const MESSAGES=')[1].rstrip(';\n'))


def action(page, name, item=None):
    selector = f'[data-action="{name}"]'
    if item:
        selector += f'[data-id="{item}"]'
    page.locator(selector).last.click()


def saved(page):
    return page.evaluate('(key)=>JSON.parse(localStorage.getItem(key)).state', GAME_KEY)


def layout(page):
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), 'Horizontal overflow'
    # Visible German source strings must not remain in translated UI or accessibility labels.
    if page.locator('html').get_attribute('lang') != 'de':
        visible = page.locator('body').inner_text().splitlines()
        for value in visible:
            value = value.strip()
            if value in CATALOG and len(value) > 8:
                assert CATALOG[value]['en'] == value, 'Untranslated UI: ' + value
        attributes = page.locator('[aria-label],img').evaluate_all('(els)=>els.map(e=>e.getAttribute("aria-label")||e.alt)')
        for value in attributes:
            assert not value or value not in CATALOG or CATALOG[value]['en'] == value, 'Untranslated accessibility label: ' + str(value)


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(executable_path=os.environ.get('TD_CHROMIUM', '/usr/bin/chromium'), headless=True, args=['--no-sandbox'])
    for locale, width in [('de', 1440), ('en', 390), ('ar-EG', 390)]:
        context = browser.new_context(viewport={'width': width, 'height': 900}, accept_downloads=True)
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.goto(BASE)
        page.locator('.language-select').select_option(locale)
        assert page.locator('html').get_attribute('dir') == ('rtl' if locale == 'ar-EG' else 'ltr')
        layout(page)
        action(page, 'start')
        page.keyboard.press('Tab')
        assert page.evaluate('document.activeElement.tagName') in ['BUTTON', 'A', 'SELECT']
        action(page, 'verify')
        assert page.locator('.feedback').inner_text()
        action(page, 'source', 'advert')
        page.keyboard.press('Escape')
        for slot, source in [('property', 'field'), ('place', 'travel'), ('identity', 'drawing')]:
            action(page, 'source', source)
            page.locator(f'[data-action="assign"][data-slot="{slot}"]').click()
        action(page, 'verify')
        layout(page)
        action(page, 'research-next')
        for person in ['dina', 'doctor', 'hand']:
            action(page, 'talk', person)
            layout(page)
            page.keyboard.press('Escape')
        action(page, 'illness-next')
        action(page, 'choose', 'research' if locale == 'en' else 'fear')
        action(page, 'resolve-next')
        action(page, 'take-note')
        action(page, 'confirm-note')
        for item in ['lens', 'lantern', 'sling', 'glass']:
            action(page, 'item', item)
            layout(page)
            action(page, 'pack', item)
        action(page, 'depart')
        layout(page)
        action(page, 'owl', 'directions' if locale == 'en' else 'ask')
        assert saved(page)['stage'] == 'river'
        # Switching languages changes no game state, and chapter titles update immediately.
        original = saved(page)
        page.locator('.language-select').select_option('de' if locale != 'de' else 'en')
        assert saved(page) == original
        page.locator('.language-select').select_option(locale)
        layout(page)
        for small_width in [320, 390]:
            page.set_viewport_size({'width': small_width, 'height': 844})
            layout(page)
        page.set_viewport_size({'width': width, 'height': 900})
        page.locator('#main').focus()
        page.evaluate('scrollTo({top:0,behavior:"instant"})')
        page.screenshot(path=f'/tmp/tamatem-river-{locale}.png', full_page=True)
        # Real service worker readiness, then reload with networking disabled.
        page.wait_for_function('document.querySelector("#offline-status").classList.contains("ready")')
        page.reload()
        page.wait_for_function('navigator.serviceWorker.controller !== null')
        context.set_offline(True)
        page.reload()
        assert saved(page)['stage'] == 'river'
        assert page.locator('html').get_attribute('lang') == locale
        for _ in range(3):
            action(page, 'hint')
        page.keyboard.press('Escape')
        action(page, 'river-cross')
        assert saved(page)['stage'] == 'river'
        action(page, 'river-item', 'lens')
        action(page, 'river-loop')
        action(page, 'river-inspect')
        action(page, 'river-scout')
        action(page, 'river-item', 'sling')
        action(page, 'river-loop')
        assert saved(page)['river']['loopAttached']
        page.reload()
        assert saved(page)['river']['loopAttached']
        action(page, 'river-anchor')
        assert saved(page)['river']['secured']
        assert page.locator('.river-sling').count() == 1
        layout(page)
        page.locator('#main').focus()
        page.evaluate('scrollTo({top:0,behavior:"instant"})')
        page.screenshot(path=f'/tmp/tamatem-river-secured-{locale}.png', full_page=True)
        action(page, 'river-cross')
        action(page, 'river-panel')
        page.reload()
        assert saved(page)['river']['crossingPanel'] == 1
        action(page, 'river-panel')
        assert saved(page)['stage'] == 'river-complete'
        layout(page)
        action(page, 'notebook')
        layout(page)
        page.keyboard.press('Escape')
        with page.expect_download() as download:
            action(page, 'export')
        exported = f'/tmp/tamatem-save-{locale}.json'
        download.value.save_as(exported)
        payload = json.loads(Path(exported).read_text())
        assert payload['state']['stage'] == 'river-complete'
        assert payload['state']['owlChoice'] == original['owlChoice']
        # Import a genuine old-format completed prologue using the existing confirmation flow.
        legacy = {**original, 'version': 1, 'stage': 'complete'}
        del legacy['river']
        page.locator('#menu-button').click()
        action(page, 'import')
        page.locator('#import-file').set_input_files({'name': 'legacy.json', 'mimeType': 'application/json', 'buffer': json.dumps({'game': 'tamatem-dina-prolog', 'state': legacy}).encode()})
        action(page, 'confirm-import')
        assert saved(page)['stage'] == 'river'
        assert saved(page)['choice'] == original['choice']
        page.reload()
        assert saved(page)['stage'] == 'river'
        assert page.locator('html').get_attribute('lang') == locale
        assert not errors, errors
        context.close()
        print(f'PASS {locale}: full prologue + river, narrow layouts, real offline reload/play, export/import, migration', flush=True)
    context = browser.new_context(viewport={'width': 390, 'height': 844})
    context.add_init_script("Storage.prototype.getItem=function(){throw Error('Storage unavailable')};Storage.prototype.setItem=function(){throw Error('Storage unavailable')}")
    page = context.new_page()
    page.goto(BASE)
    page.locator('.language-select').select_option('ar-EG')
    action(page, 'start')
    assert page.locator('html').get_attribute('dir') == 'rtl'
    assert page.locator('.save-indicator').inner_text() == CATALOG['Speichern nicht verfügbar']['ar-EG']
    layout(page)
    context.close()
    browser.close()
    print('PASS blocked storage: language choice and game remain usable')
