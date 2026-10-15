"""Level 5 via real Chromium: v7 import, actual network-off play, tap, RTL.
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
seed = json.loads(subprocess.check_output(['node', '--input-type=module', '-e', "import {levelOne,finishCase,finishEco,finishMorning} from './tests/support.mjs';const state=finishMorning(finishEco(finishCase(levelOne('research','directions'),'anonymous','document'),'doubt','visit'),'direct','anonymous');state.version=7;delete state.mask;console.log(JSON.stringify({game:'tamatem-dina-prolog',state}));"]))
copy = json.loads(subprocess.check_output(['node', '--input-type=module', '-e', "import {MASK_COPY} from './dist/mask-copy.js';console.log(JSON.stringify(MASK_COPY));"]))

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
            page.locator(f'[data-action="mask-pick"][data-id="{item}"][value="{value}"]').tap()

        def read(item):
            action('mask-read', item)
            assert page.locator('#modal').evaluate('(el)=>el.open')
            assert page.locator('#modal-body').inner_text()
            page.locator('#modal-close').tap()

        def order(ids):
            for index, item in enumerate(ids):
                page.locator(f'[data-action="mask-order"][data-index="{index}"]').select_option(item)

        def next_phase():
            action('mask-next')

        def check():
            action('mask-check')

        def layout():
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), state()['stage']
            for height in page.locator('.mask-game .case-radio,.mask-game select,.mask-game .conversation,.mask-game .button').evaluate_all('(els)=>els.map(el=>el.getBoundingClientRect().height)'):
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
            page.screenshot(path=f'/tmp/tamatem-mask-{name}-{locale}.png', full_page=True)
            assert not errors, errors

        page.locator('#menu-button').tap()
        action('import')
        page.locator('#import-file').set_input_files({'name': 'morning-v7.json', 'mimeType': 'application/json', 'buffer': json.dumps(seed).encode()})
        action('confirm-import')
        assert state()['version'] == 8 and state()['stage'] == 'morning-complete'
        previous = {key: value for key, value in state().items() if key not in ['mask', 'stage', 'hints', 'version']}
        if not STANDALONE:
            page.wait_for_function('document.querySelector("#offline-status").classList.contains("ready")')
            page.reload()
            page.wait_for_function('navigator.serviceWorker.controller !== null')
            context.set_offline(True)
        action('mask-start')
        assert page.locator('[data-action="mask-next"]').is_disabled()
        read('acclaim')
        checkpoint('opening')
        next_phase()
        read('dinaMessage')
        pick('approach', 'quiet' if locale == 'en' else 'public')
        checkpoint('question-choice')
        action('mask-question')
        checkpoint('questioned')
        next_phase()
        for item in ['rules', 'original', 'repost', 'permission']:
            read(item)
        pick('naming', 'name' if locale == 'en' else 'role')
        pick('provenance', 'repost')
        check()
        assert not state()['mask']['archiveChecked'] and page.locator('.feedback').inner_text()
        checkpoint('archive-wrong')
        pick('provenance', 'original')
        check()
        next_phase()
        read('contact')
        pick('crop', 'tight')
        assert page.locator('[data-preview="frame-tight"] svg').get_attribute('viewBox') == '110 0 120 110'
        assert page.locator('[data-preview="frame-tight"] rect').get_attribute('width') == '120'
        check()
        assert not state()['mask']['cropChecked']
        checkpoint('crop-tight')
        pick('crop', 'full')
        assert page.locator('[data-preview="frame-full"]').count() == 1
        check()
        checkpoint('crop-full')
        next_phase()
        read('sites')
        pick('view', 'front')
        pick('observation', 'contact')
        check()
        assert not state()['mask']['perspectiveChecked']
        checkpoint('perspective-front')
        pick('view', 'side')
        pick('observation', 'motive')
        check()
        assert not state()['mask']['perspectiveChecked']
        pick('observation', 'gap')
        check()
        checkpoint('perspective-side')
        next_phase()
        read('sequence')
        pick('caption', 'destroy')
        check()
        assert not state()['mask']['captionChecked']
        checkpoint('caption-unsupported')
        pick('caption', 'always')
        check()
        assert not state()['mask']['captionChecked']
        pick('caption', 'lift')
        check()
        checkpoint('caption-limited')
        next_phase()
        read('ledger')
        order(['photo', 'cut', 'label', 'post'])
        check()
        assert not state()['mask']['networkChecked']
        checkpoint('network-missing-response')
        read('reply')
        order(['photo', 'label', 'cut', 'post'])
        check()
        assert not state()['mask']['networkChecked']
        order(['photo', 'cut', 'label', 'post'])
        check()
        next_phase()
        read('receipt')
        assert page.locator('[data-action="mask-admit"]').is_disabled()
        for item, value in [('frame', 'full'), ('angle', 'side'), ('caption', 'destroy')]:
            pick(item, value)
        check()
        assert not state()['mask']['proofChecked']
        checkpoint('correction-wrong')
        pick('caption', 'lift')
        check()
        assert page.locator('[data-action="mask-repost"]').is_disabled()
        checkpoint('correction-checked')
        action('mask-admit')
        correction = page.locator('.mask-correction').inner_text()
        if locale != 'en':
            assert ('Leila' if locale == 'de' else 'ليلى') not in correction
        checkpoint('correction-admitted')
        action('mask-repost')
        assert page.locator('.mask-correction del').count() == 1
        checkpoint('correction-delivered')
        next_phase()
        read('offer')
        read('authorship')
        pick('credit', 'alone')
        check()
        assert not state()['mask']['mirrorChecked']
        checkpoint('mirror-alone')
        pick('credit', 'shared')
        check()
        checkpoint('mirror-shared')
        next_phase()
        read('crowdNote')
        pick('crowd', 'talk' if locale == 'en' else 'boundary')
        pick('kit', 'crown')
        check()
        assert not state()['mask']['returnChecked']
        checkpoint('return-crown')
        pick('kit', 'evidence')
        check()
        checkpoint('return-evidence')
        next_phase()
        read('response')
        for item, value in [('image', 'observed'), ('chain', 'documented'), ('master', 'documented')]:
            pick(item, value)
        check()
        assert not state()['mask']['publishChecked']
        checkpoint('publish-overclaim')
        pick('master', 'open')
        check()
        assert page.locator('[data-action="mask-publish"]').is_disabled()
        checkpoint('publish-checked')
        action('mask-approve')
        checkpoint('approved')
        action('mask-publish')
        checkpoint('published')
        next_phase()
        checkpoint('complete')
        assert state()['stage'] == 'mask-complete'
        for key, value in previous.items():
            assert state()[key] == value, key
        end = state()
        with page.expect_download() as downloaded:
            action('export')
        filename = f'/tmp/tamatem-mask-save-{locale}.json'
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
        print(f'PASS {locale}: Level 5, actual {"file" if STANDALONE else "service-worker"} offline, v7 import, v8 export/import, image rules, visible correction, independent Dina, touch 320/390, RTL, reloads', flush=True)
        context.close()
    browser.close()
