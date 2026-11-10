import { Greet } from "./greetservice.js";

const nameInput = document.getElementById("name");
const result = document.getElementById("result");
const button = document.getElementById("greet");

button.addEventListener("click", async () => {
    button.disabled = true;
    result.textContent = "正在等待结果…";
    try {
        const message = await Greet(nameInput.value);
        result.textContent = message;
    } catch (error) {
        result.textContent = error.message;
    } finally {
        button.disabled = false;
    }
});
