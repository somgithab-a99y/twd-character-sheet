// ==========================================
// ตั้งค่า Google Apps Script Web App URL ที่นี่
// ==========================================
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzlyJ2ACWlzMI0JhuM5-qi0qwH3soiX-0M6BIjDyY1RKt9h9gSAq_3r9bxwgP00jpKiZg/exec";

// ==========================================
// 1. ข้อมูลระบบและออบเจ็กต์พื้นฐาน
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
    'blue-collar': { stats: { con: 2 }, speed: 25, desc: '<strong>ชนชั้นแรงงาน:</strong> ร่างกายกำยำ<br>• <b>Stats:</b> CON +2<br>• <b>Speed:</b> 25 ft. (ใส่เกราะหนักไม่ลดความเร็ว)<br>• <b>Trait:</b> Advantage ทอยกันพิษ' },
    'tracker': { stats: { dex: 2 }, speed: 30, desc: '<strong>พรานป่า:</strong> ว่องไว<br>• <b>Stats:</b> DEX +2<br>• <b>Speed:</b> 30 ft.<br>• <b>Trait:</b> ชำนาญ Perception' },
    'scrounger': { stats: { dex: 2 }, speed: 25, desc: '<strong>คนร่างเล็ก:</strong> หลบซ่อนเก่ง<br>• <b>Stats:</b> DEX +2<br>• <b>Speed:</b> 25 ft.<br>• <b>Trait:</b> Lucky ทอย 1 ใหม่ได้' },
    'bruiser': { stats: { str: 2, con: 1 }, speed: 30, desc: '<strong>คนร่างยักษ์:</strong> บ้าพลัง<br>• <b>Stats:</b> STR+2, CON+1<br>• <b>Trait:</b> แบกของ x2, ทนความตายได้ 1 ครั้ง' },
    'veteran': { stats: { int: 2, wis: 1 }, speed: 25, desc: '<strong>ผู้อาวุโส:</strong> ประสบการณ์สูง<br>• <b>Stats:</b> INT+2, WIS+1<br>• <b>Trait:</b> Advantage Save จิตใจ' }
};

const classData = {
    'none': { saves: [], hitDice: '-', wpnProf: [], desc: 'โปรดเลือกบทบาทเพื่อดูข้อมูลความชำนาญ' },
    'medic': { saves: ['wis', 'cha'], hitDice: '1d8', wpnProf: ['simple'], desc: '<strong>แพทย์สนาม:</strong><br>• <b>Hit Dice:</b> 1d8<br>• <b>Saves:</b> WIS, CHA' },
    'enforcer': { saves: ['str', 'con'], hitDice: '1d10', wpnProf: ['simple', 'martial'], desc: '<strong>นักสู้:</strong><br>• <b>Hit Dice:</b> 1d10<br>• <b>Saves:</b> STR, CON<br>• <b>Trait:</b> Second Wind, Action Surge' },
    'scavenger': { saves: ['dex', 'int'], hitDice: '1d8', wpnProf: ['simple', 'hand-crossbow', 'longsword'], desc: '<strong>นักลอบเร้น:</strong><br>• <b>Hit Dice:</b> 1d8<br>• <b>Saves:</b> DEX, INT<br>• <b>Trait:</b> Sneak Attack 1d6' },
    'tactician': { saves: ['int', 'wis'], hitDice: '1d6', wpnProf: ['simple', 'light-crossbow'], desc: '<strong>วิศวกร:</strong><br>• <b>Hit Dice:</b> 1d6<br>• <b>Saves:</b> INT, WIS' },
    'berserker': { saves: ['str', 'con'], hitDice: '1d12', wpnProf: ['simple', 'martial'], desc: '<strong>คนบ้าเลือด:</strong><br>• <b>Hit Dice:</b> 1d12<br>• <b>Saves:</b> STR, CON<br>• <b>Trait:</b> Rage (ลดดาเมจถูกตี)' },
    'sniper': { saves: ['str', 'dex'], hitDice: '1d10', wpnProf: ['simple', 'martial'], desc: '<strong>พลซุ่มยิง:</strong><br>• <b>Hit Dice:</b> 1d10<br>• <b>Saves:</b> STR, DEX' },
    'leader': { saves: ['dex', 'cha'], hitDice: '1d8', wpnProf: ['simple'], desc: '<strong>ผู้นำ:</strong><br>• <b>Hit Dice:</b> 1d8<br>• <b>Saves:</b> DEX, CHA<br>• <b>Trait:</b> มอบเต๋าบัฟเพื่อน 1d6' }
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
// 2. การสร้าง UI (อาวุธ & ทักษะ)
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
    row.innerHTML = `
        <input type="checkbox" id="skill-${index}">
        <div class="skill-mod clickable-roll" id="skill-mod-${index}" onclick="rollD20('🎯 ${skill.name}', this.textContent)">+0</div>
        <div class="skill-name">${skill.name} <span class="skill-stat">(${skill.stat})</span></div>`;
    skillsContainer.appendChild(row);
    document.getElementById(`skill-${index}`).addEventListener('change', (e) => {
        e.target.checked ? proficiencies.add(index) : proficiencies.delete(index);
        updateCalculations(); autoSync();
    });
});

// ==========================================
// 3. ระบบคำนวณสเตตัส & สีเลือด & การ์ดรูปภาพ
// ==========================================
function updateHealthVisuals() {
    const current = parseInt(document.getElementById('current-hp').value) || 0;
    const max = parseInt(document.getElementById('max-hp').value) || 1;
    const container = document.getElementById('health-box-container');
    const percent = (current / max) * 100;

    container.className = 'health-box panel-3d'; 
    if (current <= 0) { container.classList.add('health-dead'); } 
    else if (percent >= 70) { container.classList.add('health-high'); } 
    else if (percent >= 35) { container.classList.add('health-med'); } 
    else { container.classList.add('health-low'); }
}

document.getElementById('current-hp').addEventListener('input', updateHealthVisuals);
document.getElementById('max-hp').addEventListener('input', updateHealthVisuals);

// ระบบคำนวณภาพการ์ด (Pollinations AI)
function updateCharacterCard() {
    const typeObj = document.getElementById('survivor-type');
    const roleObj = document.getElementById('role');
    const bgObj = document.getElementById('background');

    // ดึงชื่อภาษาไทยคำแรกมาโชว์
    const typeText = typeObj.value !== 'none' ? typeObj.options[typeObj.selectedIndex].text.split(' ')[0] : 'ผู้รอดชีวิต';
    const roleText = roleObj.value !== 'none' ? roleObj.options[roleObj.selectedIndex].text.split(' ')[0] : 'ไร้บทบาท';
    const bgText = bgObj.value !== 'none' ? bgObj.options[bgObj.selectedIndex].text.split(' ')[0] : 'ไร้ภูมิหลัง';

    const comboTitle = `${typeText} • ${roleText} • ${bgText}`;
    document.getElementById('char-combo-title').textContent = comboTitle;

    const customUrl = document.getElementById('custom-img-url').value.trim();
    const imgEl = document.getElementById('char-portrait');

    if (customUrl) {
        imgEl.src = customUrl; // ถ้าใส่ลิงก์รูปเองก็ให้โชว์รูปนั้น
    } else {
        if (typeObj.value === 'none' && roleObj.value === 'none' && bgObj.value === 'none') {
            imgEl.src = "https://placehold.co/300x400/1a1a1a/ffd700?text=Select+Survivor";
            return;
        }

        // หากไม่ได้ใส่รูปเอง ระบบจะเจเนอเรตรูป TWD ให้ตามคอมโบเป๊ะๆ (126 แบบ)
        const prompt = `A portrait of a post-apocalyptic survivor in The Walking Dead, ${typeObj.value} type, ${roleObj.value} role, ${bgObj.value} background, gritty dark comic style, highly detailed`;
        const encodedPrompt = encodeURIComponent(prompt);
        
        // สร้างรหัส Seed เฉพาะตัว เพื่อให้กลับมาใช้คอมโบเดิมแล้วได้รูปเดิมเสมอ
        const seedString = typeObj.value + roleObj.value + bgObj.value;
        let hash = 0;
        for (let i = 0; i < seedString.length; i++) hash = Math.imul(31, hash) + seedString.charCodeAt(i) | 0;
        
        imgEl.src = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=300&height=400&nologo=true&seed=${Math.abs(hash)}`;
    }
}

document.getElementById('custom-img-url').addEventListener('input', updateCharacterCard);

function updateCalculations() {
    const level = parseInt(document.getElementById('level').value) || 1;
    const profBonus = Math.ceil(level / 4) + 1;
    document.getElementById('prof-bonus').textContent = `+${profBonus}`;

    const role = document.getElementById('role').value;
    const currentRole = classData[role] || classData['none'];
    const race = document.getElementById('survivor-type').value;
    const currentRaceData = raceBonuses[race] || raceBonuses['none'];
    const bgKey = document.getElementById('background').value;
    const currentBgData = backgroundData[bgKey] || backgroundData['none'];
    
    document.getElementById('trait-description').innerHTML = currentRaceData.desc;
    document.getElementById('role-description').innerHTML = currentRole.desc;
    document.getElementById('bg-description').innerHTML = currentBgData.desc;

    let baseSpeed = currentRaceData.speed;
    const modifiers = {};
    let totalStr = 10;

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

    const armorKey = document.getElementById('armor-select').value;
    const armor = armorData[armorKey];
    const hasShield = document.getElementById('shield-check').checked;
    
    let ac = armor.baseAc;
    let dexBonus = modifiers['dex'];
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

    [1, 2, 3].forEach(slotId => {
        const wpnKey = document.getElementById(`wpn-select-${slotId}`).value;
        const wpn = weaponData[wpnKey];
        const customName = document.getElementById(`wpn-name-${slotId}`).value.trim();
        const displayWpnName = customName ? `${customName} (${wpn.name})` : wpn.name;

        let ammoType = '';
        if (wpnKey === 'light-crossbow') ammoType = 'bolt';
        else if (wpnKey === 'hand-crossbow') ammoType = 'pistol';
        else if (wpnKey === 'heavy-crossbow') ammoType = 'heavy';

        let isProficient = (currentRole.wpnProf.includes(wpn.type) || currentRole.wpnProf.includes(wpnKey));
        let atkMod = 0;
        if (wpn.stat === 'str') atkMod = modifiers['str'];
        else if (wpn.stat === 'dex') atkMod = modifiers['dex'];
        else if (wpn.stat === 'finesse') atkMod = Math.max(modifiers['str'], modifiers['dex']);

        let totalAtk = atkMod + (isProficient ? profBonus : 0);
        let atkStr = (totalAtk >= 0 ? '+' : '') + totalAtk;
        let dmgModStr = (atkMod !== 0) ? ((atkMod > 0 ? '+' : '') + atkMod) : '';
        let finalDmgStr = wpnKey === 'none' ? `${1 + atkMod} ${wpn.dmgType}` : `${wpn.damage}${dmgModStr} ${wpn.dmgType}`;
        
        document.getElementById(`wpn-atk-${slotId}`).textContent = atkStr;
        document.getElementById(`wpn-atk-${slotId}`).onclick = () => rollAttack(displayWpnName, atkStr, ammoType);
        document.getElementById(`wpn-dmg-${slotId}`).textContent = finalDmgStr;
        document.getElementById(`wpn-dmg-${slotId}`).onclick = () => rollDamage(finalDmgStr, displayWpnName);
        document.getElementById(`wpn-prop-${slotId}`).textContent = wpn.props;
    });

    updateHealthVisuals();
    updateCharacterCard(); // เรียกอัปเดตการ์ดภาพเสมอ
}

// ====================================================
// 4. ระบบเซฟข้อมูลลงเครื่อง (ป้องกันโหมดส่วนตัว Private Mode)
// ====================================================
const LOCAL_STORAGE_KEY = 'twd_rpg_char_data';

function saveLocalData() {
    try {
        const elements = document.querySelectorAll('input, select, textarea');
        const data = {};
        elements.forEach(el => {
            if (el.id) data[el.id] = (el.type === 'checkbox' || el.type === 'radio') ? el.checked : el.value;
        });
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        console.warn("Local Storage ถูกจำกัด");
    }
}

function loadLocalData() {
    try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
            const data = JSON.parse(saved);
            for (const key in data) {
                const el = document.getElementById(key);
                if (el) {
                    if (el.type === 'checkbox' || el.type === 'radio') el.checked = data[key];
                    else el.value = data[key];
                }
            }
            proficiencies.clear();
            skillsData.forEach((skill, index) => {
                if (document.getElementById(`skill-${index}`).checked) proficiencies.add(index);
            });
            updateCalculations();
        }
    } catch (e) {}
}

function resetLocalData() {
    if (confirm("⚠️ ต้องการล้างข้อมูลทั้งหมด และเริ่มใหม่ใช่หรือไม่?")) {
        try { localStorage.removeItem(LOCAL_STORAGE_KEY); } catch (e) {}
        location.reload(); 
    }
}

// ====================================================
// 5. ระบบซิงก์ข้อมูลไป Google Docs
// ====================================================
let syncTimer = null;

function getCharacterDataText() {
    const name = document.getElementById('char-name').value || 'ไม่ระบุชื่อ';
    const typeObj = document.getElementById('survivor-type');
    const type = typeObj.options[typeObj.selectedIndex].text;
    const roleObj = document.getElementById('role');
    const role = roleObj.options[roleObj.selectedIndex].text;
    const bgObj = document.getElementById('background');
    const bg = bgObj.value !== 'none' ? bgObj.options[bgObj.selectedIndex].text : '-';
    const level = document.getElementById('level').value;

    let text = `=== THE WALKING DEAD RPG: CHARACTER SHEET ===\n`;
    text += `ชื่อตัวละคร: ${name}\nประเภท: ${type} | บทบาท: ${role} | เลเวล: ${level}\nภูมิหลัง: ${bg}\n`;
    
    // ดึง URL ภาพที่ผู้เล่นใช้ (ถ้ามี) ส่งเข้า Docs ด้วย
    const customImg = document.getElementById('custom-img-url').value;
    if(customImg) text += `รูปตัวละคร: ${customImg}\n`;

    text += `---------------------------------------------\n`;
    
    const currentHp = document.getElementById('current-hp').value;
    const maxHp = document.getElementById('max-hp').value;
    const ac = document.getElementById('ac-display').textContent;
    const speed = document.getElementById('speed').textContent;
    const init = document.getElementById('initiative').textContent;

    text += `[สถานะการต่อสู้]\nHP: ${currentHp} / ${maxHp} | AC: ${ac} | Speed: ${speed} | Initiative: ${init}\n`;
    text += `---------------------------------------------\n`;

    text += `[ค่าความสามารถ]\n`;
    abilities.forEach(stat => {
        const total = document.getElementById(`${stat}-total`).textContent;
        const mod = document.getElementById(`${stat}-mod`).textContent;
        text += `${stat.toUpperCase()}: ${total} (${mod})\n`;
    });
    text += `---------------------------------------------\n`;

    text += `[ความชำนาญ Skills]\n`;
    skillsData.forEach((skill, index) => {
        if (document.getElementById(`skill-${index}`).checked) {
            const mod = document.getElementById(`skill-mod-${index}`).textContent;
            text += `★ ${skill.name} ${mod}\n`;
        }
    });
    text += `---------------------------------------------\n`;

    const armorObj = document.getElementById('armor-select');
    const armor = armorObj.options[armorObj.selectedIndex].text;
    const shield = document.getElementById('shield-check').checked ? 'ถือโล่ (+2 AC)' : 'ไม่ถือโล่';
    text += `[ชุดเกราะ]\nเกราะ: ${armor} | โล่: ${shield}\n---------------------------------------------\n`;

    text += `[อาวุธ]\n`;
    [1, 2, 3].forEach(id => {
        const wpnObj = document.getElementById(`wpn-select-${id}`);
        if (wpnObj.value !== 'none' || id === 1) { 
            const name = document.getElementById(`wpn-name-${id}`).value || wpnObj.options[wpnObj.selectedIndex].text;
            text += `Slot ${id}: ${name} | ATK: ${document.getElementById(`wpn-atk-${id}`).textContent} | DMG: ${document.getElementById(`wpn-dmg-${id}`).textContent}\n`;
        }
    });
    text += `---------------------------------------------\n`;

    text += `[กระสุน]\nลูกหน้าไม้: ${document.getElementById('ammo-bolt').value} | ปืนพก: ${document.getElementById('ammo-pistol').value} | ไรเฟิล: ${document.getElementById('ammo-heavy').value}\n---------------------------------------------\n`;
    text += `[ยุทธวิธี]\n${document.getElementById('tactics-text').value || '-'}\n\n[ช่องเก็บของ]\n${document.getElementById('inventory-text').value || '-'}\n=============================================`;
    return text;
}

function autoSync() {
    saveLocalData();
    const currentUrl = document.getElementById('webapp-url').value.trim() || WEB_APP_URL;
    if (currentUrl === "วาง_WEB_APP_URL_ของคุณตรงนี้" || currentUrl === "") return;

    const btn = document.getElementById('btn-sync');
    btn.innerHTML = '⏳ รออัปเดต...';
    clearTimeout(syncTimer);
    syncTimer = setTimeout(() => { executeSync(currentUrl); }, 2000); 
}

function manualSync() {
    saveLocalData();
    const currentUrl = document.getElementById('webapp-url').value.trim() || WEB_APP_URL;
    if (currentUrl === "" || currentUrl.includes("วาง_WEB_APP")) return alert("⚠️ โปรดใส่ Web App URL ก่อนครับ");
    clearTimeout(syncTimer);
    executeSync(currentUrl);
}

function executeSync(appUrl) {
    const btn = document.getElementById('btn-sync');
    const originalText = '☁️ ซิงก์ (Docs)';
    btn.innerHTML = '⏳ กำลังซิงก์...'; btn.disabled = true;

    fetch(appUrl, {
        method: "POST", mode: "no-cors",
        body: JSON.stringify({ characterData: getCharacterDataText() }),
        headers: { "Content-Type": "text/plain;charset=utf-8" }
    })
    .then(() => {
        btn.innerHTML = '✅ สำเร็จ!'; 
        setTimeout(() => { btn.innerHTML = originalText; btn.disabled = false; }, 2000);
    })
    .catch(error => {
        btn.innerHTML = '❌ ล้มเหลว'; 
        setTimeout(() => { btn.innerHTML = originalText; btn.disabled = false; }, 2000);
    });
}

function copyCharacterData() { copyTextToClipboard(getCharacterDataText(), '📋 คัดลอกข้อมูลตัวละครสำเร็จ!'); }

function copyTextToClipboard(text, msg) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => { if(msg) alert(msg); }).catch(() => {});
    }
}
function copyLogEntry(btnElement) {
    event.stopPropagation();
    const textToCopy = btnElement.closest('.log-entry').dataset.copytext;
    if(textToCopy) copyTextToClipboard(textToCopy, '📋 คัดลอกผลลัพธ์ลงคลิปบอร์ดแล้ว!');
}

// ====================================================
// 6. ระบบ YouTube BGM พื้นหลัง (Safari/iOS Fix)
// ====================================================
let isBgmPlaying = false;
function extractVideoID(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}
function toggleBGM() {
    const urlInput = document.getElementById('bgm-url').value.trim();
    const btn = document.getElementById('btn-bgm');
    const container = document.getElementById('yt-bgm-container');

    if (isBgmPlaying) {
        container.innerHTML = '';
        btn.innerHTML = '▶️ Play'; btn.classList.remove('btn-bgm-playing');
        isBgmPlaying = false;
    } else {
        const videoId = extractVideoID(urlInput);
        if (!videoId) return alert("⚠️ ไม่พบ ID วิดีโอ กรุณาตรวจสอบลิงก์ YouTube อีกครั้ง");
        container.innerHTML = `<iframe width="200" height="200" src="https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}&playsinline=1" frameborder="0" allow="autoplay; encrypted-media"></iframe>`;
        btn.innerHTML = '⏹️ Stop'; btn.classList.add('btn-bgm-playing');
        isBgmPlaying = true;
    }
}

// ====================================================
// 7. ระบบแอคชั่น, การพักผ่อน และทอยเต๋า 3D
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
        if (val <= 0) return alert(`กระสุนหมด! โจมตีด้วย ${name} ไม่ได้`);
        input.value = val - 1;
        logAction("⚠️ ใช้กระสุน", `ยิง ${name} (เหลือกระสุน ${input.value} นัด)`);
        autoSync();
    }
    rollD20(`⚔️ โจมตี: ${name}`, modStr);
}

function shortRest() { alert("พักสั้น: ใช้ Hit Dice ฟื้น HP ได้"); autoSync(); }
function longRest() { 
    document.getElementById('current-hp').value = document.getElementById('max-hp').value; 
    resetDeathSaves(); updateHealthVisuals(); alert("พักยาว: ฟื้นฟู HP กลับมาเต็ม"); autoSync(); 
}

function rollDeathSave() {
    const roll = Math.floor(Math.random() * 20) + 1;
    play3DDiceAnimation([roll], 0, () => {
        const logEntry = document.createElement('div'); logEntry.className = 'log-entry';
        let resultText = '', plainText = '';
        if (roll >= 10) { resultText = `<span class="text-success">รอด (Success)</span>`; plainText = 'รอด'; addDeathSaveMark('success'); } 
        else { resultText = `<span class="text-danger">ตาย (Failure)</span>`; plainText = 'ตาย'; addDeathSaveMark('failure'); }
        logEntry.dataset.copytext = `💀 ท้าความตาย\nทอยได้: ${roll}\nผลลัพธ์: ${plainText}`;
        logEntry.innerHTML = `<div class="log-header-row"><div style="font-weight:bold;">💀 ท้าความตาย (Death Save)</div><button class="btn-copy-log" onclick="copyLogEntry(this)">📋</button></div><div style="font-size: 1.1em; margin-top:5px;">ทอยได้ <b>${roll}</b> ➔ ${resultText}</div>`;
        document.getElementById('dice-log').prepend(logEntry);
        if (document.getElementById('dice-panel-content').style.display === 'none') toggleDicePanel();
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

function toggleDicePanel() {
    const p = document.getElementById('dice-panel-content');
    p.style.display = p.style.display === 'none' ? 'flex' : 'none';
}
function clearDiceLog() { document.getElementById('dice-log').innerHTML = ''; }

function logAction(title, message) {
    const logEntry = document.createElement('div'); logEntry.className = 'log-entry';
    logEntry.dataset.copytext = `${title}\n${message}`;
    logEntry.innerHTML = `<div class="log-header-row"><div style="font-weight:bold; color:var(--bonus-color);">${title}</div><button class="btn-copy-log" onclick="copyLogEntry(this)">📋</button></div><div style="font-size: 0.9em; margin-top:5px;">${message}</div>`;
    document.getElementById('dice-log').prepend(logEntry);
    if (document.getElementById('dice-panel-content').style.display === 'none') toggleDicePanel();
}

// ----------------------------------------------------
// ระบบเสียงเต๋าและลูกเต๋า 3D
// ----------------------------------------------------
let audioCtx = null;
function playDiceSound() {
    const type = document.getElementById('dice-sound-select').value;
    if (type === 'none') return;
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

document.getElementById('dice-color-select').addEventListener('change', (e) => {
    document.documentElement.style.setProperty('--dice-hue', `${e.target.value}deg`);
});

function play3DDiceAnimation(rolls, finalIndex, callback) {
    playDiceSound(); 
    const overlay = document.getElementById('dice-3d-overlay');
    const w1 = document.getElementById('dice-wrapper-1'); const r1 = document.getElementById('dice-result-1');
    const w2 = document.getElementById('dice-wrapper-2'); const r2 = document.getElementById('dice-result-2');

    overlay.classList.remove('hidden-overlay');
    w1.style.animation = 'none'; r1.style.animation = 'none'; r1.style.opacity = '0'; r1.className = 'dice-result-text';
    r1.textContent = rolls[0];

    if (rolls.length > 1) {
        w2.style.display = 'block';
        w2.style.animation = 'none'; r2.style.animation = 'none'; r2.style.opacity = '0'; r2.className = 'dice-result-text';
        r2.textContent = rolls[1];
        if (finalIndex === 0) { r1.classList.add('adv-highlight'); r2.classList.add('dis-highlight'); } 
        else { r2.classList.add('adv-highlight'); r1.classList.add('dis-highlight'); }
    } else { w2.style.display = 'none'; }

    void overlay.offsetWidth;
    w1.style.animation = 'tumbling 1.2s cubic-bezier(0.1, 0.8, 0.2, 1) forwards';
    if (rolls.length > 1) w2.style.animation = 'tumbling-delay 1.3s cubic-bezier(0.1, 0.8, 0.2, 1) forwards';

    setTimeout(() => {
        r1.style.animation = 'popNumber 0.4s ease-out forwards';
        if (rolls.length > 1) { r2.style.animation = 'popNumber 0.4s ease-out forwards'; setTimeout(() => { playDiceSound(); }, 200); }
        setTimeout(() => { overlay.classList.add('hidden-overlay'); if(callback) callback(); }, 1500);
    }, 1100);
}

function rollD20(name, modifierStr) {
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
    play3DDiceAnimation(rolls, finalIndex, () => {
        const logEntry = document.createElement('div'); logEntry.className = `log-entry`;
        logEntry.dataset.copytext = `🎲 ทอยเต๋า: ${name.replace(/<[^>]*>?/gm, '')}\nหน้าเต๋า: ${diceShow} ${critPlain}\nModifier: ${modifier >= 0 ? '+'+modifier : modifier}\nTotal: ${total}`;
        logEntry.innerHTML = `<div class="log-header-row"><div style="font-weight:bold;">${name}${modeText}</div><button class="btn-copy-log" onclick="copyLogEntry(this)">📋</button></div><div style="font-size:0.85em; color:var(--text-muted);">เต๋า: ${diceShow} ${critText} <br> Mod: ${modifier >= 0 ? '+'+modifier : modifier}</div><div style="font-size: 1.4em; font-weight: bold; color: var(--bonus-color); margin-top: 5px; text-shadow: 1px 1px 2px #000;">Total: ${total}</div>`;
        document.getElementById('dice-log').prepend(logEntry);
        if (document.getElementById('dice-panel-content').style.display === 'none') toggleDicePanel();
    });
}

function rollDamage(damageStr, wpnName) {
    if (damageStr === '-') return;
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

    play3DDiceAnimation([rolls[0]], 0, () => {
        logEntry.dataset.copytext = `⚔️ ดาเมจ: ${wpnName}\nทอย ${count}d${sides}: [${rolls.join(', ')}]\nMod: ${mod >= 0 ? '+'+mod : mod}\nTotal Damage: ${total}`;
        logEntry.innerHTML = `<div class="log-header-row"><div style="font-weight:bold;">💥 ${wpnName} (Damage)</div><button class="btn-copy-log" onclick="copyLogEntry(this)">📋</button></div><div style="font-size:0.85em; color:var(--text-muted);">ทอย ${count}d${sides}: [${rolls.join(', ')}] <br> Mod: ${mod >= 0 ? '+'+mod : mod}</div><div style="font-size: 1.4em; font-weight: bold; color: var(--red-twd-light); margin-top: 5px; text-shadow: 1px 1px 2px #000;">Total Damage: ${total}</div>`;
        document.getElementById('dice-log').prepend(logEntry);
        if (document.getElementById('dice-panel-content').style.display === 'none') toggleDicePanel();
    });
}

// ====================================================
// 8. Event Listener ควบคุมทุกการกระทำ
// ====================================================
document.querySelectorAll('input, select, textarea').forEach(el => {
    el.addEventListener('input', (e) => {
        saveLocalData();
        if (e.target.id !== 'webapp-url' && e.target.id !== 'bgm-url' && e.target.id !== 'custom-img-url') {
            autoSync();
        }
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
initWeapons();
loadLocalData(); 
updateCalculations();
