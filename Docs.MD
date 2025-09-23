## Partecipanti:
- Mattia Iaria
- Sara --
- Elena --

## Suddivisione progetto
- Mattia Iaria:
	- Architettura di Selfie
	- Gestione degli Account
	- Gestione dei "Progetti"
	- Gestione delle Notifiche (Notification API e E-Mail)
	- Autenticazione delle API 
	- TimeMachine
- Sara:
- Elena:

---
# Selfie Backend

## Librerie principali:
1. Node.js
2. nodemailer
3. jsonwebtoken
4. bcrypt
5. mongodb
6. multer

## Introduzione
Il back end è stato sviluppato interamente in node.js.  
Abbiamo utilizzato il pattern MVC cercando di mantenere il codice più chiaro possibile, suddividendolo in livelli:
- Model
- DAO (Data Access Object - Repository)
- Manager (o service)
- Controller

Tutte le API sensibili del servizio sono protette da un JWT che generiamo dinamicamente al login.  

Come DB abbiamo usato mongoDB, abbiamo astratto la definizione di repository così da suddividere il codice a livelli delegando correttamente la responsabilità delle singole operazioni ai livelli più adatti.


## Architettura
### Middlewares
Tutti gli endpoint sono esposti nel file index.ts ed abbiamo applicato il concetto di middleware di node.js.
Come middleware valutati prima di ogni richiesta abbiamo:
- CORS
- JSON body parser di express
- Middleware custom per loggare le richieste

Invece come middleware finale abbiamo un error handler che cattura un eventuale eccezione lanciata dal server. Il motivo della scelta è la centralizzazione della gestione degli errori.

Ogni endpoint chiama il suo specifico Manager dove verrà svolta tutta la logica di business, ma per accedere ai dati sul DB dovrà interfacciarsi con il DAO.

### JSON Web Token
tutte le API sono protette da un JWT per garantire la sicurezza degli endpoint esposti.
Il JWT verrà generato nel momento in cui avviene il login ed ha una scadenza di 10 ore.

Il passaggio del token tra back end e front end avviene tramite l'header Authorizazion ed utilizziamo lo standard Bearer.
### Sicurezza degli account
Per proteggere gli account creati nel sito web cri  le password utilizzando la libreria bcrypt.js (una particolare libreria di bcrypt scritta in javascript).
Questa è una cifratura a doppia chiave, una pubblica ed una segreta.
###### fonte: https://it.wikipedia.org/wiki/Bcrypt

---
## Endpoints

### 👤 Users

#### GET `/users/:userid`

Recupera i dati di un utente.  
**Auth**: JWT richiesto.
**userID** : ID dell'utente
**Risposta**: 200 -- Empty
```json
{
	"firstName": "string",
	"lastName": "string",
	"birthDate": "Date",
	"email": "string",
	"username": "string",
	"phoneNumber": "string",
}
```
#### DELETE `/users/:userid`

Elimina un utente.  
**Auth**: JWT richiesto.
**userID** : ID dell'utente
**Risposta**: 200 -- Empty
#### POST `/register`

Registra un nuovo utente.  
**Auth**: Pubblica.
**Body**:
```json
{
	"firstName": "string",
	"lastName": "string",
	"birthDate": "Date",
	"email": "string",
	"username": "string",
	"phoneNumber": "string",
	"password": "string"
}
```
**Risposta**: 200 -- Empty

#### POST `/login`

Effettua il login e restituisce un token JWT.  
**Auth**: Pubblica
**Body**:
```json
{
	"userID": "string",
	"password": "string"
}
```
**Risposta**: 200 
```json
{
	"user": {
		"firstName": "string",
		"lastName": "string",
		"birthDate": "Date",
		"email": "string",
		"username": "string",
		"phoneNumber": "string",
	},
	"token": "string"
}
```
#### PATCH `/reset-password`

Resetta la password utente.  
**Auth**: Pubblica.
**Body**:
```json
{
	"userID": "string",
	"oldPassword": "string",
	"newPassword": "string"
}
```
**Risposta**: 200 -- Empty
#### PUT `/users/:userid/profile-picture`

Carica o aggiorna la foto profilo di un utente.  
**Auth**: JWT richiesto.  
**Upload**: `multipart/form-data` con campo `file`.
**Risposta**: 200 -- Empty

#### GET `/users/:userid/profile-picture`

Recupera la foto profilo di un utente.  
**Auth**: Pubblica
**Risposta**: 200 -- Binario

### 📂 Projects

#### **POST `/users/:userid/project`**
Crea un progetto.
**Auth**: JWT richiesto.
**body**:
```json
{		
	"name": "string",
	"input": "string",
	"output": "string",
	"isMilestone": "boolean",
	"start": "Date",
	"expire": "Date",
	"linkedTask": ["task1", "task2", ...],
	"status": "string",
}
```
**Risposta**: 200 -- `Project created successfully`
#### **PATCH `/users/:userid/project/task`**
Aggiunge un task a un progetto.
**Auth**: JWT richiesto.  
**body**:
```json
{		
	"id": "string",
	"name": "string",
	"input": "string",
	"output": "string",
	"isMilestone": "boolean",
	"start": "Date",
	"expire": "Date",
	"linkedTask": ["task1", "task2", ...],
	"status": "string",
	"authors": ["member1", "member2", ...]
}
```
**Risposta**: 200
```json
	{
		"id": "string",
		"tasks": [
			"id": "string",
			"name": "string",
			"input": "string",
			"output": "string",
			"isMilestone": "boolean",
			"start": "Date",
			"expire": "Date",
			"linkedTask": ["task1", "task2", ...],
			"status": "string",
			"authors": ["member1", "member2", ...]
		],
		"name": "string",
		"note": "string",
		"author": "string",
		"expire": "Date",
		"start": "Date",
		"members": ["member1", "member2", ...]
	}
```
#### **PATCH `/users/:userid/project`**
Aggiorna un progetto.
**Auth**: JWT richiesto.  
**body**:
```json
	{
		"id": "string",
		"tasks": [
			"id": "string",
			"name": "string",
			"input": "string",
			"output": "string",
			"isMilestone": "boolean",
			"start": "Date",
			"expire": "Date",
			"linkedTask": ["task1", "task2", ...],
			"status": "string",
			"authors": ["member1", "member2", ...]
		],
		"name": "string",
		"note": "string",
		"author": "string",
		"expire": "Date",
		"start": "Date",
		"members": ["member1", "member2", ...]
	}
```

**Risposta**: 200 -- Boolean true/false

#### **GET `/users/:userid/project`**
Recupera i progetti.
**Auth**: JWT richiesto.  
**Risposta**: 200
```json
[
	{
		"id": "string",
		"tasks": [{
			"id": "string",
			"name": "string",
			"input": "string",
			"output": "string",
			"isMilestone": "boolean",
			"start": "Date",
			"expire": "Date",
			"linkedTask": ["task1", "task2", ...],
			"status": "string",
			"authors": ["member1", "member2", ...]
		}, ...],
		"name": "string",
		"note": "string",
		"author": "string",
		"expire": "Date",
		"start": "Date",
		"members": ["member1", "member2", ...]
	},
	...
]
```
#### **DELETE `/users/:userid/project/:projectid`**
Elimina un progetto.
**Auth**: JWT richiesto.  
**Risposta**: 200 -- `Project deleted successfully`

---

## 🔍 Suggest

#### **POST `/users/:userid/search`**
Suggerisce utenti (auto-suggest).
**Auth**: JWT richiesto.  
**Body**:
```json
{
	"partialUsername": "string"
}
```

**Risposta**: 200
```json
	[
		"string",
		"string",
		"string",
		"string"
	]
```
## ⏱️ Time

#### **GET `/time`**
Recupera il giorno corrente.
**Auth**: Pubblica.
**Risposta**: 200
```json
{
	"today": "Date"
}
```
#### **POST `/time`** 
Imposta il giorno corrente.
**Auth**: Pubblica.
**Body**:
  ```json
{
	"date": "Date"
}
```
**Risposta**: 204 -- Empty
#### **POST `/time/reset`**
 Reset del giorno corrente.
**Auth**: Pubblica.
**Risposta**: 204 -- Empty





