"""Real Level 3 Chromium run: v5 import, network-off play, touch, reloads, RTL.
Run with server.mjs running. TD_STANDALONE=1 attempts actual file:// without bypass.
"""
import json
import os
import subprocess
from pathlib import Path
from playwright.sync_api import sync_playwright

GAME_KEY = 'tamatem-dina-prolog-v1'
STANDALONE = os.environ.get('TD_STANDALONE') == '1'
BASE = Path('/tmp/tamatem-dina-offline.html').as_uri() if STANDALONE else 'http://127.0.0.1:4173'
seed = json.loads(subprocess.check_output(['node', '--input-type=module', '-e', "import {levelOne,finishCase} from './tests/support.mjs'; const state=finishCase(levelOne('research','directions'),'anonymous','document');state.version=5;delete state.eco;console.log(JSON.stringify({game:'tamatem-dina-prolog',state}));"]))
copy = json.loads(subprocess.check_output(['node', '--input-type=module', '-e', "import {ECO_COPY} from './dist/eco-copy.js'; console.log(JSON.stringify(ECO_COPY));"]))

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=os.environ.get('TD_CHROMIUM', '/usr/bin/chromium'), headless=True, args=['--no-sandbox'])
    for locale, width in [('de', 1440), ('en', 390), ('ar-EG', 390)]:
        context = browser.new_context(viewport={'width': width, 'height': 900}, has_touch=True, accept_downloads=True, reduced_motion='reduce')
        context.add_init_script(f"if(!localStorage.getItem('{GAME_KEY}'))localStorage.setItem('{GAME_KEY}',{json.dumps(json.dumps(seed))});")
        if STANDALONE:
            context.set_offline(True)
        page = context.new_page()
        errors, external = [], []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.on('request', lambda req: external.append(req.url) if STANDALONE and req.url.startswith(('http:', 'https:')) else None)
        try:
            page.goto(BASE)
        except Exception as error:
            if STANDALONE and 'ERR_BLOCKED_BY_ADMINISTRATOR' in str(error):
                print('BLOCKED: direct file:// rejected by browser policy; no bypass attempted', flush=True)
                browser.close()
                raise SystemExit(0)
            raise
        page.locator('.language-select').select_option(locale)

        def state():
            return page.evaluate('(key)=>JSON.parse(localStorage.getItem(key)).state', GAME_KEY)

        def action(name, item=None):
            sel = f'[data-action="{name}"]' + (f'[data-id="{item}"]' if item else '')
            page.locator(sel).last.tap()

        def pick(item, value):
            page.locator(f'[data-action="eco-pick"][data-id="{item}"][value="{value}"]').tap()

        def read(item):
            action('eco-read', item)
            assert page.locator('#modal').evaluate('(el)=>el.open')
            page.locator('#modal-close').tap()

        def layout():
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), state()['stage']
            for height in page.locator('.eco-game .case-radio,.eco-game select,.eco-game .conversation,.eco-game .button').evaluate_all('(els)=>els.map(el=>el.getBoundingClientRect().height)'):
                assert height >= 44, height
            assert page.locator('html').get_attribute('dir') == ('rtl' if locale == 'ar-EG' else 'ltr')
            if locale != 'de':
                visible = page.locator('body').inner_text().splitlines()
                german = {v[0] for v in copy.values() if len(v[0]) > 10 and v[0] != v[1]}
                assert not any(line.strip() in german for line in visible), 'Untranslated river text'

        def checkpoint(name):
            before = state()
            page.reload()
            assert state() == before
            page.wait_for_function('[...document.images].every(el=>el.complete && el.naturalWidth>0)')
            layout()
            page.locator('.language-select').select_option('en' if locale != 'en' else 'ar-EG')
            assert state() == before
            page.locator('.language-select').select_option(locale)
            for small in [320, 390]:
                page.set_viewport_size({'width': small, 'height': 844})
                layout()
            page.set_viewport_size({'width': width, 'height': 900})
            # Hints and notebook are functional in each scene, including after reload.
            action('hint')
            while page.locator('#modal-body [data-action="hint"]').count():
                page.locator('#modal-body [data-action="hint"]').tap()
            assert page.locator('#modal-body').inner_text()
            page.keyboard.press('Escape')
            page.locator('#notebook-button').tap()
            notes = page.locator('#modal-body').inner_text()
            assert len(notes) > 100
            assert 'Oris' in notes or 'أوريس' in notes
            page.keyboard.press('Escape')
            page.screenshot(path=f'/tmp/tamatem-eco-{name}-{locale}.png', full_page=True)
            assert not errors, errors

        # A genuine old v5 file, without any eco field, uses the normal confirmation flow.
        page.locator('#menu-button').tap()
        action('import')
        page.locator('#import-file').set_input_files({'name': 'case-v5.json', 'mimeType': 'application/json', 'buffer': json.dumps(seed).encode()})
        action('confirm-import')
        assert state()['version'] == 7 and state()['stage'] == 'case-complete'
        previous = {key: value for key, value in state().items() if key not in ['eco', 'stage', 'hints', 'version']}
        if not STANDALONE:
            page.wait_for_function('document.querySelector("#offline-status").classList.contains("ready")')
            page.reload()
            page.wait_for_function('navigator.serviceWorker.controller !== null')
            context.set_offline(True)
        action('eco-start')
        assert page.locator('[data-action="eco-begin"]').is_disabled()
        read('brief')
        checkpoint('opening')
        action('eco-begin')
        assert page.locator('[data-action="eco-accuse"]').is_disabled()
        action('eco-sample')
        checkpoint('single')
        action('eco-accuse')
        assert state()['eco']['accused']
        pick('reflection', 'doubt' if locale == 'en' else 'error')
        checkpoint('keeper')
        action('eco-compare-start')
        action('eco-compare')
        assert page.locator('.feedback').inner_text()
        for item in ['a6', 'b6', 'c6', 'a8', 'b8', 'c8']:
            read(item)
        pick('rise', 'c')
        pick('window', 'morning')
        action('eco-compare')
        assert not state()['eco']['compared']
        pick('rise', 'b')
        checkpoint('samples')
        # Same physical A-B-C arrangement in all locales.
        positions = page.locator('[data-site]').evaluate_all('(els)=>els.map(el=>el.getBoundingClientRect().x)')
        assert positions == sorted(positions) and len(positions) == 3
        action('eco-compare')
        action('eco-interviews')
        assert 'Dina' in page.locator('.actor-strip').inner_text() or 'دينا' in page.locator('.actor-strip').inner_text()
        for item in ['dyer', 'gate', 'valve']:
            read(item)
        pick('contradiction', 'gate')
        action('eco-check-interview')
        assert not state()['eco']['interviewChecked']
        pick('contradiction', 'valve')
        action('eco-check-interview')
        checkpoint('interviews')
        action('eco-meet')
        pick('load', 'source')
        action('eco-link')
        assert not state()['eco']['linked']
        for item, value in [('load', 'depot'), ('mist', 'source'), ('blue', 'unproven')]:
            pick(item, value)
        checkpoint('model')
        action('eco-link')
        action('eco-correction')
        pick('replacement', 'intent')
        action('eco-repost')
        assert not state()['eco']['reposted']
        pick('replacement', 'evidence')
        action('eco-repost')
        assert not state()['eco']['apologized']
        checkpoint('reposted')
        action('eco-apologize')
        checkpoint('correction')
        action('eco-response')
        read('depot')
        assert page.locator('[data-action="eco-stop-start"]').is_disabled()
        checkpoint('one-response')
        read('salma')
        pick('approach', 'visit' if locale == 'en' else 'warning')
        action('eco-stop-start')
        page.locator('[data-action="eco-order"][data-index="0"]').select_option('test')
        action('eco-stop')
        assert not state()['eco']['stopped']
        checkpoint('partial-stop')
        for index, item in enumerate(['close', 'hold', 'test']):
            page.locator(f'[data-action="eco-order"][data-index="{index}"]').select_option(item)
        action('eco-stop')
        assert state()['eco']['stopped'] and not state()['eco']['restored']
        checkpoint('stopped')
        action('eco-source')
        assert page.locator('[data-action="eco-clear"]').is_disabled()
        action('eco-inspect')
        action('eco-clear')
        pick('inlet', 'depot')
        action('eco-restore')
        assert not state()['eco']['restored']
        checkpoint('source-wrong')
        pick('inlet', 'clean')
        action('eco-restore')
        checkpoint('restored')
        action('eco-verify')
        read('water')
        assert page.locator('[data-action="eco-publish"]').is_disabled()
        checkpoint('one-check')
        read('roots')
        action('eco-publish')
        checkpoint('published')
        action('eco-finish')
        checkpoint('complete')
        assert state()['stage'] == 'eco-complete'
        for key, value in previous.items():
            assert state()[key] == value, key
        end = state()
        with page.expect_download() as downloaded:
            action('export')
        filename = f'/tmp/tamatem-eco-save-{locale}.json'
        downloaded.value.save_as(filename)
        assert json.loads(Path(filename).read_text())['state'] == end
        page.locator('#menu-button').tap()
        action('import')
        page.locator('#import-file').set_input_files(filename)
        action('confirm-import')
        assert state() == end
        page.reload()
        assert state() == end
        assert not errors, errors
        assert not external, external
        print(f'PASS {locale}: Level 3, actual {"file" if STANDALONE else "service-worker"} offline, v5 import, v7 export/import, both repairs, correction, touch 320/390, RTL/LTR, reload every phase', flush=True)
        context.close()
    browser.close()
