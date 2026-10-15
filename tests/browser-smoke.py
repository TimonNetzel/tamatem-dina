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
        context = browser.new_context(viewport={'width': width, 'height': 900}, accept_downloads=True, reduced_motion='reduce' if locale == 'ar-EG' else 'no-preference')
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
        river_checkpoint = saved(page)
        action(page, 'garden-start')
        assert saved(page)['stage'] == 'garden'
        assert page.locator('button.channel-tile:disabled').count() == 6
        action(page, 'garden-lens')
        action(page, 'garden-guardian')
        layout(page)
        page.keyboard.press('Escape')
        assert page.locator('button.channel-tile:disabled').count() == 0
        assert page.locator('.channel-grid').evaluate('(element)=>getComputedStyle(element).direction') == 'ltr'
        for narrow in [320, 390]:
            page.set_viewport_size({'width': narrow, 'height': 844})
            layout(page)
            tiles = page.locator('button.channel-tile')
            assert tiles.nth(0).bounding_box()['width'] >= 44
            assert tiles.nth(0).bounding_box()['x'] < tiles.nth(1).bounding_box()['x']
            assert abs(tiles.nth(0).bounding_box()['x'] - tiles.nth(3).bounding_box()['x']) < 1
        page.set_viewport_size({'width': width, 'height': 900})
        page.locator('#main').focus()
        page.evaluate('scrollTo({top:0,behavior:"instant"})')
        page.screenshot(path=f'/tmp/tamatem-garden-dry-{locale}.png', full_page=True)
        action(page, 'garden-test')
        assert saved(page)['garden']['watered'] is False
        assert page.locator('.channel-break').count() == 1
        if locale == 'en':
            before_preview = saved(page)['garden']['rotations']
            for _ in range(3):
                action(page, 'hint')
            action(page, 'garden-preview')
            assert saved(page)['garden']['rotations'] == before_preview
            assert page.locator('.channel-preview').count() == 1
            action(page, 'garden-hide-preview')
            assert saved(page)['garden']['solutionPreview'] is False
            action(page, 'hint')
            action(page, 'garden-preview')
            action(page, 'garden-apply-preview')
            assert saved(page)['stage'] == 'garden'
            assert saved(page)['garden']['watered'] is False
        else:
            # Test a visible partial water path, then solve by clicking each tile.
            action(page, 'garden-rotate', '0')
            action(page, 'garden-test')
            assert page.locator('.channel-water').count() == 2
            assert page.locator('.channel-break').count() == 1
            if locale == 'ar-EG':
                assert page.locator('.channel-water').first.evaluate('(element)=>getComputedStyle(element).animationName') == 'none'
            target = [1, 1, 2, 1, 1, 3]
            for index, value in enumerate(target):
                while saved(page)['garden']['rotations'][index] != value:
                    action(page, 'garden-rotate', str(index))
                if index == 2:
                    checkpoint = saved(page)
                    page.reload()
                    assert saved(page) == checkpoint
                    page.locator('.language-select').select_option('en')
                    assert saved(page) == checkpoint
                    page.locator('.language-select').select_option(locale)
                    layout(page)
        action(page, 'garden-test')
        assert saved(page)['stage'] == 'garden-complete'
        assert saved(page)['garden']['watered'] is True
        assert page.locator('button.channel-tile:disabled').count() == 6
        assert page.locator('.channel-water').count() == 6
        assert page.locator('img[src$="garden-wet.png"]').count() == 1
        complete = saved(page)
        page.reload()
        assert saved(page) == complete
        layout(page)
        page.locator('#main').focus()
        page.evaluate('scrollTo({top:0,behavior:"instant"})')
        page.evaluate('Promise.all(document.getAnimations().map(animation=>animation.finished.catch(()=>{})))')
        page.screenshot(path=f'/tmp/tamatem-garden-wet-{locale}.png', full_page=True)
        garden_checkpoint = saved(page)
        # Continue the complete episode while the browser network remains disabled.
        def checkpoint_scene(name):
            before = saved(page)
            page.reload()
            assert saved(page) == before
            page.locator('.language-select').select_option('en' if locale != 'en' else 'ar-EG')
            assert saved(page) == before
            page.locator('.language-select').select_option(locale)
            for narrow in [320, 390]:
                page.set_viewport_size({'width': narrow, 'height': 844})
                layout(page)
            page.set_viewport_size({'width': width, 'height': 900})
            page.locator('#main').focus()
            page.evaluate('scrollTo({top:0,behavior:"instant"})')
            page.screenshot(path=f'/tmp/tamatem-{name}-{locale}.png', full_page=True)
            assert page.locator('img').evaluate_all('(images)=>images.every(img=>img.complete && img.naturalWidth>0)')

        action(page, 'chamber-start')
        checkpoint_scene('chamber')
        before = saved(page)
        action(page, 'bloom-pick')
        assert saved(page) == before
        assert page.locator('.feedback').inner_text()
        action(page, 'bloom-identify')
        action(page, 'bloom-guardian')
        page.keyboard.press('Escape')
        action(page, 'bloom-collect')
        assert saved(page)['bloom']['collected']
        assert saved(page)['finale']['lanternOn']
        action(page, 'return-start')
        before = saved(page)
        action(page, 'return-hide')
        assert saved(page) == before
        action(page, 'return-protect')
        checkpoint_scene('return')
        action(page, 'return-home')
        before = saved(page)
        for incorrect in ['app-bind', 'app-calm', 'app-lantern', 'app-collect']:
            action(page, incorrect)
            assert saved(page) == before
            assert page.locator('.feedback').inner_text()
        action(page, 'app-insert')
        action(page, 'app-collect')
        checkpoint_scene('apparatus')
        action(page, 'app-bind')
        if locale == 'en':
            action(page, 'app-lantern')
        action(page, 'app-calm')
        assert saved(page)['stage'] == 'dina'
        assert saved(page)['finale']['stable'] == (locale == 'en')
        checkpoint_scene('dina-first')
        assert page.locator('[data-action="dina-report"]').is_disabled()
        for _ in range(3):
            action(page, 'hint')
        page.keyboard.press('Escape')
        action(page, 'dina-observe')
        checkpoint_scene('dina-observed')
        action(page, 'dina-report')
        if locale != 'en':
            assert saved(page)['stage'] == 'finale'
            assert page.locator('[data-action="heal"]').count() == 0
            action(page, 'app-lantern')
            action(page, 'app-calm')
            assert saved(page)['stage'] == 'dina'
            assert saved(page)['finale']['stable']
            assert page.locator('[data-action="dina-report"]').is_disabled()
            action(page, 'dina-observe')
            action(page, 'dina-report')
        assert saved(page)['finale']['dinaConfirmed']
        checkpoint_scene('finale-ready')
        action(page, 'heal')
        checkpoint_scene('healing')
        action(page, 'morning')
        assert saved(page)['stage'] == 'level-complete'
        checkpoint_scene('morning')
        action(page, 'notebook')
        layout(page)
        page.keyboard.press('Escape')
        with page.expect_download() as download:
            action(page, 'export')
        exported = f'/tmp/tamatem-save-{locale}.json'
        download.value.save_as(exported)
        payload = json.loads(Path(exported).read_text())
        assert payload['state']['stage'] == 'level-complete'
        assert payload['state']['owlChoice'] == original['owlChoice']
        # Restore an actual current export, then the old v3 garden checkpoint.
        for imported in [payload['state'], {**garden_checkpoint, 'version': 3}]:
            page.locator('#menu-button').click()
            action(page, 'import')
            if imported['version'] == 3:
                for field in ['bloom', 'journey', 'finale']:
                    del imported[field]
            page.locator('#import-file').set_input_files({'name': 'checkpoint.json', 'mimeType': 'application/json', 'buffer': json.dumps({'game': 'tamatem-dina-prolog', 'state': imported}).encode()})
            action(page, 'confirm-import')
            assert saved(page)['stage'] == imported['stage']
            assert saved(page)['choice'] == original['choice']
        assert page.locator('[data-action="chamber-start"]').count() == 1
        # Import a genuine old-format completed prologue using the existing confirmation flow.
        legacy = {**original, 'version': 1, 'stage': 'complete'}
        del legacy['river']
        del legacy['garden']
        page.locator('#menu-button').click()
        action(page, 'import')
        page.locator('#import-file').set_input_files({'name': 'legacy.json', 'mimeType': 'application/json', 'buffer': json.dumps({'game': 'tamatem-dina-prolog', 'state': legacy}).encode()})
        action(page, 'confirm-import')
        assert saved(page)['stage'] == 'river'
        assert saved(page)['choice'] == original['choice']
        page.reload()
        assert saved(page)['stage'] == 'river'
        assert page.locator('html').get_attribute('lang') == locale
        # A v2 save resumes at the old river checkpoint and retains both decisions.
        legacy_river = {**river_checkpoint, 'version': 2}
        del legacy_river['garden']
        page.locator('#menu-button').click()
        action(page, 'import')
        page.locator('#import-file').set_input_files({'name': 'river-v2.json', 'mimeType': 'application/json', 'buffer': json.dumps({'game': 'tamatem-dina-prolog', 'state': legacy_river}).encode()})
        action(page, 'confirm-import')
        assert saved(page)['stage'] == 'river-complete'
        action(page, 'garden-start')
        assert saved(page)['stage'] == 'garden'
        assert saved(page)['choice'] == original['choice']
        assert not errors, errors
        context.close()
        print(f'PASS {locale}: full Level 1, regular/early lantern solution, necessary Dina contribution, mobile RTL/LTR, offline reloads, v1/v2/v3/v4 import', flush=True)
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
