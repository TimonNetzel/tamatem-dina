"""Imports actual v1–v8 field sets through the browser confirmation UI."""
import json
import subprocess
from playwright.sync_api import sync_playwright

fixtures = json.loads(subprocess.check_output(['node', '--input-type=module', '-e', """
import {levelOne,finishCase,finishEco,finishMorning,finishMask} from './tests/support.mjs';
const points={};const collect=s=>{points[s.stage]??=s;};
const one=levelOne('research','directions',collect),two=finishCase(one,'anonymous','document',collect),three=finishEco(two,'doubt','visit',collect),four=finishMorning(three,'direct','anonymous',collect),five=finishMask(four,'quiet','role','boundary',collect);
const stages=['river','river-complete','garden-complete','level-complete','case-complete','eco-complete','morning-complete','mask-complete'];
const added={river:2,garden:3,bloom:4,journey:4,finale:4,case:5,eco:6,morning:7,mask:8,healing:9};
console.log(JSON.stringify(stages.map((stage,i)=>{const s=structuredClone(points[stage]);s.version=i+1;for(const [key,v] of Object.entries(added))if(v>s.version)delete s[key];if(s.version===1)s.stage='complete';return {game:'tamatem-dina-prolog',state:s};})));
"""]))
with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/chromium', headless=True, args=['--no-sandbox'])
    for locale in ['de', 'en', 'ar-EG']:
        context = browser.new_context()
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.goto('http://127.0.0.1:4173')
        page.locator('.language-select').select_option(locale)
        for fixture, expected in zip(fixtures, ['river', 'river-complete', 'garden-complete', 'level-complete', 'case-complete', 'eco-complete', 'morning-complete', 'mask-complete']):
            page.locator('#menu-button').click()
            page.locator('[data-action="import"]').click()
            page.locator('#import-file').set_input_files({'name': 'legacy.json', 'mimeType': 'application/json', 'buffer': json.dumps(fixture).encode()})
            page.locator('[data-action="confirm-import"]').click()
            saved = page.evaluate('JSON.parse(localStorage.getItem("tamatem-dina-prolog-v1")).state')
            assert saved['version'] == 9 and saved['stage'] == expected
            assert saved['choice'] == 'research' and saved['owlChoice'] == 'directions'
            for key, value in fixture['state'].items():
                if key not in ['version', 'stage']:
                    assert saved[key] == value, (fixture['state']['version'], key)
            if expected == 'morning-complete':
                assert page.locator('[data-action="mask-start"]').count() == 1
            if expected == 'mask-complete':
                assert page.locator('[data-action="healing-start"]').count() == 1
            page.reload()
            assert page.locator('html').get_attribute('lang') == locale
        assert not errors, errors
        print(f'PASS {locale}: v1–v8 exact historical field sets, confirmed imports, full retained histories, reload and direct Level 5/6 entry', flush=True)
        context.close()
    browser.close()
