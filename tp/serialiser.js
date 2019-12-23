const serialise = unordered => {
    const ordered = {};
    Object.keys(unordered)
        .sort()
        .forEach(function(key) {
            ordered[key] = unordered[key];
        });
    return JSON.stringify(ordered);
};

module.exports = serialise;
