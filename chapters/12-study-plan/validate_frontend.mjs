import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const source = (await fs.readFile(path.join(root, "project/first-wails/frontend/src/main.js"), "utf8"))
    .replace(/^import .*;\r?\n/gm, "");
const results = [];

async function createHarness(load, save) {
    const ids = ["greet-form", "name", "greet-button", "greeting", "note", "save-button", "note-status", "file-path", "character-count"];
    const elements = Object.fromEntries(ids.map(id => [id, {
        value: "", textContent: "", disabled: id === "note" || id === "save-button", placeholder: "", handlers: {},
        addEventListener(event, callback) { this.handlers[event] = callback; },
        click() {
            if (!this.disabled) this.lastClick = this.handlers.click();
        },
    }]));
    const documentHandlers = {};
    const sandbox = {
        document: {
            getElementById: id => elements[id],
            addEventListener: (event, callback) => { documentHandlers[event] = callback; },
        },
        GreetService: { Greet: async () => { throw new Error("请输入姓名"); } },
        NoteService: { Load: load, Save: save, FilePath: async () => "isolated/note.txt" },
        Promise, Error, String,
    };
    await vm.runInNewContext(source, sandbox, { filename: "main.js" });
    elements.documentHandlers = documentHandlers;
    return elements;
}

let resolveSave;
let rejectSave;
let capturedText;
const elements = await createHarness(async () => "已保存的旧内容", text => {
    capturedText = text;
    return new Promise((resolve, reject) => { resolveSave = resolve; rejectSave = reject; });
});
assert.equal(elements.note.value, "已保存的旧内容");
assert.equal(elements["save-button"].disabled, false);
assert.equal(elements["file-path"].textContent, "isolated/note.txt");
results.push({ case: "initial_load_enables_controls", passed: true });

elements.note.value = "本次点击时的快照";
elements.note.handlers.input();
assert.equal(elements["note-status"].textContent, "有未保存的修改");
const pending = elements["save-button"].handlers.click();
assert.equal(elements["save-button"].disabled, true);
assert.equal(elements["note-status"].textContent, "正在保存");
assert.equal(capturedText, "本次点击时的快照");
elements.note.value = "保存期间继续输入的内容";
elements.note.handlers.input();
resolveSave();
await pending;
assert.equal(elements["note-status"].textContent, "已保存刚才的内容，当前还有新的修改");
assert.equal(elements["save-button"].disabled, false);
results.push({ case: "input_during_pending_save_preserves_dirty_state", passed: true });

const failedSave = elements["save-button"].handlers.click();
rejectSave(new Error("模拟写入失败"));
await failedSave;
assert.equal(elements["note-status"].textContent, "保存失败 模拟写入失败");
assert.equal(elements["save-button"].disabled, false);
elements.note.value = "本次点击时的快照";
elements.note.handlers.input();
assert.equal(elements["note-status"].textContent, "所有修改已保存");
results.push({ case: "save_failure_does_not_advance_saved_snapshot", passed: true });

elements.note.value = "";
const emptySave = elements["save-button"].handlers.click();
assert.equal(capturedText, "");
resolveSave();
await emptySave;
assert.equal(elements["note-status"].textContent, "保存成功");
results.push({ case: "empty_text_save", passed: true });

await elements["greet-form"].handlers.submit({ preventDefault() {} });
assert.equal(elements.greeting.textContent, "请输入姓名");
assert.equal(elements["greet-button"].disabled, false);
results.push({ case: "greeting_rejection_is_displayed", passed: true });

const failedLoad = await createHarness(async () => { throw new Error("模拟读取失败"); }, async () => {});
assert.equal(failedLoad.note.disabled, true);
assert.equal(failedLoad["save-button"].disabled, true);
assert.equal(failedLoad["note-status"].textContent, "加载失败 模拟读取失败");
results.push({ case: "load_failure_keeps_editing_and_saving_disabled", passed: true });

const countElements = await createHarness(async () => "中文", async () => {});
assert.equal(countElements["character-count"].textContent, "字符计数（码点） 2");
results.push({ case: "initial_loaded_count", passed: true });
for (const [value, expected] of [["", 0], ["中文", 2], ["A😀", 2], ["e\u0301", 2], ["第十二章\n快捷键保存", 10]]) {
    countElements.note.value = value;
    countElements.note.handlers.input();
    assert.equal(countElements["character-count"].textContent, `字符计数（码点） ${expected}`);
}
results.push({ case: "input_delete_paste_and_unicode_codepoint_count", passed: true });

function keyEvent(overrides = {}) {
    return {
        key: "s", ctrlKey: false, metaKey: false, altKey: false, shiftKey: false,
        prevented: false,
        preventDefault() { this.prevented = true; },
        ...overrides,
    };
}

const keyboardSaves = [];
let finishKeyboardSave;
const keyboardElements = await createHarness(async () => "原内容", text => {
    keyboardSaves.push(text);
    return new Promise(resolve => { finishKeyboardSave = resolve; });
});
keyboardElements.note.value = "快捷键保存";
const controlSave = keyEvent({ ctrlKey: true });
keyboardElements.documentHandlers.keydown(controlSave);
assert.equal(controlSave.prevented, true);
assert.deepEqual(keyboardSaves, ["快捷键保存"]);
assert.equal(keyboardElements["save-button"].disabled, true);
results.push({ case: "control_s_reuses_existing_click_handler", passed: true });
keyboardElements.documentHandlers.keydown(keyEvent({ ctrlKey: true }));
assert.equal(keyboardSaves.length, 1);
finishKeyboardSave();
await keyboardElements["save-button"].lastClick;
assert.equal(keyboardElements["note-status"].textContent, "保存成功");
results.push({ case: "shortcut_during_pending_save_does_not_duplicate_save", passed: true });

const commandSave = keyEvent({ metaKey: true, key: "S" });
keyboardElements.documentHandlers.keydown(commandSave);
assert.equal(commandSave.prevented, true);
assert.equal(keyboardSaves.length, 2);
finishKeyboardSave();
await keyboardElements["save-button"].lastClick;
results.push({ case: "meta_s_and_uppercase_key_source_check", passed: true });
for (const event of [keyEvent(), keyEvent({ ctrlKey: true, key: "p" }),
    keyEvent({ ctrlKey: true, shiftKey: true }), keyEvent({ ctrlKey: true, altKey: true })]) {
    keyboardElements.documentHandlers.keydown(event);
    assert.equal(event.prevented, false);
}
assert.equal(keyboardSaves.length, 2);
results.push({ case: "unrelated_keys_keep_default_behavior", passed: true });

const disabledKey = keyEvent({ ctrlKey: true });
failedLoad.documentHandlers.keydown(disabledKey);
assert.equal(disabledKey.prevented, true);
assert.equal(failedLoad["save-button"].lastClick, undefined);
results.push({ case: "load_failure_shortcut_skips_disabled_save", passed: true });

const failedShortcut = await createHarness(async () => "原内容", async () => { throw new Error("快捷键写入失败"); });
failedShortcut.documentHandlers.keydown(keyEvent({ ctrlKey: true }));
await failedShortcut["save-button"].lastClick;
assert.equal(failedShortcut["note-status"].textContent, "保存失败 快捷键写入失败");
assert.equal(failedShortcut["save-button"].disabled, false);
results.push({ case: "shortcut_save_failure_is_displayed_and_controls_restore", passed: true });

await fs.writeFile(path.join(root, "frontend-validation.json"), JSON.stringify({
    method: "Source-level Node VM harness with controlled service promises and minimal element mocks",
    cases: results,
}, null, 2), "utf8");
console.log(`Frontend state checks passed, ${results.length} cases`);
