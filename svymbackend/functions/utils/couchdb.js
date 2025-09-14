// netlify/functions/utils/couchdb.js
const PouchDB = require('pouchdb-node')

// Get CouchDB URL from Netlify environment variables
const COUCHDB_URL = "http://admin:admin@localhost:5984/tech4hope"; 

//process.env.COUCHDB_PROD_URL;
if (!COUCHDB_URL) {
    console.error("ERROR: COUCHDB_PROD_URL environment variable is not set!");
    // In a production scenario, you might want to exit or throw a fatal error
    // For Netlify Functions, a runtime error will occur if not set.
}

const db = new PouchDB(COUCHDB_URL);
// --- CouchDB Design Document and Views ---
// This ensures that the necessary views for querying users exist in your database.
// Netlify Functions will run this on invocation, PouchDB handles conflicts.
const designDoc = {
    _id: '_design/users', // The name of your design document
    views: {
        by_email: {
            map: function(doc) {
                if (doc.email && doc._id.startsWith('SVYM')) { // Only for actual user docs
                    emit(doc.email, null);
                }
            }.toString()
        },
        // We no longer need by_firstLoginPin if we always fetch by _id (userId)
        // and then check the PIN against the retrieved document.
        // The _id itself (SVYMxxxx) is unique and direct access.
        by_userId: { // Explicit view for completeness, though db.get(userId) is direct
             map: function(doc) {
                 if (doc._id && doc._id.startsWith('SVYM')) {
                     emit(doc._id, null);
                 }
             }.toString()
        }
    }
};

const fieldmobiliserdesignDoc = {
    _id: '_design/fieldmobiliser', // The name of your design document
    views: {
        by_email: {
            map: function(doc) {
                if (doc.email && doc._id.startsWith('SVYMFM')) { // Only for actual user docs
                    emit(doc.email, null);
                }
            }.toString()
        },
        // We no longer need by_firstLoginPin if we always fetch by _id (userId)
        // and then check the PIN against the retrieved document.
        // The _id itself (SVYMxxxx) is unique and direct access.
        by_userId: { // Explicit view for completeness, though db.get(userId) is direct
             map: function(doc) {
                 if (doc._id && doc._id.startsWith('SVYMFM')) {
                     emit(doc._id, null);
                 }
             }.toString()
        }
    }
};
// Function to ensure the design document exists
async function ensureDesignDoc() {
    try {
        await db.put(designDoc);
        console.log('Design document "users" ensured/updated successfully.');
    } catch (err) {
        if (err.name === 'conflict') {
            console.log('Design document "users" already exists, no update needed.');
        } else {
            console.error('Error ensuring design document:', err);
            throw new Error(`Failed to ensure CouchDB design document: ${err.message}`);
        }
    }
}

async function fieldmobiliserensureDesignDoc() {
    try {
        await db1.put(fieldmobiliserdesignDoc);
        console.log('Design document "users" ensured/updated successfully.');
    } catch (err) {
        if (err.name === 'conflict') {
            console.log('Design document "users" already exists, no update needed.');
        } else {
            console.error('Error ensuring design document:', err);
            throw new Error(`Failed to ensure CouchDB design document: ${err.message}`);
        }
    }
}

// Function to generate a unique 4-digit number for userId suffix and firstLoginPin
// This is critical for generating unique IDs for new users
async function generateUniqueFiveDigitSuffix(maxAttempts = 100) {
    let suffix;
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < maxAttempts) {
        suffix = Math.floor(10000 + Math.random() * 90000).toString(); // Generate a 5-digit number
        const potentialUserId = `SVYM${suffix}`;

        try {
            // Attempt to get the document. If it throws 404, the ID is unique.
            await db.get(potentialUserId);
            // If we reached here, the document exists, so it's not unique.
        } catch (error) {
            if (error.status === 404) {
                isUnique = true; // Document not found, ID is unique
            } else {
                throw error; // Other database errors should be re-thrown
            }
        }
        attempts++;
    }
    if (!isUnique) {
        throw new Error('Failed to generate unique User ID suffix after multiple attempts.');
    }
    return suffix;
}

async function generateUniqueFiveDigitSuffixdb1(maxAttempts = 100) {
    let suffix;
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < maxAttempts) {
        suffix = Math.floor(10000 + Math.random() * 90000).toString(); // Generate a 5-digit number
        const potentialUserId = `SVYMFM${suffix}`;

        try {
            // Attempt to get the document. If it throws 404, the ID is unique.
            await db1.get(potentialUserId);
            // If we reached here, the document exists, so it's not unique.
        } catch (error) {
            if (error.status === 404) {
                isUnique = true; // Document not found, ID is unique
            } else {
                throw error; // Other database errors should be re-thrown
            }
        }
        attempts++;
    }
    if (!isUnique) {
        throw new Error('Failed to generate unique User ID suffix after multiple attempts.');
    }
    return suffix;
}


module.exports = {
    db,
    ensureDesignDoc,
    fieldmobiliserensureDesignDoc,
    generateUniqueFiveDigitSuffix,
    generateUniqueFiveDigitSuffixdb1
};