## Partecipanti:

- Mattia Iaria

- Sara Negrini

- Elena Dattilo

  

## Suddivisione progetto

1. Mattia Iaria:
	- Architettura di Selfie
	
	- Gestione degli Account
	
	- Gestione dei "Progetti"
	
	- Gestione delle Notifiche (Notification API e E-Mail)
	
	- Autenticazione delle API
	
	- TimeMachine


2. Sara Negrini:

	- Gestione Calendario
	
  - Gestione degli eventi
  
  - Gestione delle attività



3. Elena Dattilo:

	- Timer pomodoro
	
	- Cicli di studio del pomodoro e connessione alla Home
	
	- Task e legate al pomodoro
	
	- Note e funzioni legate

---

# Selfie Frontend

  

## Librerie principali:

1. Angular (CLI v19.0.6)

2. PrimeNG

3. Tailwind CSS

4. Ngx-translate (per i18n)

5. Rrule (per la ricorrenza degli eventi)

  

## Introduzione

Il front end è stato sviluppato con Angular, utilizzando un'architettura basata su componenti, il codice è suddiviso in moduli e componenti per mantenere un'architettura chiara.

L'interfaccia è stata realizzata con PrimeNG e Tailwind CSS, mentre la gestione delle traduzioni multilingua abbiamo utilizzato ngx-translate (con italiano e inglese supportati), la palette di colori è coerente per tutto l'applicazione ed è disponibile in light mode e dark mode.

  

## Architettura

  

La struttura è definita in /src/app, e contiene tutti i componenti angular, suddivisi e ordinati per garantire una gestione agile. Le definizioni di tipi sono gestiti dentro environments e in utils abbiamo funzioni helper.

In /public abbiamo i file per gestire le traduzioni, i diversi assets usati nell'app e la definizione del nostro tema personalizzato.

  
---

## Layout di Selfie

Il Layout è composto da:
- Navbar
- Contenuto
- Footer
### Header

Nella parte più in alto è presente un Header nella quale si possono vedere il Logo dell'applicazione e il pulsante dedicato alla Time Machine sulla sinistra, mentre sulla destra è possibile vedere la propria immagine profilo ed il toggle per cambiare il tema (Da chiaro a Scuro e viceversa).  
#### Time Machine

La Time Machine può essere utilizzata cliccando il pulsante con la data attuale.  
Al click del pulsante verrà aperto un modale nella quale è possibile impostare la data corrente.  
**IMPORTANT: Il tempo in Selfie non scorre mai, può essere soltanto impostato tramite l'apposito modale**

### Contenuto

Il contenuto è la parte che varia navigando il sito web.

### Footer

Il footer di Selfie è lo strumento base per la navigazione del sito.  
Sono presenti 4 pulsanti con la quale è possibile raggiungere le pagine principali:
- Home
- Pomodoro
- Progetti
- Note

## Notifiche

L'applicazione lancia delle notifiche utilizzando Notification API di javascript.  
Nello specifico verranno lanciate se ci sono degli eventi in scadenza nel giorno corrente quando si accede alla home page ed è possibile rimandare la notifica per 5 minuti.  
Inoltre verrà inviata una notifica nel momento in cui la pausa o la sessione di studio terminano nella sezione pomodoro.

--- 
## Account 👤

La gestione degli account è gestita lato back end e a seguito di Login salviamo in sessione il JWT generato per chiamare le API sensibili.

#### Login

Appena si accede al sito web, la prima pagina che appare è il login, puoi inserire l'username o l'email e la password per accedere. Se non si possiede ancora un account bisogna crearlo cliccando nella scritta "Registrati qui!".  
Verrà mandata un email di conferma quando si crea un profilo.  
#### Pagina del profilo

È possibile accedere alla pagina del proprio profilo cliccando l'avatar in alto a destra dell'Header.  
Nella pagina del profilo è possibile vedere le proprie informazioni personali, un pulsante per la modifica della password e le preferenze.  
- Cliccando l'avatar è possibile inserire un immagine profilo (Grandezza massima 1MB)
- Per reimpostare la password basta cliccare il pulsante apposito e compilare il form che si aprirà 
- Nelle preferenze è possibile selezionare il tema e la localizzazione (lingue supportate: Italiano e Inglese)  


---
## Componenti

### Calendario 📅

Il calendario offre diverse view: quella mensile, la settimanale e la giornaliera. L'utente può passare tra le diverse viste e di navigare tra i mesi tramite i bottoni del calendario in alto a destra.
L'utente con il calendario può creare eventi o attività cliccando nel giorno desiderato:
Per scegliere se creare un evento o un'attività, basta selezionare o deselezionare il riquadro nel popup di creazione/modifica.

### Type
```typescript
export  type CalendarEvent = {
  title: string;
  
  color?: string;                                     //esiste un colore predefinito 
  
  start?: Date | string;                              //viene selezionata automaticamente quando viene cliccato il calendario
  
  end?: Date | string;
  
  allDay?: boolean;                                   //se dura tutta la giornata o no
  
  rrule?:{                                            //se un evento si ripete i campi sotto saranno riempiti
    
    freq: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY',
    
    dtstart: Date,
    
    interval?: number,                                //impostato a 1 in tutte le occasioni tranne per la ripetizione bisettimanale (a 2)
    
    until?: Date,
    
    byweekday?: string[],                             //array con tutti i giorni della settimana in cui l'evento si ripete
  
  }
  
  _id: string;
  
  extendedProps?: {                                   //per dettagli aggiuntivi come luogo e per attività
    
    luogo?: string;
    
    tipo?: 'attività' | 'evento';                     //per distinguere tra attività ed evento
    
    stato?: 'da_fare' | 'in_corso' | 'completata';
  
  };

}


export type Events = CalendarEvent[];                 //lista degli eventi del calendario.
```

Il type CalendarEvent rappresenta un evento o un attività del calendario.

Le attività hanno solo un titolo, una data, un colore e tre diversi stati che possono essere cambiati manualmente nel tempo a seconda del loro svolgimento.

Per modificarle, come per gli eventi, basta cliccare sul rettangolo corrispondente sul calendario.

Gli eventi offrono maggior personalizzazione delle attività. Possono avere, infatti, anche una data di fine, un orario di inizio e di fine, un luogo e possono essere ricorrenti. Se venisse inserito un luogo nel form dell'evento comparirà un bottone che quando premuto apre una scheda all'indirizzo scritto in Google Maps.

La ricorrenza degli eventi è gestita tramite rrule. Le frequenze disponibili sono giornaliera, settimanale, bisettimanale (una settimana sì e una no), mensile e annuale. Se verrà selezionata una ricorrenza settimanale o bisettimanale apparirà una lista selezionabile dei giorni della settimana. I giorni scelti vengono salvati nel campo byweekday del JSON dell'evento.


### Nella home

Nella home, in basso a sinistra, si possono vedere gli eventi e le attività in scadenza della giornata. Se un evento ha un luogo, cliccarlo dalla home ti permetterà di aprire la sua pagina su Google Maps.



### Pomodoro 🍅

Il pomodoro è uno strumento per gestire le sessioni di studio, per bilanciare al meglio studio e riposo.

Abbiamo implementato un'interfaccia del timer pomodoro che racchiude assieme diverse funzionalità, oltre al classico timer è possibile registrare le sessioni (indipendenti dal ciclo di studio), avere delle task da completare e visualizzare il proprio ciclo di studio programmato per la giornata.

#### Il timer

```json

{

"_id": {

"$oid": "68d02f1c6f784d59889b9043"

},

"userID": "Temp123",

"id": "1", //usato per gestione più chiara nel frontend

"longBreakDuration": 900, // secondi della pausa lunga

"longBreakInterval": 4, // numero di pomodori prima della pausa lunga

"pomodoroDuration": 1200, // secondi del pomodoro (studio)

"pomodoroNumber": 2, // count di pomodori fatti

"pomodoroType": "longBreak", // a che punto siamo dello studio

"shortBreakDuration": 300 // secondi della pausa corta

}

```

Nel json che viene mandato al server abbiamo le seguenti informazioni, il pomodoro nel server rimane unico e non ne vengono creati di più, possono venire modificati i vari tempi tramite l'apposita funzione accessibile tramite il pulsante con l'ingranaggio in alto.

Il timer può essere resettato, e torna alle impostazioni di default, di 25 minuti di studio, 5 di pausa corta e 15 di pausa lunga, oppure può essere deciso in base alle preferenze dell'utente. In caso si stia usando un ciclo di studio le impostazioni non possono essere modificate, visto che il pomodoro seguirà in ogni caso gli step dettati da quello.

In caso l'user decida di iniziare ad usare il pomodoro senza cambiare impostazioni il server crea automaticamente un setting standard.

Ogni volta che viene finita una pausa o pomodoro compare un popup a lato, che si leva automaticamente dopo poco.

  

#### Le sessioni di studio

```typescript

type StudySessionDTO = {

_id: string;

pomodoroNumber: number,

taskCompleted: number,

date: string

};

```

Le sessioni di studio sono un metodo indipendente per registrare i tuoi progressi senza per forza seguire il ciclo, utilizzabili anche durante per tenere traccia delle task completate.

Ogni sessione di studio ha un suo id unico generato dal server, è possibile eliminare le sessioni.

  

#### Le attività

``` typescript

type TaskDTO = {

_id: string;

taskName: string;

taskStatus: string;

taskCompleted: boolean;

};

  

```

Per lo studio è importante potersi segnare cose da fare e argomenti che mancano, tramite questa funzione si possono aggiungere attività, riordinarle e modificarle, possono essere anche cancellate.

  

#### I cicli di studio

```typescript

type StudyStep={

step: number,

type: 'pomodoro' | 'shortBreak' | 'longBreak',

duration: number

}

  

type dayInfo={

day: Date;

step: number;

}

  

type StudyPlan={

settings: Pomodoro,

plan: StudyStep[],

totalTime: number;

days: dayInfo[],

_id?: string,

}

```

Le sessioni di studio sono il cuore di questo pomodoro, l'utente può inserire una sessione di studio secondo le attuali impostazioni. Una volta inserito compare automaticamente la schermata con la lista di pomodori e pause, man mano che vado avanti con lo studio vengono automaticamente segnate.

Posso decidere se chiudere i cicli di studio e proseguire con uno studio indipendente al ciclo, e si può riattivare in seguito senza che il ciclo venga modificato.

La creazione dei cicli di studio avviene tramite l'icona del calendario in alto, quando la clicco viene aperto questo dialog che permette di decidere le ore da studiare e se il ciclo di studio viene ripetuto oppure no. In caso non venga segnato il sì, non compare la scelta della settimana e della data, e il ciclo di studio viene salvato solo per il giorno attuale. Altrimenti è possibile scegliere i giorni della settimana in cui salvarlo e fino a quando farlo andare avanti.

Da questa schermata è possibile accedere alla lista di tutti i cicli di studio (che vengono caricati dalla data attuale in poi), per ogni giornata è possibile eliminare singolarmente il piano di studi.

In caso venga eliminato un piano che è parte di una struttura più grande allora il file json viene aggiornato senza il giorno, se invece è l'unico giorno di quella struttura viene eliminato direttamente tutto il piano.

  

#### Nella home

Nella home è possibile vedere i giorni in cui è programmato un ciclo di studio, tramite l'icona del timer che compare in basso a destra nei giorni, e se per il giorno corrente hai programmato un ciclo di studi, ti viene mostrata la percentuale completata e hai la possibilità di andare direttamente al pomodoro cliccando il pulsante.

  

### Note 🗒

Le note sono un tool per prendere appunti e da cui studiare, sono suddivisibili in categorie tramite la struttura di cartelle

```typescript

export type Note = {

label: string;

expanded: boolean;

content: string;

icon: string;

children: string[] | Object[];

type: 'note' | 'folder';

parent: string | null;

droppableNode: boolean;

draggableNode?: boolean

lastEdit: Date;

_id?: string;

data?: string;

};

```

L'interfaccia delle note è relativamente semplice, a sinistra se selezionata una Nota possiamo scriverci in markdown, e salvando viene segnato l'orario dell'ultima modifica.

E' possibile duplicare ed eliminare una Nota selezionandola e cliccando con il tasto destro. E' possibile spostare agilmente le note e le cartelle tramite il TreeModule di PrimeNG, e grazie ai valori droppableNode e draggableNode soltanto le cartelle possono tenere al loro interno delle Note.

La gestione dell'albero è gestita tramite il campo parent, il backend ci restituisce una struttura già impostata per la visualizzazione.

  

#### Nella Home

Le note nella home sono raccolte in basso a destra, con una preview delle ultime 5 note modificate. Se ci si clicca sopra porta direttamente alla schermata delle note.


### Progetti

È possibile accedere tramite il footer alla sezione "Progetti"  
Nella pagina principale vengono visualizzati i progetti di cui si fa parte e alcune delle informazioni  principali.  
Per creare un progetto esiste il pulsante apposito in alto a destra, e compilando il form verrà creato un progetto.  
Cliccando uno dei progetti verranno aperti i dettagli del suddetto.  

```typescript

export type Project = {
	id: string;
	tasks: Task[];
	name: string;
	note: string;
	author: string;
	expire: Date;
	start: Date;
	members: string[];
};

export type Task = {
	id: string;
	name: string;
	input?: string;
	output?: string;
	isMilestone: boolean;
	start: Date;
	expire: Date;
	linkedTask: string[];
	status: TaskStatus;
	authors: string[];
};

export enum TaskStatus {
	NotStartable,
	Startable,
	Started,
	Done,
	ReStarted,
	Overdue,
	Abandoned,
}
```
#### Dettagli

Il layout dei dettagli del progetto è così composta:
- Lista Attività / Vista GANTT
- Gestione Membri

##### Vista GANTT
È presente una vista GANTT delle task del progetto.
##### Lista attività
La lista di task è modificabile solo dal leader del gruppo.  
Si può visualizzare sempre la consegna di ogni task, ma è modificabile solo dal leader. 

##### Gestione Membri

In basso a destra è presente un pulsante per aggiungere dei membri al progetto, al click verrà aperto un modale per cercare un utente e aggiungerlo.
 
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

Per proteggere gli account creati nel sito web cri le password utilizzando la libreria bcrypt.js (una particolare libreria di bcrypt scritta in javascript).

Questa è una cifratura a doppia chiave, una pubblica ed una segreta.

###### fonte: https://it.wikipedia.org/wiki/Bcrypt

  

---

## Endpoints

  

### Users 👤

  

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

  

### Projects 📂 

  

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

}

```

#### **PATCH `/users/:userid/project`**

Aggiorna un progetto.

**Auth**: JWT richiesto.

**body**:

```json

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

  

### Suggest 🔍

  

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

### Time ⏱️

  

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


## Calendario 📅

#### **GET `/users/:userid/events`**

Recupera gli eventi




**Risposta**: 200.



**Auth**: JWT richiesto.


**Body**:
  ```json
  {
  
  "_id": "string",
  
  "title": "string",
  
  "color": "string | null",
  
  "start": "Date | string",
  
  "end": "Date | string | null",
  
  "allDay": "boolean",
  
  "rrule": {
    
    "freq": "'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'",
    
    "dtstart": "Date",
    
    "interval": "number",
    
    "until": "Date | null",
  
    "byweekday": " [ 'SU' | 'MO' | 'TU' | 'WE' | 'TH' | 'FR' | 'SA' ] | null"
  
  },
  
  "extendedProps": {
    
    "luogo": "string | null",
    
    "tipo": "'attività' | 'evento'",
    
    "stato": "'da_fare' | 'in_corso' | 'completata'"

  }

}
  ```



#### **GET `/users/:userid/events/today`**

Recupera gli eventi di oggi



**Risposta**: 200.



**Auth**: JWT richiesto.


**Body**:
  ```json
  {
  
  "_id": "string",
  
  "title": "string",
  
  "color": "string | null",
  
  "start": "Date | string",
  
  "end": "Date | string | null",
  
  "allDay": "boolean",
  
  "rrule": {
    
    "freq": "'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'",
    
    "dtstart": "Date",
    
    "interval": "number",
    
    "until": "Date | null",
  
    "byweekday": " [ 'SU' | 'MO' | 'TU' | 'WE' | 'TH' | 'FR' | 'SA' ] | null"
  
  },
  
  "extendedProps": {
    
    "luogo": "string | null",
    
    "tipo": "'attività' | 'evento'",
    
    "stato": "'da_fare' | 'in_corso' | 'completata'"

  }

}
  ```


#### **POST `/users/:userid/events`**

Inserisce un evento



**Risposta**: 200.



**Auth**: JWT richiesto.


**Body**:
  ```json
  {
  
  "_id": "string",
  
  "title": "string",
  
  "color": "string | null",
  
  "start": "Date | string",
  
  "end": "Date | string | null",
  
  "allDay": "boolean",
  
  "rrule": {
    
    "freq": "'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'",
    
    "dtstart": "Date",
    
    "interval": "number",
    
    "until": "Date | null",
  
    "byweekday": " [ 'SU' | 'MO' | 'TU' | 'WE' | 'TH' | 'FR' | 'SA' ] | null"
  
  },
  
  "extendedProps": {
    
    "luogo": "string | null",
    
    "tipo": "'attività' | 'evento'",
    
    "stato": "'da_fare' | 'in_corso' | 'completata'"

  }

}
  ```


#### **PUT `/users/:userid/events/:eventid`**

Modifica un evento



**Risposta**: 200.



**Auth**: JWT richiesto.


**Body**:
  ```json
  {
  
  "_id": "string",
  
  "title": "string",
  
  "color": "string | null",
  
  "start": "Date | string",
  
  "end": "Date | string | null",
  
  "allDay": "boolean",
  
  "rrule": {
    
    "freq": "'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'",
    
    "dtstart": "Date",
    
    "interval": "number",
    
    "until": "Date | null",
  
    "byweekday": " [ 'SU' | 'MO' | 'TU' | 'WE' | 'TH' | 'FR' | 'SA' ] | null"
  
  },
  
  "extendedProps": {
    
    "luogo": "string | null",
    
    "tipo": "'attività' | 'evento'",
    
    "stato": "'da_fare' | 'in_corso' | 'completata'"

  }

}
  ```



#### **DELETE `/users/:userid/events/:eventid`**
Elimina un evento



**Risposta**: 200.



**Auth**: JWT richiesto.


**Body**:
  ```json
  {
  
  "_id": "string",
  
  "title": "string",
  
  "color": "string | null",
  
  "start": "Date | string",
  
  "end": "Date | string | null",
  
  "allDay": "boolean",
  
  "rrule": {
    
    "freq": "'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'",
    
    "dtstart": "Date",
    
    "interval": "number",
    
    "until": "Date | null",
  
    "byweekday": " [ 'SU' | 'MO' | 'TU' | 'WE' | 'TH' | 'FR' | 'SA' ] | null"
  
  },
  
  "extendedProps": {
    
    "luogo": "string | null",
    
    "tipo": "'attività' | 'evento'",
    
    "stato": "'da_fare' | 'in_corso' | 'completata'"

  }

}
  ```


## Pomodoro 🍅

  

#### **GET `/users/:userid/pomodoro/pomodoroinfo/:pomodoroid`**

Recupera il pomodoro dato l'id.

  

**Risposta**: 200.

  

**Auth**: JWT richiesto.

  

**Body**:

```json

{

"pomodoroNumber": "number",

"pomodoroType": "string",

"pomodoroDuration": "number",

"shortBreakDuration": "number",

"longBreakDuration": "number",

"longBreakInterval": "number",

"id": "string"

}

```

  

#### **PUT `"/users/:userid/pomodoro/pomodoroinfo"`**

Inserisce o modifica il pomodoro.

  

**Risposta**: 200.

  

**Auth**: JWT richiesto.

  

**Body**:

```json

{

"pomodoroNumber": "number",

"pomodoroType": "string",

"pomodoroDuration": "number",

"shortBreakDuration": "number",

"longBreakDuration": "number",

"longBreakInterval": "number",

"id": "string"

}

```

  

### Ciclo di studi (study plan) 📝

#### **GET `/users/:userid/pomodoro/studyplan`**

Recupera i miei study plans

  

**Risposta**: 200.

  

**Auth**: JWT richiesto.

  

**Body**: (array di)

```json

  

{

"settings": {

"pomodoroNumber": "number",

"pomodoroType": "string",

"pomodoroDuration": "number",

"shortBreakDuration": "number",

"longBreakDuration": "number",

"longBreakInterval": "number"

},

"plan": [

{

"step": "number",

"type": "string",

"duration": "number"

}

],

"totalTime": "number",

"days": [

{

"date": "Date",

"step": "number",

}

],

"_id": "string"

}

  
  

```

  

#### **PUT `"/users/:userid/pomodoro/studyplan"`**

Inserisce o modifica lo studyplan.

  

**Risposta**: 200.

  

**Auth**: JWT richiesto.

  

**Body**:

```json

{

"settings": {

"pomodoroNumber": "number",

"pomodoroType": "string",

"pomodoroDuration": "number",

"shortBreakDuration": "number",

"longBreakDuration": "number",

"longBreakInterval": "number"

},

"plan": [

{

"step": "number",

"type": "string",

"duration": "number"

}

],

"totalTime": "number",

"days": [

{

"date": "Date",

"step": "number",

}

],

"_id": "string"

}

  

```

#### **DELETE `"/users/:userid/pomodoro/studyplan/:planid"`**

Elimina lo studyplan.

  

**Risposta**: 200.

  

**Auth**: JWT richiesto.

  

**Body**:

```json

{

"settings": {

"pomodoroNumber": "number",

"pomodoroType": "string",

"pomodoroDuration": "number",

"shortBreakDuration": "number",

"longBreakDuration": "number",

"longBreakInterval": "number"

},

"plan": [

{

"step": "number",

"type": "string",

"duration": "number"

}

],

"totalTime": "number",

"days": [

{

"date": "Date",

"step": "number",

}

],

"_id": "string"

}

  

```

### Sessioni passate ⏳

#### **GET `/users/:userid/pomodoro/oldSessions`**

Recupera le mie sessioni vecchie

  

**Risposta**: 200.

  

**Auth**: JWT richiesto.

  

**Body**: (array di)

```json

{

"id": "number",

"_id": "string",

"pomodoroNumber": "number",

"taskCompleted": "number",

"date": "string"

}

```

  

#### **PUT `"/users/:userid/pomodoro/studyplan"`**

Inserisce sessioni passate.

  

**Risposta**: 200.

  

**Auth**: JWT richiesto.

  

**Body**:

```json

{

"id": "number",

"_id": "string",

"pomodoroNumber": "number",

"taskCompleted": "number",

"date": "string"

}

```

#### **DELETE `"/users/:userid/pomodoro/studyplan/:planid"`**

Elimina una sessione passata.

  

**Risposta**: 200.

  

**Auth**: JWT richiesto.

  

**Body**:

```json

{

"id": "number",

"_id": "string",

"pomodoroNumber": "number",

"taskCompleted": "number",

"date": "string"

}

```

### Task 🖋

#### **GET `/users/:userid/pomodoro/tasks`**

Recupera le mie task

  

**Risposta**: 200.

  

**Auth**: JWT richiesto.

  

**Body**: (array di)

```json

{

"_id": "string",

"taskName": "string",

"taskStatus": "string",

"taskCompleted": "boolean"

}

```

  

#### **PUT `"/users/:userid/pomodoro/tasks"`**

Inserisce o modifica task.

  

**Risposta**: 200.

  

**Auth**: JWT richiesto.

  

**Body**:

```json

{

"_id": "string",

"taskName": "string",

"taskStatus": "string",

"taskCompleted": "boolean"

}

```

#### **POST `"/users/:userid/pomodoro/tasks"`**

Inserisce task.

  

**Risposta**: 200.

  

**Auth**: JWT richiesto.

  

**Body**:

```json

{

"_id": "string",

"taskName": "string",

"taskStatus": "string",

"taskCompleted": "boolean"

}

```

#### **DELETE `"/users/:userid/pomodoro/tasks/taskid"`**

Elimina una stask.

  

**Risposta**: 200.

  

**Auth**: JWT richiesto.

  

**Body**:

```json

{

"_id": "string",

"taskName": "string",

"taskStatus": "string",

"taskCompleted": "boolean"

}

```

  

## Note 📝

#### **GET `/users/:userid/notes`**

Recupera le mie Note

Quando recupero le note, nel server leggo una serie di note collegate tra loro solo tramite l'id presente nel parent, restituisco le note già con le relazioni impostate come un albero.

  

**Risposta**: 200.

  

**Auth**: JWT richiesto.

  

**Body**: (array di)

```json

{

"label": "string",

"expanded": "boolean",

"content": "string",

"icon": "string",

"children": "Notes",

"type": "'note' | 'folder'",

"parent": "string | null | ObjectId",

"droppableNode": "boolean",

"lastEdit": "Date",

"_id": "ObjectId",

"data": "string",

}

```

  

#### **PUT `"/users/:userid/notes"`**

Inserisce o modifica le note.

  

**Risposta**: 200.

  

**Auth**: JWT richiesto.

  

**Body**:

```json

{

"label": "string",

"expanded": "boolean",

"content": "string",

"icon": "string",

"children": "Notes",

"type": "'note' | 'folder'",

"parent": "string | null | ObjectId",

"droppableNode": "boolean",

"lastEdit": "Date",

"_id": "ObjectId",

"data": "string",

}

```

#### **PATCH `"/users/:userid/notes/:noteid"`**

Aggiornamento della nota. Per spostarla cambio il riferimento al parent.

  

**Risposta**: 200.

  

**Auth**: JWT richiesto.

  

**Body**:

```json

{

"label": "string",

"expanded": "boolean",

"content": "string",

"icon": "string",

"children": "Notes",

"type": "'note' | 'folder'",

"parent": "string | null | ObjectId",

"droppableNode": "boolean",

"lastEdit": "Date",

"_id": "ObjectId",

"data": "string",

}

```

#### **DELETE `"/users/:userid/notes/:noteid"`**

Elimina una Nota. Se è una cartella allora elimina anche tutti i figli.

  

**Risposta**: 200.

  

**Auth**: JWT richiesto.

  

**Body**:

```json

{

"label": "string",

"expanded": "boolean",

"content": "string",

"icon": "string",

"children": "Notes",

"type": "'note' | 'folder'",

"parent": "string | null | ObjectId",

"droppableNode": "boolean",

"lastEdit": "Date",

"_id": "ObjectId",

"data": "string",

}

```

### Recent notes

#### **GET `/users/:userid/notes/recent`**

Recupero le note recenti, recupero solo le ultime 5

  

**Risposta**: 200.

  

**Auth**: JWT richiesto.

  

**Body**: (array di)

```json

{

"label": "string",

"expanded": "boolean",

"content": "string",

"icon": "string",

"children": "Notes",

"type": "'note' | 'folder'",

"parent": "string | null | ObjectId",

"droppableNode": "boolean",

"lastEdit": "Date",

"_id": "ObjectId",

"data": "string",

}

```

  

#### **POST `"/users/:userid/notes/recent"`**

Inserisco le note recenti, salvo la nota con la nuova ultima modifica.

  

**Risposta**: 200.

  

**Auth**: JWT richiesto.

  

**Body**:

```json

{

"label": "string",

"expanded": "boolean",

"content": "string",

"icon": "string",

"children": "Notes",

"type": "'note' | 'folder'",

"parent": "string | null | ObjectId",

"droppableNode": "boolean",

"lastEdit": "Date",

"_id": "ObjectId",

"data": "string",

}

```

