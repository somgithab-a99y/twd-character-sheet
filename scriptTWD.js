// ==========================================
// ตั้งค่า Google Apps Script Web App URL ที่นี่
// ==========================================
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzlyJ2ACWlzMI0JhuM5-qi0qwH3soiX-0M6BIjDyY1RKt9h9gSAq_3r9bxwgP00jpKiZg/exec";

// ==========================================
// 1. ระบบจัดการแพลตฟอร์ม
// ==========================================
const PlatformManager = {
    isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1),
    isAndroid: /Android/.test(navigator.userAgent),
    get name() {
        if (this.isIOS) return 'ios';
        if (this.isAndroid) return 'android';
        return 'pc';
    },
    init() {
        document.body.classList.add('platform-' + this.name);
        console.log(`Platform Detected: ${this.name.toUpperCase()}`);
    }
};
PlatformManager.init();

// ==========================================
// 2. ข้อมูลระบบและออบเจ็กต์พื้นฐาน
// ==========================================
const abilities = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
const skillsData = [
    { name: 'Strength Save', stat: 'str', isSave: true }, { name: 'Dexterity Save', stat: 'dex', isSave: true },
    { name: 'Constitution Save', stat: 'con', isSave: true }, { name: 'Intelligence Save', stat: 'int', isSave: true },
    { name: 'Wisdom Save', stat: 'wis', isSave: true }, { name: 'Charisma Save', stat: 'cha', isSave: true },
    { name: 'Acrobatics', stat: 'dex' }, { name: 'Animal Handling', stat: 'wis' }, { name: 'Athletics', stat: 'str' }, { name: 'Deception', stat: 'cha' },
    { name: 'History', stat: 'int' }, { name: 'Insight', stat: 'wis' }, { name: 'Intimidation', stat: 'cha' },
    { name: 'Investigation', stat: 'int' }, { name: 'Medicine', stat: 'wis' }, { name: 'Nature', stat: 'int' },
    { name: 'Perception', stat: 'wis' }, { name: 'Persuasion', stat: 'cha' }, { name: 'Sleight of Hand', stat: 'dex' },
    { name: 'Stealth', stat: 'dex' }, { name: 'Survival', stat: 'wis' }
];

const raceBonuses = {
    'none': { stats: {}, speed: 30, desc: 'โปรดเลือกประเภทผู้รอดชีวิตเพื่อดูข้อมูลความสามารถ' },
    'standard': { stats: { str: 1, dex: 1, con: 1, int: 1, wis: 1, cha: 1 }, speed: 30, desc: '<strong>อดีตคนเมือง:</strong> ปรับตัวเก่ง<br>• <b>Stats:</b> ทุกค่า +1<br>• <b>Speed:</b> 30 ft.' },
    'blue-collar': { stats: { con: 2 }, speed: 25, desc: '<strong>ชนชั้นแรงงาน:</strong> ร่างกายกำยำ<br>• <b>Stats:</b> CON +2<br>• <b>Speed:</b> 25 ft.<br>• <b>Trait:</b> Advantage ทอยกันพิษ' },
    'tracker': { stats: { dex: 2 }, speed: 30, desc: '<strong>พรานป่า:</strong> ว่องไว<br>• <b>Stats:</b> DEX +2<br>• <b>Speed:</b> 30 ft.<br>• <b>Trait:</b> ชำนาญ Perception' },
    'scrounger': { stats: { dex: 2 }, speed: 25, desc: '<strong>คนร่างเล็ก:</strong> หลบซ่อนเก่ง<br>• <b>Stats:</b> DEX +2<br>• <b>Speed:</b> 25 ft.<br>• <b>Trait:</b> Lucky ทอย 1 ใหม่ได้' },
    'bruiser': { stats: { str: 2, con: 1 }, speed: 30, desc: '<strong>คนร่างยักษ์:</strong> บ้าพลัง<br>• <b>Stats:</b> STR+2, CON+1<br>• <b>Trait:</b> แบกของ x2, ทนความตายได้ 1 ครั้ง' },
    'veteran': { stats: { int: 2, wis: 1 }, speed: 25, desc: '<strong>ผู้อาวุโส:</strong> ประสบการณ์สูง<br>• <b>Stats:</b> INT+2, WIS+1<br>• <b>Trait:</b> Advantage Save จิตใจ' }
};

const classData = {
    'none': { saves: [], hitDice: '-', wpnProf: [], desc: 'โปรดเลือกบทบาทเพื่อดูข้อมูลความชำนาญ' },
    'medic': { saves: ['wis', 'cha'], hitDice: '1d8', wpnProf: ['simple'], desc: '<strong>แพทย์สนาม:</strong><br>• <b>Hit Dice:</b> 1d8<br>• <b>Saves:</b> WIS, CHA' },
    'enforcer': { saves: ['str', 'con'], hitDice: '1d10', wpnProf: ['simple', 'martial'], desc: '<strong>นักสู้:</strong><br>• <b>Hit Dice:</b> 1d10<br>• <b>Saves:</b> STR, CON' },
    'scavenger': { saves: ['dex', 'int'], hitDice: '1d8', wpnProf: ['simple', 'hand-crossbow', 'longsword'], desc: '<strong>นักลอบเร้น:</strong><br>• <b>Hit Dice:</b> 1d8<br>• <b>Saves:</b> DEX, INT' },
    'tactician': { saves: ['int', 'wis'], hitDice: '1d6', wpnProf: ['simple', 'light-crossbow'], desc: '<strong>วิศวกร:</strong><br>• <b>Hit Dice:</b> 1d6<br>• <b>Saves:</b> INT, WIS' },
    'berserker': { saves: ['str', 'con'], hitDice: '1d12', wpnProf: ['simple', 'martial'], desc: '<strong>คนบ้าเลือด:</strong><br>• <b>Hit Dice:</b> 1d12<br>• <b>Saves:</b> STR, CON' },
    'sniper': { saves: ['str', 'dex'], hitDice: '1d10', wpnProf: ['simple', 'martial'], desc: '<strong>พลซุ่มยิง:</strong><br>• <b>Hit Dice:</b> 1d10<br>• <b>Saves:</b> STR, DEX' },
    'leader': { saves: ['dex', 'cha'], hitDice: '1d8', wpnProf: ['simple'], desc: '<strong>ผู้นำ:</strong><br>• <b>Hit Dice:</b> 1d8<br>• <b>Saves:</b> DEX, CHA' }
};

const backgroundData = {
    'none': { skills: [], desc: 'โปรดเลือกภูมิหลัง...' },
    'criminal': { skills: ['Deception', 'Stealth'], desc: 'ชำนาญ Deception & Stealth' },
    'soldier': { skills: ['Athletics', 'Intimidation'], desc: 'ชำนาญ Athletics & Intimidation' },
    'folk_hero': { skills: ['Animal Handling', 'Survival'], desc: 'ชำนาญ Animal Handling & Survival' }
};

const armorData = {
    'none': { baseAc: 10, type: 'none', maxDex: 99, stealthDis: false, minStr: 0 },
    'padded': { baseAc: 11, type: 'light', maxDex: 99, stealthDis: true, minStr: 0 },
    'leather': { baseAc: 11, type: 'light', maxDex: 99, stealthDis: false, minStr: 0 },
    'studded': { baseAc: 12, type: 'light', maxDex: 99, stealthDis: false, minStr: 0 },
    'scale': { baseAc: 14, type: 'medium', maxDex: 2, stealthDis: true, minStr: 0 },
    'breastplate': { baseAc: 14, type: 'medium', maxDex: 2, stealthDis: false, minStr: 0 },
    'splint': { baseAc: 17, type: 'heavy', maxDex: 0, stealthDis: true, minStr: 15 },
    'plate': { baseAc: 18, type: 'heavy', maxDex: 0, stealthDis: true, minStr: 15 }
};

const weaponData = {
    'none': { name: 'มือเปล่า', damage: '1', dmgType: 'Bludg', type: 'simple', stat: 'str', props: '-' },
    'dagger': { name: 'มีดพก', damage: '1d4', dmgType: 'Pierce', type: 'simple', stat: 'finesse', props: 'ขว้าง' },
    'handaxe': { name: 'ขวาน', damage: '1d6', dmgType: 'Slash', type: 'simple', stat: 'str', props: 'ขว้าง' },
    'mace': { name: 'ไม้เบสบอล', damage: '1d6', dmgType: 'Bludg', type: 'simple', stat: 'str', props: '-' },
    'longsword': { name: 'ดาบคาตานะ', damage: '1d8', dmgType: 'Slash', type: 'martial', stat: 'str', props: 'สองมือ (1d10)' },
    'light-crossbow': { name: 'หน้าไม้เบา', damage: '1d8', dmgType: 'Pierce', type: 'simple', stat: 'dex', props: 'ยิง' },
    'hand-crossbow': { name: 'ปืนพก', damage: '1d6', dmgType: 'Pierce', type: 'martial', stat: 'dex', props: 'ยิง, เบา' },
    'heavy-crossbow': { name: 'ปืนไรเฟิล', damage: '1d10', dmgType: 'Pierce', type: 'martial', stat: 'dex', props: 'ยิง, หนัก' }
};

let proficiencies = new Set();
let currentRace = 'none';
let currentBg = 'none';

// ==========================================
// 3. ระบบ UI ย่อ-ขยาย พับหมวดหมู่ และจดจำ
// ==========================================
let allCollapsed = false;
function togglePanel(panelId) {
    const panel = document.getElementById(panelId);
    if (panel) { panel.classList.toggle('collapsed'); saveUIState(); }
}
function toggleAllPanels() {
    allCollapsed = !allCollapsed;
    document.querySelectorAll('.collapsible-panel').forEach(panel => {
        if (allCollapsed) panel.classList.add('collapsed'); else panel.classList.remove('collapsed');
    });
    saveUIState();
}
function saveUIState() {
    const panels = document.querySelectorAll('.collapsible-panel');
    const state = {};
    panels.forEach(p => { state[p.id] = p.classList.contains('collapsed'); });
    const dp = document.getElementById('dice-panel');
    if (dp) {
        state['dice_collapsed'] = dp.classList.contains('collapsed');
        state['dice_hidden'] = dp.classList.contains('hidden-panel');
    }
    localStorage.setItem('twd_rpg_ui_state', JSON.stringify(state));
}
function loadUIState() {
    try {
        const stateStr = localStorage.getItem('twd_rpg_ui_state');
        if (stateStr) {
            const state = JSON.parse(stateStr);
            for (const [id, isCollapsed] of Object.entries(state)) {
                const p = document.getElementById(id);
                if (p && p.classList.contains('collapsible-panel')) { 
                    if (isCollapsed) p.classList.add('collapsed'); else p.classList.remove('collapsed'); 
                }
            }
            const dp = document.getElementById('dice-panel');
            if (dp) {
                if (state['dice_collapsed']) dp.classList.add('collapsed'); else dp.classList.remove('collapsed');
                if (state['dice_hidden']) dp.classList.add('hidden-panel'); else dp.classList.remove('hidden-panel');
            }
        }
    } catch(e) {}
}

function closeDicePanel() { document.getElementById('dice-panel').classList.add('hidden-panel'); saveUIState(); }
function showDicePanel() { const panel = document.getElementById('dice-panel'); panel.classList.remove('hidden-panel'); panel.classList.remove('collapsed'); saveUIState(); }
function openDicePanelAuto() {
    const panel = document.getElementById('dice-panel'); panel.classList.remove('hidden-panel'); 
    if (panel.classList.contains('collapsed')) { panel.classList.remove('collapsed'); } saveUIState();
}

// ==========================================
// 4. การสร้าง UI (อาวุธ & ทักษะ)
// ==========================================
function initWeapons() {
    [1, 2, 3].forEach(slotId => {
        const select = document.getElementById(`wpn-select-${slotId}`);
        for (const [key, wpn] of Object.entries(weaponData)) {
            const option = document.createElement('option');
            option.value = key; option.textContent = wpn.name; select.appendChild(option);
        }
        select.addEventListener('change', updateCalculations);
        document.getElementById(`wpn-name-${slotId}`).addEventListener('input', updateCalculations);
    });
}
const skillsContainer = document.getElementById('skills-container');
skillsData.forEach((skill, index) => {
    const row = document.createElement('div');
    row.className = 'skill-row'; row.id = `skill-row-${index}`;
    if (skill.isSave) row.style.fontWeight = 'bold';
    row.innerHTML = `<input type="checkbox" id="skill-${index}"><div class="skill-mod clickable-roll" id="skill-mod-${index}" onclick="rollD20('🎯 ${skill.name}', this.textContent, '${skill.stat}')">+0</div><div class="skill-name">${skill.name} <span class="skill-stat">(${skill.stat})</span></div>`;
    skillsContainer.appendChild(row);
    document.getElementById(`skill-${index}`).addEventListener('change', (e) => { e.target.checked ? proficiencies.add(index) : proficiencies.delete(index); updateCalculations(); autoSync(); });
});

// ==========================================
// 5. ระบบคำนวณสเตตัส & สีเลือด & การ์ดรูปภาพ
// ==========================================
function updateHealthVisuals() {
    const current = parseInt(document.getElementById('current-hp').value) || 0;
    const max = parseInt(document.getElementById('max-hp').value) || 1;
    const container = document.getElementById('health-box-container');
    const percent = (current / max) * 100;
    container.className = 'health-box panel-3d'; 
    if (current <= 0) container.classList.add('health-dead'); else if (percent >= 70) container.classList.add('health-high'); else if (percent >= 35) container.classList.add('health-med'); else container.classList.add('health-low');
}
document.getElementById('current-hp').addEventListener('input', updateHealthVisuals); document.getElementById('max-hp').addEventListener('input', updateHealthVisuals);

function updateCharacterCard() {
    const typeObj = document.getElementById('survivor-type'); const roleObj = document.getElementById('role'); const bgObj = document.getElementById('background');
    const typeText = typeObj.value !== 'none' ? typeObj.options[typeObj.selectedIndex].text.split(' ')[0] : 'ผู้รอดชีวิต';
    const roleText = roleObj.value !== 'none' ? roleObj.options[roleObj.selectedIndex].text.split(' ')[0] : 'ไร้บทบาท';
    const bgText = bgObj.value !== 'none' ? bgObj.options[bgObj.selectedIndex].text.split(' ')[0] : 'ไร้ภูมิหลัง';
    document.getElementById('char-combo-title').textContent = `${typeText} • ${roleText} • ${bgText}`;

    const customUrl = document.getElementById('custom-img-url').value.trim(); const imgEl = document.getElementById('char-portrait');
    if (customUrl) { imgEl.src = customUrl; } 
    else {
        if (typeObj.value === 'none' && roleObj.value === 'none' && bgObj.value === 'none') { imgEl.src = "https://placehold.co/300x400/1a1a1a/ffd700?text=Select+Survivor"; return; }
        const prompt = `A portrait of a post-apocalyptic survivor in The Walking Dead, ${typeObj.value} type, ${roleObj.value} role, ${bgObj.value} background, gritty dark comic style, highly detailed`;
        const encodedPrompt = encodeURIComponent(prompt); const seedString = typeObj.value + roleObj.value + bgObj.value;
        let hash = 0; for (let i = 0; i < seedString.length; i++) hash = Math.imul(31, hash) + seedString.charCodeAt(i) | 0;
        imgEl.src = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=300&height=400&nologo=true&seed=${Math.abs(hash)}`;
    }
}
document.getElementById('custom-img-url').addEventListener('input', updateCharacterCard);

function updateCalculations() {
    const level = parseInt(document.getElementById('level').value) || 1;
    const profBonus = Math.ceil(level / 4) + 1;
    document.getElementById('prof-bonus').textContent = `+${profBonus}`;

    const role = document.getElementById('role').value; const currentRole = classData[role] || classData['none'];
    const race = document.getElementById('survivor-type').value; const currentRaceData = raceBonuses[race] || raceBonuses['none'];
    const bgKey = document.getElementById('background').value; const currentBgData = backgroundData[bgKey] || backgroundData['none'];
    
    document.getElementById('trait-description').innerHTML = currentRaceData.desc;
    document.getElementById('role-description').innerHTML = currentRole.desc;
    document.getElementById('bg-description').innerHTML = currentBgData.desc;

    let baseSpeed = currentRaceData.speed;
    const modifiers = {}; let totalStr = 10;
    abilities.forEach(stat => {
        const baseVal = parseInt(document.getElementById(`${stat}-score`).value) || 10;
        const raceMod = currentRaceData.stats[stat] || 0;
        const totalScore = baseVal + raceMod;
        if(stat === 'str') totalStr = totalScore;
        let mod = Math.floor((totalScore - 10) / 2);
        modifiers[stat] = mod;
        document.getElementById(`${stat}-total`).textContent = totalScore;
        document.getElementById(`${stat}-mod`).textContent = (mod >= 0 ? '+' : '') + mod;
    });

    document.getElementById('initiative').textContent = (modifiers['dex'] >= 0 ? '+' : '') + modifiers['dex'];

    const armorKey = document.getElementById('armor-select').value; const armor = armorData[armorKey];
    const hasShield = document.getElementById('shield-check').checked;
    let ac = armor.baseAc; let dexBonus = modifiers['dex'];
    if (dexBonus > armor.maxDex) dexBonus = armor.maxDex;
    if (armor.type === 'heavy') ac += 0; else ac += dexBonus;
    if (hasShield) ac += 2;
    document.getElementById('ac-display').textContent = ac;

    let warnings = [];
    if (armor.stealthDis) warnings.push("⚠️ เสียเปรียบ Stealth");
    if (armor.minStr > totalStr) {
        warnings.push(`⚠️ STR ไม่ถึง ${armor.minStr} (Speed -10 ft.)`);
        if (race !== 'blue-collar') baseSpeed -= 10; 
    }
    document.getElementById('armor-warning').innerHTML = warnings.join('<br>');
    document.getElementById('speed').textContent = `${baseSpeed} ft.`;

    const showAll = document.getElementById('show-all-skills').checked;
    skillsData.forEach((skill, index) => {
        let skillTotal = modifiers[skill.stat];
        const isProficient = proficiencies.has(index);
        if (isProficient) skillTotal += profBonus;
        document.getElementById(`skill-mod-${index}`).textContent = (skillTotal >= 0 ? '+' : '') + skillTotal;
        document.getElementById(`skill-row-${index}`).style.display = (showAll || isProficient) ? 'flex' : 'none';
    });

    // 💥 ซ่อมแซมระบบผูกฟังก์ชันปุ่มโจมตี ATK / DMG
    [1, 2, 3].forEach(slotId => {
        const wpnKey = document.getElementById(`wpn-select-${slotId}`).value; 
        const wpn = weaponData[wpnKey] || weaponData['none']; // ดักบั๊กกันแตก
        const customName = document.getElementById(`wpn-name-${slotId}`).value.trim();
        const displayWpnName = customName ? `${customName} (${wpn.name})` : wpn.name;

        let ammoType = '';
        if (wpnKey === 'light-crossbow') ammoType = 'bolt'; else if (wpnKey === 'hand-crossbow') ammoType = 'pistol'; else if (wpnKey === 'heavy-crossbow') ammoType = 'heavy';

        let isProficient = (currentRole.wpnProf.includes(wpn.type) || currentRole.wpnProf.includes(wpnKey));
        let atkMod = 0;
        if (wpn.stat === 'str') atkMod = modifiers['str']; else if (wpn.stat === 'dex') atkMod = modifiers['dex']; else if (wpn.stat === 'finesse') atkMod = Math.max(modifiers['str'], modifiers['dex']);

        let totalAtk = atkMod + (isProficient ? profBonus : 0);
        let atkStr = (totalAtk >= 0 ? '+' : '') + totalAtk;
        let dmgModStr = (atkMod !== 0) ? ((atkMod > 0 ? '+' : '') + atkMod) : '';
        let finalDmgStr = wpnKey === 'none' ? `${1 + atkMod} ${wpn.dmgType}` : `${wpn.damage}${dmgModStr} ${wpn.dmgType}`;
        
        const btnAtk = document.getElementById(`wpn-atk-${slotId}`);
        const btnDmg = document.getElementById(`wpn-dmg-${slotId}`);

        btnAtk.textContent = atkStr;
        btnAtk.onclick = () => rollAttack(displayWpnName, atkStr, ammoType);
        
        btnDmg.textContent = finalDmgStr;
        btnDmg.onclick = () => rollDamage(finalDmgStr, displayWpnName);
        
        document.getElementById(`wpn-prop-${slotId}`).textContent = wpn.props;
    });
    updateHealthVisuals(); updateCharacterCard();
}

// ====================================================
// 6. ระบบต่อสู้, พักผ่อน และ กระสุน (กู้คืนมาแล้ว)
// ====================================================
function adjAmmo(type, amount) {
    const input = document.getElementById(`ammo-${type}`);
    input.value = Math.max(0, (parseInt(input.value) || 0) + amount); 
    autoSync();
}

function rollAttack(name, modStr, ammoType) {
    if (ammoType) {
        const input = document.getElementById(`ammo-${ammoType}`);
        let val = parseInt(input.value) || 0;
        if (val <= 0) {
            alert(`กระสุนหมด! โจมตีด้วย ${name} ไม่ได้`);
            return;
        }
        input.value = val - 1;
        logAction("⚠️ ใช้กระสุน", `ยิง ${name} (เหลือกระสุน ${input.value} นัด)`);
        autoSync();
    }
    // ส่งสกินคำว่า 'atk' ไปให้ระบบลูกเต๋ารู้
    rollD20(`⚔️ โจมตี: ${name}`, modStr, 'atk');
}

function shortRest() { alert("พักสั้น: ใช้ Hit Dice ฟื้น HP ได้"); autoSync(); }
function longRest() { 
    document.getElementById('current-hp').value = document.getElementById('max-hp').value; 
    resetDeathSaves(); updateHealthVisuals(); alert("พักยาว: ฟื้นฟู HP กลับมาเต็ม"); autoSync(); 
}

function rollDeathSave() {
    const roll = Math.floor(Math.random() * 20) + 1;
    // ส่งสกิน 'death' ไปให้เต๋า
    play3DDiceAnimation([roll], 20, 0, 'death', () => {
        const logEntry = document.createElement('div'); logEntry.className = 'log-entry';
        let resultText = '', plainText = '';
        if (roll >= 10) { resultText = `<span class="text-success">รอด (Success)</span>`; plainText = 'รอด'; addDeathSaveMark('success'); } 
        else { resultText = `<span class="text-danger">ตาย (Failure)</span>`; plainText = 'ตาย'; addDeathSaveMark('failure'); }
        logEntry.dataset.copytext = `💀 ท้าความตาย\nทอยได้: ${roll}\nผลลัพธ์: ${plainText}`;
        logEntry.innerHTML = `<div class="log-header-row"><div style="font-weight:bold;">💀 ท้าความตาย (Death Save)</div><button class="btn-copy-log" onclick="copyLogEntry(this)">📋</button></div><div style="font-size: 1.1em; margin-top:5px;">ทอยได้ <b>${roll}</b> ➔ ${resultText}</div>`;
        document.getElementById('dice-log').prepend(logEntry);
        openDicePanelAuto();
    });
}

function addDeathSaveMark(type) {
    for (let i = 1; i <= 3; i++) {
        let cb = document.getElementById(type === 'success' ? `ds-s-${i}` : `ds-f-${i}`);
        if (!cb.checked) { cb.checked = true; setTimeout(checkDeathSaveCondition, 100); break; }
    }
    autoSync();
}

function checkDeathSaveCondition() {
    let s = [1,2,3].filter(i => document.getElementById(`ds-s-${i}`).checked).length;
    let f = [1,2,3].filter(i => document.getElementById(`ds-f-${i}`).checked).length;
    if (s >= 3) { alert("ตัวละครรอดชีวิตแล้ว! (Stable)"); resetDeathSaves(); } 
    else if (f >= 3) { alert("ตัวละครเสียชีวิต... กลายเป็น Walker 🧟"); resetDeathSaves(); }
}

function resetDeathSaves() {
    for(let i=1; i<=3; i++) { document.getElementById(`ds-s-${i}`).checked = false; document.getElementById(`ds-f-${i}`).checked = false; }
    autoSync();
}

// ====================================================
// 7. ระบบเซฟข้อมูล (Private Mode) & ซิงก์ (Cloud)
// ====================================================
const LOCAL_STORAGE_KEY = 'twd_rpg_char_data';
function saveLocalData() {
    try {
        const elements = document.querySelectorAll('input, select, textarea');
        const data = {};
        elements.forEach(el => { if (el.id) data[el.id] = (el.type === 'checkbox' || el.type === 'radio') ? el.checked : el.value; });
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {}
}
function loadLocalData() {
    try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
            const data = JSON.parse(saved);
            for (const key in data) {
                const el = document.getElementById(key);
                if (el) { if (el.type === 'checkbox' || el.type === 'radio') el.checked = data[key]; else el.value = data[key]; }
            }
            proficiencies.clear();
            skillsData.forEach((skill, index) => { if (document.getElementById(`skill-${index}`).checked) proficiencies.add(index); });
            updateCalculations();
        }
    } catch (e) {}
}
function resetLocalData() {
    if (confirm("⚠️ ล้างข้อมูลทั้งหมด และเริ่มใหม่ใช่หรือไม่?")) {
        try { localStorage.removeItem(LOCAL_STORAGE_KEY); localStorage.removeItem('twd_rpg_ui_state'); } catch (e) {}
        location.reload(); 
    }
}

let syncTimer = null;
function getCharacterDataText() {
    const name = document.getElementById('char-name').value || 'ไม่ระบุชื่อ';
    const typeObj = document.getElementById('survivor-type'); const type = typeObj.options[typeObj.selectedIndex].text;
    const roleObj = document.getElementById('role'); const role = roleObj.options[roleObj.selectedIndex].text;
    const bgObj = document.getElementById('background'); const bg = bgObj.value !== 'none' ? bgObj.options[bgObj.selectedIndex].text : '-';
    const level = document.getElementById('level').value;

    let text = `=== THE WALKING DEAD RPG: CHARACTER SHEET ===\nชื่อตัวละคร: ${name}\nประเภท: ${type} | บทบาท: ${role} | เลเวล: ${level}\nภูมิหลัง: ${bg}\n`;
    const customImg = document.getElementById('custom-img-url').value;
    if(customImg) text += `รูปตัวละคร: ${customImg}\n`; text += `---------------------------------------------\n`;
    text += `[สถานะการต่อสู้]\nHP: ${document.getElementById('current-hp').value} / ${document.getElementById('max-hp').value} | AC: ${document.getElementById('ac-display').textContent} | Speed: ${document.getElementById('speed').textContent} | Initiative: ${document.getElementById('initiative').textContent}\n---------------------------------------------\n[ค่าความสามารถ]\n`;
    abilities.forEach(stat => { text += `${stat.toUpperCase()}: ${document.getElementById(`${stat}-total`).textContent} (${document.getElementById(`${stat}-mod`).textContent})\n`; });
    text += `---------------------------------------------\n[ความชำนาญ Skills]\n`;
    skillsData.forEach((skill, index) => { if (document.getElementById(`skill-${index}`).checked) { text += `★ ${skill.name} ${document.getElementById(`skill-mod-${index}`).textContent}\n`; } });
    text += `---------------------------------------------\n[ชุดเกราะ]\nเกราะ: ${document.getElementById('armor-select').options[document.getElementById('armor-select').selectedIndex].text} | โล่: ${document.getElementById('shield-check').checked ? 'ถือโล่ (+2 AC)' : 'ไม่ถือโล่'}\n---------------------------------------------\n[อาวุธ]\n`;
    [1, 2, 3].forEach(id => {
        const wpnObj = document.getElementById(`wpn-select-${id}`);
        if (wpnObj.value !== 'none' || id === 1) { text += `Slot ${id}: ${document.getElementById(`wpn-name-${id}`).value || wpnObj.options[wpnObj.selectedIndex].text} | ATK: ${document.getElementById(`wpn-atk-${id}`).textContent} | DMG: ${document.getElementById(`wpn-dmg-${id}`).textContent}\n`; }
    });
    text += `---------------------------------------------\n[กระสุน]\nลูกหน้าไม้: ${document.getElementById('ammo-bolt').value} | ปืนพก: ${document.getElementById('ammo-pistol').value} | ไรเฟิล: ${document.getElementById('ammo-heavy').value}\n---------------------------------------------\n[ยุทธวิธี]\n${document.getElementById('tactics-text').value || '-'}\n\n[ช่องเก็บของ]\n${document.getElementById('inventory-text').value || '-'}\n=============================================`;
    return text;
}
function autoSync() {
    saveLocalData();
    const currentUrl = document.getElementById('webapp-url').value.trim() || WEB_APP_URL;
    if (currentUrl === "วาง_WEB_APP_URL_ของคุณตรงนี้" || currentUrl === "") return;
    const btn = document.getElementById('btn-sync'); btn.innerHTML = '⏳ รออัปเดต...';
    clearTimeout(syncTimer); syncTimer = setTimeout(() => { executeSync(currentUrl); }, 2000); 
}
function manualSync() {
    saveLocalData(); const currentUrl = document.getElementById('webapp-url').value.trim() || WEB_APP_URL;
    if (currentUrl === "" || currentUrl.includes("วาง_WEB_APP")) return alert("⚠️ โปรดใส่ Web App URL ก่อนครับ");
    clearTimeout(syncTimer); executeSync(currentUrl);
}
function executeSync(appUrl) {
    const btn = document.getElementById('btn-sync'); const originalText = '☁️ ซิงก์ (Docs)';
    btn.innerHTML = '⏳ กำลังซิงก์...'; btn.disabled = true;
    fetch(appUrl, { method: "POST", mode: "no-cors", body: JSON.stringify({ characterData: getCharacterDataText() }), headers: { "Content-Type": "text/plain;charset=utf-8" } })
    .then(() => { btn.innerHTML = '✅ สำเร็จ!'; setTimeout(() => { btn.innerHTML = originalText; btn.disabled = false; }, 2000); })
    .catch(error => { btn.innerHTML = '❌ ล้มเหลว'; setTimeout(() => { btn.innerHTML = originalText; btn.disabled = false; }, 2000); });
}
function copyCharacterData() { copyTextToClipboard(getCharacterDataText(), '📋 คัดลอกข้อมูลตัวละครสำเร็จ!'); }
function copyTextToClipboard(text, msg) { if (navigator.clipboard) { navigator.clipboard.writeText(text).then(() => { if(msg) alert(msg); }).catch(() => {}); } }
function copyLogEntry(btnElement) { event.stopPropagation(); const textToCopy = btnElement.closest('.log-entry').dataset.copytext; if(textToCopy) copyTextToClipboard(textToCopy, '📋 คัดลอกผลลัพธ์ลงคลิปบอร์ดแล้ว!'); }

// ====================================================
// 8. ระบบ YouTube BGM พื้นหลัง
// ====================================================
let isBgmPlaying = false;
function extractVideoID(url) { const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/); return (match && match[2].length === 11) ? match[2] : null; }
function toggleBGM() {
    const urlInput = document.getElementById('bgm-url').value.trim();
    const btn = document.getElementById('btn-bgm'); const container = document.getElementById('yt-bgm-container');
    if (isBgmPlaying) {
        container.innerHTML = ''; btn.innerHTML = '▶️ Play'; btn.classList.remove('btn-bgm-playing'); isBgmPlaying = false;
    } else {
        const videoId = extractVideoID(urlInput); if (!videoId) return alert("⚠️ ไม่พบ ID วิดีโอ กรุณาตรวจสอบลิงก์ YouTube อีกครั้ง");
        container.innerHTML = `<iframe width="200" height="200" src="https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}&playsinline=1" frameborder="0" allow="autoplay; encrypted-media"></iframe>`;
        btn.innerHTML = '⏹️ Stop'; btn.classList.add('btn-bgm-playing'); isBgmPlaying = true;
    }
}

// ====================================================
// 9. 🛑 กราฟิกเต๋า และ ระบบทำลายเต๋าแก้บั๊กค้าง iOS 100%
// ====================================================
let audioCtx = null; let audioUnlocked = false;
function unlockAudio() {
    if (audioUnlocked) return;
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const buffer = audioCtx.createBuffer(1, 1, 22050); const source = audioCtx.createBufferSource(); source.buffer = buffer; source.connect(audioCtx.destination); source.start(0);
    audioUnlocked = true; document.removeEventListener('touchstart', unlockAudio); document.removeEventListener('click', unlockAudio);
}
document.addEventListener('touchstart', unlockAudio, { once: true }); document.addEventListener('click', unlockAudio, { once: true });

function playDiceSound() {
    const type = document.getElementById('dice-sound-select').value; if (type === 'none') return;
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;
    const playClick = (time, freq, typeStr, dur, vol = 1) => {
        const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
        osc.type = typeStr; osc.frequency.setValueAtTime(freq, time); osc.frequency.exponentialRampToValueAtTime(freq * 0.1, time + dur);
        gain.gain.setValueAtTime(vol, time); gain.gain.exponentialRampToValueAtTime(0.01, time + dur);
        osc.connect(gain); gain.connect(audioCtx.destination); osc.start(time); osc.stop(time + dur);
    };
    if (type === '1') { playClick(now, 800, 'square', 0.05, 0.4); playClick(now+0.1, 950, 'square', 0.04, 0.3); playClick(now+0.25, 750, 'square', 0.05, 0.2); } 
    else if (type === '2') { playClick(now, 300, 'triangle', 0.08, 0.8); playClick(now+0.15, 250, 'triangle', 0.06, 0.6); playClick(now+0.3, 200, 'triangle', 0.05, 0.4); } 
    else if (type === '3') { playClick(now, 1200, 'sine', 0.1, 0.5); playClick(now+0.12, 1500, 'sine', 0.08, 0.4); playClick(now+0.2, 1300, 'sine', 0.1, 0.3); }
}

document.getElementById('dice-color-select').addEventListener('change', (e) => { document.documentElement.style.setProperty('--dice-hue', `${e.target.value}deg`); });

// 🟢 สร้างรูปทรงลูกเต๋า SVG
function getDiceSvg(sides) {
    if (sides == 4) return `<svg viewBox="0 0 100 100" class="dice-svg"><polygon points="50,10 10,85 90,85" fill="#d00000" stroke="#ff8888" stroke-width="2"/><polygon points="50,10 50,85 10,85" fill="#ff4d4d" stroke="#ff8888" stroke-width="1.5"/><polygon points="50,10 90,85 50,85" fill="#cc0000" stroke="#ff8888" stroke-width="1.5"/></svg>`;
    if (sides == 6) return `<svg viewBox="0 0 100 100" class="dice-svg"><polygon points="50,15 85,35 50,55 15,35" fill="#ff6666" stroke="#ff8888" stroke-width="1.5"/><polygon points="15,35 50,55 50,90 15,70" fill="#cc0000" stroke="#ff8888" stroke-width="1.5"/><polygon points="50,55 85,35 85,70 50,90" fill="#990000" stroke="#ff8888" stroke-width="1.5"/></svg>`;
    if (sides == 8) return `<svg viewBox="0 0 100 100" class="dice-svg"><polygon points="50,10 15,50 85,50" fill="#ff4d4d" stroke="#ff8888" stroke-width="1.5"/><polygon points="50,10 50,50 15,50" fill="#ff6666" stroke="#ff8888" stroke-width="1.5"/><polygon points="50,10 85,50 50,50" fill="#d00000" stroke="#ff8888" stroke-width="1.5"/><polygon points="15,50 50,90 85,50" fill="#cc0000" stroke="#ff8888" stroke-width="1.5"/><polygon points="15,50 50,90 50,50" fill="#990000" stroke="#ff8888" stroke-width="1.5"/><polygon points="85,50 50,90 50,50" fill="#7a0000" stroke="#ff8888" stroke-width="1.5"/></svg>`;
    if (sides == 10) return `<svg viewBox="0 0 100 100" class="dice-svg"><polygon points="50,10 20,45 50,65 80,45" fill="#ff4d4d" stroke="#ff8888" stroke-width="1.5"/><polygon points="50,10 20,45 50,65" fill="#ff6666" stroke="#ff8888" stroke-width="1.5"/><polygon points="50,10 80,45 50,65" fill="#d00000" stroke="#ff8888" stroke-width="1.5"/><polygon points="20,45 50,90 50,65" fill="#cc0000" stroke="#ff8888" stroke-width="1.5"/><polygon points="80,45 50,90 50,65" fill="#990000" stroke="#ff8888" stroke-width="1.5"/></svg>`;
    if (sides == 12) return `<svg viewBox="0 0 100 100" class="dice-svg"><polygon points="50,25 25,40 35,70 65,70 75,40" fill="#ff4d4d" stroke="#ff8888" stroke-width="1.5"/><polygon points="50,25 25,40 10,20 50,5" fill="#ff6666" stroke="#ff8888" stroke-width="1.5"/><polygon points="50,25 75,40 90,20 50,5" fill="#d00000" stroke="#ff8888" stroke-width="1.5"/><polygon points="25,40 35,70 15,90 5,60 10,20" fill="#cc0000" stroke="#ff8888" stroke-width="1.5"/><polygon points="75,40 65,70 85,90 95,60 90,20" fill="#990000" stroke="#ff8888" stroke-width="1.5"/><polygon points="35,70 65,70 85,90 50,100 15,90" fill="#7a0000" stroke="#ff8888" stroke-width="1.5"/></svg>`;
    // Default D20
    return `<svg viewBox="0 0 100 100" class="dice-svg"><polygon points="50,20 15,70 85,70" fill="#b22222" stroke="#ff8888" stroke-width="1.5"/><polygon points="50,0 0,25 50,20" fill="#ff6666" stroke="#ff8888" stroke-width="1.5"/><polygon points="50,0 100,25 50,20" fill="#d00000" stroke="#ff8888" stroke-width="1.5"/><polygon points="0,25 15,70 50,20" fill="#ff4d4d" stroke="#ff8888" stroke-width="1.5"/><polygon points="100,25 85,70 50,20" fill="#cc0000" stroke="#ff8888" stroke-width="1.5"/><polygon points="0,25 0,75 15,70" fill="#e60000" stroke="#ff8888" stroke-width="1.5"/><polygon points="100,25 100,75 85,70" fill="#7a0000" stroke="#ff8888" stroke-width="1.5"/><polygon points="0,75 50,100 15,70" fill="#990000" stroke="#ff8888" stroke-width="1.5"/><polygon points="100,75 50,100 85,70" fill="#550000" stroke="#ff8888" stroke-width="1.5"/><polygon points="15,70 50,100 85,70" fill="#8b0000" stroke="#ff8888" stroke-width="1.5"/></svg>`;
}

// 🟢 ฟังก์ชันหลัก สร้างและทำลายล้าง 100% (The iOS GPU Killer)
function play3DDiceAnimation(rolls, sides, finalIndex, skinType, callback) {
    playDiceSound(); 

    // 1. ทำลายของเก่าที่อาจจะค้างอยู่ (DOM Nuke)
    let oldOverlay = document.getElementById('dice-3d-overlay-dynamic');
    if (oldOverlay) oldOverlay.remove();

    // 2. สร้างฉากและลูกเต๋าขึ้นมาใหม่หมดจากศูนย์
    const overlay = document.createElement('div');
    overlay.id = 'dice-3d-overlay-dynamic';
    overlay.className = 'dice-3d-overlay-fullscreen';

    const container = document.createElement('div');
    container.className = 'dice-container';
    overlay.appendChild(container);

    // เลือกลายน้ำ (Skin Emoji)
    let emoji = '';
    if (skinType === 'str') emoji = '💪';
    else if (skinType === 'dex') emoji = '🏃';
    else if (skinType === 'con') emoji = '🛡️';
    else if (skinType === 'int') emoji = '🧠';
    else if (skinType === 'wis') emoji = '👁️';
    else if (skinType === 'cha') emoji = '🗣️';
    else if (skinType === 'atk') emoji = '⚔️';
    else if (skinType === 'dmg') emoji = '💥';
    else if (skinType === 'death') emoji = '💀';

    const watermarkHtml = emoji ? `<div class="dice-watermark">${emoji}</div>` : '';

    let visualRolls = rolls.slice(0, 2);

    visualRolls.forEach((roll, idx) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'dice-3d-wrapper';
        wrapper.innerHTML = `
            ${getDiceSvg(sides)}
            ${watermarkHtml}
            <div class="dice-result-text" id="dynamic-dice-result-${idx}">${roll}</div>
        `;
        container.appendChild(wrapper);
    });

    // ยัดลงไปในหน้าเว็บ
    document.body.appendChild(overlay);

    // บังคับให้ iOS วาดหน้าจอใหม่ทันที
    void overlay.offsetWidth;

    const wrappers = overlay.querySelectorAll('.dice-3d-wrapper');
    const results = overlay.querySelectorAll('.dice-result-text');

    wrappers.forEach((w, idx) => {
        if (visualRolls.length > 1 && sides === 20) {
            if (finalIndex === idx) results[idx].classList.add('adv-highlight');
            else results[idx].classList.add('dis-highlight');
        }
        w.style.animation = `tumbling ${1.2 + (idx * 0.1)}s cubic-bezier(0.1, 0.8, 0.2, 1) forwards`;
        setTimeout(() => {
            results[idx].style.animation = 'popNumber 0.4s ease-out forwards';
            if (idx > 0) setTimeout(() => playDiceSound(), 200); 
        }, 1100 + (idx * 100));
    });

    // 🔴 3. ฟังก์ชันทุบทำลายทิ้ง (ล้าง RAM 100%)
    let isDestroyed = false;
    const destroyOverlay = () => {
        if(isDestroyed) return;
        isDestroyed = true;
        
        // เคลียร์การเรนเดอร์ก่อนเพื่อความชัวร์
        wrappers.forEach(w => {
            w.style.animation = 'none';
            w.style.transform = 'none';
            w.style.display = 'none';
        });

        // ถอนรากถอนโคนออกจาก HTML
        overlay.remove();

        if(callback) callback();
    };

    // แตะที่จอเพื่อปิดทันที
    overlay.addEventListener('click', destroyOverlay);
    overlay.addEventListener('touchstart', (e) => {
        e.preventDefault(); 
        destroyOverlay();
    }, { passive: false });

    // หน่วงเวลาตั้งเวลาลบทิ้งอัตโนมัติ
    setTimeout(destroyOverlay, 1500 + (visualRolls.length * 100));
    setTimeout(destroyOverlay, 3500); // Failsafe สูงสุด
}

// ====================================================
// 10. ระบบหน้าต่างทอยเต๋า ลอยได้ & ย่อขยายได้
// ====================================================
const dicePanel = document.getElementById('dice-panel');
const diceHeader = document.getElementById('dice-panel-header');
const diceResize = document.getElementById('dice-resize-handle');

let isDragging = false; let isResizing = false;
let dragStartX, dragStartY, initialLeft, initialTop;
let resizeStartW, resizeStartH, resizeStartX, resizeStartY;
let panelWasDragged = false;

function startDrag(e) {
    if (e.target.closest('button') || e.target.closest('select')) return; 
    isDragging = true; panelWasDragged = false;
    const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
    const rect = dicePanel.getBoundingClientRect();
    dragStartX = clientX; dragStartY = clientY; initialLeft = rect.left; initialTop = rect.top;

    dicePanel.style.left = initialLeft + 'px'; dicePanel.style.top = initialTop + 'px';
    dicePanel.style.bottom = 'auto'; dicePanel.style.right = 'auto'; dicePanel.style.margin = '0';

    if(PlatformManager.isPC) {
        document.addEventListener('mousemove', onDrag, { passive: false });
        document.addEventListener('mouseup', stopDrag);
    } else {
        document.addEventListener('touchmove', onDrag, { passive: false });
        document.addEventListener('touchend', stopDrag);
    }
}
function onDrag(e) {
    if (!isDragging) return; e.preventDefault(); 
    const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
    const dx = clientX - dragStartX; const dy = clientY - dragStartY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) panelWasDragged = true;

    let newLeft = initialLeft + dx; let newTop = initialTop + dy;
    newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - dicePanel.offsetWidth));
    newTop = Math.max(0, Math.min(newTop, window.innerHeight - dicePanel.offsetHeight));
    dicePanel.style.left = newLeft + 'px'; dicePanel.style.top = newTop + 'px';
}
function stopDrag() {
    isDragging = false;
    document.removeEventListener('mousemove', onDrag); document.removeEventListener('touchmove', onDrag);
    document.removeEventListener('mouseup', stopDrag); document.removeEventListener('touchend', stopDrag);
}

function startResize(e) {
    if(!PlatformManager.isPC) return; 
    isResizing = true; e.preventDefault(); e.stopPropagation();
    const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
    resizeStartX = clientX; resizeStartY = clientY;
    resizeStartW = dicePanel.offsetWidth; resizeStartH = dicePanel.offsetHeight;

    const rect = dicePanel.getBoundingClientRect();
    dicePanel.style.left = rect.left + 'px'; dicePanel.style.top = rect.top + 'px';
    dicePanel.style.bottom = 'auto'; dicePanel.style.right = 'auto';

    document.addEventListener('mousemove', onResize, { passive: false });
    document.addEventListener('mouseup', stopResize);
}
function onResize(e) {
    if (!isResizing) return; e.preventDefault();
    const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
    const dx = clientX - resizeStartX; const dy = clientY - resizeStartY;
    
    let newWidth = resizeStartW + dx; let newHeight = resizeStartH + dy;
    newWidth = Math.max(280, Math.min(newWidth, window.innerWidth - dicePanel.offsetLeft));
    newHeight = Math.max(200, Math.min(newHeight, window.innerHeight - dicePanel.offsetTop));
    dicePanel.style.width = newWidth + 'px'; dicePanel.style.height = newHeight + 'px';
}
function stopResize() {
    isResizing = false;
    document.removeEventListener('mousemove', onResize);
    document.removeEventListener('mouseup', stopResize);
}

if (PlatformManager.isPC) {
    diceHeader.addEventListener('mousedown', startDrag);
    diceResize.addEventListener('mousedown', startResize);
} else {
    diceHeader.addEventListener('touchstart', startDrag, { passive: false });
}

diceHeader.addEventListener('click', (e) => {
    if (e.target.closest('button') || e.target.closest('select')) return;
    if (!panelWasDragged) { togglePanel('dice-panel'); }
});

// ====================================================
// 11. ระบบลอจิกทอยเต๋า สกินอัจฉริยะ และประวัติ
// ====================================================
function rollD20(name, modifierStr, forcedSkin = null) {
    openDicePanelAuto(); 
    const modifier = parseInt(modifierStr) || 0;
    const mode = document.querySelector('input[name="roll_mode"]:checked').value;
    const r1 = Math.floor(Math.random() * 20) + 1; const r2 = Math.floor(Math.random() * 20) + 1;
    let rolls = [], finalRoll = 0, finalIndex = 0, modeText = '', diceShow = '';

    if (mode === 'advantage') { rolls = [r1, r2]; finalRoll = Math.max(r1, r2); finalIndex = r1 >= r2 ? 0 : 1; modeText = ' <span class="text-success">[Adv]</span>'; diceShow = `(${r1}, ${r2}) ➔ ${finalRoll}`; } 
    else if (mode === 'disadvantage') { rolls = [r1, r2]; finalRoll = Math.min(r1, r2); finalIndex = r1 <= r2 ? 0 : 1; modeText = ' <span class="text-danger">[Dis]</span>'; diceShow = `(${r1}, ${r2}) ➔ ${finalRoll}`; } 
    else { rolls = [r1]; finalRoll = r1; diceShow = `${r1}`; }

    let critText = '', critPlain = '';
    if (finalRoll === 20) { critText = '<span class="text-success">(Critical Success!)</span>'; critPlain = '(Critical Success!)'; }
    if (finalRoll === 1) { critText = '<span class="text-danger">(Critical Failure!)</span>'; critPlain = '(Critical Failure!)'; }

    const total = finalRoll + modifier;

    // 🌟 ระบบตรวจจับสกินอัจฉริยะจากชื่อที่ทอย หรือจากค่าที่ถูกบังคับส่งมา
    let skinType = forcedSkin || '';
    if (!skinType) {
        const n = name.toLowerCase();
        if (n.includes('str') || n.includes('strength') || n.includes('athletics')) skinType = 'str';
        else if (n.includes('dex') || n.includes('dexterity') || n.includes('acrobatics') || n.includes('sleight') || n.includes('stealth') || n.includes('initiative') || n.includes('เริ่มก่อน')) skinType = 'dex';
        else if (n.includes('con') || n.includes('constitution')) skinType = 'con';
        else if (n.includes('int') || n.includes('intelligence') || n.includes('history') || n.includes('investigation') || n.includes('nature')) skinType = 'int';
        else if (n.includes('wis') || n.includes('wisdom') || n.includes('animal') || n.includes('insight') || n.includes('medicine') || n.includes('perception') || n.includes('survival')) skinType = 'wis';
        else if (n.includes('cha') || n.includes('charisma') || n.includes('deception') || n.includes('intimidation') || n.includes('persuasion')) skinType = 'cha';
    }

    play3DDiceAnimation(rolls, 20, finalIndex, skinType, () => {
        const logEntry = document.createElement('div'); logEntry.className = `log-entry`;
        logEntry.dataset.copytext = `🎲 ทอยเต๋า: ${name.replace(/<[^>]*>?/gm, '')}\nหน้าเต๋า: ${diceShow} ${critPlain}\nModifier: ${modifier >= 0 ? '+'+modifier : modifier}\nTotal: ${total}`;
        logEntry.innerHTML = `<div class="log-header-row"><div style="font-weight:bold;">${name}${modeText}</div><button class="btn-copy-log" onclick="copyLogEntry(this)">📋</button></div><div style="font-size:0.85em; color:var(--text-muted);">เต๋า: ${diceShow} ${critText} <br> Mod: ${modifier >= 0 ? '+'+modifier : modifier}</div><div style="font-size: 1.4em; font-weight: bold; color: var(--bonus-color); margin-top: 5px; text-shadow: 1px 1px 2px #000;">Total: ${total}</div>`;
        document.getElementById('dice-log').prepend(logEntry);
    });
}

function rollDamage(damageStr, wpnName) {
    if (damageStr === '-') return;
    openDicePanelAuto();
    const match = damageStr.match(/(\d+)d(\d+)\s*([+-]\s*\d+)?/i);
    const logEntry = document.createElement('div'); logEntry.className = 'log-entry';

    if (!match) {
        const matchFlat = damageStr.match(/([+-]?\d+)\s*([+-]\s*\d+)?/);
        if(matchFlat) {
            playDiceSound(); 
            const totalFlat = parseInt(matchFlat[1]) + (matchFlat[2] ? parseInt(matchFlat[2].replace(/\s/g,'')) : 0);
            logEntry.dataset.copytext = `⚔️ ${wpnName} Damage\nTotal: ${totalFlat}`;
            logEntry.innerHTML = `<div class="log-header-row"><div style="font-weight:bold;">💥 ${wpnName} Damage</div><button class="btn-copy-log" onclick="copyLogEntry(this)">📋</button></div><div style="font-size: 1.4em; font-weight: bold; color: var(--red-twd-light); text-shadow: 1px 1px 2px #000;">Total: ${totalFlat}</div>`;
            document.getElementById('dice-log').prepend(logEntry);
        }
        return;
    }

    const count = parseInt(match[1]), sides = parseInt(match[2]), mod = match[3] ? parseInt(match[3].replace(/\s/g,'')) : 0;
    let totalDice = 0, rolls = [];
    for(let i=0; i<count; i++) { let r = Math.floor(Math.random() * sides) + 1; rolls.push(r); totalDice += r; }
    const total = totalDice + mod;

    // ทอยเต๋าแบบ Dynamic ตามขนาดอาวุธ พร้อมใส่สกินระเบิด 💥
    play3DDiceAnimation(rolls, sides, 0, 'dmg', () => {
        logEntry.dataset.copytext = `⚔️ ดาเมจ: ${wpnName}\nทอย ${count}d${sides}: [${rolls.join(', ')}]\nMod: ${mod >= 0 ? '+'+mod : mod}\nTotal Damage: ${total}`;
        logEntry.innerHTML = `<div class="log-header-row"><div style="font-weight:bold;">💥 ${wpnName} (Damage)</div><button class="btn-copy-log" onclick="copyLogEntry(this)">📋</button></div><div style="font-size:0.85em; color:var(--text-muted);">ทอย ${count}d${sides}: [${rolls.join(', ')}] <br> Mod: ${mod >= 0 ? '+'+mod : mod}</div><div style="font-size: 1.4em; font-weight: bold; color: var(--red-twd-light); margin-top: 5px; text-shadow: 1px 1px 2px #000;">Total Damage: ${total}</div>`;
        document.getElementById('dice-log').prepend(logEntry);
    });
}

function logAction(title, message) {
    openDicePanelAuto();
    const logEntry = document.createElement('div'); logEntry.className = 'log-entry';
    logEntry.dataset.copytext = `${title}\n${message}`;
    logEntry.innerHTML = `<div class="log-header-row"><div style="font-weight:bold; color:var(--bonus-color);">${title}</div><button class="btn-copy-log" onclick="copyLogEntry(this)">📋</button></div><div style="font-size: 0.9em; margin-top:5px;">${message}</div>`;
    document.getElementById('dice-log').prepend(logEntry);
}

// ผูก Event เพิ่มเติม
document.querySelectorAll('input, select, textarea').forEach(el => {
    el.addEventListener('input', (e) => {
        saveLocalData();
        if (e.target.id !== 'webapp-url' && e.target.id !== 'bgm-url' && e.target.id !== 'custom-img-url') { autoSync(); }
    });
});

abilities.forEach(stat => { document.getElementById(`${stat}-score`).addEventListener('input', updateCalculations); });
document.getElementById('show-all-skills').addEventListener('change', updateCalculations);
document.getElementById('level').addEventListener('input', updateCalculations);
document.getElementById('armor-select').addEventListener('change', updateCalculations);
document.getElementById('shield-check').addEventListener('change', updateCalculations);

document.getElementById('survivor-type').addEventListener('change', (e) => {
    const percIndex = skillsData.findIndex(s => s.name === 'Perception');
    if (currentRace === 'tracker' && percIndex !== -1) { proficiencies.delete(percIndex); document.getElementById(`skill-${percIndex}`).checked = false; }
    currentRace = e.target.value;
    if (currentRace === 'tracker' && percIndex !== -1) { proficiencies.add(percIndex); document.getElementById(`skill-${percIndex}`).checked = true; }
    updateCalculations();
});

document.getElementById('background').addEventListener('change', (e) => {
    if (currentBg !== 'none' && backgroundData[currentBg]) {
        backgroundData[currentBg].skills.forEach(sn => {
            const idx = skillsData.findIndex(s => s.name === sn); if (idx !== -1) { proficiencies.delete(idx); document.getElementById(`skill-${idx}`).checked = false; }
        });
    }
    currentBg = e.target.value;
    if (currentBg !== 'none' && backgroundData[currentBg]) {
        backgroundData[currentBg].skills.forEach(sn => {
            const idx = skillsData.findIndex(s => s.name === sn); if (idx !== -1) { proficiencies.add(idx); document.getElementById(`skill-${idx}`).checked = true; }
        });
    }
    updateCalculations();
});

document.getElementById('role').addEventListener('change', (e) => {
    const roleData = classData[e.target.value];
    for(let i = 0; i < 6; i++) { proficiencies.delete(i); document.getElementById(`skill-${i}`).checked = false; }
    if (roleData) {
        document.getElementById('hit-dice').textContent = roleData.hitDice;
        roleData.saves.forEach(sv => {
            const idx = skillsData.findIndex(s => s.stat === sv && s.isSave);
            if(idx !== -1) { proficiencies.add(idx); document.getElementById(`skill-${idx}`).checked = true; }
        });
        document.getElementById('show-all-skills').checked = false;
    } else {
        document.getElementById('hit-dice').textContent = '-';
        document.getElementById('show-all-skills').checked = true;
    }
    updateCalculations();
});

// เริ่มการทำงานครั้งแรก
initWeapons(); loadUIState(); loadLocalData(); updateCalculations();
