# Selfie

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.0.6.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.


## Project Details

The project is divided into components (located in the /src folder)

### Authentication

We use JWT technology (JSON web token) to manage the authentication of the entire application

There are also two types of routes:
- the authenticated one (Profile page, Home ...)
- the unauthenticated one (Login page, Registration ...)

### Assets

All assets are in the folder `/public`. We have configured Angular so that when we write an absolute path automatically is set to `/public` as base (for all things related to assets, for example: \<img src="/absolute/path" /> cercherà il file in `/public/absolut/path`)

### I18N

in `/public/i18n` we put the `[it || en].json` files with labels and their translations into the selected language. To load translations dynamically we use the library [ngx-translate](https://www.npmjs.com/package/@ngx-translate/core).

### Palette

- Primary color: `#ADC178`
- Light theme main color: `#F0EAD2`
- Dark theme main color: `#6C584C`

### NgPrime Theme

The NgPrime theme we are using has been defined based on an existing one (Aura), we have defined it in `/public/selfie-theme.ts`

## Sources:

- Tomato icon : https://www.flaticon.com/free-icons/tomato
- Logo SELFIE : https://logo.com/logo-ideas
- Style libraries: 
   - [PrimeNG](https://primeng.org/)
   - [TailWind CSS](https://tailwindcss.com/docs/guides/angular)
