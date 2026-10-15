"""Level 6 via real Chromium: v8 import, actual network-off play, tap, RTL.
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
seed = json.loads(subprocess.check_output(['node', '--input-type=module', '-e', "import {levelOne,finishCase,finishEco,finishMorning,finishMask} from './tests/support.mjs';const state=finishMask(finishMorning(finishEco(finishCase(levelOne('research','directions'),'anonymous','document'),'doubt','visit'),'direct','anonymous'),'quiet','role','boundary');state.version=8;delete state.healing;console.log(JSON.stringify({game:'tamatem-dina-prolog',state}));"]))
copy = json.loads(subprocess.check_output(['node', '--input-type=module', '-e', "import {HEALING_COPY} from './dist/healing-copy.js';console.log(JSON.stringify(HEALING_COPY));"]))

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
            page.locator(f'[data-action="healing-pick"][data-id="{item}"][value="{value}"]').tap()

        def read(item):
            action('healing-read', item)
            assert page.locator('#modal').evaluate('(el)=>el.open')
            assert page.locator('#modal-body').inner_text()
            page.locator('#modal-close').tap()

        def order(ids):
            for index, item in enumerate(ids):
                page.locator(f'[data-action="healing-order"][data-index="{index}"]').select_option(item)

        def next_phase():
            action('healing-next')

        def check():
            action('healing-check')

        def layout():
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), state()['stage']
            for height in page.locator('.healing-game .case-radio,.healing-game select,.healing-game .conversation,.healing-game .button').evaluate_all('(els)=>els.map(el=>el.getBoundingClientRect().height)'):
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
            page.screenshot(path=f'/tmp/tamatem-healing-{name}-{locale}.png', full_page=True)
            assert not errors, errors

        page.locator('#menu-button').tap()
        action('import')
        page.locator('#import-file').set_input_files({'name': 'mask-v8.json', 'mimeType': 'application/json', 'buffer': json.dumps(seed).encode()})
        action('confirm-import')
        assert state()['version'] == 10 and state()['stage'] == 'mask-complete'
        previous = {key: value for key, value in state().items() if key not in ['healing', 'stage', 'hints', 'version']}
        if not STANDALONE:
            page.wait_for_function('document.querySelector("#offline-status").classList.contains("ready")')
            page.reload()
            page.wait_for_function('navigator.serviceWorker.controller !== null')
            context.set_offline(True)
        action('healing-start')
        assert state()['stage'] == 'healing-opening'
        phases = ['opening', 'call', 'study', 'contact', 'supply', 'contract', 'protect', 'chain', 'responses', 'revise', 'publish', 'followup']
        documents = {
            'opening': ['clinic', 'request'], 'call': ['draft', 'patient'],
            'study': ['protocol', 'results'], 'contact': ['permission', 'origin'],
            'supply': ['arrival', 'quality', 'reserved'], 'contract': ['c24', 'n2', 'payment'],
            'protect': ['withdrawal', 'risk'], 'chain': ['register', 'audit'],
            'responses': ['vela', 'office', 'hospital'], 'revise': ['review'],
            'publish': ['approval'], 'followup': ['delivery', 'outcome']}
        answers = {
            'call': {'approach': 'together' if locale == 'en' else 'doubt'},
            'study': {'benefit': 'ten', 'scope': 'adults', 'safety': 'uncertain'},
            'contact': {'access': 'limited', 'provenance': 'compare'},
            'supply': {'batch': 'b41', 'available': 'forty', 'hold': 'retain'},
            'contract': {'cash': 'twohundred', 'gap': '3200', 'cost': 'security'},
            'protect': {'private': 'omit', 'fingerprint': 'omit', 'public': 'keep'},
            'responses': {'barrier': 'documented', 'intent': 'open', 'responseMode': 'meeting' if locale == 'en' else 'written'},
            'revise': {'wording': 'limited'},
            'followup': {'accessResult': 'arrived', 'healthResult': 'unknown'}}
        wrong = {'study': ('benefit', 'fifty'), 'contact': ('provenance', 'trust'),
                 'supply': ('available', 'hundred'), 'contract': ('cost', 'profit'),
                 'protect': ('fingerprint', 'nameonly'), 'responses': ('intent', 'corrupt'),
                 'revise': ('wording', 'cure'), 'followup': ('healthResult', 'cured')}
        for phase in phases:
            assert state()['stage'] == 'healing-' + phase
            assert page.locator('[data-action="healing-next"]').is_disabled()
            check()
            assert phase not in state()['healing']['checked']
            assert page.locator('.feedback').inner_text()
            for item in documents[phase]:
                read(item)
            for item, value in answers.get(phase, {}).items():
                pick(item, value)
            if phase == 'chain':
                order(['effective', 'shortfall', 'ordered', 'waiting'])
                check()
                assert phase not in state()['healing']['checked']
                checkpoint('chain-wrong')
                order(['effective', 'ordered', 'shortfall', 'waiting'])
            if phase in wrong:
                item, value = wrong[phase]
                pick(item, value)
                check()
                assert phase not in state()['healing']['checked']
                checkpoint(phase + '-wrong')
                pick(item, answers[phase][item])
            checkpoint(phase + '-partial')
            check()
            assert phase in state()['healing']['checked']
            if phase in ['protect', 'chain', 'revise', 'publish']:
                assert page.locator('[data-action="healing-next"]').is_disabled()
                if phase == 'protect':
                    action('healing-protect')
                    assert state()['healing']['protected']
                elif phase == 'chain':
                    action('healing-meet')
                    assert state()['healing']['met']
                elif phase == 'revise':
                    assert page.locator('.healing-correction del').count() == 0
                    action('healing-revise')
                    assert page.locator('.healing-correction del').count() == 1
                else:
                    assert page.locator('[data-action="healing-publish"]').is_disabled()
                    action('healing-approve')
                    checkpoint('approved')
                    assert page.locator('[data-action="healing-next"]').is_disabled()
                    action('healing-publish')
                    assert state()['healing']['published']
            checkpoint(phase + '-done')
            next_phase()
        assert state()['stage'] == 'healing-complete'
        checkpoint('complete')
        for key, value in previous.items():
            assert state()[key] == value, key
        page.locator('#notebook-button').tap()
        notes = page.locator('#modal-body').inner_text()
        for earlier in ['Level 5 · Bildquellen und eigene Fehler' if locale == 'de' else 'Level 5 · Image sources and our mistakes' if locale == 'en' else 'المستوى ٥ · مصادر الصور وغلطاتنا']:
            assert earlier in notes
        page.keyboard.press('Escape')
        end = state()
        with page.expect_download() as downloaded:
            action('export')
        filename = f'/tmp/tamatem-healing-save-{locale}.json'
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
        print(f'PASS {locale}: Level 6, actual {"file" if STANDALONE else "service-worker"} offline, exact v8 import, v10 export/import, source protection, calculations, revision, publication, 320/390 touch, reload and language switch in all phases', flush=True)
        context.close()
    browser.close()
