import fs from "fs";
import path from "path";

// Percorso assoluto e SICURO per Railway + locale
const dataDir = path.resolve("./data");
const usersFile = path.join(dataDir, "users.json");

// Assicura che cartella e file esistano
function ensureUsersFile() {
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    if (!fs.existsSync(usersFile)) {
        fs.writeFileSync(usersFile, JSON.stringify([], null, 2));
    }
}

/* ============================================================
   GET ALL USERS
============================================================ */
export async function getAllUsers() {
    ensureUsersFile();
    const data = fs.readFileSync(usersFile, "utf8");
    return JSON.parse(data);
}

/* ============================================================
   GET USER BY TELEFONO
============================================================ */
export async function getUserByTelefono(telefono) {
    ensureUsersFile();
    const users = JSON.parse(fs.readFileSync(usersFile, "utf8"));
    return users.find(u => u.telefono === telefono) || null;
}

/* ============================================================
   REGISTER OR UPDATE USER
============================================================ */
export async function registerUser(userData) {
    ensureUsersFile();

    let users = JSON.parse(fs.readFileSync(usersFile, "utf8"));

    // Cerca cliente esistente tramite telefono
    const existingUser = users.find(u => u.telefono === userData.telefono);

    if (existingUser) {
        existingUser.nome = userData.nome || existingUser.nome;
        existingUser.cognome = userData.cognome || existingUser.cognome;
        existingUser.indirizzo = userData.indirizzo || existingUser.indirizzo;
        existingUser.note = userData.note || existingUser.note;
        existingUser.email = userData.email || existingUser.email;

        fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
        return existingUser;
    }

    // Nuovo utente
    const newUser = {
        id: Date.now().toString(),
        nome: userData.nome || "",
        cognome: userData.cognome || "",
        indirizzo: userData.indirizzo || "",
        telefono: userData.telefono || "",
        email: userData.email || "",
        note: userData.note || "",
        data_registrazione: new Date().toISOString()
    };

    users.push(newUser);
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

    return newUser;
}

/* ============================================================
   DELETE USER
============================================================ */
export async function deleteUser(id) {
    ensureUsersFile();

    let users = JSON.parse(fs.readFileSync(usersFile, "utf8"));
    users = users.filter(u => u.id !== id);

    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
}
