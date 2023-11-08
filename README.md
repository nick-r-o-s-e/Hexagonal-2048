# Hexagonal 2048 (React + Firebase)

## Hosted App 
https://hexagonal-2048-dev.firebaseapp.com

## Table of Contents
* [About](#about)
* [Technologies Used](#technologies-used)
* [Screenshots](#screenshots)
* [Project Specifications](#project-specifications)
* [Major files](#major-files)
* [Project Status](#project-status)
* [Room for Improvement](#room-for-improvement)

## About

Online representation of the modified "2048" game. User authentication and connection to the database have been implemented to create, read and update player statistics. 
 - #### Gameplay
    Hexagonal 2048 is played on a hexagonal grid with a radius of 2, 3 or 4, with numbered tiles that slide when a player moves them using the 6 control keys (Q, W, E, A, S, D). Every turn, one or two new tiles randomly appears in empty spots on the board with a value of either 2 or 4. Tiles slide as far as possible in the chosen direction until they are stopped by either another tile or the edge of the grid. If two tiles of the same number collide while moving, they will merge into a tile with the total value of the two tiles that collided. The resulting tile cannot merge with another tile again in the same move. If a move causes three consecutive tiles of the same value to slide together, only the two tiles farthest along the direction of motion will combine. A scoreboard on the upper left keeps track of the user's score. The user's score starts at zero and is increased whenever two tiles combine, by the value of the new tile. The game is won when a tile with a value of 2048 appears on the board. Players can continue beyond that to reach higher scores. When the player has no legal moves (there are no empty spaces and no adjacent tiles with the same value), the game ends.

## Technologies Used

- ### TypeScript

- ### Routing
  - [React Router](https://reactrouter.com/en/main)

- ### User Interface
  - React
  - [Material-MUI](https://mui.com/)
  - [howler.js](https://howlerjs.com/) (for the sound)
  
- ### Authentication, Database and Hosting
  - [Firebase Authentication](https://firebase.google.com/docs/auth)
  - [Cloud Firestore](https://firebase.google.com/docs/firestore)
  - [Firebase Hosting](https://firebase.google.com/docs/hosting)


## Screenshots
<table>
  <tr>
    <td> <h2 align="center">Login Form</h2> </td>
    <td> <h2 align="center">Game Field</h2> </td>
  </tr>
  <tr>
    <td> <img src="https://github.com/nick-r-o-s-e/Hexagonal-2048/blob/main/src/assets/screenshots/LoginForm-screenshot.png"  alt="1" width = 100%  ></td>
    <td> <img src="https://github.com/nick-r-o-s-e/Hexagonal-2048/blob/main/src/assets/screenshots/Field-screenshot.png"  alt="1" width = 100%  ></td>
  </tr> 
  <tr>
    <td> <h2 align="center">Leaderboard</h2> </td>
    <td> <h2 align="center">Mobile View</h2> </td>
  </tr>
  <tr>
    <td> <img src="https://github.com/nick-r-o-s-e/Hexagonal-2048/blob/main/src/assets/screenshots/Leaderboard-screenshot.png"  alt="1" width = 100%  ></td>
    <td> <img src="https://github.com/nick-r-o-s-e/Hexagonal-2048/blob/main/src/assets/screenshots/MobileView-screenshot.png"  alt="1" width = 100%  ></td>
  </tr> 
</table>

## Project Specifications

- ### Authentication 
  App supports authentication using Google, GitHub or Microsoft as a providers. Google and GitHub account linking: if the user is already logged in and tries to register with another method using the same user credentials(email), the application will link accounts with the exception of Microsoft. When linking Microsoft account user credentials are not saved during linking redirect and re-authentication occurs, which is unacceptable for the user-experience and will disable processing request due to missing initial state using linkWithRedirect in a storage-partioned browser environment.

- ### Username uniqueness
  The data base will have a collection of statistics for the leaderboard. Each document will also contain the username. I wanted to remove the possibility of duplicate names. For example you can check the existence of the document by unique id, but in my case the id of documents in the statistics collection is tied to the authentication id. Because of the security rules check uniqueness of the specific field of the document without inefficiently reading whole collection is impossible data base will have separate usernames collection for storing empty docs using name as id, to have ability for fast duplicate validation. 

- ### Mobile audio policy
  Mobile browsers such as ios safari don't allow sound to play without DOM interaction according to its autoplay audio policy. User has to interact with DOM after first loading of the application in someway to play sounds. I didn`t want to make the game sound button off by default for specific cases. To allow audioContext to be resumed, i added control method picking for all mobile devices as initial user interaction.

## Major files

- [Field utilities](https://github.com/nick-r-o-s-e/Hexagonal-2048/blob/main/src/utils/gameUtils/fieldUtils.ts) 
- [Game logic utilities](https://github.com/nick-r-o-s-e/Hexagonal-2048/blob/main/src/utils/gameUtils/gameLogicUtils.ts)
- [Game controlling component](https://github.com/nick-r-o-s-e/Hexagonal-2048/blob/main/src/components/Game/Game.tsx)
- [Cloud Firestore functions](https://github.com/nick-r-o-s-e/Hexagonal-2048/blob/main/src/firebase/firebase-db.ts)

## Project Status
Project is in progress

## Room for Improvement
- Changing control method option for mobile devices after initial choice.
- Sign out option.
- Menu jump links to leaderboard and game rules.
- Being able to click on leaderboard table row and see detailed player statistics.
- #### To Do:
  - Create options menu for additional features implementation.
  - Add expanding row functionality for leaderboard table.
