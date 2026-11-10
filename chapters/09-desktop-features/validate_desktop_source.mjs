import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const source = (await fs.readFile(path.join(root, "project/first-wails/frontend/src/main.js"), "utf8"))
    .replace(/^import .*;\r?\n/gm, "");
const cases = [];

async function runExample({ listeners = new Map(), emitFails = false, titleFails = false } = {}) {
    const trace = [];
    const errors = [];
    const handlers = {};
    const ids = ["greet-form", "name", "greet-button", "greeting", "note", "save-button", "note-status", "file-path", "clock"];
    const elements = Object.fromEntries(ids.map(id => [id, {
        value: "", textContent: "", disabled: id === "note" || id === "save-button",
        addEventListener() {},
    }]));
    const Events = {
        On(name, callback) {
            trace.push({ action: "subscribe", name });
            const token = Symbol(name);
            listeners.set(token, { name, callback });
            return () => { trace.push({ action: "unsubscribe", name }); listeners.delete(token); };
        },
        Emit(name) {
            trace.push({ action: "emit", name });
            if (emitFails) return Promise.reject(new Error("模拟发送失败"));
            for (const listener of listeners.values()) {
                if (listener.name === "note:time") listener.callback({ data: "10:20:30" });
            }
            return Promise.resolve();
        },
    };
    const Window = {
        SetTitle(title) {
            trace.push({ action: "set_title", title });
            return titleFails ? Promise.reject(new Error("模拟标题失败")) : Promise.resolve();
        },
    };
    await vm.runInNewContext(source, {
        document: { getElementById: id => elements[id] },
        window: { addEventListener: (event, callback) => { handlers[event] = callback; } },
        Events, Window,
        GreetService: { Greet: async () => "你好" },
        NoteService: { Load: async () => "", FilePath: async () => "isolated/note.txt", Save: async () => {} },
        console: { error: error => errors.push(error.message) },
        Promise, Error, String,
    });
    await Promise.resolve();
    return { trace, errors, handlers, elements, listeners };
}

const first = await runExample();
assert.equal(first.trace[0].action, "subscribe");
assert.equal(first.trace[0].name, "note:time");
assert.equal(first.trace[1].action, "emit");
assert.equal(first.trace[1].name, "note:time-request");
cases.push({ case: "subscribe_before_request", passed: true });
assert.equal(first.elements.clock.textContent, "Go 返回的时间 10:20:30");
cases.push({ case: "event_data_updates_clock_text", passed: true });
assert.deepEqual(first.trace[2], { action: "set_title", title: "正在学习 Wails v3" });
cases.push({ case: "current_window_title_api_argument", passed: true });
assert.equal(first.listeners.size, 1);
first.handlers.pagehide();
assert.equal(first.listeners.size, 0);
cases.push({ case: "pagehide_cancels_subscription", passed: true });

const reopened = await runExample({ listeners: first.listeners });
assert.equal(reopened.listeners.size, 1);
reopened.handlers.pagehide();
assert.equal(reopened.listeners.size, 0);
cases.push({ case: "reinitialisation_keeps_one_active_listener", passed: true });

const failedEmit = await runExample({ emitFails: true });
assert.equal(failedEmit.elements.clock.textContent, "模拟发送失败");
cases.push({ case: "emit_rejection_is_displayed", passed: true });
const failedTitle = await runExample({ titleFails: true });
assert.deepEqual(failedTitle.errors, ["模拟标题失败"]);
cases.push({ case: "title_rejection_reaches_error_handler", passed: true });

await fs.writeFile(path.join(root, "frontend-validation.json"), JSON.stringify({
    method: "Actual frontend script evaluated with controlled Events and Window responses and minimal element mocks",
    cases,
}, null, 2), "utf8");
console.log(`Desktop source checks passed, ${cases.length} cases`);
