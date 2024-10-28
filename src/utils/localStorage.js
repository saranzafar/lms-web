const saveDataToLocalStorage = (key, value) => {
    localStorage.setItem(key, value)
}

const getDataFromLocalStorage = (key) => {
    return localStorage.getItem(key);
}

const clearDataOfLocalStorage = () => {
    localStorage.clear();
}

export {
    saveDataToLocalStorage,
    getDataFromLocalStorage,
    clearDataOfLocalStorage,
}