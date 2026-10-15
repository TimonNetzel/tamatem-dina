"""Level 4 via real Chromium: v6 import, actual network-off play, tap, RTL.
TD_STANDALONE=1 attempts direct file access without a policy bypass.
"""
import json
import os
import subprocess
from pathlib import Path
from playwright.sync_api import sync_playwright

GAME_KEY = 'tamatem-dina-prolog-v1'
STANDALONE = os.environ.get('TD_STANDALONE') == '1'
BASE = Path('/tmp/tamatem-dina-offline.html').as_uri() if STANDALONE else 'http://127.0.0.1:4173'
seed = json.loads(subprocess.check_output(['node', '--input-type=module', '-e', "import {levelOne,finishCase,finishEco} from './tests/support.mjs';const state=finishEco(finishCase(levelOne('research','directions'),'anonymous','document'),'doubt','visit');state.version=6;delete state.morning;console.log(JSON.stringify({game:'tamatem-dina-prolog',state}));"]))
copy = json.loads(subprocess.check_output(['node', '--input-type=module', '-e', "import {MORNING_COPY} from './dist/morning-copy.js';console.log(JSON.stringify(MORNING_COPY));"]))

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
            page.locator(f'[data-action="morning-pick"][data-id="{item}"][value="{value}"]').tap()

        def read(item):
            action('morning-read', item)
            assert page.locator('#modal').evaluate('(el)=>el.open')
            assert page.locator('#modal-body').inner_text()
            page.locator('#modal-close').tap()

        def order(ids):
            for index, item in enumerate(ids):
                page.locator(f'[data-action="morning-order"][data-index="{index}"]').select_option(item)

        def next_phase():
            action('morning-next')

        def check():
            action('morning-check')

        def layout():
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), state()['stage']
            for height in page.locator('.morning-game .case-radio,.morning-game select,.morning-game .conversation,.morning-game .button').evaluate_all('(els)=>els.map(el=>el.getBoundingClientRect().height)'):
                assert height >= 44, height
            assert page.locator('html').get_attribute('dir') == ('rtl' if locale == 'ar-EG' else 'ltr')
            if locale != 'de':
                visible = page.locator('body').inner_text().splitlines()
                german = {v[0] for v in copy.values() if len(v[0]) > 10 and v[0] != v[1]}
                assert not any(line.strip() in german for line in visible), 'Untranslated episode text'

        def checkpoint(name):
            before = state()
            page.reload()
            assert state() == before
            page.wait_for_function('document.querySelector("#offline-status").classList.contains("ready")')
            page.wait_for_function('[...document.images].every(el=>el.complete && el.naturalWidth>0)')
            layout()
            page.locator('.language-select').select_option('en' if locale != 'en' else 'ar-EG')
            assert state() == before
            page.locator('.language-select').select_option(locale)
            for small in [320, 390]:
                page.set_viewport_size({'width': small, 'height': 844})
                layout()
            page.set_viewport_size({'width': width, 'height': 900})
            action('hint')
            while page.locator('#modal-body [data-action="hint"]').count():
                page.locator('#modal-body [data-action="hint"]').tap()
            assert page.locator('#modal-body').inner_text()
            page.keyboard.press('Escape')
            page.locator('#notebook-button').tap()
            notes = page.locator('#modal-body').inner_text()
            assert len(notes) > 100
            assert 'Oris' in notes or 'أوريس' in notes
            assert ('Silberatem' in notes if locale == 'de' else 'Silver Breath' in notes if locale == 'en' else 'الفضي' in notes)
            page.keyboard.press('Escape')
            page.screenshot(path=f'/tmp/tamatem-morning-{name}-{locale}.png', full_page=True)
            assert not errors, errors

        # Import the exact old format through the regular file-confirmation UI.
        page.locator('#menu-button').tap()
        action('import')
        page.locator('#import-file').set_input_files({'name': 'river-v6.json', 'mimeType': 'application/json', 'buffer': json.dumps(seed).encode()})
        action('confirm-import')
        assert state()['version'] == 8 and state()['stage'] == 'eco-complete'
        previous = {key: value for key, value in state().items() if key not in ['morning', 'stage', 'hints', 'version']}
        if not STANDALONE:
            page.wait_for_function('document.querySelector("#offline-status").classList.contains("ready")')
            page.reload()
            page.wait_for_function('navigator.serviceWorker.controller !== null')
            context.set_offline(True)
        action('morning-start')
        assert page.locator('[data-action="morning-next"]').is_disabled()
        read('allegation')
        checkpoint('opening')
        next_phase()
        assert page.locator('[data-action="morning-dissent"]').is_disabled()
        pick('pressure', 'direct' if locale == 'en' else 'open')
        checkpoint('pressure-choice')
        action('morning-dissent')
        checkpoint('pressure')
        next_phase()
        read('ruth')
        pick('method', 'reposts')
        check()
        assert not state()['morning']['methodChecked'] and page.locator('.feedback').inner_text()
        pick('method', 'original')
        check()
        checkpoint('method')
        next_phase()
        for item in ['camera', 'stockSource', 'receiptSource', 'collage']:
            read(item)
            pick(item, 'independent')
        check()
        assert not state()['morning']['sourcesChecked']
        checkpoint('sources-wrong')
        pick('collage', 'derived')
        check()
        next_phase()
        read('custody')
        order(['log', 'copy', 'compare'])
        check()
        assert not state()['morning']['preserved']
        checkpoint('preserve-wrong')
        order(['copy', 'compare', 'log'])
        check()
        checkpoint('preserve')
        next_phase()
        read('calibration')
        pick('time', '1720')
        pick('scope', 'interval')
        check()
        assert not state()['morning']['clockChecked']
        pick('time', '1810')
        pick('scope', 'always')
        check()
        assert not state()['morning']['clockChecked']
        checkpoint('clock-wrong')
        pick('scope', 'interval')
        check()
        checkpoint('clock')
        next_phase()
        for item in ['inventory', 'transport', 'receipt']:
            read(item)
        order(['stock', 'clip', 'move', 'safe'])
        check()
        assert not state()['morning']['timelineChecked']
        checkpoint('timeline-wrong')
        order(['clip', 'stock', 'move', 'safe'])
        check()
        next_phase()
        read('inspection')
        pick('clip', 'found')
        check()
        assert not state()['morning']['modelChecked']
        for item, value in [('clip', 'box'), ('stock', 'later'), ('safe', 'found')]:
            pick(item, value)
        check()
        checkpoint('model')
        next_phase()
        read('manager')
        assert page.locator('[data-action="morning-next"]').is_disabled()
        checkpoint('one-response')
        read('editor')
        read('mara')
        next_phase()
        read('consent')
        for item, value in [('times', 'publish'), ('seal', 'publish'), ('neighbours', 'mask'), ('message', 'publish'), ('address', 'omit')]:
            pick(item, value)
        pick('naming', 'name' if locale == 'en' else 'anonymous')
        check()
        assert not state()['morning']['privacyChecked']
        checkpoint('privacy-wrong')
        pick('message', 'omit')
        check()
        checkpoint('privacy')
        next_phase()
        assert page.locator('[data-action="morning-group"]').is_disabled()
        assert page.locator('[data-action="morning-publish"]').is_disabled()
        article = page.locator('.case-article').inner_text()
        if locale != 'en':
            assert ('Mara' if locale == 'de' else 'مارا') not in article
        checkpoint('draft')
        action('morning-revise')
        assert page.locator('[data-action="morning-publish"]').is_disabled()
        checkpoint('approved')
        action('morning-group')
        checkpoint('group')
        action('morning-publish')
        checkpoint('published')
        next_phase()
        checkpoint('complete')
        assert state()['stage'] == 'morning-complete'
        for key, value in previous.items():
            assert state()[key] == value, key
        end = state()
        with page.expect_download() as downloaded:
            action('export')
        filename = f'/tmp/tamatem-morning-save-{locale}.json'
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
        print(f'PASS {locale}: Level 4, actual {"file" if STANDALONE else "service-worker"} offline, v6 import, v8 export/import, all puzzles, disclosure, touch 320/390, RTL, reloads', flush=True)
        context.close()
    browser.close()
