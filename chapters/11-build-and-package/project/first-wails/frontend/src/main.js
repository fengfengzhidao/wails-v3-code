import "@wailsio/runtime";
import { GreetService, NoteService } from "../bindings/example.com/learn/first-wails/index.js";

const greetForm = document.getElementById("greet-form");
const nameInput = document.getElementById("name");
const greetButton = document.getElementById("greet-button");
const greeting = document.getElementById("greeting");
const noteInput = document.getElementById("note");
const saveButton = document.getElementById("save-button");
console.log("开始绑定保存按钮", saveButton);
const noteStatus = document.getElementById("note-status");
const filePath = document.getElementById("file-path");

let savedText = "";

function describeError(error) {
    return error instanceof Error ? error.message : String(error);
}

greetForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    greetButton.disabled = true;

    try {
        greeting.textContent = await GreetService.Greet(nameInput.value);
    } catch (error) {
        greeting.textContent = describeError(error);
    } finally {
        greetButton.disabled = false;
    }
});

noteInput.addEventListener("input", () => {
    noteStatus.textContent = noteInput.value === savedText
        ? "所有修改已保存"
        : "有未保存的修改";
});

saveButton.addEventListener("click", async () => {
    const textToSave = noteInput.value;
    saveButton.disabled = true;
    noteStatus.textContent = "正在保存";

    try {
        await NoteService.Save(textToSave);
        savedText = textToSave;
        noteStatus.textContent = noteInput.value === savedText
            ? "保存成功"
            : "已保存刚才的内容，当前还有新的修改";
    } catch (error) {
        noteStatus.textContent = `保存失败 ${describeError(error)}`;
    } finally {
        saveButton.disabled = false;
    }
});

async function initialise() {
    try {
        const [text, path] = await Promise.all([
            NoteService.Load(),
            NoteService.FilePath(),
        ]);

        noteInput.value = text;
        savedText = text;
        filePath.textContent = path;
        noteInput.placeholder = "写下今天想记住的内容";
        noteInput.disabled = false;
        saveButton.disabled = false;
        noteStatus.textContent = "读取完成";
    } catch (error) {
        noteStatus.textContent = `加载失败 ${describeError(error)}`;
    }
}

initialise();
