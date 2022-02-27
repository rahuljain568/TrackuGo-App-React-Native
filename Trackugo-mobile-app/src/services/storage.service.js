import AsyncStorage from '@react-native-community/async-storage';

function store(key, value) {
    return AsyncStorage.setItem(key, value);
}

function fetch(key) {
    return AsyncStorage.getItem(key);
}

function clear() {
    return AsyncStorage.clear();
}

function remove(key) {

    if (Array.isArray(key)) {
        return AsyncStorage.multiRemove(key);
    }

    return AsyncStorage.removeItem(key);
}

export default {
    store,
    fetch,
    clear,
    remove
};