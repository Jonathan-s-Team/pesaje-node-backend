const dbAdapter = require('../adapters');

const getAll = async (type = null) => {
    // Fetch all sizes from the database
    let sizes = await dbAdapter.sizeAdapter.getAll();

    // If type is provided, filter the results in JavaScript
    if (type) {
        const typesArray = type.split(',').map(t => t.trim()); // Convert "TAIL-A,TAIL-B" to ["TAIL-A", "TAIL-B"]
        sizes = sizes.filter(size => typesArray.includes(size.type));
    }

    // Improved sorting: numeric sizes first, non-numeric at the end
    sizes.sort((a, b) => {
        const sizeA = a.size.split('/').map(Number);
        const sizeB = b.size.split('/').map(Number);
        const isNumA = sizeA.every(n => !isNaN(n));
        const isNumB = sizeB.every(n => !isNaN(n));

        if (isNumA && isNumB) {
            return sizeA[0] - sizeB[0] || sizeA[1] - sizeB[1];
        }
        if (isNumA) return -1;
        if (isNumB) return 1;
        // Both are not numbers, keep original order or sort alphabetically if you want
        return 0;
    });

    return sizes;
};

module.exports = {
    getAll,
};
