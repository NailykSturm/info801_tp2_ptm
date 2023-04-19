// import { fork } from 'child_process';

// function init() {
//     const capteur_process = fork('./controller/capteur.ts');
//     const chaudiere_process = fork('./controller/chauffage.ts');
//     const controller_process = fork('./controller/controller.ts');
//     const horloge_process = fork('./controller/horloge.ts');

//     capteur_process.on('error', (err) => { console.log(`capteur_process error: ${err}`) });
//     capteur_process.on('exit', (code) => { console.log(`capteur_process exit: ${code}`) });
//     capteur_process.on('close', (code) => { console.log(`capteur_process close: ${code}`) });

//     chaudiere_process.on('error', (err) => { console.log(`chaudiere_process error: ${err}`) });
//     chaudiere_process.on('exit', (code) => { console.log(`chaudiere_process exit: ${code}`) });
//     chaudiere_process.on('close', (code) => { console.log(`chaudiere_process close: ${code}`) });

//     controller_process.on('error', (err) => { console.log(`controller_process error: ${err}`) });
//     controller_process.on('exit', (code) => { console.log(`controller_process exit: ${code}`) });
//     controller_process.on('close', (code) => { console.log(`controller_process close: ${code}`) });

//     horloge_process.on('error', (err) => { console.log(`horloge_process error: ${err}`) });
//     horloge_process.on('exit', (code) => { console.log(`horloge_process exit: ${code}`) });
//     horloge_process.on('close', (code) => { console.log(`horloge_process close: ${code}`) });
// }

// export default init;