import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const bindingRoot = path.join(root, "project/first-wails/frontend/bindings/example.com/learn/first-wails");
const sources = {};
const methods = new Map();
const pending = new Map();
const trace = [];
const cases = [];

for (const file of ["greetservice.js", "noteservice.js"]) {
    const source = await fs.readFile(path.join(bindingRoot, file), "utf8");
    sources[file] = source;
    for (const match of source.matchAll(/export function (\w+)\([^)]*\) \{\s*return \$Call.ByID\((\d+)/g)) {
        methods.set(Number(match[2]), match[1]);
    }
}
assert.equal(methods.size, 4);
assert.match(sources["greetservice.js"], /CancellablePromise<string>/);
assert.match(sources["noteservice.js"], /CancellablePromise<void>/);

const runtimeStub = {
    ByID(id, ...args) {
        const method = methods.get(id);
        assert.ok(method, "Generated binding must route to a known method");
        trace.push({ event: "binding_call", method, args });
        if (pending.has(method)) return pending.get(method).promise;
        if (method === "Load") return Promise.resolve("上次保存的内容");
        if (method === "FilePath") return Promise.resolve("isolated/note.txt");
        throw new Error("No response prepared for " + method);
    },
};

function loadBinding(source, names) {
    const body = source.replace(/^import .*;\r?\n/gm, "").replace(/^export function /gm, "function ");
    return vm.runInNewContext(body + "\n;({" + names.join(",") + "})", { $Call: runtimeStub });
}

function responseFor(method) {
    let resolve;
    let reject;
    const promise = new Promise((success, failure) => { resolve = success; reject = failure; });
    const response = { promise, resolve, reject };
    pending.set(method, response);
    return response;
}

const GreetService = loadBinding(sources["greetservice.js"], ["Greet"]);
const NoteService = loadBinding(sources["noteservice.js"], ["Load", "Save", "FilePath"]);
const ids = ["greet-form", "name", "greet-button", "greeting", "note", "save-button", "note-status", "file-path"];
const elements = Object.fromEntries(ids.map(id => [id, {
    value: "", textContent: "", disabled: id === "note" || id === "save-button", handlers: {},
    addEventListener(event, callback) { this.handlers[event] = callback; },
}]));
const frontend = (await fs.readFile(path.join(root, "project/first-wails/frontend/src/main.js"), "utf8"))
    .replace(/^import .*;\r?\n/gm, "");
await vm.runInNewContext(frontend, {
    document: { getElementById: id => elements[id] }, GreetService, NoteService, Promise, Error, String,
});
assert.equal(elements.note.value, "上次保存的内容");
assert.deepEqual(trace.map(item => item.method), ["Load", "FilePath"]);
cases.push({ case: "initialisation_routes_through_generated_bindings", passed: true });

trace.length = 0;
elements.name.value = "小明";
const greeting = responseFor("Greet");
const submitted = elements["greet-form"].handlers.submit({
    preventDefault() { trace.push({ event: "prevent_default" }); },
});
assert.equal(elements["greet-button"].disabled, true);
assert.equal(elements.greeting.textContent, "");
assert.equal(trace[0].event, "prevent_default");
assert.equal(trace[1].method, "Greet");
assert.equal(trace[1].args[0], "小明");
greeting.resolve("你好，小明！欢迎学习 Wails v3。");
await submitted;
assert.equal(elements.greeting.textContent, "你好，小明！欢迎学习 Wails v3。");
assert.equal(elements["greet-button"].disabled, false);
cases.push({ case: "submit_parameter_await_and_success_update", passed: true, trace: [...trace] });

elements.name.value = "   ";
const errorResponse = responseFor("Greet");
const rejected = elements["greet-form"].handlers.submit({ preventDefault() {} });
errorResponse.reject(new Error("请输入姓名"));
await rejected;
assert.equal(elements.greeting.textContent, "请输入姓名");
assert.equal(elements["greet-button"].disabled, false);
cases.push({ case: "rejected_promise_enters_catch_and_finally", passed: true });

trace.length = 0;
elements.note.value = "本次点击的保存快照";
const saveResponse = responseFor("Save");
const saving = elements["save-button"].handlers.click();
assert.equal(elements["save-button"].disabled, true);
assert.equal(elements["note-status"].textContent, "正在保存");
assert.equal(trace[0].method, "Save");
assert.equal(trace[0].args[0], "本次点击的保存快照");
saveResponse.resolve(undefined);
await saving;
assert.equal(elements["note-status"].textContent, "保存成功");
assert.equal(elements["save-button"].disabled, false);
cases.push({ case: "save_void_completion_then_frontend_status", passed: true, trace: [...trace] });

elements.note.value = "还没有保存的新内容";
const failedSaveResponse = responseFor("Save");
const failedSave = elements["save-button"].handlers.click();
failedSaveResponse.reject(new Error("创建临时文件失败"));
await failedSave;
assert.equal(elements["note-status"].textContent, "保存失败 创建临时文件失败");
assert.equal(elements["save-button"].disabled, false);
cases.push({ case: "save_error_updates_message_and_restores_button", passed: true });

const model = spawnSync("go", ["run", "."], {
    cwd: path.join(root, "examples/note-model"), encoding: "utf8",
});
assert.equal(model.status, 0, model.stderr);
const note = JSON.parse(model.stdout);
assert.equal(note.title, "学习笔记");
assert.equal(note.content, "今天读懂调用过程。");
assert.deepEqual(Object.keys(note), ["title", "content"]);
await fs.writeFile(path.join(root, "examples/note-model/note.json"), model.stdout, "utf8");
cases.push({ case: "go_json_tags_to_javascript_field_names", passed: true, note });

await fs.writeFile(path.join(root, "call-flow-validation.json"), JSON.stringify({
    method: "Actual frontend handlers and generated binding functions evaluated with controlled runtime responses and element mocks. Go JSON model executed separately.",
    runtime_transport_review: "Controlled runtime responses validate generated call routing, async handlers and view updates at source level.",
    generated_methods: Object.fromEntries(methods), cases,
}, null, 2), "utf8");
console.log(`Call-flow checks passed, ${cases.length} cases`);
