"""A fresh seven-level campaign through visible controls, without seeded progress.

Requires Python Playwright, Chromium and node server.mjs. Screenshots and saves
stay in /tmp. This is an automated browser check, never a human timing/device review.
TD_STANDALONE=1 uses the generated HTML directly and respects browser policy.
"""
import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright

KEY = 'tamatem-dina-prolog-v1'
STANDALONE = os.environ.get('TD_STANDALONE') == '1'
BASE = Path('/tmp/tamatem-dina-offline.html').as_uri() if STANDALONE else 'http://127.0.0.1:4173'
# Deliberately crossed histories: the three contact routes must vary independently.
PROFILES = [
    ('de', 'fear', 'name', 'direct', 'role', 'written', 'ownArchive', 'local', 'separate'),
    ('en', 'research', 'anonymous', 'open', 'name', 'meeting', 'collective', 'mobile', 'scheduled'),
    ('ar-EG', 'fear', 'name', 'open', 'role', 'meeting', 'ownArchive', 'mobile', 'separate'),
]

with sync_playwright() as pw:
    browser = pw.chromium.launch(executable_path=os.environ.get('TD_CHROMIUM', '/usr/bin/chromium'), headless=True, args=['--no-sandbox'])
    for locale, fear, consent, pressure, naming, source_mode, dina_goal, job, cooperation in PROFILES:
        context = browser.new_context(viewport={'width': 390, 'height': 844}, has_touch=True, accept_downloads=True, reduced_motion='reduce')
        if STANDALONE:
            context.set_offline(True)
        page = context.new_page()
        page.set_default_timeout(10000)
        errors = []
        external = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.on('request', lambda req: external.append(req.url) if not req.url.startswith((BASE.split('/index')[0], 'data:', 'file:')) else None)
        try:
            page.goto(BASE)
        except Exception as error:
            if STANDALONE and 'ERR_BLOCKED_BY_ADMINISTRATOR' in str(error):
                print('BLOCKED: direct file:// rejected by browser policy; no bypass attempted', flush=True)
                browser.close()
                raise SystemExit(0)
            raise
        assert page.locator('[data-action="start"]').count() == 1
        assert page.evaluate('(key)=>localStorage.getItem(key)', KEY) is None
        page.locator('.language-select').select_option(locale)
        page.wait_for_function('document.querySelector("#offline-status").classList.contains("ready")')
        if not STANDALONE:
            page.reload()
            page.wait_for_function('navigator.serviceWorker.controller !== null')
            context.set_offline(True)
            page.reload()
            assert page.evaluate('navigator.onLine') is False

        frozen = {}
        seen = set()
        actors = {}
        age = 6

        def state():
            return page.evaluate('(key)=>JSON.parse(localStorage.getItem(key)).state', KEY)

        def close():
            if page.locator('#modal').evaluate('(el)=>el.open'):
                page.locator('#modal-close').tap()

        def checkpoint():
            s = state()
            for key, value in frozen.items():
                assert s[key] == value, (locale, s['stage'], key)
            if s['stage'] in seen:
                return
            seen.add(s['stage'])
            page.reload()
            assert state() == s, s['stage']
            page.wait_for_function('[...document.images].every(el=>el.complete && el.naturalWidth>0)')
            page.wait_for_function('document.querySelector("#offline-status").classList.contains("ready")')
            for width in [320, 390]:
                page.set_viewport_size({'width': width, 'height': 844})
                assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), (locale, s['stage'], width)
            assert page.locator('html').get_attribute('dir') == ('rtl' if locale == 'ar-EG' else 'ltr')
            page.locator('.language-select').select_option('en' if locale != 'en' else 'ar-EG')
            assert state() == s
            page.locator('.language-select').select_option(locale)
            age_word = {8: ['acht', 'eight', 'تمن'], 10: ['zehn', 'ten', 'عشر'], 12: ['zwölf', 'twelve', 'اتناشر']}.get(age, [str(age)] * 3)[['de', 'en', 'ar-EG'].index(locale)]
            assert age_word in page.locator('.chapter-heading .eyebrow').inner_text().translate(str.maketrans('٠١٢٣٤٥٦٧٨٩', '0123456789')).casefold(), (s['stage'], age_word, page.locator('.chapter-heading .eyebrow').inner_text())
            actor = page.locator('.actor-strip strong').inner_text() if page.locator('.actor-strip').count() else ''
            actors.setdefault(age, set()).add(actor)
            page.locator('#notebook-button').tap()
            assert len(page.locator('#modal-body').inner_text()) > 50
            close()
            if page.locator('[data-action="hint"]').count():
                page.locator('[data-action="hint"]').first.tap()
                assert page.locator('#modal-body').inner_text()
                close()
            assert not errors, errors

        def act(name, item=None, modal=False):
            selector = f'[data-action="{name}"]' + (f'[data-id="{item}"]' if item is not None else '')
            page.locator(selector).last.tap()
            if not modal:
                close()
                checkpoint()

        def pick(prefix, item, value):
            page.locator(f'[data-action="{prefix}-pick"][data-id="{item}"][value="{value}"]').tap()

        def read(prefix, item):
            act(prefix+'-read', item, modal=True)
            assert page.locator('#modal-body').inner_text()
            close()

        def order(prefix, items):
            for i, item in enumerate(items):
                page.locator(f'[data-action="{prefix}-order"][data-index="{i}"]').select_option(item)

        def finish(level, stage):
            assert state()['stage'] == stage
            assert len(actors[age] - {''}) == 2, (locale, level, actors[age])
            saved = state()
            with page.expect_download() as download:
                act('export')
            filename = f'/tmp/tamatem-campaign-{locale}-level-{level}.json'
            download.value.save_as(filename)
            assert json.loads(Path(filename).read_text())['state'] == saved
            page.locator('#menu-button').tap()
            act('import', modal=True)
            page.locator('#import-file').set_input_files(filename)
            act('confirm-import')
            assert state() == saved
            fields = ['choice', 'owlChoice', 'read', 'assign', 'committed', 'talked', 'packed', 'noteTaken', 'river', 'garden', 'bloom', 'journey', 'finale'] + ['case', 'eco', 'morning', 'mask', 'healing', 'edition'][:level-1]
            frozen.update({key: saved[key] for key in fields})
            print(f'PASS {locale}: continuous offline Level {level}, both actors, reload/language/320/390 touch, real export/reimport', flush=True)

        act('start')
        for slot, doc in [('property', 'field'), ('place', 'travel'), ('identity', 'drawing')]:
            act('source', doc, modal=True)
            page.locator(f'[data-action="assign"][data-slot="{slot}"]').tap()
        act('verify')
        act('research-next')
        for person in ['dina', 'doctor']:
            act('talk', person)
        act('illness-next')
        act('choose', fear)
        act('resolve-next')
        act('take-note', modal=True)
        act('confirm-note')
        for item in ['lens', 'lantern', 'sling', 'glass']:
            act('item', item, modal=True)
            act('pack', item)
        act('depart')
        act('owl', 'directions' if locale == 'en' else 'ask')
        for name in ['river-inspect', 'river-scout']:
            act(name)
        act('river-item', 'sling')
        for name in ['river-loop', 'river-anchor', 'river-cross', 'river-panel', 'river-panel', 'garden-start', 'garden-guardian', 'garden-inspect']:
            act(name)
        for i, rotation in enumerate([1, 1, 2, 1, 1, 3]):
            while state()['garden']['rotations'][i] != rotation:
                act('garden-rotate', str(i))
        for name in ['garden-test', 'chamber-start', 'bloom-identify', 'bloom-collect', 'return-start', 'return-protect', 'return-home', 'app-insert', 'app-collect', 'app-bind']:
            act(name)
        if locale == 'en':
            act('app-lantern')
        for name in ['app-calm', 'dina-observe', 'dina-report']:
            act(name)
        if locale != 'en':
            for name in ['app-lantern', 'app-calm', 'dina-observe', 'dina-report']:
                act(name)
        act('heal')
        act('morning')
        finish(1, 'level-complete')

        age = 8
        act('case-start')
        act('case-begin')
        for doc in ['letter', 'address', 'sale']:
            read('case', doc)
            # Marking requires the open source dialog.
            act('case-read', doc, modal=True)
            act('case-select', doc)
        act('case-address')
        act('case-interviews')
        act('case-consent', consent)
        act('case-nora')
        act('case-emil')
        act('case-withdraw', 'document' if locale == 'en' else 'omit')
        act('case-meet')
        order('case', ['sale', 'rent', 'complaint'])
        act('case-link')
        act('case-response-start')
        for doc in ['owner', 'office']:
            read('case', doc)
        act('case-editor')
        for item, value in [('abduction', 'false'), ('complaints', 'verified'), ('motive', 'open')]:
            page.locator(f'[data-action="case-claim"][data-id="{item}"][value="{value}"]').tap()
        for name in ['case-check', 'case-correct', 'case-print', 'case-finish']:
            act(name)
        finish(2, 'case-complete')

        age = 10
        act('eco-start')
        read('eco', 'brief')
        for name in ['eco-begin', 'eco-sample', 'eco-accuse']:
            act(name)
        pick('eco', 'reflection', 'doubt' if locale == 'en' else 'error')
        act('eco-compare-start')
        for doc in ['a6', 'b6', 'c6', 'a8', 'b8', 'c8']:
            read('eco', doc)
        pick('eco', 'rise', 'b')
        pick('eco', 'window', 'morning')
        act('eco-compare')
        act('eco-interviews')
        for doc in ['dyer', 'gate', 'valve']:
            read('eco', doc)
        pick('eco', 'contradiction', 'valve')
        act('eco-check-interview')
        act('eco-meet')
        for item, value in [('load', 'depot'), ('mist', 'source'), ('blue', 'unproven')]:
            pick('eco', item, value)
        act('eco-link')
        act('eco-correction')
        pick('eco', 'replacement', 'evidence')
        for name in ['eco-repost', 'eco-apologize', 'eco-response']:
            act(name)
        for doc in ['depot', 'salma']:
            read('eco', doc)
        pick('eco', 'approach', 'visit' if locale == 'en' else 'warning')
        act('eco-stop-start')
        order('eco', ['close', 'hold', 'test'])
        for name in ['eco-stop', 'eco-source', 'eco-inspect', 'eco-clear']:
            act(name)
        pick('eco', 'inlet', 'clean')
        act('eco-restore')
        act('eco-verify')
        for doc in ['water', 'roots']:
            read('eco', doc)
        act('eco-publish')
        act('eco-finish')
        finish(3, 'eco-complete')

        def phases(prefix, rows):
            for phase, docs, picks, sequence, obligations in rows:
                assert state()['stage'] == prefix+'-'+phase
                for doc in docs:
                    read(prefix, doc)
                for item, value in picks.items():
                    pick(prefix, item, value)
                if sequence:
                    order(prefix, sequence)
                if phase not in ['opening', 'pressure', 'doubt', 'responses'] or prefix in ['healing', 'edition']:
                    act(prefix+'-check')
                for obligation in obligations:
                    act(prefix+'-'+obligation)
                act(prefix+'-next')

        age = 12
        act('morning-start')
        phases('morning', [
            ('opening', ['allegation'], {}, [], []),
            ('pressure', [], {'pressure': pressure}, [], ['dissent']),
            ('method', ['ruth'], {'method': 'original'}, [], []),
            ('sources', ['camera', 'stockSource', 'receiptSource', 'collage'], {'camera': 'independent', 'stockSource': 'independent', 'receiptSource': 'independent', 'collage': 'derived'}, [], []),
            ('preserve', ['custody'], {}, ['copy', 'compare', 'log'], []),
            ('clock', ['calibration'], {'time': '1810', 'scope': 'interval'}, [], []),
            ('timeline', ['inventory', 'transport', 'receipt'], {}, ['clip', 'stock', 'move', 'safe'], []),
            ('model', ['inspection'], {'clip': 'box', 'stock': 'later', 'safe': 'found'}, [], []),
            ('responses', ['manager', 'editor', 'mara'], {}, [], []),
            ('privacy', ['consent'], {'times': 'publish', 'seal': 'publish', 'neighbours': 'mask', 'message': 'omit', 'address': 'omit', 'naming': 'anonymous'}, [], []),
        ])
        for name in ['morning-revise', 'morning-group', 'morning-publish', 'morning-next']:
            act(name)
        finish(4, 'morning-complete')

        age = 14
        act('mask-start')
        phases('mask', [
            ('opening', ['acclaim'], {}, [], []),
            ('doubt', ['dinaMessage'], {'approach': 'quiet' if locale == 'en' else 'public'}, [], ['question']),
            ('archive', ['rules', 'original', 'repost', 'permission'], {'provenance': 'original', 'naming': naming}, [], []),
            ('crop', ['contact'], {'crop': 'full'}, [], []),
            ('perspective', ['sites'], {'view': 'side', 'observation': 'gap'}, [], []),
            ('caption', ['sequence'], {'caption': 'lift'}, [], []),
            ('network', ['ledger', 'reply'], {}, ['photo', 'cut', 'label', 'post'], []),
            ('correction', ['receipt'], {'frame': 'full', 'angle': 'side', 'caption': 'lift'}, [], ['admit', 'repost']),
            ('mirror', ['offer', 'authorship'], {'credit': 'shared'}, [], []),
            ('return', ['crowdNote'], {'crowd': 'talk' if locale == 'en' else 'boundary', 'kit': 'evidence'}, [], []),
            ('publish', ['response'], {'image': 'observed', 'chain': 'documented', 'master': 'open'}, [], ['approve', 'publish']),
        ])
        finish(5, 'mask-complete')

        age = 16
        act('healing-start')
        phases('healing', [
            ('opening', ['clinic', 'request'], {}, [], []),
            ('call', ['draft', 'patient'], {'approach': 'together' if locale == 'en' else 'doubt'}, [], []),
            ('study', ['protocol', 'results'], {'benefit': 'ten', 'scope': 'adults', 'safety': 'uncertain'}, [], []),
            ('contact', ['permission', 'origin'], {'access': 'limited', 'provenance': 'compare'}, [], []),
            ('supply', ['arrival', 'quality', 'reserved'], {'batch': 'b41', 'available': 'forty', 'hold': 'retain'}, [], []),
            ('contract', ['c24', 'n2', 'payment'], {'cash': 'twohundred', 'gap': '3200', 'cost': 'security'}, [], []),
            ('protect', ['withdrawal', 'risk'], {'private': 'omit', 'fingerprint': 'omit', 'public': 'keep'}, [], ['protect']),
            ('chain', ['register', 'audit'], {}, ['effective', 'ordered', 'shortfall', 'waiting'], ['meet']),
            ('responses', ['vela', 'office', 'hospital'], {'barrier': 'documented', 'intent': 'open', 'responseMode': source_mode}, [], []),
            ('revise', ['review'], {'wording': 'limited'}, [], ['revise']),
            ('publish', ['approval'], {}, [], ['approve', 'publish']),
            ('followup', ['delivery', 'outcome'], {'accessResult': 'arrived', 'healthResult': 'unknown'}, [], []),
        ])
        finish(6, 'healing-complete')

        age = 18
        act('edition-start')
        phases('edition', [
            ('opening', ['room', 'notice'], {}, [], []),
            ('call', ['rumour', 'worksheet'], {'start': 'questions'}, [], []),
            ('contacts', ['tenant', 'archivist'], {'tenantRoute': 'introduction' if consent == 'name' else 'mediator', 'archiveRoute': 'appointment' if naming == 'name' else 'desk'}, [], []),
            ('records', ['r7', 'n4'], {'contract': 'r7', 'deadline': 'thirty', 'legality': 'undecided'}, [], []),
            ('funds', ['invoice', 'bank', 'grant'], {'debt': '1500', 'grantUse': 'restricted'}, [], []),
            ('sources', ['register', 'permission'], {'sourceRoute': 'letter' if source_mode == 'written' else 'visit', 'access': 'extract', 'identity': 'omit'}, [], ['protect']),
            ('chain', ['dates'], {}, ['amendment', 'bill', 'paid', 'letter'], ['meet']),
            ('responses', ['owner', 'editor', 'template'], {'claim': 'roomClaim', 'motive': 'open', 'link': 'unproven'}, [], []),
            ('agreement', ['archiveOffer', 'workplan'], {'reviewMode': 'publicReview' if pressure == 'open' else 'writtenHandover', 'dinaGoal': dina_goal, 'cooperation': cooperation}, [], ['sign']),
            ('future', ['jobOffer', 'draft'], {'tamatemGoal': job, 'revision': 'bounded'}, [], ['author']),
            ('publish', ['printOffer', 'orders'], {'printCost': '2000', 'reserve': 'zeroReserve', 'privacy': 'protected'}, [], ['approve', 'publish']),
            ('followup', ['printReceipt', 'keys'], {'copies': 'printed', 'roomResult': 'returned'}, [], []),
        ])
        finish(7, 'edition-complete')
        assert page.locator('.edition-correction del').count() == 1
        assert len(page.locator('.edition-consequences p').all()) == 7
        assert state()['edition']['picks']['dinaGoal'] == dina_goal
        assert state()['edition']['picks']['tamatemGoal'] == job
        page.locator('#notebook-button').tap()
        assert page.locator('#modal-body h2').count() >= 7
        close()
        page.screenshot(path=f'/tmp/tamatem-campaign-final-{locale}.png', full_page=True)
        assert not errors, errors
        assert not external, external
        print(f'PASS {locale}: NEW GAME → seven continuous levels → edition-complete; {len(seen)} stages; no injected progress; offline since intro', flush=True)
        context.close()
    browser.close()
