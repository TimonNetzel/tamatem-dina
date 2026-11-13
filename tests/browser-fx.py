"""Level 1 garden and chamber animations in a real Chromium against `node server.mjs`.
Checks that animations never gate an action, settle on reload, vanish with reduced
motion and leave the saved game identical to the pure reducer result.
Usage: TD_CHROMIUM=/path/to/chrome python tests/browser-fx.py
"""
import json
import os
import subprocess
import time
from playwright.sync_api import sync_playwright

GAME_KEY = 'tamatem-dina-prolog-v1'
URL = os.environ.get('TD_URL', 'http://127.0.0.1:4173/')
SEED = r"""
import {initialState,reduce,ITEM_IDS} from './dist/state.js';
import {CHANNEL_SOLUTION} from './dist/channels.js';
const apply=(s,...a)=>a.reduce(reduce,s);
let s=reduce(initialState(),{type:'START'});
for(const [slot,id] of Object.entries({property:'field',place:'travel',identity:'drawing'}))s=apply(s,{type:'READ',id},{type:'ASSIGN',slot,id});
s=apply(s,{type:'VERIFY'},{type:'RESEARCH_NEXT'},{type:'TALK',id:'dina'},{type:'TALK',id:'doctor'},{type:'ILLNESS_NEXT'},{type:'CHOOSE',id:'fear'},{type:'RESOLVE_NEXT'},{type:'TAKE_NOTE'},...ITEM_IDS.map(id=>({type:'PACK',id})),{type:'DEPART'},{type:'OWL_CHOICE',id:'ask'});
for(const type of ['RIVER_INSPECT','RIVER_SCOUT','RIVER_SLING','RIVER_LOOP','RIVER_ANCHOR','RIVER_CROSS','RIVER_PANEL','RIVER_PANEL'])s=reduce(s,{type});
const out={};
out.start=s=reduce(s,{type:'GARDEN_START'});
out.talked=s=reduce(s,{type:'GARDEN_TALK'});
out.ready=s=reduce(s,{type:'GARDEN_INSPECT'});
out.turned=s=reduce(s,{type:'GARDEN_ROTATE',index:0});
out.failed=s=reduce(s,{type:'GARDEN_TEST'});
for(let i=0;i<6;i++)while(s.garden.rotations[i]!==CHANNEL_SOLUTION[i])s=reduce(s,{type:'GARDEN_ROTATE',index:i});
out.aligned=s;
out.complete=s=reduce(s,{type:'GARDEN_TEST'});
out.chamber=s=reduce(s,{type:'CHAMBER_START'});
out.identified=s=reduce(s,{type:'BLOOM_IDENTIFY'});
out.collected=reduce(s,{type:'BLOOM_COLLECT'});
out.solution=CHANNEL_SOLUTION;
console.log(JSON.stringify(out));
"""
S = json.loads(subprocess.check_output(['node', '--input-type=module', '-e', SEED]))


def saved(page):
    return page.evaluate('(key)=>JSON.parse(localStorage.getItem(key)).state', GAME_KEY)


def seed(page, name, locale):
    page.goto(URL)
    page.evaluate('([k,s,l])=>{localStorage.setItem(k,JSON.stringify({state:s,savedAt:"seed"}));localStorage.setItem("tamatem-dina-language",l)}', [GAME_KEY, S[name], locale])
    page.reload()
    page.wait_for_selector('.scene-fx')


def act(page, action, item=None):
    selector = f'#main button[data-action="{action}"]' + (f'[data-id="{item}"]' if item is not None else '')
    target = page.locator(selector).last
    if page.evaluate('navigator.maxTouchPoints > 0'):
        target.tap()
    else:
        target.click()


def layout(page, locale):
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), 'Horizontal overflow'
    assert page.locator('html').get_attribute('dir') == ('rtl' if locale == 'ar-EG' else 'ltr')
    for layer in page.locator('.scene-fx').all():
        assert layer.get_attribute('aria-hidden') == 'true'
        assert layer.evaluate('(e)=>getComputedStyle(e).pointerEvents') == 'none'
        assert layer.evaluate('(e)=>getComputedStyle(e).direction') == 'ltr'
        assert layer.locator('button,a,[data-action],[tabindex]').count() == 0
        assert layer.inner_text().strip() == ''
    assert page.locator('.scene img').first.evaluate('(e)=>e.complete&&e.naturalWidth>0')


def animations(page):
    return page.evaluate('document.getAnimations().length')


def run(browser, locale, width, reduced, touch):
    context = browser.new_context(viewport={'width': width, 'height': 844 if width < 500 else 900}, has_touch=touch, reduced_motion='reduce' if reduced else 'no-preference')
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
    label = f'{locale} {width} reduced={reduced}'

    # Station 7: dry garden. Hotspots stay reachable through the layer.
    seed(page, 'start', locale)
    layout(page, locale)
    assert page.locator('.fx-garden-dry .fx-moist').count() == 0
    assert (animations(page) == 0) == reduced, label
    page.locator('.hotspot[data-action="garden-guardian"]').click()
    page.keyboard.press('Escape')
    assert saved(page) == S['talked'], label
    page.locator('.hotspot[data-action="garden-inspect"]').click()
    assert saved(page) == S['ready'], label
    assert page.locator('.fx-garden-dry .fx-moist').count() == 7
    assert page.locator('.garden-observation').count() == 1  # the same information as text
    assert page.locator('.fx-arrive').count() == (0 if reduced else 1)

    # Station 8: tiles turn at once; state is saved before any animation ends.
    if touch:
        act(page, 'garden-rotate', '0')
    else:
        tile = page.locator('button.channel-tile[data-id="0"]')
        tile.focus()
        page.keyboard.press('Enter')
        assert page.evaluate('document.activeElement.dataset.id') == '0', 'Focus lost after turning'
    assert saved(page) == S['turned'], label
    assert page.locator('.channel-tile.fx-turn').count() == (0 if reduced else 1)
    act(page, 'garden-test')
    assert saved(page) == S['failed'], label
    assert page.locator('.paper-panel .feedback[role=status]').count() == 1
    assert page.locator('.channel-break').count() == 1 and page.locator('.channel-splash circle').count() == 5
    if reduced:
        assert animations(page) == 0
        assert page.locator('.channel-break').evaluate('(e)=>getComputedStyle(e).opacity') == '1'
    for index, value in enumerate(S['solution']):
        while saved(page)['garden']['rotations'][index] != value:
            act(page, 'garden-rotate', str(index))
    assert saved(page) == S['aligned'], label
    layout(page, locale)
    act(page, 'garden-test')
    assert saved(page) == S['complete'], label
    assert page.locator('img[src$="garden-wet.png"]').count() == 1
    assert page.locator('.success-line').count() == 1
    layout(page, locale)
    if reduced:
        assert page.locator('.fx-play,.fx-fade,.fx-skip,.fx-cam').count() == 0 and animations(page) == 0
    else:
        assert page.locator('.fx-garden-wet.fx-play .fx-fade').count() == 1
        skip = page.locator('.fx-skip')
        assert skip.count() == 1 and skip.bounding_box()['height'] >= 44
        assert float(page.locator('.fx-fade').evaluate('(e)=>getComputedStyle(e).opacity')) > .5
        # Reload in the middle of the change: settled picture, identical save.
        time.sleep(.6)
        page.reload()
        page.wait_for_selector('.scene-fx')
        assert saved(page) == S['complete'], label
        assert page.locator('.fx-play,.fx-fade,.fx-skip').count() == 0
        # Replay from the last step and skip, once by button and once by tapping the picture.
        for how in ['button', 'scene']:
            seed(page, 'aligned', locale)
            act(page, 'garden-test')
            if how == 'button':
                if touch:
                    page.locator('.fx-skip').tap()
                else:
                    page.locator('.fx-skip').focus()
                    page.keyboard.press('Enter')
            else:
                page.locator('.scene').click(position={'x': 30, 'y': 30})
            assert page.locator('.fx-play,.fx-fade,.fx-skip,.fx-skippable').count() == 0, label + ' skip ' + how
            assert page.evaluate('document.getElementById("main").contains(document.activeElement)')
            assert saved(page) == S['complete']
        # Language switch while playing keeps the sequence and the state.
        seed(page, 'aligned', locale)
        act(page, 'garden-test')
        other = 'en' if locale != 'en' else 'de'
        page.locator('.language-select').select_option(other)
        assert page.locator('.fx-garden-wet.fx-play').count() == 1 and saved(page) == S['complete']
        page.locator('.language-select').select_option(locale)
        # Left alone, the skip control disappears by itself.
        page.wait_for_selector('.fx-skip', state='detached', timeout=8000)
        assert page.locator('.fx-skippable').count() == 0

    # Nothing waits: the next action works immediately after solving.
    seed(page, 'aligned', locale)
    act(page, 'garden-test')
    act(page, 'chamber-start')
    assert saved(page) == S['chamber'], label

    # Station 9: chamber layer follows the cropped picture exactly.
    layout(page, locale)
    geometry = page.evaluate('''()=>{const s=document.querySelector('.scene>img').getBoundingClientRect(),l=document.querySelector('.scene-fx').getBoundingClientRect();return {ratio:l.width/l.height,covers:l.left<=s.left+.5&&l.top<=s.top+.5&&l.right>=s.right-.5&&l.bottom>=s.bottom-.5,centered:Math.abs((l.left+l.right)-(s.left+s.right))<1&&Math.abs((l.top+l.bottom)-(s.top+s.bottom))<1,tight:Math.abs(l.width-s.width)<1||Math.abs(l.height-s.height)<1}}''')
    assert abs(geometry['ratio'] - 1672 / 941) < .01 and geometry['covers'] and geometry['centered'] and geometry['tight'], (label, geometry)
    assert page.locator('.fx-bloom').count() == 1 and page.locator('.fx-jar').count() == 0
    act(page, 'bloom-pick')
    act(page, 'bloom-identify')
    assert saved(page) == S['identified'], label
    act(page, 'bloom-collect')
    assert saved(page) == S['collected'], label
    assert page.locator('.fx-jar').count() == 1 and page.locator('.success-line').count() == 1
    assert page.locator('.fx-fly').count() == (0 if reduced else 10)
    assert page.locator('.fx-skip').count() == (0 if reduced else 1)
    layout(page, locale)
    page.reload()
    page.wait_for_selector('.scene-fx')
    assert saved(page) == S['collected'] and page.locator('.fx-fly,.fx-skip,.fx-play').count() == 0 and page.locator('.fx-jar').count() == 1
    act(page, 'return-start')
    assert saved(page)['stage'] == 'return'
    assert not errors, (label, errors)
    context.close()


def offline(browser):
    context = browser.new_context(viewport={'width': 390, 'height': 844}, has_touch=True)
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    seed(page, 'aligned', 'de')
    page.wait_for_selector('#offline-status.ready', timeout=30000)
    page.reload()  # now controlled by the service worker
    page.wait_for_selector('.scene-fx')
    context.set_offline(True)
    page.reload()
    page.wait_for_selector('.fx-garden-dry')
    assert page.locator('.scene img').evaluate('(e)=>e.complete&&e.naturalWidth>0')
    act(page, 'garden-test')
    assert page.locator('.fx-fade').evaluate('(e)=>e.complete&&e.naturalWidth>0'), 'Dry picture missing offline'
    act(page, 'chamber-start')
    page.wait_for_selector('.fx-chamber')
    assert page.locator('.scene img').evaluate('(e)=>e.complete&&e.naturalWidth>0')
    assert saved(page) == S['chamber'] and not errors, errors
    context.close()


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(executable_path=os.environ.get('TD_CHROMIUM', '/usr/bin/chromium'), headless=True, args=['--no-sandbox'])
    for locale in ['de', 'en', 'ar-EG']:
        for width, touch in [(1440, False), (390, True), (320, True)]:
            for reduced in [False, True]:
                run(browser, locale, width, reduced, touch)
                print(f'OK {locale} {width} reduced={reduced}', flush=True)
    offline(browser)
    print('OK offline', flush=True)
    browser.close()
