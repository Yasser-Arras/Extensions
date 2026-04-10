// src/utils.js
export function debounce(fn, ms = 100) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), ms);
    };
}

export function save(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

export function load(key, defaultValue) {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : defaultValue;
}