const dbAdapter = require('../adapters');

const getAll = async (type = null) => {
    // Fetch all sizes from the database
    let sizes = await dbAdapter.sizeAdapter.getAll();

    // If type is provided, filter the results in JavaScript
    if (type) {
        const typesArray = type.split(',').map(t => t.trim()); // Convert "TAIL-A,TAIL-B" to ["TAIL-A", "TAIL-B"]
        sizes = sizes.filter(size => typesArray.includes(size.type));
    }

    // Ensure correct sorting (numeric sorting for sizes)
    sizes.sort((a, b) => {
        const sizeA = a.size.split('/').map(Number); // Convert "20/30" → [20, 30]
        const sizeB = b.size.split('/').map(Number);

        return sizeA[0] - sizeB[0] || sizeA[1] - sizeB[1]; // Sort first by primary size, then secondary
    });

    return sizes;
};

module.exports = {
    getAll,
};
