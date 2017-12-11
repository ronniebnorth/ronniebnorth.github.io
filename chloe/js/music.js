const diatonic = ['A','Bb','B','C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B','C','Db','D','Eb','E','F','Gb','G'];

const g_dorian     =  [1,0,1,1,0,1,0,1,0,1,1,0,1,0,1,1,0,1,0,1,0,1,1,0];
const g_phrygian   =      [1,1,0,1,0,1,0,1,1,0,1,0,1,1,0,1,0,1,0,1,1,0,1,0];
const g_lydian     =        [1,0,1,0,1,0,1,1,0,1,0,1,1,0,1,0,1,0,1,1,0,1,0,1];
const g_mixolydian =            [1,0,1,0,1,1,0,1,0,1,1,0,1,0,1,0,1,1,0,1,0,1,1,0];
const g_aeolian    =                [1,0,1,1,0,1,0,1,1,0,1,0,1,0,1,1,0,1,0,1,1,0,1,0];
const g_locrian    =                    [1,1,0,1,0,1,1,0,1,0,1,0,1,1,0,1,0,1,1,0,1,0,1,0];
const g_ionian     =                      [1,0,1,0,1,1,0,1,0,1,0,1,1,0,1,0,1,1,0,1,0,1,0,1];
const g_minorpent  =                [1,0,0,1,0,1,0,1,0,0,1,0,1,0,0,1,0,1,0,1,0,0,1,0];
const g_majorpent  =                      [1,0,1,0,1,0,0,1,0,1,0,0,1,0,1,0,1,0,0,1,0,1,0,0];
const g_phrygdom   =      [1,1,0,0,1,1,0,1,1,0,1,0,1,1,0,0,1,1,0,1,1,0,1,0];
const g_majortriad =                      [1,0,0,0,1,0,0,1,0,0,0,0,1,0,0,0,1,0,0,1,0,0,0,0];
const g_minortriad =                [1,0,0,1,0,0,0,1,0,0,0,0,1,0,0,1,0,0,0,1,0,0,0,0];

window.onload = function () {

};
let lastVelocity = 100;

$(".btn_key").mousedown(function(){
    let rootNote = $(this).text();
    rootNote = rootNote.replace('♭','b');
    let mode = $(this).closest("div").attr('name');
    playMode(rootNote, mode);
});


function randomlyRepeatNotes(notesArr){
    notesArr = clone(notesArr);
    let loopTimes = Math.floor(Math.random() * (notesArr.length));
    for(let lp = 0; lp < loopTimes; lp++){
        let randomNote = Math.floor(Math.random() * (notesArr.length - 1));
        notesArr[randomNote + 1] = notesArr[randomNote];
    }
    return notesArr;
}

function randomlyReshuffle(notesArr){
    notesArr = clone(notesArr);
    let reshuf = Math.floor(Math.random() * 2);
    
    if(reshuf === 1){
        notesArr = shuffle(notesArr);
    }
    return notesArr;
}

function randomlyShortenPhrase(notesArr){
    notesArr = clone(notesArr);
    let doStrip =  Math.floor(Math.random() * 3);
    if(doStrip === 1){
        let stripEnd = Math.floor(Math.random() * (notesArr.length - 1));
        while(stripEnd > 0){
            notesArr.pop();
            stripEnd--;
        }
    }
    return notesArr;
}

function randomlyPutHoles(notesArr){
    notesArr = clone(notesArr);
    let putHoles = Math.floor(Math.random() * 4);
    if(putHoles === 1 || putHoles === 2 || putHoles === 3){
        let numHoles = Math.floor(Math.random() * (notesArr.length - 3));
        numHoles = numHoles + 2;
        while(numHoles > 0){
            let pHole = Math.floor(Math.random() * (notesArr.length - 1));
            notesArr[pHole] = 0;
            numHoles--;
        }           
    }
    return notesArr;
}

function randomlyGoHalfTime(){      
    let mydelayT = Math.floor(Math.random() * 2);
    let delayt = .3;
    if(mydelayT === 1){
        delayt = .15;
    }
    return delayt;
}

function getRandomRootOctave(note){
    let rootOctR = Math.floor(Math.random() * 3);
    if(rootOctR === 1){
        return note + '2';
    }else{
        return note + '1';
    }
}

function randomlyDoubleNotes(notes){
    let connotes = clone(notes);
    if(Math.floor(Math.random() * 3) === 1){
        connotes.reverse();
    }else if(Math.floor(Math.random() * 3) === 2){
        connotes = shuffle(connotes);
    }

    let bs = Math.floor(Math.random() * 3);
    if(bs === 0){
        notes = notes.concat(connotes);
    }
    return notes;
}


function playMode(rootNote, mode){    

    let notesArr = getNotes(rootNote, mode);

    notesArr = shuffle(notesArr);

    notesArr = randomlyRepeatNotes(notesArr);

    notesArr = randomlyReshuffle(notesArr);

    notesArr = randomlyShortenPhrase(notesArr);

    notesArr = randomlyPutHoles(notesArr);

    let instrumentName = "acoustic_guitar_nylon";

    MIDI.loadPlugin({
        soundfontUrl: "./soundfont/",
        instrument: instrumentName,
        onprogress: function(state, progress) {
            //console.log(state, progress);
        },
        onsuccess: function() {
            MIDI.programChange(0, MIDI.GM.byName[instrumentName].number);
            let notes = notesArr;
            let delayt = randomlyGoHalfTime();
            if($('input[name=play_style]:checked').val() == 'chord'){
                delayt = 0;
            }
            let delay = Array(notes.length).fill(delayt);
            let tmpdelay= 0;
            let ctxtime = MIDI.getContext().currentTime;
            let channel = 0;

            let velocity = lastVelocity;

            if(Math.floor(Math.random() * 3) === 1){
                velocity = Math.floor(Math.random() * 60 + 40);
                lastVelocity = velocity;
            }

            rootNote = getRandomRootOctave(rootNote);
            
            rootNoteStr = MIDI.keyToNote[rootNote];

            if($('input[name=play_style]:checked').val() !== 'just_fills'){
                MIDI.noteOn(channel, rootNoteStr, velocity + 150,0);
            }
            

            if(delayt === .15){
                notes = randomlyDoubleNotes(notes);
            }
            
            if($('input[name=play_style]:checked').val() != 'root'){
                for(let i=0; i < notes.length; i++){
                    let chordIt = Math.floor(Math.random() * 3);
                    if(chordIt === 1){
                        let chordIt2 = Math.floor(Math.random() * 2);
                        if(chordIt2 === 1){
                            let harm2 = Math.floor(Math.random() * (notes.length - 1));
                            let harm3 = Math.floor(Math.random() * (notes.length - 1));
                            MIDI.chordOn(channel, [notes[i],notes[harm2],notes[harm3]], velocity, ctxtime+tmpdelay);
                        }else{
                            let harm = Math.floor(Math.random() * (notes.length - 1));
                            MIDI.chordOn(channel, [notes[i],notes[harm]], velocity, ctxtime+tmpdelay);
                        }
                    }else{
                        MIDI.noteOn(channel, notes[i], velocity, ctxtime+tmpdelay);
                    }
                    
                    tmpdelay = tmpdelay + delay[i]
                }
            }


        }
    });
}


function clone(obj){
    return JSON.parse(JSON.stringify(obj));
}

function getPattern(mode){

}

function shuffle(array) {
    let currentIndex = array.length, temporaryValue, randomIndex;
  
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
  
      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
  
    return array;
}


function getModes(inputPattern){
    let modes  = ['DORIAN','PHRYGIAN','LYDIAN','MIXOLYDIAN','AEOLIAN','LOCRIAN','IONIAN','MAJORPENT','MINORPENT','PHRYGDOM','MAJORTRIAD','MINORTRIAD'];
    
    for(let i = 0; i < inputPattern.length; i++){
        if(inputPattern[i] == 1){
            if(g_dorian[i] !== 1 && modes.includes("DORIAN")){
                modes.splice(modes.indexOf("DORIAN"), 1);
            }
            if(g_phrygian[i] !== 1 && modes.includes("PHRYGIAN")){
                modes.splice(modes.indexOf("PHRYGIAN"), 1);
            }
            if(g_lydian[i] !== 1 && modes.includes("LYDIAN")){
                modes.splice(modes.indexOf("LYDIAN"), 1);
            }
            if(g_mixolydian[i] !== 1 && modes.includes("MIXOLYDIAN")){
                modes.splice(modes.indexOf("MIXOLYDIAN"), 1);
            }
            if(g_aeolian[i] !== 1 && modes.includes("AEOLIAN")){
                modes.splice(modes.indexOf("AEOLIAN"), 1);
            }
            if(g_locrian[i] !== 1 && modes.includes("LOCRIAN")){
                modes.splice(modes.indexOf("LOCRIAN"), 1);
            }
            if(g_ionian[i] !== 1 && modes.includes("IONIAN")){
                modes.splice(modes.indexOf("IONIAN"), 1);
            }
            if(g_majortriad[i] !== 1 && modes.includes("MAJORTRIAD")){
                modes.splice(modes.indexOf("MAJORTRIAD"), 1);
            }
            if(g_minortriad[i] !== 1 && modes.includes("MINORTRIAD")){
                modes.splice(modes.indexOf("MINORTRIAD"), 1);
            }
            if(g_majorpent[i] !== 1 && modes.includes("MAJORPENT")){
                modes.splice(modes.indexOf("MAJORPENT"), 1);
            }
            if(g_minorpent[i] !== 1 && modes.includes("MINORPENT")){
                modes.splice(modes.indexOf("MINORPENT"), 1);
            }
            if(g_phrygdom[i] !== 1 && modes.includes("PHRYGDOM")){
                modes.splice(modes.indexOf("PHRYGDOM"), 1);
            }
        }
    }
    return modes;
}


function getNotes(rootNote, mode){
    let notes = [];
    let kOct = 3;
    let oct = Math.floor(Math.random() * 9);
    if(oct === 3 || oct === 4 || oct === 5){
        kOct = 4;
    }else if(oct === 6 || oct === 7){
        kOct = 5;
    }else if(oct === 8){
        kOct = 6;
    }

    let matchArr = [];
    if(mode === "DORIAN"){
        matchArr = g_dorian;
    }
    if(mode === "PHRYGIAN"){
        matchArr = g_phrygian;
    }
    if(mode === "LYDIAN"){
        matchArr = g_lydian;
    }
    if(mode === "MIXOLYDIAN"){
        matchArr = g_mixolydian;
    }
    if(mode === "AEOLIAN"){
        matchArr = g_aeolian;
    }
    if(mode === "LOCRIAN"){
        matchArr = g_locrian;
    }
    if(mode === "IONIAN"){
        matchArr = g_ionian;
    }
    if(mode === "MAJORPENT"){
        matchArr = g_majorpent;
    }
    if(mode === "MAJORTRIAD"){
        matchArr = g_majortriad;
    }
    if(mode === "MINORTRIAD"){
        matchArr = g_minortriad;
    }
    if(mode === "MINORPENT"){
        matchArr = g_minorpent;
    }
    if(mode === "PHRYGDOM"){
        matchArr = g_phrygdom;
    }
    let start = diatonic.indexOf(rootNote);
    for(let i = 0; i < 13; i++){
        if(matchArr[i] === 1){
            let thisOct = kOct;
            let bump = Math.floor(Math.random() * 3);
            if(bump === 1){
                thisOct += 1;          
            }
            let key = diatonic[start + i] + thisOct;
            let note = MIDI.keyToNote[key]
            notes.push(note);
        }
    }
    return notes;
}

function getInputPattern(inputNotes){
    let inputPattern = [1]; 
    for(let i = 0; i < inputNotes.length - 1; i++){
        let steps = getHalfStepsBetween(inputNotes[i], inputNotes[i+1]);
        while(steps > 0){
            inputPattern.push(0);
            steps = steps - 1;
        }
        inputPattern.push(1);
    }
    return inputPattern;
}


function getHalfStepsBetween(note1, note2){
    
    const ind1 = diatonic.indexOf(note1);
    const ind2 = diatonic.indexOf(note2, ind1);
    return ind2 - ind1 - 1;
}
















