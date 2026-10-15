"""Level 7: exact v9 file import, actual network-off play, inherited routes and endings."""
import json
import os
import subprocess
from pathlib import Path
from playwright.sync_api import sync_playwright
GAME_KEY = 'tamatem-dina-prolog-v1'
STANDALONE = os.environ.get('TD_STANDALONE') == '1'
BASE = Path('/tmp/tamatem-dina-offline.html').as_uri() if STANDALONE else 'http://127.0.0.1:4173'
seeds = json.loads(subprocess.check_output(['node','--input-type=module','-e',"""
import {levelOne,finishCase,finishEco,finishMorning,finishMask,finishHealing} from './tests/support.mjs';
console.log(JSON.stringify([0,1,2].map(i=>{const one=levelOne(i===1?'fear':'research'),two=finishCase(one,i===1?'name':'anonymous'),three=finishEco(two),four=finishMorning(three,i===1?'open':'direct'),five=finishMask(four,i===1?'public':'quiet',i===1?'name':'role',i===1?'talk':'boundary'),state=finishHealing(five,i===1?'together':'doubt',i===1?'meeting':'written');state.version=9;delete state.edition;return {game:'tamatem-dina-prolog',state};})));
"""]))
copy = json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {EDITION_COPY} from './dist/edition-copy.js';console.log(JSON.stringify(EDITION_COPY));"]))

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=os.environ.get('TD_CHROMIUM', '/usr/bin/chromium'), headless=True, args=['--no-sandbox'])
    for index, (locale, width) in enumerate([('de', 1440), ('en', 390), ('ar-EG', 390)]):
        seed = seeds[index]
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
            page.locator(f'[data-action="edition-pick"][data-id="{item}"][value="{value}"]').tap()

        def read(item):
            action('edition-read', item)
            assert page.locator('#modal').evaluate('(el)=>el.open')
            assert page.locator('#modal-body').inner_text()
            page.locator('#modal-close').tap()

        def order(ids):
            for index, item in enumerate(ids):
                page.locator(f'[data-action="edition-order"][data-index="{index}"]').select_option(item)

        def next_phase():
            action('edition-next')

        def check():
            action('edition-check')

        def layout():
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), state()['stage']
            for height in page.locator('.edition-game .case-radio,.edition-game select,.edition-game .conversation,.edition-game .button').evaluate_all('(els)=>els.map(el=>el.getBoundingClientRect().height)'):
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
            page.screenshot(path=f'/tmp/tamatem-edition-{name}-{locale}.png', full_page=True)
            assert not errors, errors


        page.locator('#menu-button').tap()
        action('import')
        page.locator('#import-file').set_input_files({'name':'healing-v9.json','mimeType':'application/json','buffer':json.dumps(seed).encode()})
        action('confirm-import')
        assert state()['version'] == 10 and state()['stage'] == 'healing-complete'
        previous = {key:value for key,value in state().items() if key not in ['edition','stage','hints','version']}
        if not STANDALONE:
            page.wait_for_function('document.querySelector("#offline-status").classList.contains("ready")')
            page.reload()
            page.wait_for_function('navigator.serviceWorker.controller !== null')
            context.set_offline(True)
        action('edition-start')
        phases=['opening','call','contacts','records','funds','sources','chain','responses','agreement','future','publish','followup']
        docs={'opening':['room','notice'],'call':['rumour','worksheet'],'contacts':['tenant','archivist'],'records':['r7','n4'],'funds':['invoice','bank','grant'],'sources':['register','permission'],'chain':['dates'],'responses':['owner','editor','template'],'agreement':['archiveOffer','workplan'],'future':['jobOffer','draft'],'publish':['printOffer','orders'],'followup':['printReceipt','keys']}
        answers={'call':{'start':'crosscheck' if index==1 else 'questions'},'contacts':{'tenantRoute':'introduction' if index==1 else 'mediator','archiveRoute':'appointment' if index==1 else 'desk'},'records':{'contract':'r7','deadline':'thirty','legality':'undecided'},'funds':{'debt':'1500','grantUse':'restricted'},'sources':{'sourceRoute':'visit' if index==1 else 'letter','access':'extract','identity':'omit'},'responses':{'claim':'roomClaim','motive':'open','link':'unproven'},'agreement':{'reviewMode':'publicReview' if index==1 else 'writtenHandover','dinaGoal':'ownArchive' if index==1 else 'collective','cooperation':'separate' if index==1 else 'scheduled'},'future':{'tamatemGoal':'mobile' if index==1 else 'local','revision':'bounded'},'publish':{'printCost':'2000','reserve':'zeroReserve','privacy':'protected'},'followup':{'copies':'printed','roomResult':'returned'}}
        wrong={'contacts':('tenantRoute','mediator' if index==1 else 'introduction'),'records':('deadline','twenty'),'funds':('grantUse','rent'),'sources':('sourceRoute','letter' if index==1 else 'visit'),'responses':('link','sameLogo'),'agreement':('reviewMode','writtenHandover' if index==1 else 'publicReview'),'future':('revision','total'),'publish':('privacy','allNames'),'followup':('roomResult','saved')}
        for phase in phases:
            assert state()['stage']=='edition-'+phase
            assert page.locator('[data-action="edition-next"]').is_disabled()
            check()
            assert phase not in state()['edition']['checked']
            assert page.locator('.feedback').inner_text()
            for item in docs[phase]:
                read(item)
            for item,value in answers.get(phase,{}).items():
                pick(item,value)
            if phase=='chain':
                order(['amendment','paid','bill','letter'])
                check()
                assert phase not in state()['edition']['checked']
                checkpoint('chain-wrong')
                order(['amendment','bill','paid','letter'])
            if phase in wrong:
                item,value=wrong[phase]
                pick(item,value)
                check()
                assert phase not in state()['edition']['checked']
                checkpoint(phase+'-wrong')
                pick(item,answers[phase][item])
            checkpoint(phase+'-partial')
            check()
            assert phase in state()['edition']['checked']
            for required,command,flag in [('sources','protect','protected'),('chain','meet','met'),('agreement','sign','dinaSigned'),('future','author','authored'),('publish','approve','approved')]:
                if phase==required:
                    assert page.locator('[data-action="edition-next"]').is_disabled()
                    if phase=='future':
                        assert page.locator('.edition-correction del').count()==0
                    action('edition-'+command)
                    assert state()['edition'][flag]
                    checkpoint(command)
                    if phase=='future':
                        assert page.locator('.edition-correction del').count()==1
                    if phase=='publish':
                        assert page.locator('[data-action="edition-next"]').is_disabled()
                        action('edition-publish')
                        assert state()['edition']['published']
            checkpoint(phase+'-done')
            next_phase()
        assert state()['stage']=='edition-complete'
        checkpoint('complete')
        assert page.locator('.edition-correction del').count()==1
        assert page.locator('.edition-consequences').inner_text()
        assert copy[answers['agreement']['dinaGoal']][index] in page.locator('.edition-article').inner_text()
        assert copy[answers['future']['tamatemGoal']][index] in page.locator('.edition-article').inner_text()
        for key,value in previous.items():
            assert state()[key]==value,key
        end=state()
        with page.expect_download() as downloaded:
            action('export')
        filename=f'/tmp/tamatem-edition-save-{locale}.json'
        downloaded.value.save_as(filename)
        assert json.loads(Path(filename).read_text())['state']==end
        page.locator('#menu-button').tap()
        action('import')
        page.locator('#import-file').set_input_files(filename)
        action('confirm-import')
        assert state()==end
        page.reload()
        assert state()==end
        assert not errors,errors
        assert not external,external
        print(f'PASS {locale}: Level 7 actual offline, v9 import/v10 export/import, inherited routes, independent plans, signatures, correction, publication, 320/390 touch and reload/language switch in all phases',flush=True)
        context.close()
    browser.close()
