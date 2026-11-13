"""Level 1 scene animations (all stations) in a real Chromium against `node server.mjs`.
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
let q=reduce(initialState(),{type:'START'});
out.research=q;
out.read=q=reduce(q,{type:'READ',id:'field'});
for(const [slot,id] of Object.entries({property:'field',place:'travel',identity:'drawing'}))q=apply(q,{type:'READ',id},{type:'ASSIGN',slot,id});
out.verified=q=reduce(q,{type:'VERIFY'});
out.illness=q=reduce(q,{type:'RESEARCH_NEXT'});
q=apply(q,{type:'TALK',id:'dina'},{type:'TALK',id:'doctor'},{type:'ILLNESS_NEXT'},{type:'CHOOSE',id:'fear'});
out.pack=q=apply(q,{type:'RESOLVE_NEXT'},{type:'TAKE_NOTE'});
out.packedOne=q=reduce(q,{type:'PACK',id:ITEM_IDS[0]});
for(const id of ITEM_IDS)q=reduce(q,{type:'PACK',id});
out.packed=q;
out.threshold=q=reduce(q,{type:'DEPART'});
out.river=q=reduce(q,{type:'OWL_CHOICE',id:'ask'});
out.inspected=q=reduce(q,{type:'RIVER_INSPECT'});
out.loop=q=apply(q,{type:'RIVER_SCOUT'},{type:'RIVER_SLING'},{type:'RIVER_LOOP'});
out.secured=q=reduce(q,{type:'RIVER_ANCHOR'});
out.crossing0=q=reduce(q,{type:'RIVER_CROSS'});
out.crossing1=q=reduce(q,{type:'RIVER_PANEL'});
out.riverComplete=q=reduce(q,{type:'RIVER_PANEL'});
q=reduce(out.collected,{type:'RETURN_START'});
out.storm=q;
out.protected=q=reduce(q,{type:'RETURN_PROTECT'});
out.apparatus=q=reduce(q,{type:'RETURN_HOME'});
q=apply(q,{type:'APP_INSERT'},{type:'APP_COLLECT'},{type:'APP_BIND'},{type:'APP_LANTERN'},{type:'APP_CALM'});
out.dina=q;
q=apply(q,{type:'DINA_OBSERVE'},{type:'DINA_REPORT'});
out.healing=q=reduce(q,{type:'HEAL'});
out.morning=reduce(q,{type:'MORNING'});
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


def covers(page, label):
    """Every cover layer has the picture's proportions and spans the visible scene."""
    g = page.evaluate("""()=>{const s=document.querySelector('.scene').getBoundingClientRect(),l=document.querySelector('.scene-fx.fx-cover').getBoundingClientRect();return {ratio:l.width/l.height,covers:l.left<=s.left+1.5&&l.top<=s.top+1.5&&l.right>=s.right-1.5&&l.bottom>=s.bottom-1.5}}""")
    assert abs(g['ratio'] - 1672 / 941) < .01 and g['covers'], (label, g)


def tap(page, locator):
    if page.evaluate('navigator.maxTouchPoints > 0'):
        locator.tap()
    else:
        locator.click()


def settled(page):
    return page.locator('.fx-play,.fx-fade,.fx-skip,.fx-skippable,.fx-cam,.fx-wobble,.fx-fly').count() == 0


def run_rest(browser, locale, width, reduced, touch):
    """Stations 1-6 and 10-12: work table, illness, pack, threshold, river, storm, morning."""
    context = browser.new_context(viewport={'width': width, 'height': 844 if width < 500 else 900}, has_touch=touch, reduced_motion='reduce' if reduced else 'no-preference')
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
    label = f'{locale} {width} reduced={reduced} rest'

    # Station 1: markers work through the layer; a read source gets a sheen, the text list says the same.
    seed(page, 'research', locale)
    layout(page, locale)
    covers(page, label)
    assert (animations(page) == 0) == reduced, label
    assert page.locator('.fx-workroom .fx-paper').count() == 0
    tap(page, page.locator('.hotspot[data-action="source"][data-id="field"]'))
    assert saved(page) == S['read'], label
    assert page.locator('.fx-workroom .fx-paper').count() == 2 and page.locator('.source-tab.read').count() == 1
    assert page.locator('.fx-shot.fx-arrive').count() == (0 if reduced else 1)
    page.keyboard.press('Escape')
    seed(page, 'verified', locale)
    act(page, 'research-next')
    assert saved(page) == S['illness'], label
    assert page.locator('.fx-illness').count() == 1
    assert page.locator('.fx-fade.fx-quick').count() == (0 if reduced else 1)
    if not reduced:
        assert page.locator('.fx-fade.fx-quick').evaluate('(e)=>e.complete&&e.naturalWidth>0&&e.src.endsWith("workroom.png")')
        assert page.locator('.fx-skip').count() == 0  # short change, no skip control
    layout(page, locale)
    covers(page, label)

    # Station 4: packing never waits for the travelling light.
    seed(page, 'pack', locale)
    act(page, 'item', S['packedOne']['packed'][0])
    act_modal = page.locator('#modal button[data-action="pack"]')
    tap(page, act_modal)
    assert saved(page) == S['packedOne'], label
    assert page.locator('.fx-workroom .fx-paper').count() == 1
    assert page.locator('.fx-fly').count() == (0 if reduced else 3)
    layout(page, locale)

    # Station 5: arrival at the forest edge. Skippable, settles on reload, choice works at once.
    seed(page, 'packed', locale)
    act(page, 'depart')
    assert saved(page) == S['threshold'], label
    layout(page, locale)
    covers(page, label)
    if reduced:
        assert settled(page) and animations(page) == 0, label
    else:
        assert page.locator('.scene.fx-cam.fx-cam-forest.fx-skippable').count() == 1
        skip = page.locator('.fx-skip')
        assert skip.count() == 1 and skip.bounding_box()['height'] >= 44
        time.sleep(.5)
        page.reload()
        page.wait_for_selector('.scene-fx')
        assert saved(page) == S['threshold'] and settled(page), label
        for how in ['button', 'scene']:
            seed(page, 'packed', locale)
            act(page, 'depart')
            if how == 'button':
                tap(page, page.locator('.fx-skip'))
            else:
                page.locator('.scene').click(position={'x': 30, 'y': 30})
            assert settled(page), label + ' skip ' + how
            assert saved(page) == S['threshold']
        seed(page, 'packed', locale)
        act(page, 'depart')
    act(page, 'owl', 'ask')
    assert saved(page) == S['river'], label

    # Station 6: the failed attempt rocks the picture, the save stays the same.
    layout(page, locale)
    covers(page, label)
    act(page, 'river-cross')
    assert saved(page) == S['river'] and page.locator('.feedback[role=status]').count() == 1, label
    assert page.locator('.scene.fx-wobble').count() == (0 if reduced else 1)
    tap(page, page.locator('.hotspot[data-action="river-inspect"]'))
    assert saved(page) == S['inspected'], label
    seed(page, 'loop', locale)
    act(page, 'river-anchor')
    assert saved(page) == S['secured'], label
    assert page.locator('.river-sling').count() == 1 and page.locator('.river-secured[role=status]').count() == 1
    assert page.locator('.river-sling.fx-play').count() == (0 if reduced else 1)
    layout(page, locale)
    act(page, 'river-cross')
    assert saved(page) == S['crossing0'], label
    assert page.locator('.scene.fx-cam').count() == (0 if reduced else 1) and page.locator('.fx-view .fx-river').count() == 1
    act(page, 'river-panel')
    assert saved(page) == S['crossing1'], label
    act(page, 'river-panel')
    assert saved(page) == S['riverComplete'], label
    layout(page, locale)
    page.reload()
    page.wait_for_selector('.scene-fx')
    assert settled(page) and page.locator('.river-sling.fx-play').count() == 0

    # Station 10: storm. Rain and gusts are decoration; the light follows the puzzle state.
    seed(page, 'storm', locale)
    layout(page, locale)
    covers(page, label)
    assert page.locator('.fx-storm .fx-rain').count() == 26 and page.locator('.fx-storm .fx-jar').count() == 0
    assert (animations(page) == 0) == reduced, label
    act(page, 'return-hide')
    assert saved(page) == S['storm'] and page.locator('.feedback[role=status]').count() == 1
    act(page, 'return-protect')
    assert saved(page) == S['protected'], label
    assert page.locator('.fx-storm .fx-jar').count() == 1 and page.locator('.success-line').count() == 1
    assert page.locator('.fx-jar.fx-arrive').count() == (0 if reduced else 1)
    layout(page, locale)
    act(page, 'return-home')
    assert saved(page) == S['apparatus'], label
    assert page.locator('.scene-fx').count() == 0  # station 11 keeps its existing light display

    # Station 11, Dina's view, and station 12: night turns into morning.
    seed(page, 'dina', locale)
    layout(page, locale)
    assert page.locator('.fx-illness').count() == 1
    seed(page, 'healing', locale)
    layout(page, locale)
    act(page, 'morning')
    assert saved(page) == S['morning'], label
    assert page.locator('img[src$="morning.png"]').count() == 1
    layout(page, locale)
    covers(page, label)
    if reduced:
        assert settled(page) and animations(page) == 0, label
    else:
        fade = page.locator('.fx-morning.fx-play .fx-fade')
        assert fade.count() == 1 and fade.evaluate('(e)=>e.complete&&e.naturalWidth>0&&e.src.endsWith("illness.png")')
        assert page.locator('.fx-skip').count() == 1
        other = 'en' if locale != 'en' else 'de'
        page.locator('.language-select').select_option(other)
        assert page.locator('.fx-morning.fx-play').count() == 1 and saved(page) == S['morning']
        page.locator('.language-select').select_option(locale)
        time.sleep(.5)
        page.reload()
        page.wait_for_selector('.scene-fx')
        assert saved(page) == S['morning'] and settled(page), label
        seed(page, 'healing', locale)
        act(page, 'morning')
        page.locator('.scene').click(position={'x': 30, 'y': 30})
        assert settled(page) and saved(page) == S['morning'], label
        seed(page, 'healing', locale)
        act(page, 'morning')
    # Nothing waits: Level 2 can start while the morning still fades in.
    act(page, 'case-start')
    assert saved(page)['stage'] != 'level-complete', label
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
    assert page.locator('.scene>img').evaluate('(e)=>e.complete&&e.naturalWidth>0')
    assert saved(page) == S['chamber'] and not errors, errors
    # New scenes offline: both pictures of the morning change come from the cache.
    page.evaluate('([k,s])=>localStorage.setItem(k,JSON.stringify({state:s,savedAt:"seed"}))', [GAME_KEY, S['healing']])
    page.reload()
    page.wait_for_selector('.fx-illness')
    act(page, 'morning')
    assert page.locator('.fx-morning .fx-fade').evaluate('(e)=>e.complete&&e.naturalWidth>0'), 'Night picture missing offline'
    assert page.locator('.scene>img').evaluate('(e)=>e.complete&&e.naturalWidth>0')
    assert saved(page) == S['morning'] and not errors, errors
    context.close()


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(executable_path=os.environ.get('TD_CHROMIUM', '/usr/bin/chromium'), headless=True, args=['--no-sandbox'])
    for locale in ['de', 'en', 'ar-EG']:
        for width, touch in [(1440, False), (390, True), (320, True)]:
            for reduced in [False, True]:
                run(browser, locale, width, reduced, touch)
                run_rest(browser, locale, width, reduced, touch)
                print(f'OK {locale} {width} reduced={reduced}', flush=True)
    offline(browser)
    print('OK offline', flush=True)
    browser.close()
