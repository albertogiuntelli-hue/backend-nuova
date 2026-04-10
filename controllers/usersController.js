import fs from "fs";
import path from "path";

const usersFile = path.resolve("data/users.json");

// Assicura che il file esista
function ensureUsersFile() {
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

    // Cerca cliente esistente
    const existingUser = users.find(u => u.telefono === userData.telefono);

    if (existingUser) {
        // Aggiorna i campi se presenti
        existingUser.nome = userData.nome || existingUser.nome;
        existingUser.cognome = userData.cognome || existingUser.cognome;
        existingUser.indirizzo = userData.indirizzo || existingUser.indirizzo;
        existingUser.note = userData.note || existingUser.note;

        fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
        return existingUser;
    }

    // Se non esiste → crealo
    const newUser = {
        id: Date.now().toString(),
        nome: userData.nome || "",
        cognome: userData.cognome || "",
        indirizzo: userData.indirizzo || "",
        telefono: userData.telefono || "",
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
