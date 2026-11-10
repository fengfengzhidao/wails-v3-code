// 本地异步模拟，用于练习 Promise。问候由 JavaScript 生成。
export function Greet(name) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const trimmedName = name.trim();
            if (trimmedName === "") {
                reject(new Error("请输入姓名"));
                return;
            }
            resolve(`你好，${trimmedName}`);
        }, 600);
    });
}
