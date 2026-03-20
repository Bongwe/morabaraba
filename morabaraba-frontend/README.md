# Morabaraba Frontend

Angular frontend for the Morabaraba board game.

## Development

### Prerequisites
- Node.js v18+
- npm

### Running Locally
```bash
npm install
npm start
```

The application will be available at `http://localhost:4200`

### Building
```bash
npm run build
```

### Maven Build
```bash
mvn clean install
```

This will install Node.js, npm, dependencies, and build the Angular application.

## Features

- Interactive game board visualization
- Place pieces during placement phase
- Move pieces during movement/flying phases
- Remove opponent pieces after forming mills
- Real-time game state updates
- Local storage for game persistence

## API Integration

The frontend communicates with the Spring Boot backend API at `http://localhost:8080/api/games`.

Make sure the backend is running before using the frontend.
